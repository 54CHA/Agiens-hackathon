import React from "react";
import { Message } from "../hooks/useChat";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${
        message.isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          message.isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>
        <div
          className={`text-xs mt-2 ${
            message.isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
