import dotenv from "dotenv";
import Database from "../config/database.js";

// Load environment variables
dotenv.config();

const createTables = async () => {
  try {
    console.log("🗄️  Initializing database tables...\n");

    // Initialize database connection first
    await Database.initialize();

    // Create users table
    await Database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created/verified");

    // Create conversations table
    await Database.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Conversations table created/verified");

    // Create messages table
    await Database.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Messages table created/verified");

    // Create agents table
    await Database.query(`
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
    console.log("✅ Agents table created/verified");

    // Create indexes for better performance
    await Database.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
    `);
    await Database.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    `);
    await Database.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);
    await Database.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
    `);
    await Database.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_is_default ON agents(is_default);
    `);
    console.log("✅ Database indexes created/verified");

    // Create default agent if it doesn't exist
    const defaultAgentResult = await Database.query(`
      SELECT COUNT(*) as count FROM agents WHERE is_default = true;
    `);
    
    if (defaultAgentResult.rows[0].count == 0) {
      await Database.query(`
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
      console.log("✅ Default agent created");
    } else {
      console.log("✅ Default agent already exists");
    }

    console.log("\n🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  } finally {
    await Database.close();
  }
};

// Run the initialization
createTables().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
