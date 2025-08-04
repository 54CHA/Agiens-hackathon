import { pgTable, uuid, varchar, text, boolean, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Agents table
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_agents_user_id').on(table.userId),
  isDefaultIdx: index('idx_agents_is_default').on(table.isDefault),
}));

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_conversations_user_id').on(table.userId),
}));

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isUser: boolean('is_user').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index('idx_messages_conversation_id').on(table.conversationId),
  createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
}));

// Self-improvement settings table
export const selfImprovementSettings = pgTable('self_improvement_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  mode: varchar('mode', { length: 20 }).default('manual').notNull(), // 'auto', 'manual', 'disabled'
  promptInterval: integer('prompt_interval').default(5).notNull(), // Number of prompts before analysis
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_self_improvement_settings_user_id').on(table.userId),
}));

// Agent prompt history table
export const agentPromptHistory = pgTable('agent_prompt_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  previousName: varchar('previous_name', { length: 255 }).notNull(),
  previousDescription: text('previous_description').notNull(),
  previousSystemPrompt: text('previous_system_prompt').notNull(),
  newName: varchar('new_name', { length: 255 }).notNull(),
  newDescription: text('new_description').notNull(),
  newSystemPrompt: text('new_system_prompt').notNull(),
  analysisData: text('analysis_data'), // JSON string containing conversation analysis
  improvementReason: text('improvement_reason').notNull(),
  isApplied: boolean('is_applied').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  agentIdIdx: index('idx_agent_prompt_history_agent_id').on(table.agentId),
  createdAtIdx: index('idx_agent_prompt_history_created_at').on(table.createdAt),
}));

// Conversation analysis tracking table
export const conversationAnalysis = pgTable('conversation_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  userPromptCount: integer('user_prompt_count').default(0).notNull(),
  lastAnalyzedAt: timestamp('last_analyzed_at'),
  themeAnalysis: text('theme_analysis'), // JSON string containing detected themes
  performanceMetrics: text('performance_metrics'), // JSON string containing performance data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index('idx_conversation_analysis_conversation_id').on(table.conversationId),
  agentIdIdx: index('idx_conversation_analysis_agent_id').on(table.agentId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  conversations: many(conversations),
  selfImprovementSettings: many(selfImprovementSettings),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
  promptHistory: many(agentPromptHistory),
  conversationAnalyses: many(conversationAnalysis),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [conversations.agentId],
    references: [agents.id],
  }),
  messages: many(messages),
  analysis: many(conversationAnalysis),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const selfImprovementSettingsRelations = relations(selfImprovementSettings, ({ one }) => ({
  user: one(users, {
    fields: [selfImprovementSettings.userId],
    references: [users.id],
  }),
}));

export const agentPromptHistoryRelations = relations(agentPromptHistory, ({ one }) => ({
  agent: one(agents, {
    fields: [agentPromptHistory.agentId],
    references: [agents.id],
  }),
}));

export const conversationAnalysisRelations = relations(conversationAnalysis, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationAnalysis.conversationId],
    references: [conversations.id],
  }),
  agent: one(agents, {
    fields: [conversationAnalysis.agentId],
    references: [agents.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type SelfImprovementSettings = typeof selfImprovementSettings.$inferSelect;
export type NewSelfImprovementSettings = typeof selfImprovementSettings.$inferInsert;

export type AgentPromptHistory = typeof agentPromptHistory.$inferSelect;
export type NewAgentPromptHistory = typeof agentPromptHistory.$inferInsert;

export type ConversationAnalysis = typeof conversationAnalysis.$inferSelect;
export type NewConversationAnalysis = typeof conversationAnalysis.$inferInsert; 