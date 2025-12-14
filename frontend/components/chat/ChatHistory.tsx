'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export function ChatHistory({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { deleteConversation, updateConversationTitle } = useChat();

  const handleEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = async (conversationId: number) => {
    if (editTitle.trim()) {
      await updateConversationTitle(conversationId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MM/dd');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Conversations</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewConversation}
            className="text-gray-400 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            className="pl-9 bg-gray-800/50 border-gray-700"
          />
          <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-gray-700"
              onClick={onNewConversation}
            >
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                  currentConversation?.id === conversation.id
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "hover:bg-gray-800/50"
                )}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex-1 min-w-0">
                  {editingId === conversation.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(conversation.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-white truncate">
                          {conversation.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.updated_at)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {editingId !== conversation.id && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(conversation);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300"
                      onClick={(e) => handleDelete(conversation.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-400">
              {conversations.length} conversations
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {format(new Date(), 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}