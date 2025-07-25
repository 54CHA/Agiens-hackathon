import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { TypingIndicator } from "./components/TypingIndicator";
import { Sidebar } from "./components/Sidebar";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useChat } from "./hooks/useChat";

// Main authenticated chat interface
const ChatInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    sendMessage,
    createNewChat,
    selectConversation,
    deleteConversation,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text);
    } catch (error) {
      // Error is already handled in useChat hook
      console.error("Failed to send message:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      await createNewChat();
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

  return (
    <div className="h-screen flex bg-white">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {conversations.find((c) => c.id === activeConversationId)
                  ?.title || "Chat"}
              </h1>
              <p className="text-sm text-gray-500">Powered by DeepSeek AI</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}!
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Start a new conversation
                </h2>
                <p className="text-gray-600 mb-6">
                  Ask me anything and I'll help you out!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 px-6 py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!activeConversationId}
          />
        </div>
      </div>
    </div>
  );
};

// Authentication wrapper component
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
