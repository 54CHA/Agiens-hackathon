import React, { useState } from 'react';
import { CaretDown, Plus, Robot, Trash, PencilSimple } from '@phosphor-icons/react';
import { Agent } from '../types/Agent';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent(agent);
    setIsOpen(false);
  };

  const handleDeleteAgent = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      onDeleteAgent(agent);
    }
  };

  const handleEditAgent = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation();
    onEditAgent(agent);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Agent Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Robot size={16} className="text-white" weight="fill" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAgent?.name || 'Select Agent'}
            </p>
            {selectedAgent && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-48">
                {selectedAgent.description}
              </p>
            )}
          </div>
        </div>
        <CaretDown 
          size={16} 
          className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Create New Agent */}
          <button
            onClick={() => {
              onCreateAgent();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-200 dark:border-gray-600"
          >
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-white" weight="bold" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Create New Agent
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a custom AI agent
              </p>
            </div>
          </button>

          {/* Agent List */}
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`group flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                selectedAgent?.id === agent.id ? 'bg-blue-50 dark:bg-blue-950' : ''
              }`}
              onClick={() => handleSelectAgent(agent)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  agent.isDefault ? 'bg-purple-500' : 'bg-blue-500'
                }`}>
                  <Robot size={16} className="text-white" weight="fill" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {agent.name}
                    {agent.isDefault && (
                      <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                        (Default)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {!agent.isDefault && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => handleEditAgent(e, agent)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors duration-200"
                    title="Edit agent"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteAgent(e, agent)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors duration-200"
                    title="Delete agent"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {agents.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Robot size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No agents available
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Create your first custom agent
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 