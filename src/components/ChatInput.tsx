import React, { useState, KeyboardEvent } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { AgentDropdown } from "./AgentDropdown";
import { Agent } from "../types/Agent";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  // Agent props
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
  hasActiveChat?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  agents,
  selectedAgent,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  hasActiveChat = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isSubmitDisabled = !message.trim() || isLoading || disabled;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        {/* Agent Selection - Above input for active chats */}
        {hasActiveChat && (
          <div className="flex items-center justify-center mb-3 px-2">
            <AgentDropdown 
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={onSelectAgent}
              onCreateAgent={onCreateAgent}
              onEditAgent={onEditAgent}
              onDeleteAgent={onDeleteAgent}
              variant="active-chat"
              openDirection="down"
            />
          </div>
        )}
        
        <div className="relative bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-3xl overflow-hidden flex items-center transition-colors duration-200">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              disabled
                ? "Start a new chat to begin messaging..."
                : "Send a message..."
            }
            disabled={isLoading || disabled}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-6 py-4 pr-16 resize-none border-0 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed text-base leading-6 transition-colors duration-200"
            rows={1}
            style={{
              minHeight: "56px",
              maxHeight: "200px",
            }}
          />
          
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperPlaneTilt size={18} weight="fill" />
            )}
          </button>
        </div>
        

      </form>
    </div>
  );
};
