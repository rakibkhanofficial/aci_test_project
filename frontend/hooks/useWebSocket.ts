import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'error';
  data: any;
}

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onTyping?: (isTyping: boolean) => void;
  onStatus?: (status: 'connected' | 'disconnected' | 'error') => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!session?.accessToken) return;

    const wsUrl = `ws://localhost:8000/ws/chat?token=${session.accessToken}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      options.onStatus?.('connected');
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'message':
            options.onMessage?.(message.data);
            break;
          case 'typing':
            options.onTyping?.(message.data.isTyping);
            break;
          case 'status':
            options.onStatus?.(message.data);
            break;
          case 'error':
            console.error('WebSocket error:', message.data);
            options.onError?.(new Error(message.data));
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      options.onStatus?.('disconnected');
      console.log('WebSocket disconnected');

      // Attempt to reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          connect();
        }, delay);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      options.onError?.(new Error('WebSocket connection error'));
      options.onStatus?.('error');
    };
  }, [session?.accessToken, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const send = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data });
      wsRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  const sendMessage = useCallback((message: string, conversationId?: number) => {
    return send('message', { content: message, conversationId });
  }, [send]);

  const sendTyping = useCallback((isTyping: boolean, conversationId?: number) => {
    return send('typing', { isTyping, conversationId });
  }, [send]);

  // Auto-connect on mount and when token changes
  useEffect(() => {
    if (session?.accessToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [session?.accessToken, connect, disconnect]);

// Auto-reconnect when disconnected
useEffect(() => {
  let timeout: NodeJS.Timeout;

  if (!isConnected && session?.accessToken && reconnectAttemptsRef.current < maxReconnectAttempts) {
    timeout = setTimeout(() => {
      connect();
    }, 5000);
  }

  // Always return cleanup function
  return () => {
    if (timeout) clearTimeout(timeout);
  };
}, [isConnected, session?.accessToken, connect]);

  return {
    isConnected,
    sendMessage,
    sendTyping,
    disconnect,
    connect,
  };
}