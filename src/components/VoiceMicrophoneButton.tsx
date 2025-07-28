import React from 'react';
import { Microphone } from '@phosphor-icons/react';

interface VoiceMicrophoneButtonProps {
  onClick: () => void;
  hasActiveChat?: boolean;
}

export const VoiceMicrophoneButton: React.FC<VoiceMicrophoneButtonProps> = ({
  onClick,
  hasActiveChat = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed z-40 w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center group ${
        hasActiveChat 
          ? 'bottom-32 right-8' 
          : 'bottom-8 right-8'
      }`}
      title="Start voice conversation"
      aria-label="Start voice conversation"
    >
      <Microphone 
        size={20} 
        weight="fill"
        className="group-hover:scale-110 transition-transform duration-200"
      />
    </button>
  );
}; 