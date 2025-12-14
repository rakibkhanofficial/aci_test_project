import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0">
        <div className="p-2 bg-purple-500/20 rounded-full">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="rounded-2xl px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-bl-none max-w-[200px]">
          <div className="flex items-center space-x-1">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-sm text-gray-400">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
}