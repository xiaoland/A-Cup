import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tags: text('tags').notNull(), // JSON array
  createdBy: text('created_by').notNull().references(() => users.id),
  outbounds: text('outbounds').notNull().default("[]"), // JSON array of Outbound Ids
  rule_sets: text('rule_sets').notNull().default("[]"), // JSON array of RuleSet Ids
});

export const outbounds = sqliteTable('outbounds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  readableBy: text('readable_by').notNull().default("[]"), // JSON array of strings
  writeableBy: text('writeable_by').notNull().default("[]"), // JSON array of strings
  name: text('name').notNull(),
  region: text('region').notNull(),
  provider: text('provider').notNull(),
  type: text('type').notNull(),
  server: text('server').notNull(),
  server_port: integer('server_port').notNull(),
  credential: text('credential').notNull().default("{}"), // JSON object
  tls: text('tls').notNull().default("{}"), // JSON object
  mux: text('mux').notNull().default("{}"), // JSON object
  other: text('other').notNull().default("{}"), // JSON object
});

export const ruleSets = sqliteTable('rule_sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  readableBy: text('readable_by').notNull().default("[]"), // JSON array of strings
  writeableBy: text('writeable_by').notNull().default("[]"), // JSON array of strings
  name: text('tag').notNull(),
  type: text('type').notNull(),
  format: text('format'),
  content: text('content').notNull(),
});
