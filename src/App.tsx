import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { TypingIndicator } from "./components/TypingIndicator";
import { Sidebar } from "./components/Sidebar";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ElevenLabsWidget } from "./components/ElevenLabsWidget";
import { AgentModal } from "./components/AgentModal";
import { AgentDropdown } from "./components/AgentDropdown";
import { ThemeToggle } from "./components/ThemeToggle";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useChat } from "./hooks/useChat";
import { useAgents } from "./hooks/useAgents";
import { Agent, CreateAgentRequest } from "./types/Agent";

// Main authenticated chat interface
const ChatInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const {
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
  } = useChat();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showVoiceWidget, setShowVoiceWidget] = useState(false);

  const {
    agents,
    selectedAgent,
    error: agentsError,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
  } = useAgents();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    try {
      // If no active conversation, create a new one first
      if (!activeConversationId) {
        await createNewChat(selectedAgent?.id);
      }
      await sendMessage(text, selectedAgent?.id);
    } catch (error) {
      // Error is already handled in useChat hook
      console.error("Failed to send message:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      await createNewChat(selectedAgent?.id);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  // Helper function to determine if we should show date separator
  const shouldShowDateSeparator = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  const hasActiveChat = messages.length > 0;

  // Show skeleton loader for initial loading
  if (isLoadingConversations) {
    // If no conversations exist or this is the first load, show new chat skeleton
    if (conversations.length === 0) {
      return <SkeletonLoader type="newChat" />;
    }
    // If conversations exist but we're loading messages, show existing chat skeleton
    return <SkeletonLoader type="existingChat" />;
  }

  // Agent management handlers
  const handleCreateAgent = () => {
    setEditingAgent(null);
    setIsAgentModalOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsAgentModalOpen(true);
  };

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      await deleteAgent(agent.id);
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  const handleSaveAgent = async (agentData: CreateAgentRequest) => {
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, agentData);
      } else {
        await createAgent(agentData);
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
    }
  };

  return (
    <div className="h-screen flex bg-white dark:bg-black transition-colors duration-200">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* User info and theme toggle in top right - always visible */}
        <div className="absolute top-6 right-8 z-10 flex items-center space-x-4">
          <ThemeToggle />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user?.username}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(error || agentsError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error || agentsError}
              </p>
            </div>
          )}

          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl w-full px-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white dark:bg-black rounded-sm"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                  Ask me anything using text input or use the voice assistant in the bottom-right corner.
                </p>
                
                {/* Agent Dropdown */}
                <div className="mb-8 flex justify-center">
                  <AgentDropdown 
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onSelectAgent={selectAgent}
                    onCreateAgent={handleCreateAgent}
                    onEditAgent={handleEditAgent}
                    onDeleteAgent={handleDeleteAgent}
                  />
                </div>
                
                {/* Centered Chat Input */}
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-end space-x-3">
                    {/* Chat Input */}
                    <div className="flex-1">
                      <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        disabled={!activeConversationId}
                      />
                    </div>

                    {/* Microphone Button for Welcome Screen */}
                    <button
                      onClick={() => setShowVoiceWidget(!showVoiceWidget)}
                      className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center flex-shrink-0 mb-7 ${
                        showVoiceWidget 
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-default' 
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }`}
                      disabled={showVoiceWidget}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12c-2.21 0-4-1.79-4-4V6H6v4c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-2v4c0 2.21-1.79 4-4 4zm-1 2v3h2v-3h-1z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  showDate={shouldShowDateSeparator(message, messages[index - 1])}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Container - only show when there are messages */}
        {hasActiveChat && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-3xl p-4">
            <div className="max-w-4xl mx-auto flex items-end space-x-3">
              {/* Chat Input */}
              <div className="flex-1">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  disabled={!activeConversationId}
                />
              </div>

              {/* Microphone Button */}
              <button
                onClick={() => setShowVoiceWidget(!showVoiceWidget)}
                className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center mb-7 justify-center flex-shrink-0 ${
                  showVoiceWidget 
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-default' 
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
                disabled={showVoiceWidget}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12c-2.21 0-4-1.79-4-4V6H6v4c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-2v4c0 2.21-1.79 4-4 4zm-1 2v3h2v-3h-1z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Microphone Button */}
      {/* This button is now moved to the chat input bar */}

      {/* ElevenLabs Widget - conditionally shown */}
      {showVoiceWidget && (
        <>
          {/* Background overlay to close widget when clicking outside */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowVoiceWidget(false)}
          />
          <ElevenLabsWidget 
            onClose={() => setShowVoiceWidget(false)}
          />
        </>
      )}

      {/* Agent Creation/Edit Modal */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSave={handleSaveAgent}
        editingAgent={editingAgent}
      />
    </div>
  );
};

// Authentication wrapper component
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (isLoading) {
    return <SkeletonLoader type="auth" />;
  }

  if (!isAuthenticated) {
    return authMode === "login" ? (
      <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
    );
  }

  return <ChatInterface />;
};

// Main App component with providers
function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
