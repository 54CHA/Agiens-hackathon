import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages?: Message[];
  lastMessage: string;
  timestamp: string;
}

const API_BASE_URL = "http://localhost:3001/api";

class ChatAPI {
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

  async getConversations(): Promise<Conversation[]> {
    const data = await this.request("/chat/conversations");
    return data.conversations || [];
  }

  async getConversation(id: string): Promise<Conversation> {
    const data = await this.request(`/chat/conversations/${id}`);
    return data.conversation;
  }

  async createConversation(title: string = "New Conversation", agentId?: string): Promise<Conversation> {
    const data = await this.request("/chat/conversations", {
      method: "POST",
      body: JSON.stringify({ title, agentId }),
    });
    return data.conversation;
  }

  async sendMessage(
    conversationId: string,
    message: string,
    agentId?: string
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
    const data = await this.request(
      `/chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message, agentId }),
      }
    );
    return {
      userMessage: data.userMessage,
      aiMessage: data.aiMessage,
    };
  }

  async deleteConversation(id: string): Promise<void> {
    await this.request(`/chat/conversations/${id}`, {
      method: "DELETE",
    });
  }

  async getStats() {
    const data = await this.request("/chat/stats");
    return data.stats;
  }
}

const chatAPI = new ChatAPI();

export const useChat = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadConversations();
    } else if (!isAuthenticated) {
      // Clear state when not authenticated
      setConversations([]);
      setMessages([]);
      setActiveConversationId("");
    }
  }, [isAuthenticated, authLoading]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId && isAuthenticated) {
      loadConversationMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, isAuthenticated]);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      setIsLoadingConversations(true);
      const conversationList = await chatAPI.getConversations();
      setConversations(conversationList);

      // If no active conversation and conversations exist, select the first one
      if (!activeConversationId && conversationList.length > 0) {
        setActiveConversationId(conversationList[0].id);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated, activeConversationId]);

  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      if (!isAuthenticated) return;

      try {
        setError(null);
        const conversation = await chatAPI.getConversation(conversationId);
        setMessages(conversation.messages || []);
      } catch (error) {
        console.error("Failed to load conversation messages:", error);
        setError("Failed to load messages");
      }
    },
    [isAuthenticated]
  );

  const createNewChat = useCallback(
    async (agentId?: string) => {
      if (!isAuthenticated) return;

      try {
        setError(null);
        const newConversation = await chatAPI.createConversation("New Conversation", agentId);
        
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setMessages([]);
        
        return newConversation;
      } catch (error) {
        console.error("Failed to create new chat:", error);
        setError("Failed to create new chat");
        throw error;
      }
    },
    [isAuthenticated]
  );

  const sendMessage = useCallback(
    async (text: string, agentId?: string) => {
      if (!text.trim() || !activeConversationId || !isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      // Create and immediately display the user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        text: text.trim(),
        isUser: true,
        timestamp: new Date().toISOString(),
      };

      // Add user message immediately to the UI
      setMessages((prev) => [...prev, userMessage]);

      try {
        const { userMessage: serverUserMessage, aiMessage } = await chatAPI.sendMessage(
          activeConversationId,
          text.trim(),
          agentId
        );

        // Replace the temporary user message with the server one and add AI response
        setMessages((prev) => [
          ...prev.filter(msg => msg.id !== userMessage.id),
          serverUserMessage,
          aiMessage
        ]);

        // Update the conversation's last message in the list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  lastMessage: aiMessage.text,
                  timestamp: aiMessage.timestamp,
                }
              : conv
          )
        );

        // Reload conversations to get updated titles if needed
        loadConversations();
      } catch (error) {
        console.error("Failed to send message:", error);
        
        // Remove the user message if sending failed
        setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
        
        setError(
          error instanceof Error ? error.message : "Failed to send message"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, isAuthenticated, loadConversations]
  );

  const selectConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === activeConversationId) return;

      setActiveConversationId(conversationId);
      setError(null);
    },
    [activeConversationId]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!isAuthenticated) return;

      try {
        setError(null);
        await chatAPI.deleteConversation(conversationId);

        // Remove from conversations list
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );

        // If this was the active conversation, clear it or select another
        if (conversationId === activeConversationId) {
          const remainingConversations = conversations.filter(
            (conv) => conv.id !== conversationId
          );
          if (remainingConversations.length > 0) {
            setActiveConversationId(remainingConversations[0].id);
          } else {
            setActiveConversationId("");
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        setError("Failed to delete conversation");
        throw error;
      }
    },
    [isAuthenticated, activeConversationId, conversations]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isLoadingConversations,
    error,
    sendMessage,
    createNewChat,
    selectConversation,
    deleteConversation,
    loadConversations,
  };
};
