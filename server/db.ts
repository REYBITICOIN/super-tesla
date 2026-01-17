import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tokenBalances, tokenTransactions, creations, InsertCreation, InsertTokenTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Token Management
export async function getTokenBalance(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(tokenBalances)
    .where(eq(tokenBalances.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function initializeTokenBalance(userId: number, initialTokens: number = 1000) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .insert(tokenBalances)
      .values({
        userId,
        balance: initialTokens,
        totalAllocated: initialTokens,
      })
      .onDuplicateKeyUpdate({
        set: { balance: initialTokens, totalAllocated: initialTokens },
      });

    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize token balance:", error);
    throw error;
  }
}

export async function deductTokens(
  userId: number,
  amount: number,
  type: InsertTokenTransaction["type"],
  creationId?: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current balance
    const currentBalance = await getTokenBalance(userId);
    if (!currentBalance) throw new Error("Token balance not found");

    const newBalance = Math.max(0, currentBalance.balance - amount);

    // Update balance
    await db
      .update(tokenBalances)
      .set({
        balance: newBalance,
      })
      .where(eq(tokenBalances.userId, userId));

    // Record transaction
    const transaction = await db.insert(tokenTransactions).values({
      userId,
      amount: -amount,
      type,
      creationId,
      description,
    });

    return transaction;
  } catch (error) {
    console.error("[Database] Failed to deduct tokens:", error);
    throw error;
  }
}

export async function getTokenTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(tokenTransactions.createdAt)
    .limit(limit);

  return result;
}

// Creation Management
export async function createCreation(data: InsertCreation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(creations).values(data);
    // Get the created record to return it
    const created = await db
      .select()
      .from(creations)
      .where(eq(creations.userId, data.userId))
      .orderBy(creations.createdAt)
      .limit(1);
    
    return created[0];
  } catch (error) {
    console.error("[Database] Failed to create creation:", error);
    throw error;
  }
}

export async function getUserCreations(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(creations)
    .where(eq(creations.userId, userId))
    .orderBy(creations.createdAt)
    .limit(limit);

  return result;
}

export async function getCreationsByType(userId: number, type: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(creations)
    .where(and(eq(creations.userId, userId), eq(creations.type, type as any)))
    .orderBy(creations.createdAt)
    .limit(limit);

  return result;
}

export async function updateCreationStatus(
  creationId: number,
  status: "pending" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updateData: any = { status };
    if (errorMessage) updateData.errorMessage = errorMessage;

    const result = await db
      .update(creations)
      .set(updateData)
      .where(eq(creations.id, creationId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to update creation status:", error);
    throw error;
  }
}
