import { describe, it, expect, beforeEach } from "vitest";
import { tiktokAPI } from "./server/_core/tiktokGraphAPI";
import { youtubeAPI } from "./server/_core/youtubeDataAPI";
import {
  engagementWebhooks,
  type EngagementEvent,
} from "./server/_core/engagementWebhooks";
import { narrativeTemplates } from "./server/_core/narrativeTemplates";

describe("Advanced APIs Integration", () => {
  // ========== TikTok API Tests ==========
  describe("TikTok API", () => {
    it("should validate TikTok access token", async () => {
      const isValid = await tiktokAPI.validateAccessToken("invalid_token");
      expect(typeof isValid).toBe("boolean");
    });

    it("should handle invalid TikTok token gracefully", async () => {
      const userInfo = await tiktokAPI.getUserInfo("invalid_token");
      expect(userInfo).toBeNull();
    });

    it("should publish video with correct structure", async () => {
      const result = await tiktokAPI.publishVideo(
        "https://example.com/video.mp4",
        "Test video",
        "test_token"
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("error");
    });

    it("should get video insights", async () => {
      const insights = await tiktokAPI.getVideoInsights(
        "test_video_id",
        "test_token"
      );
      expect(insights).toBeNull(); // Será null sem token válido
    });

    it("should delete video", async () => {
      const deleted = await tiktokAPI.deleteVideo(
        "test_video_id",
        "test_token"
      );
      expect(typeof deleted).toBe("boolean");
    });

    it("should get user videos", async () => {
      const videos = await tiktokAPI.getUserVideos("test_token");
      expect(Array.isArray(videos)).toBe(true);
    });
  });

  // ========== YouTube API Tests ==========
  describe("YouTube API", () => {
    it("should validate YouTube access token", async () => {
      const isValid = await youtubeAPI.validateAccessToken("invalid_token");
      expect(typeof isValid).toBe("boolean");
    });

    it("should handle invalid YouTube token gracefully", async () => {
      const channelInfo = await youtubeAPI.getChannelInfo("invalid_token");
      expect(channelInfo).toBeNull();
    });

    it("should publish video with correct structure", async () => {
      const result = await youtubeAPI.publishVideo(
        "https://example.com/video.mp4",
        "Test Video",
        "Test Description",
        ["test", "video"],
        "test_token"
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("error");
    });

    it("should get video insights", async () => {
      const insights = await youtubeAPI.getVideoInsights(
        "test_video_id",
        "test_token"
      );
      expect(insights).toBeNull(); // Será null sem token válido
    });

    it("should delete video", async () => {
      const deleted = await youtubeAPI.deleteVideo(
        "test_video_id",
        "test_token"
      );
      expect(typeof deleted).toBe("boolean");
    });

    it("should get channel videos", async () => {
      const videos = await youtubeAPI.getChannelVideos("test_token");
      expect(Array.isArray(videos)).toBe(true);
    });

    it("should create playlist", async () => {
      const playlistId = await youtubeAPI.createPlaylist(
        "Test Playlist",
        "Test Description",
        "test_token"
      );
      expect(playlistId).toBeNull(); // Será null sem token válido
    });

    it("should add video to playlist", async () => {
      const added = await youtubeAPI.addVideoToPlaylist(
        "test_video_id",
        "test_playlist_id",
        "test_token"
      );
      expect(typeof added).toBe("boolean");
    });
  });

  // ========== Engagement Webhooks Tests ==========
  describe("Engagement Webhooks", () => {
    beforeEach(() => {
      // Limpar webhooks antes de cada teste
      engagementWebhooks.listWebhooks().forEach((webhook) => {
        engagementWebhooks.unregisterWebhook(webhook.platform);
      });
    });

    it("should register webhook", () => {
      engagementWebhooks.registerWebhook({
        platform: "facebook",
        webhook_url: "https://example.com/webhook",
        verify_token: "test_token",
        is_active: true,
        subscribed_events: ["like", "comment"],
      });

      const config = engagementWebhooks.getWebhookConfig("facebook");
      expect(config).not.toBeNull();
      expect(config?.platform).toBe("facebook");
    });

    it("should unregister webhook", () => {
      engagementWebhooks.registerWebhook({
        platform: "instagram",
        webhook_url: "https://example.com/webhook",
        verify_token: "test_token",
        is_active: true,
        subscribed_events: ["like"],
      });

      const removed = engagementWebhooks.unregisterWebhook("instagram");
      expect(removed).toBe(true);
      expect(engagementWebhooks.getWebhookConfig("instagram")).toBeNull();
    });

    it("should emit engagement events", (done) => {
      engagementWebhooks.on("facebook", (event: EngagementEvent) => {
        expect(event.platform).toBe("facebook");
        expect(event.event_type).toBeDefined();
        done();
      });

      engagementWebhooks.processFacebookWebhook({
        entry: [
          {
            messaging: [
              {
                sender: { id: "user123", name: "Test User" },
                recipient: { id: "page123" },
                message: { text: "Great product!" },
              },
            ],
          },
        ],
      });
    });

    it("should process TikTok webhook events", (done) => {
      engagementWebhooks.on("tiktok", (event: EngagementEvent) => {
        expect(event.platform).toBe("tiktok");
        expect(event.event_type).toBe("like");
        done();
      });

      engagementWebhooks.processTikTokWebhook({
        events: [
          {
            type: "like",
            video_id: "video123",
            user_id: "user123",
            user_name: "Test User",
            timestamp: Math.floor(Date.now() / 1000),
          },
        ],
      });
    });

    it("should process YouTube webhook events", (done) => {
      engagementWebhooks.on("youtube", (event: EngagementEvent) => {
        expect(event.platform).toBe("youtube");
        done();
      });

      engagementWebhooks.processYouTubeWebhook({
        feed: {
          entry: [
            {
              "yt:videoId": ["video123"],
              author: [{ uri: ["https://youtube.com/user/user123"], name: ["Test User"] }],
              summary: ["Great video!"],
              updated: [new Date().toISOString()],
            },
          ],
        },
      });
    });

    it("should verify webhook token", () => {
      engagementWebhooks.registerWebhook({
        platform: "tiktok",
        webhook_url: "https://example.com/webhook",
        verify_token: "secret_token",
        is_active: true,
        subscribed_events: ["like", "comment"],
      });

      const isValid = engagementWebhooks.verifyWebhook(
        "tiktok",
        "secret_token"
      );
      expect(isValid).toBe(true);
    });

    it("should reject invalid webhook token", () => {
      engagementWebhooks.registerWebhook({
        platform: "youtube",
        webhook_url: "https://example.com/webhook",
        verify_token: "correct_token",
        is_active: true,
        subscribed_events: ["like"],
      });

      const isValid = engagementWebhooks.verifyWebhook(
        "youtube",
        "wrong_token"
      );
      expect(isValid).toBe(false);
    });

    it("should get webhook statistics", () => {
      engagementWebhooks.registerWebhook({
        platform: "facebook",
        webhook_url: "https://example.com/webhook",
        verify_token: "test_token",
        is_active: true,
        subscribed_events: ["like"],
      });

      const stats = engagementWebhooks.getStats();
      expect(stats.total_webhooks).toBeGreaterThan(0);
      expect(stats.active_webhooks).toBeGreaterThan(0);
    });
  });

  // ========== Narrative Templates Tests ==========
  describe("Narrative Templates", () => {
    it("should get templates by niche", () => {
      const fashionTemplates = narrativeTemplates.getTemplatesByNiche("moda");
      expect(Array.isArray(fashionTemplates)).toBe(true);
      expect(fashionTemplates.length).toBeGreaterThan(0);
    });

    it("should get templates by platform", () => {
      const instagramTemplates =
        narrativeTemplates.getTemplatesByPlatform("instagram");
      expect(Array.isArray(instagramTemplates)).toBe(true);
    });

    it("should generate narrative from template", () => {
      const templates = narrativeTemplates.getTemplatesByNiche("moda");
      const template = templates[0];

      const narrative = narrativeTemplates.generateNarrative(template.id, {
        product_name: "Camiseta Premium",
        description: "Camiseta 100% algodão com design exclusivo",
        price: "89,90",
      });

      expect(narrative).not.toBeNull();
      expect(narrative?.narrative).toContain("Camiseta Premium");
      expect(narrative?.narrative).toContain("89,90");
    });

    it("should handle missing variables", () => {
      const templates = narrativeTemplates.getTemplatesByNiche("moda");
      const template = templates[0];

      const narrative = narrativeTemplates.generateNarrative(template.id, {
        product_name: "Camiseta",
        // Faltam outras variáveis obrigatórias
      } as any);

      expect(narrative).toBeNull();
    });

    it("should add custom template", () => {
      const newTemplate = narrativeTemplates.addTemplate({
        niche: "custom",
        platform: "instagram",
        title: "Custom Template",
        description: "A custom template for testing",
        template: "Product: {product_name}, Price: R$ {price}",
        variables: ["product_name", "price"],
        tone: "casual",
        max_length: 200,
      });

      expect(newTemplate.id).toBeDefined();
      expect(newTemplate.niche).toBe("custom");
    });

    it("should generate adaptive narrative", async () => {
      const narrative = await narrativeTemplates.generateAdaptiveNarrative(
        "moda",
        "instagram",
        {
          product_name: "Calça Jeans",
          description: "Calça jeans slim fit",
          price: "129,90",
        }
      );

      expect(typeof narrative).toBe("string");
      expect(narrative.length).toBeGreaterThan(0);
    });

    it("should list all templates", () => {
      const templates = narrativeTemplates.listTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should get template statistics", () => {
      const stats = narrativeTemplates.getStats();
      expect(stats.total_templates).toBeGreaterThan(0);
      expect(stats.total_niches).toBeGreaterThan(0);
      expect(Array.isArray(stats.niches)).toBe(true);
    });

    it("should get recent narratives", () => {
      const templates = narrativeTemplates.getTemplatesByNiche("moda");
      const template = templates[0];

      narrativeTemplates.generateNarrative(template.id, {
        product_name: "Produto 1",
        description: "Descrição 1",
        price: "100",
      });

      const recent = narrativeTemplates.getRecentNarratives(5);
      expect(Array.isArray(recent)).toBe(true);
    });

    it("should delete template", () => {
      const templates = narrativeTemplates.listTemplates();
      const templateToDelete = templates[0];

      const deleted = narrativeTemplates.deleteTemplate(templateToDelete.id);
      expect(deleted).toBe(true);

      const found = narrativeTemplates.getTemplate(templateToDelete.id);
      expect(found).toBeNull();
    });
  });
});
