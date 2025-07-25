import React from "react";
import {
  PlusIcon,
  ChatCircleIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { User } from "../contexts/AuthContext";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  user,
  onLogout,
}) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* User Section */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon size={20} />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pb-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <ChatCircleIcon
                size={32}
                className="mx-auto text-gray-400 mb-2"
              />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                    conversation.id === activeConversationId
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all"
                      title="Delete conversation"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-xs text-gray-500">Powered by DeepSeek AI</p>
        </div>
      </div>
    </div>
  );
};
