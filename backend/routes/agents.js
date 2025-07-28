import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Database from '../config/database.js';

const router = express.Router();

// Get all agents for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's custom agents
    const result = await Database.query(`
      SELECT id, name, description, system_prompt, is_default, preferred_model, created_at, updated_at 
      FROM agents 
      WHERE user_id = $1 OR is_default = true
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    // Transform snake_case to camelCase for frontend
    const agents = result.rows.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.system_prompt,
      isDefault: agent.is_default,
      preferredModel: agent.preferred_model,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at
    }));

    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Create a new custom agent
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, systemPrompt, preferredModel = 'deepseek-v3' } = req.body;

    if (!name || !description || !systemPrompt) {
      return res.status(400).json({ error: 'Name, description, and system prompt are required' });
    }

    const result = await Database.query(`
      INSERT INTO agents (user_id, name, description, system_prompt, preferred_model, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, description, system_prompt, preferred_model, is_default, created_at, updated_at
    `, [userId, name, description, systemPrompt, preferredModel]);

    // Transform snake_case to camelCase for frontend
    const agent = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      systemPrompt: result.rows[0].system_prompt,
      preferredModel: result.rows[0].preferred_model,
      isDefault: result.rows[0].is_default,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update an existing agent
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.id;
    const { name, description, systemPrompt, preferredModel = 'deepseek-v3' } = req.body;

    if (!name || !description || !systemPrompt) {
      return res.status(400).json({ error: 'Name, description, and system prompt are required' });
    }

    // Check if agent exists and belongs to user (or is default)
    const existingResult = await Database.query(`
      SELECT * FROM agents 
      WHERE id = $1 AND (user_id = $2 OR is_default = true)
    `, [agentId, userId]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const existingAgent = existingResult.rows[0];

    // Don't allow editing default agents
    if (existingAgent.is_default) {
      return res.status(403).json({ error: 'Cannot edit default agents' });
    }

    const updateResult = await Database.query(`
      UPDATE agents 
      SET name = $1, description = $2, system_prompt = $3, preferred_model = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING id, name, description, system_prompt, preferred_model, is_default, created_at, updated_at
    `, [name, description, systemPrompt, preferredModel, agentId, userId]);

    // Transform snake_case to camelCase for frontend
    const agent = {
      id: updateResult.rows[0].id,
      name: updateResult.rows[0].name,
      description: updateResult.rows[0].description,
      systemPrompt: updateResult.rows[0].system_prompt,
      preferredModel: updateResult.rows[0].preferred_model,
      isDefault: updateResult.rows[0].is_default,
      createdAt: updateResult.rows[0].created_at,
      updatedAt: updateResult.rows[0].updated_at
    };

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete an agent
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const agentId = req.params.id;

    // Check if agent exists and belongs to user
    const existingResult = await Database.query(`
      SELECT * FROM agents 
      WHERE id = $1 AND user_id = $2
    `, [agentId, userId]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const existingAgent = existingResult.rows[0];

    // Don't allow deleting default agents
    if (existingAgent.is_default) {
      return res.status(403).json({ error: 'Cannot delete default agents' });
    }

    await Database.query(`DELETE FROM agents WHERE id = $1 AND user_id = $2`, [agentId, userId]);

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router; 