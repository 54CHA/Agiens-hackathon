import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const { Pool } = pg;

class Database {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not found. Database features will be disabled.');
      console.log('📋 To enable database features, add DATABASE_URL to your .env file');
      return;
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('neon') 
        ? { rejectUnauthorized: false } 
        : false,
    });
    
    this.isInitialized = true;
    await this.testConnection();
    
    // Auto-initialize database schema
    await this.initializeSchema();
  }

  async testConnection() {
    if (!this.pool) {
      console.log('🔄 Database not configured - using in-memory storage');
      return;
    }

    try {
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');
      console.log(`🔗 Connected to external database`);
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('🔄 Falling back to in-memory storage for this session');
      console.log('🔍 Troubleshooting tips:');
      console.log('   - Verify your DATABASE_URL is correct');
      console.log('   - Check if your database allows external connections');
      console.log('   - Ensure your IP is whitelisted (for cloud databases)');
      
      // Don't throw error, just disable database features
      this.pool = null;
      this.isInitialized = false;
    }
  }

  async initializeSchema() {
    if (!this.pool) return;

    try {
      console.log('🔧 Auto-initializing database schema...');

      // Create users table
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create agents table
      await this.query(`
        CREATE TABLE IF NOT EXISTS agents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          system_prompt TEXT NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create conversations table with agent_id
      await this.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add agent_id column if it doesn't exist (migration)
      await this.query(`
        ALTER TABLE conversations ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;
      `);

      // Add model preference column if it doesn't exist (migration)
      await this.query(`
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS preferred_model VARCHAR(50) DEFAULT 'deepseek-v3';
      `);

      // Create messages table
      await this.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_user BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for better performance
      await this.query(`CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_agents_is_default ON agents(is_default);`);

      // Create default agent if it doesn't exist
      const defaultAgentResult = await this.query(`
        SELECT COUNT(*) as count FROM agents WHERE is_default = true;
      `);
      
      if (defaultAgentResult.rows[0].count == 0) {
        await this.query(`
          INSERT INTO agents (user_id, name, description, system_prompt, is_default, created_at, updated_at)
          VALUES (
            NULL,
            'General Assistant',
            'A helpful AI assistant for general questions and tasks',
            'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and helpful responses to user questions. Be concise but thorough in your explanations.',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Default agent created');
      }

      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database schema:', error);
      // Don't throw error to prevent server from crashing
    }
  }

  async query(text, params) {
    if (!this.pool) {
      throw new Error('Database not available. Using in-memory storage.');
    }

    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      // Only log query info in development or for slow queries
      if (process.env.NODE_ENV === 'development' || duration > 1000) {
      console.log('Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
      }
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient() {
    if (!this.pool) {
      throw new Error('Database not available');
    }
    return await this.pool.connect();
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  isAvailable() {
    return !!this.pool;
  }
}

const database = new Database();
export default database;
