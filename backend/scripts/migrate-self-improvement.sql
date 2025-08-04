-- Migration script for self-improvement functionality
-- Run this script to add the new tables for AI agent self-improvement

-- Self-improvement settings table
CREATE TABLE IF NOT EXISTS self_improvement_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT false NOT NULL,
    mode VARCHAR(20) DEFAULT 'manual' NOT NULL, -- 'auto', 'manual', 'disabled'
    prompt_interval INTEGER DEFAULT 5 NOT NULL, -- Number of prompts before analysis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_self_improvement_settings_user_id ON self_improvement_settings(user_id);

-- Agent prompt history table
CREATE TABLE IF NOT EXISTS agent_prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    previous_name VARCHAR(255) NOT NULL,
    previous_description TEXT NOT NULL,
    previous_system_prompt TEXT NOT NULL,
    new_name VARCHAR(255) NOT NULL,
    new_description TEXT NOT NULL,
    new_system_prompt TEXT NOT NULL,
    analysis_data TEXT, -- JSON string containing conversation analysis
    improvement_reason TEXT NOT NULL,
    is_applied BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_prompt_history_agent_id ON agent_prompt_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompt_history_created_at ON agent_prompt_history(created_at);

-- Conversation analysis tracking table
CREATE TABLE IF NOT EXISTS conversation_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_prompt_count INTEGER DEFAULT 0 NOT NULL,
    last_analyzed_at TIMESTAMP,
    theme_analysis TEXT, -- JSON string containing detected themes
    performance_metrics TEXT, -- JSON string containing performance data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversation_analysis_conversation_id ON conversation_analysis(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analysis_agent_id ON conversation_analysis(agent_id);

-- Insert default self-improvement settings for existing users
INSERT INTO self_improvement_settings (user_id, is_enabled, mode, prompt_interval)
SELECT id, false, 'manual', 5
FROM users
WHERE id NOT IN (SELECT user_id FROM self_improvement_settings);

COMMIT;