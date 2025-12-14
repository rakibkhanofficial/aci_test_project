'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  Send, 
  Upload, 
  Bot, 
  User, 
  Image as ImageIcon,
  Mic,
  MicOff,
  Paperclip,
  X,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './MessageBubble';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { FileUpload } from '@/components/chat/FileUpload';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

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

export function ChatInterface({ conversationId }: { conversationId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  // Load conversation messages
  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/chat/conversations/${id}`);
      const conversation = response.data;
      setCurrentConversation(conversation);
      
      // Transform messages
      const formattedMessages: Message[] = conversation.messages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        imageUrl: msg.image_path ? `http://localhost:8000/uploads/${session?.user?.id}/${msg.image_path}` : undefined,
        metadata: msg.metadata,
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  }, [session?.user?.id]);

  // Initialize
  useEffect(() => {
    loadConversations();
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversations, loadConversation]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    setIsLoading(true);
    setIsTyping(true);

    const formData = new FormData();
    formData.append('message', input);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    if (currentConversation?.id) {
      formData.append('conversation_id', currentConversation.id.toString());
    }

    try {
      const response = await api.post('/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      
      // Update conversation if new
      if (!currentConversation) {
        setCurrentConversation({
          id: data.conversation_id,
          title: input.substring(0, 50),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        loadConversations();
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
        metadata: data.message.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error('Failed to send message', {
        description: error.response?.data?.detail || 'Please try again',
      });
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Failed to get response. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB',
      });
      return;
    }

    setSelectedFile(file);
    toast.success('Image ready for upload', {
      description: `${file.name} will be sent with your message`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setInput('');
    setSelectedFile(null);
    setShowHistory(false);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await loadConversation(conversation.id.toString());
    setShowHistory(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
    toast.info('Voice input coming soon');
  };

  return (
    <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto">
      {/* Sidebar with History */}
      <div className={cn(
        "w-64 md:w-80 border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300",
        showHistory ? "block" : "hidden md:block"
      )}>
        <ChatHistory
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
              >
                <div className="w-6 h-4 flex flex-col justify-between">
                  <div className="h-0.5 bg-gray-400 rounded"></div>
                  <div className="h-0.5 bg-gray-400 rounded"></div>
                  <div className="h-0.5 bg-gray-400 rounded"></div>
                </div>
              </button>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {currentConversation?.title || 'CHIMERA Assistant'}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                    Online
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {messages.length} messages
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-gray-400 hover:text-white"
              >
                New Chat
              </Button>
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-800/50 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">
                  {session?.user?.name || 'Astronaut'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                <Bot className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Welcome to CHIMERA Assistant
              </h3>
              <p className="text-gray-400 max-w-md mb-8">
                I&apos;m your AI co-pilot for deep space diagnostics and guidance.
                Describe issues, upload images, or ask for system analysis.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mb-8">
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="p-2 bg-blue-500/20 rounded-lg w-fit mb-3">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Visual Diagnostics</h4>
                  <p className="text-sm text-gray-400">Upload images of equipment for analysis</p>
                </div>
                
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="p-2 bg-green-500/20 rounded-lg w-fit mb-3">
                    <User className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Natural Language</h4>
                  <p className="text-sm text-gray-400">Describe issues in plain English</p>
                </div>
                
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="p-2 bg-purple-500/20 rounded-lg w-fit mb-3">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">AI Analysis</h4>
                  <p className="text-sm text-gray-400">Get real-time diagnostics and solutions</p>
                </div>
              </div>

              <div className="max-w-lg">
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-300">
                    Remember: Always verify critical system advice with Mission Control.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          {selectedFile && (
            <div className="mb-4 p-3 bg-blue-900/20 rounded-lg flex items-center justify-between border border-blue-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm text-blue-300 block">{selectedFile.name}</span>
                  <span className="text-xs text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white hover:bg-red-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <FileUpload onFileSelect={handleFileSelect}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
              </FileUpload>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                className={cn(
                  "text-gray-400 hover:text-white",
                  isRecording && "text-red-400 bg-red-500/20"
                )}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe the issue or ask for guidance... (Shift+Enter for new line)"
                className="pr-12 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500 resize-none min-h-[60px] max-h-[120px]"
                disabled={isLoading}
                rows={1}
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2"
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !selectedFile)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">
              Press Enter to send • Shift+Enter for new line • Max file size: 10MB
            </p>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">
                Connection: <span className="text-green-400">Secure</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}