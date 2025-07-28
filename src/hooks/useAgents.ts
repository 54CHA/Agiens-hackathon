import { useState, useCallback, useEffect } from 'react';
import { Agent, CreateAgentRequest } from '../types/Agent';

const API_BASE_URL = "http://localhost:3001/api";

class AgentAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("authToken");

    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getAgents(): Promise<Agent[]> {
    return this.request('/agents');
  }

  async createAgent(agentData: CreateAgentRequest): Promise<Agent> {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(id: string, agentData: CreateAgentRequest): Promise<Agent> {
    return this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  async deleteAgent(id: string): Promise<void> {
    return this.request(`/agents/${id}`, {
      method: 'DELETE',
    });
  }
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentAPI = new AgentAPI();

  // Save selected agent to localStorage
  const saveSelectedAgentToStorage = (agent: Agent | null) => {
    try {
      if (agent) {
        localStorage.setItem('selectedAgentId', agent.id);
      } else {
        localStorage.removeItem('selectedAgentId');
      }
    } catch (error) {
      console.warn('Failed to save agent to localStorage:', error);
    }
  };

  // Load selected agent from localStorage
  const loadSelectedAgentFromStorage = (availableAgents: Agent[]): Agent | null => {
    try {
      const savedAgentId = localStorage.getItem('selectedAgentId');
      if (savedAgentId && availableAgents.length > 0) {
        const savedAgent = availableAgents.find(agent => agent.id === savedAgentId);
        if (savedAgent) {
          return savedAgent;
        }
      }
    } catch (error) {
      console.warn('Failed to load agent from localStorage:', error);
    }
    return null;
  };

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, []);

  // Set default agent if none selected, with localStorage preference
  useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      // First try to load from localStorage
      const savedAgent = loadSelectedAgentFromStorage(agents);
      
      if (savedAgent) {
        setSelectedAgent(savedAgent);
      } else {
        // Fallback to default agent
        const defaultAgent = agents.find(agent => agent.isDefault) || agents[0];
        setSelectedAgent(defaultAgent);
        saveSelectedAgentToStorage(defaultAgent);
      }
    }
  }, [agents, selectedAgent]);

  const loadAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedAgents = await agentAPI.getAgents();
      setAgents(loadedAgents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load agents');
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (agentData: CreateAgentRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const newAgent = await agentAPI.createAgent(agentData);
      setAgents(prev => [...prev, newAgent]);
      setSelectedAgent(newAgent);
      saveSelectedAgentToStorage(newAgent);
      return newAgent;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create agent');
      console.error('Failed to create agent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAgent = useCallback(async (id: string, agentData: CreateAgentRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedAgent = await agentAPI.updateAgent(id, agentData);
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updatedAgent : agent
      ));
      if (selectedAgent?.id === id) {
        setSelectedAgent(updatedAgent);
        saveSelectedAgentToStorage(updatedAgent);
      }
      return updatedAgent;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update agent');
      console.error('Failed to update agent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent]);

  const deleteAgent = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await agentAPI.deleteAgent(id);
      setAgents(prev => prev.filter(agent => agent.id !== id));
      
      // If deleted agent was selected, select default or first available
      if (selectedAgent?.id === id) {
        const remainingAgents = agents.filter(agent => agent.id !== id);
        const defaultAgent = remainingAgents.find(agent => agent.isDefault) || remainingAgents[0];
        setSelectedAgent(defaultAgent || null);
        saveSelectedAgentToStorage(defaultAgent || null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete agent');
      console.error('Failed to delete agent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [agents, selectedAgent]);

  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    saveSelectedAgentToStorage(agent);
  }, []);

  return {
    agents,
    selectedAgent,
    isLoading,
    error,
    loadAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
  };
}; 