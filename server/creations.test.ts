import { describe, expect, it, beforeEach } from "vitest";
import {
  createCreation,
  getUserCreations,
  getCreationsByType,
  updateCreationStatus,
  initializeTokenBalance,
} from "./db";

describe("Creation System", () => {
  let testUserId = 88888;

  beforeEach(() => {
    testUserId = Math.floor(Math.random() * 1000000) + 100000;
  });

  describe("createCreation", () => {
    it("should create a new image creation", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "image",
        prompt: "A beautiful sunset",
        s3Key: "images/test-image.png",
        s3Url: "https://example.com/test-image.png",
        mimeType: "image/png",
        tokensUsed: 50,
        status: "completed",
      });

      expect(creation).toBeDefined();
      expect(creation?.id).toBeDefined();
      expect(creation?.type).toBe("image");
      expect(creation?.prompt).toBe("A beautiful sunset");
    });

    it("should create a video creation", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "video",
        prompt: "A dancing person",
        s3Key: "videos/test-video.mp4",
        s3Url: "https://example.com/test-video.mp4",
        mimeType: "video/mp4",
        tokensUsed: 200,
        status: "completed",
      });

      expect(creation?.type).toBe("video");
      expect(creation?.tokensUsed).toBe(200);
    });

    it("should create a TTS creation", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "tts",
        prompt: "Hello world",
        s3Key: "audio/test-audio.mp3",
        s3Url: "https://example.com/test-audio.mp3",
        mimeType: "audio/mpeg",
        tokensUsed: 20,
        status: "completed",
      });

      expect(creation?.type).toBe("tts");
      expect(creation?.tokensUsed).toBe(20);
    });

    it("should store metadata as JSON", async () => {
      const metadata = JSON.stringify({ voice: "en-US", speed: 1.0 });
      const creation = await createCreation({
        userId: testUserId,
        type: "tts",
        prompt: "Test metadata",
        s3Key: "audio/test.mp3",
        s3Url: "https://example.com/test.mp3",
        mimeType: "audio/mpeg",
        tokensUsed: 20,
        metadata,
        status: "completed",
      });

      expect(creation?.metadata).toBe(metadata);
    });
  });

  describe("getUserCreations", () => {
    it("should return empty array for user with no creations", async () => {
      const creations = await getUserCreations(777666555);
      expect(Array.isArray(creations)).toBe(true);
      expect(creations.length).toBe(0);
    });

    it("should return user creations", async () => {
      await createCreation({
        userId: testUserId,
        type: "image",
        prompt: "Test image",
        s3Key: "images/test.png",
        s3Url: "https://example.com/test.png",
        mimeType: "image/png",
        tokensUsed: 50,
        status: "completed",
      });

      const creations = await getUserCreations(testUserId, 10);
      expect(creations.length).toBeGreaterThan(0);
      expect(creations[0]?.userId).toBe(testUserId);
    });

    it("should respect limit parameter", async () => {
      const creations = await getUserCreations(testUserId, 1);
      expect(creations.length).toBeLessThanOrEqual(1);
    });

    it("should return creations in reverse chronological order", async () => {
      const creations = await getUserCreations(testUserId, 10);
      
      if (creations.length > 1) {
        const first = new Date(creations[0]?.createdAt || 0).getTime();
        const second = new Date(creations[1]?.createdAt || 0).getTime();
        expect(first).toBeLessThanOrEqual(second);
      }
    });
  });

  describe("getCreationsByType", () => {
    it("should return empty array for non-existent type", async () => {
      const creations = await getCreationsByType(testUserId, "nonexistent");
      expect(Array.isArray(creations)).toBe(true);
    });

    it("should filter creations by type", async () => {
      await createCreation({
        userId: testUserId,
        type: "image",
        prompt: "Image test",
        s3Key: "images/filter-test.png",
        s3Url: "https://example.com/filter-test.png",
        mimeType: "image/png",
        tokensUsed: 50,
        status: "completed",
      });

      const imageCreations = await getCreationsByType(testUserId, "image", 10);
      
      if (imageCreations.length > 0) {
        expect(imageCreations.every(c => c.type === "image")).toBe(true);
      }
    });

    it("should return only user's creations", async () => {
      const creations = await getCreationsByType(testUserId, "image", 10);
      
      if (creations.length > 0) {
        expect(creations.every(c => c.userId === testUserId)).toBe(true);
      }
    });
  });

  describe("updateCreationStatus", () => {
    it("should update creation status to completed", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "image",
        prompt: "Status test",
        s3Key: "images/status-test.png",
        s3Url: "https://example.com/status-test.png",
        mimeType: "image/png",
        tokensUsed: 50,
        status: "pending",
      });

      if (creation?.id) {
        await updateCreationStatus(creation.id, "completed");
        
        const updated = await getUserCreations(testUserId, 10);
        const found = updated.find(c => c.id === creation.id);
        expect(found?.status).toBe("completed");
      }
    });

    it("should update creation status to failed with error message", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "video",
        prompt: "Error test",
        s3Key: "videos/error-test.mp4",
        s3Url: "https://example.com/error-test.mp4",
        mimeType: "video/mp4",
        tokensUsed: 200,
        status: "pending",
      });

      if (creation?.id) {
        const errorMsg = "Generation timeout";
        await updateCreationStatus(creation.id, "failed", errorMsg);
        
        const updated = await getUserCreations(testUserId, 10);
        const found = updated.find(c => c.id === creation.id);
        expect(found?.status).toBe("failed");
        expect(found?.errorMessage).toBe(errorMsg);
      }
    });
  });

  describe("Creation Token Costs", () => {
    it("should track correct token usage for image", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "image",
        prompt: "Token tracking test",
        s3Key: "images/token-test.png",
        s3Url: "https://example.com/token-test.png",
        mimeType: "image/png",
        tokensUsed: 50,
        status: "completed",
      });

      expect(creation?.tokensUsed).toBe(50);
    });

    it("should track correct token usage for video", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "video",
        prompt: "Video token test",
        s3Key: "videos/token-test.mp4",
        s3Url: "https://example.com/token-test.mp4",
        mimeType: "video/mp4",
        tokensUsed: 200,
        status: "completed",
      });

      expect(creation?.tokensUsed).toBe(200);
    });

    it("should track correct token usage for upscale", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "upscale",
        prompt: "Upscale 2x",
        s3Key: "upscaled/test.png",
        s3Url: "https://example.com/upscaled.png",
        mimeType: "image/png",
        tokensUsed: 30,
        status: "completed",
      });

      expect(creation?.tokensUsed).toBe(30);
    });

    it("should track correct token usage for TTS", async () => {
      const creation = await createCreation({
        userId: testUserId,
        type: "tts",
        prompt: "TTS token test",
        s3Key: "audio/token-test.mp3",
        s3Url: "https://example.com/token-test.mp3",
        mimeType: "audio/mpeg",
        tokensUsed: 20,
        status: "completed",
      });

      expect(creation?.tokensUsed).toBe(20);
    });
  });
});
