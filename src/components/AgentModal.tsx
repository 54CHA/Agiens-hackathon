import React, { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { Agent, CreateAgentRequest } from '../types/Agent';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: CreateAgentRequest) => void;
  onDelete?: (agent: Agent) => void;
  editingAgent?: Agent | null;
}

export const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAgent,
}) => {
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    systemPrompt: '',
    preferredModel: 'deepseek-v3',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAgent) {
      setFormData({
        name: editingAgent.name,
        description: editingAgent.description,
        systemPrompt: editingAgent.systemPrompt,
        preferredModel: editingAgent.preferredModel || 'deepseek-v3',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        systemPrompt: '',
        preferredModel: 'deepseek-v3',
      });
    }
    setErrors({});
  }, [editingAgent, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Agent name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    } else if (formData.systemPrompt.trim().length < 20) {
      newErrors.systemPrompt = 'System prompt must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        systemPrompt: formData.systemPrompt.trim(),
        preferredModel: formData.preferredModel,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
      preferredModel: 'deepseek-v3',
    });
    setErrors({});
    onClose();
  };

  const handleDelete = () => {
    if (editingAgent && onDelete) {
      if (window.confirm(`Are you sure you want to delete "${editingAgent.name}"? This action cannot be undone.`)) {
        onDelete(editingAgent);
        handleClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingAgent ? 'Edit Agent' : 'Create New Agent'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Agent Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Assistant, Code Reviewer, Creative Writer"
                className={`w-full px-4 py-3 bg-white dark:bg-black border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 rounded-xl focus:outline-none transition-all duration-200 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this agent does"
                className={`w-full px-4 py-3 bg-white dark:bg-black border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 rounded-xl focus:outline-none transition-all duration-200 ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-600'
                }`}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* AI Model Selection */}
            <div>
              <label htmlFor="preferredModel" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                AI Model
              </label>
              <select
                id="preferredModel"
                value={formData.preferredModel}
                onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-gray-600 transition-all duration-200"
              >
                <option value="deepseek-v3">DeepSeek V3</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>

            </div>

            {/* System Prompt */}
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                System Prompt
              </label>
              <textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Define the agent's personality, expertise, and behavior. This will guide how the AI responds to users."
                rows={6}
                className={`w-full px-4 py-3 bg-white dark:bg-black border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 rounded-xl focus:outline-none transition-all duration-200 resize-none ${
                  errors.systemPrompt
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-600'
                }`}
              />
              {errors.systemPrompt && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.systemPrompt}</p>
              )}

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-center items-center space-x-3">
            {editingAgent && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 rounded-xl transition-all duration-200 font-medium"
              >
                Delete Agent
              </button>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
            >
              {editingAgent ? 'Update Agent' : 'Create Agent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 