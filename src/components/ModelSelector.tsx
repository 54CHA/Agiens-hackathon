import React from 'react';
import { Brain, Sparkle, Robot } from '@phosphor-icons/react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className = '',
}) => {
  const models = [
    {
      id: 'deepseek-v3',
      name: 'DeepSeek V3',
      description: 'Advanced reasoning and coding',
      icon: Brain,
      color: 'text-blue-400',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Multimodal and creative tasks',
      icon: Sparkle,
      color: 'text-purple-400',
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Advanced reasoning and multimodal',
      icon: Robot,
      color: 'text-green-400',
    },
  ];

  const selectedModelData = models.find(model => model.id === selectedModel);

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="appearance-none bg-gray-950 border border-gray-800 text-white px-4 py-2 pr-8 rounded-xl focus:outline-none focus:border-gray-600 transition-all duration-200 text-sm"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown indicator */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {selectedModelData && (
          <selectedModelData.icon size={16} className={selectedModelData.color} />
        )}
      </div>
    </div>
  );
}; 