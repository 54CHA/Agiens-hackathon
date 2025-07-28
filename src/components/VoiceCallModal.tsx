import React, { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  agentId
}) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (isOpen && !scriptRef.current) {
      // Load the ElevenLabs widget script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      
      document.head.appendChild(script);
      scriptRef.current = script;
    }

    // Cleanup when modal closes
    return () => {
      if (!isOpen && scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <X size={24} />
      </button>

      {/* Just the ElevenLabs Widget */}
      <elevenlabs-convai agent-id={agentId} />
    </div>
  );
};

// Extend the global JSX namespace to include the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id': string;
        },
        HTMLElement
      >;
    }
  }
} 