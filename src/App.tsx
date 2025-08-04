import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { TypingIndicator } from "./components/TypingIndicator";
import { Sidebar } from "./components/Sidebar";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
// import { ElevenLabsWidget } from "./components/ElevenLabsWidget"; // Temporarily disabled
import { AgentModal } from "./components/AgentModal";
import { AgentDropdown } from "./components/AgentDropdown";
import { ThemeToggle } from "./components/ThemeToggle";
import { SettingsDropdown } from "./components/SettingsDropdown";
import { PromptApprovalModal } from "./components/PromptApprovalModal";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useChat } from "./hooks/useChat";
import { useAgents } from "./hooks/useAgents";
import { useSelfImprovement } from "./hooks/useSelfImprovement";
import { Agent, CreateAgentRequest } from "./types/Agent";
import { setUserTimezone, getDateStringInUserTimezone } from "./utils/timezone";

// Main authenticated chat interface
const ChatInterface: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isNewConversation,
    error,
    sendMessage,
    createNewChat,
    selectConversation,
    deleteConversation,
  } = useChat();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  // const [showVoiceWidget, setShowVoiceWidget] = useState(false); // Temporarily disabled
  const [isPromptApprovalOpen, setIsPromptApprovalOpen] = useState(false);
  const [promptApprovalData, setPromptApprovalData] = useState<any>(null);

  const {
    agents,
    selectedAgent,
    error: agentsError,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
  } = useAgents();

  const {
    settings: selfImprovementSettings,
    loadSettings,
    trackPrompt,
    analyzeConversation,
    applyImprovement,
    shouldTriggerAnalysis,
  } = useSelfImprovement();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store user's timezone on app initialization
  useEffect(() => {
    setUserTimezone();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Only load self-improvement settings when user is authenticated
    if (user && !authLoading) {
      loadSettings();
    }
  }, [user, authLoading, loadSettings]);

  const handleSendMessage = async (text: string) => {
    try {
      // sendMessage will handle creating conversation if needed
      await sendMessage(text, selectedAgent?.id);

      // Track prompt for self-improvement if enabled and agent is selected
      if (activeConversationId && selectedAgent && selfImprovementSettings?.isEnabled) {
        const promptCount = await trackPrompt(activeConversationId);
        
        if (promptCount && shouldTriggerAnalysis(promptCount)) {
          // Trigger analysis based on mode
          const analysisData = await analyzeConversation(selectedAgent.id, selectedAgent);
          
          if (analysisData) {
            if (selfImprovementSettings.mode === 'auto') {
              // Apply automatically
              const updatedAgent = await applyImprovement(selectedAgent.id, analysisData.analysisId);
              if (updatedAgent) {
                selectAgent(updatedAgent);
              }
            } else if (selfImprovementSettings.mode === 'manual') {
              // Show approval modal
              setPromptApprovalData(analysisData);
              setIsPromptApprovalOpen(true);
            }
            // For 'disabled' mode, we just analyze but don't show or apply anything
          }
        }
      }
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
    
    // Compare dates in user's timezone
    const currentDateString = getDateStringInUserTimezone(currentMessage.timestamp);
    const previousDateString = getDateStringInUserTimezone(previousMessage.timestamp);
    
    // Debug logging to see what's happening
    console.log('Date separator check:', {
      current: {
        text: currentMessage.text?.substring(0, 30) + '...',
        timestamp: currentMessage.timestamp,
        dateString: currentDateString,
        isUser: currentMessage.isUser
      },
      previous: {
        text: previousMessage.text?.substring(0, 30) + '...',
        timestamp: previousMessage.timestamp,
        dateString: previousDateString,
        isUser: previousMessage.isUser
      },
      shouldShow: currentDateString !== previousDateString
    });
    
    return currentDateString !== previousDateString;
  };

  // Simplified logic: if no active conversation or it's marked as new, show welcome
  const shouldShowWelcome = !activeConversationId || isNewConversation;
  const shouldShowLoading = activeConversationId && !isNewConversation && messages.length === 0;
  const shouldShowChat = activeConversationId && !isNewConversation && messages.length > 0;

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

  const handleApprovePromptImprovement = async (analysisId: string) => {
    try {
      if (!selectedAgent) return;
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token available for applying improvement');
        return;
      }
      
      const response = await fetch(`/api/self-improvement/agents/${selectedAgent.id}/apply-improvement/${analysisId}`, {
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
        // Update the selected agent with the new data
        selectAgent(data.agent);
        setIsPromptApprovalOpen(false);
        setPromptApprovalData(null);
      }
    } catch (error) {
      console.error('Failed to apply improvement:', error);
    }
  };

  const handleRejectPromptImprovement = () => {
    setIsPromptApprovalOpen(false);
    setPromptApprovalData(null);
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
        {/* User info and controls in top right - always visible */}
        <div className="absolute top-6 right-8 z-10 flex items-center space-x-4">
          <SettingsDropdown />
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

          {shouldShowWelcome ? (
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
                  Ask me anything using the text input below.
                </p>
                
                {/* Agent Selection - Separate from input */}
                <div className="max-w-4xl mx-auto mb-6">
                  <AgentDropdown 
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onSelectAgent={selectAgent}
                    onCreateAgent={handleCreateAgent}
                    onEditAgent={handleEditAgent}
                    onDeleteAgent={handleDeleteAgent}
                    variant="new-chat"
                    openDirection="down"
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
                        disabled={false}
                        agents={agents}
                        selectedAgent={selectedAgent}
                        onSelectAgent={selectAgent}
                        onCreateAgent={handleCreateAgent}
                        onEditAgent={handleEditAgent}
                        onDeleteAgent={handleDeleteAgent}
                        hasActiveChat={false}
                      />
                    </div>

                    {/* Microphone Button for Welcome Screen - Temporarily Disabled */}
                    {/* <button
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
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          ) : shouldShowLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
              </div>
            </div>
          ) : shouldShowChat ? (
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
          ) : (
            // Fallback - this shouldn't happen but just in case
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 dark:text-gray-400">No conversation selected</p>
            </div>
          )}
        </div>

        {/* Chat Input Container - only show when there's an active chat with messages or loading */}
        {(shouldShowChat || shouldShowLoading) && (
          <div className="border-t border-gray-200 mx-auto dark:border-gray-700 bg-gray-500/5 dark:bg-gray-900/50 rounded-[30px] mb-6 p-4">
            <div className="max-w-4xl mx-auto">
              {/* Chat Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                disabled={false}
                agents={agents}
                selectedAgent={selectedAgent}
                onSelectAgent={selectAgent}
                onCreateAgent={handleCreateAgent}
                onEditAgent={handleEditAgent}
                onDeleteAgent={handleDeleteAgent}
                hasActiveChat={Boolean(shouldShowChat || shouldShowLoading)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Microphone Button */}
      {/* This button is now moved to the chat input bar */}

      {/* ElevenLabs Widget - Temporarily Disabled */}
      {/* {showVoiceWidget && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowVoiceWidget(false)}
          />
          <ElevenLabsWidget 
            onClose={() => setShowVoiceWidget(false)}
          />
        </>
      )} */}

      {/* Agent Creation/Edit Modal */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSave={handleSaveAgent}
        onDelete={handleDeleteAgent}
        editingAgent={editingAgent}
      />

      {/* Prompt Approval Modal */}
      <PromptApprovalModal
        isOpen={isPromptApprovalOpen}
        onClose={() => setIsPromptApprovalOpen(false)}
        onApprove={handleApprovePromptImprovement}
        onReject={handleRejectPromptImprovement}
        data={promptApprovalData}
      />
    </div>
  );
};

// Authentication wrapper component
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
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
