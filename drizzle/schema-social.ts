import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
