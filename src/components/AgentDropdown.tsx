import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Trash, PencilSimple, Robot, Brain, Sparkle } from '@phosphor-icons/react';
import { Agent } from '../types/Agent';

interface AgentDropdownProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
  isLoading?: boolean;
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-3 px-4 py-3 bg-gray-950 border border-gray-800 text-white rounded-2xl hover:bg-gray-900 hover:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Robot size={16} className="text-gray-400" />
        )}
        <span className="text-sm font-medium text-white">
          {isLoading 
            ? 'Loading agents...' 
            : selectedAgent?.name || 'Default Agent'
          }
        </span>
        <CaretDown 
          size={14} 
          className={`text-gray-400 transition-transform duration-200 ml-auto ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 mt-2 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl z-50 min-w-80 max-h-96 overflow-y-auto">
          {/* Create New Agent */}
          <button
            onClick={() => {
              onCreateAgent();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center px-4 py-3 hover:bg-gray-900 transition-colors duration-200 border-b border-gray-800 group"
          >
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                + Create New Agent
              </p>
              <p className="text-xs text-gray-400">
                Build a custom AI assistant
              </p>
            </div>
          </button>

          {/* Agent List */}
          {agents.length > 0 ? (
            agents.map((agent) => (
              <div
                key={agent.id}
                className={`group relative flex items-center justify-between px-4 py-3 hover:bg-gray-900 transition-all duration-200 cursor-pointer ${
                  selectedAgent?.id === agent.id ? 'bg-gray-900 border-l-2 border-white' : ''
                }`}
                onClick={() => handleSelectAgent(agent)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {agent.name}
                    </p>
                    {/* Model indicator */}
                    {agent.preferredModel === 'gemini-2.5-pro' ? (
                      <Sparkle size={12} className="text-purple-400" />
                    ) : (
                      <Brain size={12} className="text-blue-400" />
                    )}
                    {agent.isDefault && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full font-medium">
                        Default
                      </span>
                    )}
                    {selectedAgent?.id === agent.id && (
                      <span className="px-2 py-0.5 bg-white text-black text-xs rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed text-left truncate">
                    {agent.description?.trim() || 'No description available'}
                  </p>
                </div>

                {/* Action Buttons */}
                {!agent.isDefault && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => handleEditAgent(e, agent)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                      title="Edit agent"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAgent(e, agent)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all duration-200"
                      title="Delete agent"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-white mb-1 font-medium">
                No agents available
              </p>
              <p className="text-xs text-gray-400">
                Create your first custom AI assistant
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading Dropdown */}
      {isOpen && isLoading && (
        <div className="absolute top-full left-0 mt-2 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl z-50 min-w-80">
          <div className="px-4 py-6 text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-white font-medium">Loading agents...</p>
            <p className="text-xs text-gray-400 mt-1">Please wait</p>
          </div>
        </div>
      )}
    </div>
  );
}; 