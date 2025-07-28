import express from "express";
import { v4 as uuidv4 } from "uuid";
import DeepSeekService from "../services/deepseekService.js";
import GeminiService from "../services/geminiService.js";
import { authenticateToken } from "../middleware/auth.js";
import Database from "../config/database.js";

const router = express.Router();

// Initialize AI services only when needed
const getDeepSeekService = () => {
  return new DeepSeekService();
};

const getGeminiService = () => {
  return new GeminiService();
};

const getAIService = (model) => {
  switch (model) {
    case 'gemini-2.5-pro':
      return getGeminiService();
    case 'deepseek-v3':
    default:
      return getDeepSeekService();
  }
};

// Apply authentication to all chat routes
router.use(authenticateToken);

// Test AI models endpoint
router.get("/test-models", async (req, res) => {
  try {
    const testResults = {};
    
    // Test DeepSeek
    try {
      const deepseekService = getDeepSeekService();
      const deepseekTest = await deepseekService.testConnection();
      testResults.deepseek = deepseekTest;
    } catch (error) {
      testResults.deepseek = { success: false, message: error.message };
    }
    
    // Test Gemini
    try {
      const geminiService = getGeminiService();
      const geminiTest = await geminiService.testConnection();
      testResults.gemini = geminiTest;
    } catch (error) {
      testResults.gemini = { success: false, message: error.message };
    }
    
    res.json({
      success: true,
      models: testResults
    });
  } catch (error) {
    console.error('Model test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test models'
    });
  }
});

// Get all conversations for the authenticated user
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Database.query(
      `SELECT 
        c.id, 
        c.title, 
        c.created_at as timestamp,
        c.updated_at,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM conversations c 
       WHERE c.user_id = $1 
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    const conversations = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      lastMessage: row.last_message || "No messages yet",
      timestamp: row.timestamp,
    }));

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations",
    });
  }
});

// Get a specific conversation with messages
router.get("/conversations/:id", async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Verify conversation belongs to user
    const conversationResult = await Database.query(
      "SELECT id, title FROM conversations WHERE id = $1 AND user_id = $2",
      [conversationId, userId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Get messages
    const messagesResult = await Database.query(
      `SELECT id, content as text, is_user, created_at as timestamp 
       FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    const conversation = {
      id: conversationResult.rows[0].id,
      title: conversationResult.rows[0].title,
      messages: messagesResult.rows.map((row) => ({
        id: row.id,
        text: row.text,
        isUser: row.is_user,
        timestamp: row.timestamp.toISOString(),
      })),
    };

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation",
    });
  }
});

// Create a new conversation
router.post("/conversations", async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = "New Conversation", agentId } = req.body;

    // Create new conversation with agent ID
    const result = await Database.query(
      `INSERT INTO conversations (user_id, title, agent_id, created_at, updated_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, title, created_at as timestamp`,
      [userId, title, agentId]
    );

    const conversation = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      timestamp: result.rows[0].timestamp.toISOString(),
      lastMessage: "No messages yet",
    };

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create conversation",
    });
  }
});

// Send a message in a conversation
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const { message, agentId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message content is required",
      });
    }

    // Verify conversation belongs to user and get agent info
    const conversationResult = await Database.query(
      `SELECT c.id, c.title, c.agent_id, a.system_prompt, a.name as agent_name, a.preferred_model 
       FROM conversations c 
       LEFT JOIN agents a ON c.agent_id = a.id 
       WHERE c.id = $1 AND c.user_id = $2`,
      [conversationId, userId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    const conversation = conversationResult.rows[0];
    
    // Update conversation's agent if a new one is provided
    let systemPrompt = conversation.system_prompt;
    let preferredModel = conversation.preferred_model || 'deepseek-v3';
    
    if (agentId && agentId !== conversation.agent_id) {
      // Get the new agent's system prompt and model preference
      const agentResult = await Database.query(
        "SELECT system_prompt, preferred_model FROM agents WHERE id = $1 AND (user_id = $2 OR is_default = true)",
        [agentId, userId]
      );
      
      if (agentResult.rows.length > 0) {
        systemPrompt = agentResult.rows[0].system_prompt;
        preferredModel = agentResult.rows[0].preferred_model || 'deepseek-v3';
        // Update the conversation's agent
        await Database.query(
          "UPDATE conversations SET agent_id = $1 WHERE id = $2",
          [agentId, conversationId]
        );
      }
    }

    // Store user message
    const userMessageResult = await Database.query(
      `INSERT INTO messages (conversation_id, content, is_user) 
       VALUES ($1, $2, true) 
       RETURNING id, content as text, created_at as timestamp`,
      [conversationId, message.trim()]
    );

    const userMessage = {
      id: userMessageResult.rows[0].id,
      text: userMessageResult.rows[0].text,
      isUser: true,
      timestamp: userMessageResult.rows[0].timestamp.toISOString(),
    };

    // Get conversation history for AI context
    const historyResult = await Database.query(
      `SELECT content, is_user, created_at 
       FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    // Convert to DeepSeek message format with system prompt
    const messages = [];
    
    // Add system prompt if available
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }
    
    // Add conversation history
    messages.push(...historyResult.rows.map((row) => ({
      role: row.is_user ? "user" : "assistant",
      content: row.content,
    })));

    // Get AI response
    const aiService = getAIService(preferredModel);
    const aiResponse = await aiService.generateResponse(messages);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        error: aiResponse.error || "Failed to generate AI response",
      });
    }

    // Store AI response
    const aiMessageResult = await Database.query(
      `INSERT INTO messages (conversation_id, content, is_user) 
       VALUES ($1, $2, false) 
       RETURNING id, content as text, created_at as timestamp`,
      [conversationId, aiResponse.content]
    );

    const aiMessage = {
      id: aiMessageResult.rows[0].id,
      text: aiMessageResult.rows[0].text,
      isUser: false,
      timestamp: aiMessageResult.rows[0].timestamp.toISOString(),
    };

    // Update conversation timestamp
    await Database.query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [conversationId]
    );

    // Update conversation title if it's still default and we have enough context
    if (
      conversation.title === "New Conversation" &&
      historyResult.rows.length >= 2
    ) {
      try {
        const titlePrompt = [
          {
            role: "system",
            content:
              "Generate a short, descriptive title (max 5 words) for this conversation based on the user's first message. Return only the title, no quotes or extra text.",
          },
          { role: "user", content: message.trim() },
        ];

        const titleResponse = await aiService.generateResponse(
          titlePrompt
        );
        if (titleResponse.success) {
          const newTitle = titleResponse.content.trim().substring(0, 50);
          await Database.query(
            "UPDATE conversations SET title = $1 WHERE id = $2",
            [newTitle, conversationId]
          );
        }
      } catch (titleError) {
        console.warn("Failed to generate conversation title:", titleError);
      }
    }

    res.json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

// Delete a conversation
router.delete("/conversations/:id", async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Verify conversation belongs to user
    const result = await Database.query(
      "DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id",
      [conversationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    res.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete conversation",
    });
  }
});

// Get user's chat statistics
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await Database.query(
      `SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(m.id) as total_messages,
        COUNT(CASE WHEN m.is_user = true THEN 1 END) as user_messages,
        COUNT(CASE WHEN m.is_user = false THEN 1 END) as ai_messages
       FROM conversations c
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE c.user_id = $1`,
      [userId]
    );

    const stats = {
      totalConversations:
        parseInt(statsResult.rows[0].total_conversations) || 0,
      totalMessages: parseInt(statsResult.rows[0].total_messages) || 0,
      userMessages: parseInt(statsResult.rows[0].user_messages) || 0,
      aiMessages: parseInt(statsResult.rows[0].ai_messages) || 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

export default router;
