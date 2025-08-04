import express from 'express';
import Database from '../config/database.js';
import DeepSeekService from '../services/deepseekService.js';
import GeminiService from '../services/geminiService.js';
import OpenAIService from '../services/openaiService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize AI services only when needed
const getDeepSeekService = () => {
  return new DeepSeekService();
};

const getGeminiService = () => {
  return new GeminiService();
};

const getOpenAIService = () => {
  return new OpenAIService();
};

const getAIService = (model) => {
  switch (model) {
    case 'gemini-2.5-pro':
      return getGeminiService();
    case 'gpt-4o':
    case 'openai':
      return getOpenAIService();
    case 'deepseek-v3':
    default:
      return getDeepSeekService();
  }
};

// Apply authentication to all self-improvement routes
router.use(authenticateToken);

// Get self-improvement settings for the current user
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Database.query(
      `SELECT * FROM self_improvement_settings WHERE user_id = $1`,
      [userId]
    );

    // If no settings exist, create default ones
    if (result.rows.length === 0) {
      const defaultSettings = await Database.query(
        `INSERT INTO self_improvement_settings (user_id, is_enabled, mode, prompt_interval)
         VALUES ($1, false, 'manual', 5)
         RETURNING *`,
        [userId]
      );
      
      return res.json({
        success: true,
        settings: {
          isEnabled: defaultSettings.rows[0].is_enabled,
          mode: defaultSettings.rows[0].mode,
          promptInterval: defaultSettings.rows[0].prompt_interval,
        },
      });
    }

    const settings = result.rows[0];
    res.json({
      success: true,
      settings: {
        isEnabled: settings.is_enabled,
        mode: settings.mode,
        promptInterval: settings.prompt_interval,
      },
    });
  } catch (error) {
    console.error('Error fetching self-improvement settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
    });
  }
});

// Update self-improvement settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user.id;
    const { isEnabled, mode, promptInterval } = req.body;

    // Validate input
    if (typeof isEnabled !== 'boolean' || 
        !['auto', 'manual', 'disabled'].includes(mode) ||
        !Number.isInteger(promptInterval) || promptInterval < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings data',
      });
    }

    const result = await Database.query(
      `UPDATE self_improvement_settings 
       SET is_enabled = $1, mode = $2, prompt_interval = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING *`,
      [isEnabled, mode, promptInterval, userId]
    );

    if (result.rows.length === 0) {
      // Create if doesn't exist
      const newSettings = await Database.query(
        `INSERT INTO self_improvement_settings (user_id, is_enabled, mode, prompt_interval)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, isEnabled, mode, promptInterval]
      );
      
      const settings = newSettings.rows[0];
      return res.json({
        success: true,
        settings: {
          isEnabled: settings.is_enabled,
          mode: settings.mode,
          promptInterval: settings.prompt_interval,
        },
      });
    }

    const settings = result.rows[0];
    res.json({
      success: true,
      settings: {
        isEnabled: settings.is_enabled,
        mode: settings.mode,
        promptInterval: settings.prompt_interval,
      },
    });
  } catch (error) {
    console.error('Error updating self-improvement settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
    });
  }
});

// Get prompt history for an agent
router.get('/agents/:agentId/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.agentId;

    // Verify agent belongs to user
    const agentCheck = await Database.query(
      `SELECT id FROM agents WHERE id = $1 AND (user_id = $2 OR is_default = true)`,
      [agentId, userId]
    );

    if (agentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    const result = await Database.query(
      `SELECT * FROM agent_prompt_history 
       WHERE agent_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [agentId]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      previousName: row.previous_name,
      previousDescription: row.previous_description,
      previousSystemPrompt: row.previous_system_prompt,
      newName: row.new_name,
      newDescription: row.new_description,
      newSystemPrompt: row.new_system_prompt,
      analysisData: row.analysis_data ? JSON.parse(row.analysis_data) : null,
      improvementReason: row.improvement_reason,
      isApplied: row.is_applied,
      createdAt: row.created_at,
    }));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error fetching prompt history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompt history',
    });
  }
});

// Analyze conversation and generate improved prompt
router.post('/agents/:agentId/analyze', async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.agentId;

    // Verify agent belongs to user
    const agentResult = await Database.query(
      `SELECT * FROM agents WHERE id = $1 AND (user_id = $2 OR is_default = true)`,
      [agentId, userId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    const agent = agentResult.rows[0];

    // Get recent conversations for this agent
    const conversationsResult = await Database.query(
      `SELECT c.id, c.title, m.content, m.is_user, m.created_at
       FROM conversations c
       JOIN messages m ON c.id = m.conversation_id
       WHERE c.agent_id = $1 AND c.user_id = $2
       ORDER BY m.created_at DESC
       LIMIT 100`,
      [agentId, userId]
    );

    if (conversationsResult.rows.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Not enough conversation data for analysis',
      });
    }

    // Analyze conversation patterns and themes
    const messages = conversationsResult.rows;
    const userMessages = messages.filter(m => m.is_user).slice(0, 20);
    const agentMessages = messages.filter(m => !m.is_user).slice(0, 20);

    // Create analysis prompt
    const analysisPrompt = `
Analyze the following conversation patterns between a user and an AI agent to suggest improvements to the agent's system prompt.

Current Agent:
- Name: ${agent.name}
- Description: ${agent.description}
- System Prompt: ${agent.system_prompt}

Recent User Messages:
${userMessages.map(m => `- ${m.content.substring(0, 200)}`).join('\n')}

Recent Agent Responses:
${agentMessages.map(m => `- ${m.content.substring(0, 200)}`).join('\n')}

Please analyze:
1. What themes and topics are most common in the conversations?
2. What style of communication does the user prefer?
3. Are there gaps in the agent's responses or areas for improvement?
4. What specific expertise or personality traits would make the agent more effective?

Based on this analysis, suggest an improved:
- Agent Name (if needed)
- Agent Description
- System Prompt

Respond in JSON format:
{
  "analysis": {
    "themes": ["theme1", "theme2"],
    "communicationStyle": "description",
    "gaps": ["gap1", "gap2"],
    "recommendations": ["rec1", "rec2"]
  },
  "improvements": {
    "name": "new name",
    "description": "new description", 
    "systemPrompt": "new system prompt",
    "reason": "explanation of why these changes would improve the agent"
  }
}`;

    // Get AI analysis
    const aiService = getAIService('deepseek-v3'); // Use a reliable model for analysis
    const analysisResult = await aiService.generateResponse([
      { role: 'user', content: analysisPrompt }
    ]);

    if (!analysisResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze conversation',
      });
    }

    let analysisData;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisResult.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse analysis response:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse analysis results',
      });
    }

    // Store the analysis in prompt history (but don't apply yet)
    const historyResult = await Database.query(
      `INSERT INTO agent_prompt_history 
       (agent_id, previous_name, previous_description, previous_system_prompt,
        new_name, new_description, new_system_prompt, analysis_data, improvement_reason, is_applied)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
       RETURNING id`,
      [
        agentId,
        agent.name,
        agent.description,
        agent.system_prompt,
        analysisData.improvements.name,
        analysisData.improvements.description,
        analysisData.improvements.systemPrompt,
        JSON.stringify(analysisData.analysis),
        analysisData.improvements.reason
      ]
    );

    res.json({
      success: true,
      analysisId: historyResult.rows[0].id,
      analysis: analysisData.analysis,
      improvements: analysisData.improvements,
    });
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze conversation',
    });
  }
});

// Apply a prompt improvement
router.post('/agents/:agentId/apply-improvement/:historyId', async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.agentId;
    const historyId = req.params.historyId;

    // Verify agent belongs to user
    const agentResult = await Database.query(
      `SELECT * FROM agents WHERE id = $1 AND (user_id = $2 OR is_default = true)`,
      [agentId, userId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    // Get the improvement from history
    const historyResult = await Database.query(
      `SELECT * FROM agent_prompt_history WHERE id = $1 AND agent_id = $2`,
      [historyId, agentId]
    );

    if (historyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Improvement not found',
      });
    }

    const improvement = historyResult.rows[0];

    // Apply the improvement to the agent
    const updateResult = await Database.query(
      `UPDATE agents 
       SET name = $1, description = $2, system_prompt = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        improvement.new_name,
        improvement.new_description,
        improvement.new_system_prompt,
        agentId
      ]
    );

    // Mark improvement as applied
    await Database.query(
      `UPDATE agent_prompt_history SET is_applied = true WHERE id = $1`,
      [historyId]
    );

    const updatedAgent = updateResult.rows[0];

    res.json({
      success: true,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        description: updatedAgent.description,
        systemPrompt: updatedAgent.system_prompt,
        isDefault: updatedAgent.is_default,
        createdAt: updatedAgent.created_at,
        updatedAt: updatedAgent.updated_at,
      },
    });
  } catch (error) {
    console.error('Error applying improvement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply improvement',
    });
  }
});

// Track conversation analysis
router.post('/conversations/:conversationId/track-prompt', async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;

    // Verify conversation belongs to user
    const conversationResult = await Database.query(
      `SELECT c.*, a.id as agent_id FROM conversations c
       LEFT JOIN agents a ON c.agent_id = a.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [conversationId, userId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const conversation = conversationResult.rows[0];

    if (!conversation.agent_id) {
      return res.status(400).json({
        success: false,
        error: 'No agent associated with conversation',
      });
    }

    // Update or create conversation analysis record
    const existingResult = await Database.query(
      `SELECT user_prompt_count FROM conversation_analysis WHERE conversation_id = $1`,
      [conversationId]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing record
      result = await Database.query(
        `UPDATE conversation_analysis 
         SET user_prompt_count = user_prompt_count + 1, updated_at = CURRENT_TIMESTAMP
         WHERE conversation_id = $1
         RETURNING user_prompt_count`,
        [conversationId]
      );
    } else {
      // Create new record
      result = await Database.query(
        `INSERT INTO conversation_analysis (conversation_id, agent_id, user_prompt_count)
         VALUES ($1, $2, 1)
         RETURNING user_prompt_count`,
        [conversationId, conversation.agent_id]
      );
    }

    const promptCount = result.rows[0].user_prompt_count;

    res.json({
      success: true,
      promptCount,
    });
  } catch (error) {
    console.error('Error tracking prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track prompt',
    });
  }
});

export default router;