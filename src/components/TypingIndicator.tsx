import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="group mb-8">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>

        {/* Typing Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-black dark:text-white">
              AI Assistant
            </span>
          
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};