export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  preferredModel: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  systemPrompt: string;
  preferredModel: string;
}

export interface UpdateAgentRequest extends CreateAgentRequest {
  id: string;
} 