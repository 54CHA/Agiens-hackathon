import React from 'react';
import { Robot } from '@phosphor-icons/react';
import { Agent } from '../types/Agent';

interface AgentButtonProps {
  selectedAgent: Agent | null;
  onClick: () => void;
}

export const AgentButton: React.FC<AgentButtonProps> = ({
  selectedAgent,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex items-center space-x-3 px-6 py-4 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
    >
      <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
        <Robot size={20} className="text-white dark:text-black" weight="fill" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {selectedAgent?.name || 'Default Assistant'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click to change agent
        </p>
      </div>
    </button>
  );
}; 