import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error: any) {
      toast.error('Failed to load conversations', {
        description: error.response?.data?.detail || 'Please try again',
      });
    }
  }, []);

  const loadConversation = useCallback(async (conversationId: number) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      const conversation = response.data;
      setCurrentConversation(conversation);
      
      const formattedMessages: Message[] = conversation.messages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        imageUrl: msg.image_path ? `http://localhost:8000/uploads/${session?.user?.id}/${msg.image_path}` : undefined,
        metadata: msg.metadata,
      }));
      
      setMessages(formattedMessages);
      return { success: true, conversation };
    } catch (error: any) {
      toast.error('Failed to load conversation', {
        description: error.response?.data?.detail || 'Please try again',
      });
      return { success: false, error: error.message };
    }
  }, [session?.user?.id]);

  const sendMessage = useCallback(async (
    content: string,
    file?: File,
    conversationId?: number
  ) => {
    if (!content.trim() && !file) return { success: false, error: 'Message cannot be empty' };

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      imageUrl: file ? URL.createObjectURL(file) : undefined,
    };

    setMessages(prev => [...prev, userMessage]);

    const formData = new FormData();
    formData.append('message', content);
    if (file) {
      formData.append('image', file);
    }
    if (conversationId) {
      formData.append('conversation_id', conversationId.toString());
    }

    try {
      const response = await api.post('/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: abortControllerRef.current.signal,
      });

      const data = response.data;
      
      if (!currentConversation) {
        const newConversation: Conversation = {
          id: data.conversation_id,
          title: content.substring(0, 50),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentConversation(newConversation);
        setConversations(prev => [newConversation, ...prev]);
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
        metadata: data.message.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversations list with new message
      setConversations(prev => prev.map(conv => 
        conv.id === data.conversation_id 
          ? { ...conv, updated_at: new Date().toISOString() }
          : conv
      ));

      return { 
        success: true, 
        message: assistantMessage,
        conversationId: data.conversation_id 
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return { success: false, error: 'Request aborted' };
      }

      const errorMessage = error.response?.data?.detail || 'Failed to send message';
      toast.error('Error', { description: errorMessage });
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Failed to get response. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [currentConversation]);

  const createNewConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    return { success: true };
  }, []);

  const deleteConversation = useCallback(async (conversationId: number) => {
    try {
      await api.delete(`/chat/conversations/${conversationId}`);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      toast.success('Conversation deleted');
      return { success: true };
    } catch (error: any) {
      toast.error('Failed to delete conversation');
      return { success: false, error: error.message };
    }
  }, [currentConversation]);

  const updateConversationTitle = useCallback(async (conversationId: number, title: string) => {
    try {
      await api.put(`/chat/conversations/${conversationId}`, { title });
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, title } : conv
      ));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [currentConversation]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsTyping(false);
      toast.info('Request cancelled');
    }
  }, []);

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    isTyping,
    loadConversations,
    loadConversation,
    sendMessage,
    createNewConversation,
    deleteConversation,
    updateConversationTitle,
    cancelRequest,
    setMessages,
    setCurrentConversation,
  };
}