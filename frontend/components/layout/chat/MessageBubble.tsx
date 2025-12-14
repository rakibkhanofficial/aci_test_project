'use client';

import { Bot, User, AlertCircle, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    imageUrl?: string;
    metadata?: Record<string, any>;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const renderAvatar = () => {
    if (isSystem) {
      return (
        <div className="p-2 bg-yellow-500/20 rounded-full">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        </div>
      );
    }
    
    return (
      <div className={cn(
        "p-2 rounded-full",
        isUser ? "bg-blue-500/20" : "bg-purple-500/20"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-blue-400" />
        ) : (
          <Bot className="w-5 h-5 text-purple-400" />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (message.imageUrl) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <Image
              src={message.imageUrl}
              alt="Uploaded image"
              width={400}
              height={300}
              className="w-full h-auto object-cover"
              unoptimized
            />
          </div>
          {message.content && (
            <p className="text-gray-300 whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      );
    }

    return (
      <p className="text-gray-300 whitespace-pre-wrap">{message.content}</p>
    );
  };

  const renderMetadata = () => {
    if (!message.metadata || Object.keys(message.metadata).length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {message.metadata.has_image && (
          <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
            <ImageIcon className="w-3 h-3 mr-1" />
            Contains Image
          </Badge>
        )}
        {message.metadata.model && (
          <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
            {message.metadata.model}
          </Badge>
        )}
        {message.metadata.confidence && (
          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
            {message.metadata.confidence}% confidence
          </Badge>
        )}
      </div>
    );
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-yellow-300">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex gap-3 mb-6",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="flex-shrink-0">
        {renderAvatar()}
      </div>
      
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser 
            ? "bg-blue-500/20 border border-blue-500/30 rounded-br-none" 
            : "bg-gray-800/50 border border-gray-700 rounded-bl-none"
        )}>
          {renderContent()}
          {renderMetadata()}
        </div>
        
        <div className={cn(
          "flex items-center gap-2 mt-2 text-xs",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-gray-500">
            {format(message.timestamp, 'HH:mm')}
          </span>
          {isUser && (
            <span className="text-gray-500">•</span>
          )}
          {isUser && (
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Sent
            </span>
          )}
        </div>
      </div>
    </div>
  );
}