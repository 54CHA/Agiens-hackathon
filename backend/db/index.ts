import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const connection = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('neon') 
    ? { rejectUnauthorized: false } 
    : false,
});

// Create the database instance
export const db = drizzle(connection, { schema });

// Export schema for use in other files
export * from './schema.js';

// Helper function to close the connection
export const closeConnection = async () => {
  await connection.end();
}; 