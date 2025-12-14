'use client';

import { useState } from 'react';
import { MessageSquare, Clock, User, Bot, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';

export function RecentConversations() {
  const { conversations, loadConversation } = useChat();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleSelectConversation = async (id: number) => {
    setLoadingId(id);
    try {
      await loadConversation(id);
      router.push(`/chat/${id}`);
    } finally {
      setLoadingId(null);
    }
  };

  const recentConversations = conversations.slice(0, 5);

  return (
    <Card className="backdrop-blur-sm bg-gray-900/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Recent Conversations
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
          onClick={() => router.push('/chat')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No conversations yet</p>
            <Button
              variant="outline"
              className="mt-4 border-gray-600"
              onClick={() => router.push('/chat')}
            >
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-blue-500/20 rounded">
                      <MessageSquare className="h-3 w-3 text-blue-400" />
                    </div>
                    <h4 className="font-medium text-white truncate">
                      {conversation.title}
                    </h4>
                    <Badge variant="outline" className="ml-2 text-xs border-gray-600">
                      #{conversation.id}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(conversation.updated_at), 'MMM d, HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-blue-400" />
                        <span>You</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3 text-purple-400" />
                        <span>CHIMERA</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={loadingId === conversation.id}
                >
                  {loadingId === conversation.id ? (
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {recentConversations.length > 0 && (
          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Showing {recentConversations.length} of {conversations.length}
              </span>
              <span className="text-blue-400">
                {conversations.length} total
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}