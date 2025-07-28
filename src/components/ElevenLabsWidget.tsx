import React, { useEffect, useRef } from 'react';

interface ElevenLabsWidgetProps {
  onClose?: () => void;
}

export const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({ onClose }) => {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if the custom element is already defined or script is loaded
    if (customElements.get('elevenlabs-convai') || scriptLoadedRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      
      // Listen for widget close events if onClose is provided
      if (onClose) {
        const handleWidgetClose = (event: any) => {
          if (event.detail?.type === 'widget-closed' || event.detail?.action === 'close') {
            onClose();
          }
        };
        
        // Listen for custom events from the widget
        window.addEventListener('elevenlabs-widget-close', handleWidgetClose);
        
        // Cleanup listener when component unmounts
        return () => {
          window.removeEventListener('elevenlabs-widget-close', handleWidgetClose);
        };
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onClose]);

  // Listen for widget close button clicks
  useEffect(() => {
    if (!onClose) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the clicked element is a close button within the widget
      if (target && (
        target.classList.contains('close') ||
        target.classList.contains('close-button') ||
        target.getAttribute('aria-label')?.toLowerCase().includes('close') ||
        target.textContent?.toLowerCase().includes('close') ||
        target.textContent?.toLowerCase().includes('end')
      )) {
        // Check if the click is within the elevenlabs widget
        const widget = document.querySelector('elevenlabs-convai');
        if (widget && widget.contains(target)) {
          onClose();
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [onClose]);

  return (
    <elevenlabs-convai agent-id="agent_9101k119eeg7fht83hcw0aq1wbzr"></elevenlabs-convai>
  );
};

// Declare the custom element for TypeScript
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