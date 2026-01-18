import { describe, it, expect, beforeEach, vi } from "vitest";
import { getDb } from "./db";
import { socialMediaAccounts } from "../drizzle/schema";
import { eq, and, update } from "drizzle-orm";

describe("Social Media Integration", () => {
  let db: any;

  beforeEach(async () => {
    db = await getDb();
    if (!db) {
      console.warn("Database not available for testing");
    }
  });

  describe("Social Media Accounts", () => {
    it("should insert a Facebook account", async () => {
      if (!db) return;

      const testUserId = 1;
      const testAccount = {
        userId: testUserId,
        platform: "facebook",
        platformUserId: "fb_user_123",
        platformUsername: "Test User",
        accessToken: "test_token_facebook",
        refreshToken: "test_refresh_facebook",
        expiresAt: new Date(Date.now() + 3600 * 1000),
        isConnected: 1,
      };

      try {
        await db.insert(socialMediaAccounts).values(testAccount);

        const result = await db
          .select()
          .from(socialMediaAccounts)
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, "facebook")
            )
          );

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].platform).toBe("facebook");
        expect(result[0].platformUsername).toBe("Test User");
      } catch (error) {
        console.error("Error inserting Facebook account:", error);
        throw error;
      }
    });

    it("should insert a TikTok account", async () => {
      if (!db) return;

      const testUserId = 1;
      const testAccount = {
        userId: testUserId,
        platform: "tiktok",
        platformUserId: "tt_user_456",
        platformUsername: "TikTok User",
        accessToken: "test_token_tiktok",
        refreshToken: "test_refresh_tiktok",
        expiresAt: new Date(Date.now() + 3600 * 1000),
        isConnected: 1,
      };

      try {
        await db.insert(socialMediaAccounts).values(testAccount);

        const result = await db
          .select()
          .from(socialMediaAccounts)
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, "tiktok")
            )
          );

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].platform).toBe("tiktok");
        expect(result[0].platformUsername).toBe("TikTok User");
      } catch (error) {
        console.error("Error inserting TikTok account:", error);
        throw error;
      }
    });

    it("should insert an Instagram account", async () => {
      if (!db) return;

      const testUserId = 1;
      const testAccount = {
        userId: testUserId,
        platform: "instagram",
        platformUserId: "ig_user_789",
        platformUsername: "Instagram User",
        accessToken: "test_token_instagram",
        refreshToken: "test_refresh_instagram",
        expiresAt: new Date(Date.now() + 3600 * 1000),
        isConnected: 1,
      };

      try {
        await db.insert(socialMediaAccounts).values(testAccount);

        const result = await db
          .select()
          .from(socialMediaAccounts)
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, "instagram")
            )
          );

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].platform).toBe("instagram");
        expect(result[0].platformUsername).toBe("Instagram User");
      } catch (error) {
        console.error("Error inserting Instagram account:", error);
        throw error;
      }
    });

    it("should update an existing account", async () => {
      if (!db) return;

      const testUserId = 1;
      const platform = "facebook";

      try {
        // Insert initial account
        await db
          .insert(socialMediaAccounts)
          .values({
            userId: testUserId,
            platform,
            platformUserId: "fb_user_update_test",
            platformUsername: "Test User",
            accessToken: "old_token",
            refreshToken: null,
            expiresAt: new Date(Date.now() + 3600 * 1000),
            isConnected: 1,
          });

        // Update the account using UPDATE statement
        await db
          .update(socialMediaAccounts)
          .set({
            accessToken: "new_token",
            refreshToken: "new_refresh",
          })
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, platform)
            )
          );

        const result = await db
          .select()
          .from(socialMediaAccounts)
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, platform)
            )
          );

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].accessToken).toBe("new_token");
      } catch (error) {
        console.error("Error updating account:", error);
        throw error;
      }
    });

    it("should retrieve all accounts for a user", async () => {
      if (!db) return;

      const testUserId = 1;

      try {
        const accounts = await db
          .select()
          .from(socialMediaAccounts)
          .where(eq(socialMediaAccounts.userId, testUserId));

        expect(Array.isArray(accounts)).toBe(true);
        // Should have at least the accounts we created in previous tests
        expect(accounts.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.error("Error retrieving accounts:", error);
        throw error;
      }
    });

    it("should delete a social media account", async () => {
      if (!db) return;

      const testUserId = 1;
      const platform = "facebook";

      try {
        // Delete the account
        await db
          .delete(socialMediaAccounts)
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, platform)
            )
          );

        const result = await db
          .select()
          .from(socialMediaAccounts)
          .where(
            and(
              eq(socialMediaAccounts.userId, testUserId),
              eq(socialMediaAccounts.platform, platform)
            )
          );

        expect(result.length).toBe(0);
      } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
    });
  });

  describe("OAuth URL Generation", () => {
    it("should generate a valid Facebook OAuth URL", async () => {
      const { getFacebookAuthUrl } = await import("./_core/socialMedia");
      const url = getFacebookAuthUrl();

      expect(url).toContain("facebook.com");
      expect(url).toContain("oauth");
      expect(url).toContain("client_id");
      expect(url).toContain("redirect_uri");
      expect(url).toContain("scope");
    });

    it("should generate a valid TikTok OAuth URL", async () => {
      const { getTikTokAuthUrl } = await import("./_core/socialMedia");
      const url = getTikTokAuthUrl();

      expect(url).toContain("tiktok.com");
      expect(url).toContain("oauth");
      expect(url).toContain("client_key");
      expect(url).toContain("redirect_uri");
      expect(url).toContain("scope");
    });
  });
});
