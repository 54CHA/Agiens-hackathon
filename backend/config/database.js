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

  initialize() {
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
    this.testConnection();
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

  async query(text, params) {
    if (!this.pool) {
      throw new Error('Database not available. Using in-memory storage.');
    }

    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
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
