import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Token balance for each user.
 * Tracks current balance and total tokens allocated.
 */
export const tokenBalances = mysqlTable("tokenBalances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: int("balance").default(1000).notNull(), // Starting balance
  totalAllocated: int("totalAllocated").default(1000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TokenBalance = typeof tokenBalances.$inferSelect;
export type InsertTokenBalance = typeof tokenBalances.$inferInsert;

/**
 * Audit trail for token transactions.
 * Records every token consumption event.
 */
export const tokenTransactions = mysqlTable("tokenTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // Negative for deductions
  type: mysqlEnum("type", ["image_generation", "video_generation", "upscale", "tts", "initial_allocation", "purchase"]).notNull(),
  creationId: int("creationId"), // Reference to the creation that consumed tokens
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * User creations (images, videos, etc).
 * Stores metadata about generated content.
 */
export const creations = mysqlTable("creations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["image", "video", "upscale", "tts", "flow"]).notNull(),
  prompt: text("prompt").notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(), // S3 file path
  s3Url: varchar("s3Url", { length: 2048 }).notNull(), // Public S3 URL
  mimeType: varchar("mimeType", { length: 64 }),
  tokensUsed: int("tokensUsed").notNull(),
  metadata: text("metadata"), // JSON string for additional data
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Creation = typeof creations.$inferSelect;
export type InsertCreation = typeof creations.$inferInsert;

/**
 * Tabela para armazenar credenciais de redes sociais conectadas
 * Armazena tokens de acesso de forma segura
 */
export const socialMediaAccounts = mysqlTable("social_media_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, instagram, tiktok
  platformUserId: varchar("platformUserId", { length: 255 }).notNull(),
  platformUsername: varchar("platformUsername", { length: 255 }),
  accessToken: text("accessToken").notNull(), // Criptografado
  refreshToken: text("refreshToken"), // Para renovação automática
  expiresAt: timestamp("expiresAt"),
  isConnected: int("isConnected").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela para armazenar histórico de publicações
 */
export const publishedPosts = mysqlTable("published_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  creationId: int("creationId"), // Referência ao comercial gerado
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, instagram, tiktok
  platformPostId: varchar("platformPostId", { length: 255 }),
  title: text("title"),
  description: text("description"),
  mediaUrl: text("mediaUrl"),
  status: varchar("status", { length: 50 }).default("published").notNull(), // published, failed, pending
  engagementMetrics: text("engagementMetrics"), // JSON com likes, comments, shares
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

export type PublishedPost = typeof publishedPosts.$inferSelect;
export type InsertPublishedPost = typeof publishedPosts.$inferInsert;
