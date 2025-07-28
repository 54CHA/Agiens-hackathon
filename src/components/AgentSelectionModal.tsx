import React from 'react';
import { X, Plus, Robot, Trash, PencilSimple } from '@phosphor-icons/react';
import { Agent } from '../types/Agent';

interface AgentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
}

export const AgentSelectionModal: React.FC<AgentSelectionModalProps> = ({
  isOpen,
  onClose,
  agents,
  selectedAgent,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
}) => {
  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent(agent);
    onClose();
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Agent
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-80 overflow-y-auto">
          {/* Create New Agent */}
          <button
            onClick={() => {
              onCreateAgent();
              onClose();
            }}
            className="w-full mb-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Plus size={20} className="text-white" weight="bold" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Create Custom Agent
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Design your own AI assistant
                </p>
              </div>
            </div>
          </button>

          {/* Agents List */}
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAgent?.id === agent.id
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleSelectAgent(agent)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                    <Robot size={20} className="text-white dark:text-black" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {agent.name}
                      </p>
                      {agent.isDefault && (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!agent.isDefault && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
          </div>

          {agents.length === 0 && (
            <div className="text-center py-8">
              <Robot size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No agents available
              </p>
              <button
                onClick={() => {
                  onCreateAgent();
                  onClose();
                }}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Create Your First Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 