'use client';

import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  variant?: 'default' | 'compact' | 'minimal';
  name?: string;
  avatarColor?: string;
}

export function TypingIndicator({ 
  variant = 'default',
  name = 'CHIMERA',
  avatarColor = 'bg-purple-500/20'
}: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  // Animate typing dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 p-3">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-full", avatarColor)}>
          <Bot className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400">{name} is typing</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0">
        <div className={cn("p-2 rounded-full relative", avatarColor)}>
          <Bot className="w-5 h-5 text-purple-400" />
          {/* Pulsing effect around avatar */}
          <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-ping" />
        </div>
      </div>
      
      <div className="flex-1 max-w-[85%]">
        <div className="rounded-2xl px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-bl-none">
          <div className="flex items-center gap-3">
            <div className="flex space-x-1">
              <div className="typing-dot w-2 h-2 bg-purple-400 rounded-full animate-typing" />
              <div className="typing-dot w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
              <div className="typing-dot w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm text-gray-400">Analyzing your message{dots}</span>
          </div>
          
          {/* AI thinking process indicators */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-1 bg-gradient-to-r from-purple-400/20 to-purple-400/60 rounded-full animate-pulse" />
            <div className="h-1 bg-gradient-to-r from-purple-400/20 to-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="h-1 bg-gradient-to-r from-purple-400/20 to-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            <div className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
              Processing image
            </div>
            <div className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
              Running diagnostics
            </div>
            <div className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
              Generating response
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        .typing-dot {
          animation: typing 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

// Enhanced TypingIndicator with optional AI thinking messages
export function AdvancedTypingIndicator() {
  const [thinkingMessage, setThinkingMessage] = useState('');
  const thinkingMessages = [
    'Analyzing your query...',
    'Processing image data...',
    'Running diagnostics...',
    'Checking system databases...',
    'Generating comprehensive response...',
    'Validating with mission protocols...',
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      // Use optional chaining and provide a fallback to ensure we always pass a string
      setThinkingMessage(thinkingMessages[currentIndex] || 'Processing...');
      currentIndex = (currentIndex + 1) % thinkingMessages.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0">
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
          <Bot className="w-5 h-5 text-purple-400" />
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-[85%] animate-pulse">
        <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-bl-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-sm text-gray-300">{thinkingMessage}</span>
            </div>
            <span className="text-xs text-gray-500">AI thinking</span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 animate-shimmer" />
            </div>
          </div>
        </div>
        
        {/* System activity indicators */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>System: Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Processing: Optimized</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Response: Generating</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        .animate-shimmer {
          background-size: 200px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}