import { describe, it, expect, beforeEach } from "vitest";
import {
  publishToFacebook,
  publishToInstagram,
  publishToTikTok,
  publishToYouTube,
  publishToMultiplePlatforms,
} from "./_core/socialPublisher";
import { generateVideoFromImages, generateVideoForPlatform } from "./_core/videoGenerator";

describe("Publishing and Video Generation", () => {
  describe("Social Media Publishing", () => {
    it("should return success structure for Facebook publish", async () => {
      const result = await publishToFacebook({
        platform: "facebook",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test caption",
        accessToken: "test_token",
        platformUserId: "test_user_id",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("platform");
      expect(result).toHaveProperty("timestamp");
      expect(result.platform).toBe("facebook");
    });

    it("should return success structure for Instagram publish", async () => {
      const result = await publishToInstagram({
        platform: "instagram",
        imageUrl: "https://example.com/image.jpg",
        caption: "Test caption",
        accessToken: "test_token",
        platformUserId: "test_user_id",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("platform");
      expect(result.platform).toBe("instagram");
    });

    it("should return success structure for TikTok publish", async () => {
      const result = await publishToTikTok({
        platform: "tiktok",
        videoUrl: "https://example.com/video.mp4",
        caption: "Test caption",
        accessToken: "test_token",
        platformUserId: "test_user_id",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("platform");
      expect(result.platform).toBe("tiktok");
    });

    it("should return success structure for YouTube publish", async () => {
      const result = await publishToYouTube({
        platform: "youtube",
        videoUrl: "https://example.com/video.mp4",
        caption: "Test caption",
        accessToken: "test_token",
        platformUserId: "test_user_id",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("platform");
      expect(result.platform).toBe("youtube");
    });

    it("should publish to multiple platforms", async () => {
      const configs = [
        {
          platform: "facebook" as const,
          imageUrl: "https://example.com/image.jpg",
          caption: "Test",
          accessToken: "token",
          platformUserId: "user_id",
        },
        {
          platform: "instagram" as const,
          imageUrl: "https://example.com/image.jpg",
          caption: "Test",
          accessToken: "token",
          platformUserId: "user_id",
        },
      ];

      const results = await publishToMultiplePlatforms(configs);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0]).toHaveProperty("platform");
      expect(results[1]).toHaveProperty("platform");
    });
  });

  describe("Video Generation", () => {
    it("should generate video structure from images", async () => {
      const result = await generateVideoFromImages({
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
        ],
        script: "Test script for video narration",
        duration: 15,
        voiceGender: "female",
        language: "pt-BR",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("duration");
      expect(result).toHaveProperty("format");
      expect(result.duration).toBe(15);
      expect(result.format).toBe("mp4");
    });

    it("should generate video for TikTok with correct duration", async () => {
      const result = await generateVideoForPlatform(
        "tiktok",
        ["https://example.com/image.jpg"],
        "Test script"
      );

      expect(result.duration).toBe(15); // TikTok default
      expect(result.format).toBe("mp4");
    });

    it("should generate video for Instagram with correct duration", async () => {
      const result = await generateVideoForPlatform(
        "instagram",
        ["https://example.com/image.jpg"],
        "Test script"
      );

      expect(result.duration).toBe(30); // Instagram default
      expect(result.format).toBe("mp4");
    });

    it("should generate video for Facebook with correct duration", async () => {
      const result = await generateVideoForPlatform(
        "facebook",
        ["https://example.com/image.jpg"],
        "Test script"
      );

      expect(result.duration).toBe(30); // Facebook default
      expect(result.format).toBe("mp4");
    });

    it("should generate video for YouTube with correct duration", async () => {
      const result = await generateVideoForPlatform(
        "youtube",
        ["https://example.com/image.jpg"],
        "Test script"
      );

      expect(result.duration).toBe(60); // YouTube default
      expect(result.format).toBe("mp4");
    });

    it("should generate video for WhatsApp with correct duration", async () => {
      const result = await generateVideoForPlatform(
        "whatsapp",
        ["https://example.com/image.jpg"],
        "Test script"
      );

      expect(result.duration).toBe(30); // WhatsApp default
      expect(result.format).toBe("mp4");
    });

    it("should handle multiple images in video generation", async () => {
      const images = [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg",
      ];

      const result = await generateVideoFromImages({
        images,
        script: "Test script",
        duration: 30,
      });

      expect(result).toHaveProperty("url");
      expect(result.duration).toBe(30);
    });

    it("should support different voice genders", async () => {
      const maleVoice = await generateVideoFromImages({
        images: ["https://example.com/image.jpg"],
        script: "Test",
        voiceGender: "male",
      });

      const femaleVoice = await generateVideoFromImages({
        images: ["https://example.com/image.jpg"],
        script: "Test",
        voiceGender: "female",
      });

      expect(maleVoice).toHaveProperty("url");
      expect(femaleVoice).toHaveProperty("url");
    });
  });
});
