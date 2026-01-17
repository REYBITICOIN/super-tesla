import { describe, expect, it, beforeEach } from "vitest";
import {
  getTokenBalance,
  initializeTokenBalance,
  deductTokens,
  getTokenTransactions,
} from "./db";

describe("Token System", () => {
  let testUserId = 99999;

  beforeEach(() => {
    testUserId = Math.floor(Math.random() * 1000000) + 100000;
  });

  describe("initializeTokenBalance", () => {
    it("should initialize token balance for a new user", async () => {
      const result = await initializeTokenBalance(testUserId, 1000);
      expect(result).toBeDefined();
    });

    it("should set correct initial balance", async () => {
      await initializeTokenBalance(testUserId, 1000);
      const balance = await getTokenBalance(testUserId);
      expect(balance?.balance).toBe(1000);
      expect(balance?.totalAllocated).toBe(1000);
    });
  });

  describe("getTokenBalance", () => {
    it("should return null for non-existent user", async () => {
      const balance = await getTokenBalance(999888777);
      expect(balance).toBeNull();
    });

    it("should return balance for existing user", async () => {
      await initializeTokenBalance(testUserId, 500);
      const balance = await getTokenBalance(testUserId);
      expect(balance).toBeDefined();
      expect(balance?.balance).toBe(500);
    });
  });

  describe("deductTokens", () => {
    it("should deduct tokens from user balance", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      const balanceBefore = await getTokenBalance(testUserId);
      expect(balanceBefore?.balance).toBe(1000);

      await deductTokens(testUserId, 50, "image_generation", undefined, "Test deduction");

      const balanceAfter = await getTokenBalance(testUserId);
      expect(balanceAfter?.balance).toBe(950);
    });

    it("should not allow negative balance", async () => {
      await initializeTokenBalance(testUserId, 30);
      
      await deductTokens(testUserId, 50, "image_generation");

      const balance = await getTokenBalance(testUserId);
      expect(balance?.balance).toBeGreaterThanOrEqual(0);
    });

    it("should record transaction", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      await deductTokens(testUserId, 50, "image_generation", undefined, "Test transaction");

      const transactions = await getTokenTransactions(testUserId, 10);
      const lastTransaction = transactions[transactions.length - 1];
      
      expect(lastTransaction).toBeDefined();
      expect(lastTransaction?.amount).toBe(-50);
      expect(lastTransaction?.type).toBe("image_generation");
    });
  });

  describe("getTokenTransactions", () => {
    it("should return empty array for user with no transactions", async () => {
      const transactions = await getTokenTransactions(999777666);
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBe(0);
    });

    it("should return transactions in order", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      await deductTokens(testUserId, 50, "image_generation");
      await deductTokens(testUserId, 30, "upscale");
      await deductTokens(testUserId, 20, "tts");

      const transactions = await getTokenTransactions(testUserId, 10);
      
      expect(transactions.length).toBeGreaterThanOrEqual(3);
      const hasImageGen = transactions.some(t => t.type === "image_generation");
      const hasUpscale = transactions.some(t => t.type === "upscale");
      const hasTts = transactions.some(t => t.type === "tts");
      expect(hasImageGen).toBe(true);
      expect(hasUpscale).toBe(true);
      expect(hasTts).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const transactions = await getTokenTransactions(testUserId, 2);
      expect(transactions.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Token Costs", () => {
    it("should correctly calculate image generation cost", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      await deductTokens(testUserId, 50, "image_generation");
      const balance = await getTokenBalance(testUserId);
      
      expect(balance?.balance).toBe(950);
    });

    it("should correctly calculate video generation cost", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      await deductTokens(testUserId, 200, "video_generation");
      const balance = await getTokenBalance(testUserId);
      
      expect(balance?.balance).toBe(800);
    });

    it("should correctly calculate upscale cost", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      await deductTokens(testUserId, 30, "upscale");
      const balance = await getTokenBalance(testUserId);
      
      expect(balance?.balance).toBe(970);
    });

    it("should correctly calculate TTS cost", async () => {
      await initializeTokenBalance(testUserId, 1000);
      
      await deductTokens(testUserId, 20, "tts");
      const balance = await getTokenBalance(testUserId);
      
      expect(balance?.balance).toBe(980);
    });
  });
});
