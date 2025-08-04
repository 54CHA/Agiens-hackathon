import { useState, useCallback } from 'react';

interface SelfImprovementSettings {
  isEnabled: boolean;
  mode: 'auto' | 'manual' | 'disabled';
  promptInterval: number;
}

interface PromptApprovalData {
  analysisId: string;
  analysis: {
    themes: string[];
    communicationStyle: string;
    gaps: string[];
    recommendations: string[];
  };
  improvements: {
    name: string;
    description: string;
    systemPrompt: string;
    reason: string;
  };
  currentAgent: {
    name: string;
    description: string;
    systemPrompt: string;
  };
}

export const useSelfImprovement = () => {
  const [settings, setSettings] = useState<SelfImprovementSettings | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token available for self-improvement settings');
        return;
      }

      const response = await fetch(`/api/self-improvement/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load self-improvement settings:', error);
    }
  }, []);

  const trackPrompt = useCallback(async (conversationId: string): Promise<number | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token available for tracking prompt');
        return null;
      }

      const response = await fetch(`/api/self-improvement/conversations/${conversationId}/track-prompt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to track prompt');
      }

      const data = await response.json();
      if (data.success) {
        return data.promptCount;
      }
    } catch (error) {
      console.error('Failed to track prompt:', error);
    }
    return null;
  }, []);

  const analyzeConversation = useCallback(async (agentId: string, currentAgent: any): Promise<PromptApprovalData | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token available for conversation analysis');
        return null;
      }

      setIsAnalyzing(true);
      
      const response = await fetch(`/api/self-improvement/agents/${agentId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to analyze conversation');
      }

      const data = await response.json();
      if (data.success) {
        return {
          analysisId: data.analysisId,
          analysis: data.analysis,
          improvements: data.improvements,
          currentAgent: {
            name: currentAgent.name,
            description: currentAgent.description,
            systemPrompt: currentAgent.systemPrompt,
          },
        };
      }
    } catch (error) {
      console.error('Failed to analyze conversation:', error);
    } finally {
      setIsAnalyzing(false);
    }
    return null;
  }, []);

  const applyImprovement = useCallback(async (agentId: string, analysisId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token available for applying improvement');
        return null;
      }

      const response = await fetch(`/api/self-improvement/agents/${agentId}/apply-improvement/${analysisId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to apply improvement');
      }

      const data = await response.json();
      if (data.success) {
        return data.agent;
      }
    } catch (error) {
      console.error('Failed to apply improvement:', error);
    }
    return null;
  }, []);

  const shouldTriggerAnalysis = useCallback((promptCount: number): boolean => {
    if (!settings || !settings.isEnabled) return false;
    return promptCount > 0 && promptCount % settings.promptInterval === 0;
  }, [settings]);

  return {
    settings,
    isAnalyzing,
    loadSettings,
    trackPrompt,
    analyzeConversation,
    applyImprovement,
    shouldTriggerAnalysis,
  };
};