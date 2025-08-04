import React, { useRef } from 'react';
import { Agent } from '../types/Agent';

interface AgentDropdownProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
  isLoading?: boolean;
  variant?: 'default' | 'new-chat' | 'active-chat';
  openDirection?: 'down' | 'up';
}

export const AgentDropdown: React.FC<AgentDropdownProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  isLoading = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent(agent);
  };

  return (
    <div className="w-full max-w-full" ref={dropdownRef}>
      {/* Simple Agent List in Single Row */}
      <div className="flex items-center gap-2 max-w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-4 h-4 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mr-2" />
            <p className="text-sm text-gray-900 dark:text-white">Loading...</p>
          </div>
        ) : agents.length > 0 ? (
          <>
            {/* Scrollable Agents Container */}
            <div className="flex gap-2 pt-1 overflow-x-auto scrollbar-hide min-w-0 flex-1 max-w-full">
              {agents.map((agent) => (
                <div key={agent.id} className="relative group flex-shrink-0">
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      selectedAgent?.id === agent.id 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                        : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleSelectAgent(agent)}
                  >
                    {agent.name}
                  </button>
                  
                  {/* Edit Button - Shows on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAgent(agent);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs hover:bg-gray-700 dark:hover:bg-gray-300 z-50"
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
            
            {/* Fixed Create Button */}
            <button
              onClick={onCreateAgent}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 flex-shrink-0"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </>
        ) : (
          <button
            onClick={onCreateAgent}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
          >
            Create first agent
          </button>
        )}
      </div>
    </div>
  );
}; 