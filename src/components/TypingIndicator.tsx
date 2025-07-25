import React from 'react';
import { Robot } from '@phosphor-icons/react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Robot size={18} className="text-gray-600" />
      </div>
      
      <div className="max-w-[70%]">
        <div className="bg-gray-100 px-4 py-3 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};