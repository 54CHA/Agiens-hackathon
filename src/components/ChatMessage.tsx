import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Message } from "../hooks/useChat";
import { formatTimeInUserTimezone, formatDateInUserTimezone, formatDateTimeInUserTimezone } from "../utils/timezone";

interface ChatMessageProps {
  message: Message;
  showDate?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, showDate = false }) => {

  return (
    <div className="group mb-8">
      {/* Date Separator */}
      {showDate && (
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 px-3 pb-1 rounded-full">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {formatDateInUserTimezone(message.timestamp)}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            message.isUser 
              ? "bg-gray-900 dark:bg-white text-white dark:text-black" 
              : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
          }`}
        >
          {message.isUser ? (
            <div className="w-4 h-4 bg-white dark:bg-black rounded-sm"></div>
          ) : (
            <div className="w-4 h-4 bg-gray-900 dark:bg-white rounded-sm"></div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {message.isUser ? "You" : "AI Assistant"}
            </span>
            <span 
              className="text-xs text-gray-500 dark:text-gray-500"
              title={formatDateTimeInUserTimezone(message.timestamp)}
            >
              {formatTimeInUserTimezone(message.timestamp)}
            </span>
          </div>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="text-sm leading-relaxed markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
