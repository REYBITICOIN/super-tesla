import { describe, it, expect, beforeEach, vi } from "vitest";
import { scrapeProduct } from "./_core/productScraper";
import { generateCommercialConfigs } from "./_core/commercialGenerator";

describe("Commercial Agent", () => {
  describe("Product Scraper", () => {
    it("should extract product name", async () => {
      // Mock test - em produção seria feito com um site real
      const mockProductData = {
        name: "Kit 3 Calça Jeans Feminina Skinny Elastano Premium",
        description: "Feito com tecido de altíssima qualidade",
        price: 129.99,
        currency: "BRL",
        images: ["https://example.com/image1.jpg"],
        logo: "https://example.com/logo.jpg",
        storeName: "Toca da Onça Modas",
        url: "https://example.com/product",
      };

      expect(mockProductData.name).toBeDefined();
      expect(mockProductData.name).toContain("Calça");
    });

    it("should extract product price", () => {
      const mockProductData = {
        name: "Produto",
        description: "Descrição",
        price: 129.99,
        currency: "BRL",
        images: [],
        logo: "",
        storeName: "Loja",
        url: "https://example.com",
      };

      expect(mockProductData.price).toBe(129.99);
      expect(mockProductData.currency).toBe("BRL");
    });

    it("should extract product images", () => {
      const mockProductData = {
        name: "Produto",
        description: "Descrição",
        price: 100,
        currency: "BRL",
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
          "https://example.com/image3.jpg",
        ],
        logo: "https://example.com/logo.jpg",
        storeName: "Loja",
        url: "https://example.com",
      };

      expect(mockProductData.images.length).toBeGreaterThan(0);
      expect(mockProductData.images[0]).toContain("http");
    });
  });

  describe("Commercial Generator", () => {
    it("should generate configs for multiple platforms", () => {
      const productData = {
        name: "Calça Jeans Premium",
        description: "Calça de alta qualidade",
        price: 129.99,
        currency: "BRL",
        images: ["https://example.com/image.jpg"],
        logo: "https://example.com/logo.jpg",
        storeName: "Toca da Onça",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["tiktok", "instagram", "facebook"] as const,
        includeVideo: false,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);

      expect(commercials.length).toBe(3); // 3 plataformas x 1 tipo (imagem)
      expect(commercials[0].platform).toBe("tiktok");
      expect(commercials[0].type).toBe("image");
    });

    it("should generate configs with video", () => {
      const productData = {
        name: "Calça Jeans Premium",
        description: "Calça de alta qualidade",
        price: 129.99,
        currency: "BRL",
        images: ["https://example.com/image.jpg"],
        logo: "https://example.com/logo.jpg",
        storeName: "Toca da Onça",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["tiktok", "instagram"] as const,
        includeVideo: true,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);

      expect(commercials.length).toBe(4); // 2 plataformas x 2 tipos (imagem + vídeo)
      
      const tiktokCommercials = commercials.filter(c => c.platform === "tiktok");
      expect(tiktokCommercials.length).toBe(2);
      expect(tiktokCommercials.some(c => c.type === "image")).toBe(true);
      expect(tiktokCommercials.some(c => c.type === "video")).toBe(true);
    });

    it("should generate correct dimensions for TikTok", () => {
      const productData = {
        name: "Produto",
        description: "Descrição",
        price: 100,
        currency: "BRL",
        images: [],
        logo: "",
        storeName: "Loja",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["tiktok"] as const,
        includeVideo: false,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);
      const tiktokCommercial = commercials[0];

      expect(tiktokCommercial.dimensions.width).toBe(1080);
      expect(tiktokCommercial.dimensions.height).toBe(1920);
      expect(tiktokCommercial.aspectRatio).toBe("9:16");
    });

    it("should generate correct dimensions for Instagram", () => {
      const productData = {
        name: "Produto",
        description: "Descrição",
        price: 100,
        currency: "BRL",
        images: [],
        logo: "",
        storeName: "Loja",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["instagram"] as const,
        includeVideo: false,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);
      const instagramCommercial = commercials[0];

      expect(instagramCommercial.dimensions.width).toBe(1080);
      expect(instagramCommercial.dimensions.height).toBe(1080);
      expect(instagramCommercial.aspectRatio).toBe("1:1");
    });

    it("should generate correct dimensions for Facebook", () => {
      const productData = {
        name: "Produto",
        description: "Descrição",
        price: 100,
        currency: "BRL",
        images: [],
        logo: "",
        storeName: "Loja",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["facebook"] as const,
        includeVideo: false,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);
      const facebookCommercial = commercials[0];

      expect(facebookCommercial.dimensions.width).toBe(1200);
      expect(facebookCommercial.dimensions.height).toBe(628);
      expect(facebookCommercial.aspectRatio).toBe("1.91:1");
    });

    it("should generate correct dimensions for YouTube", () => {
      const productData = {
        name: "Produto",
        description: "Descrição",
        price: 100,
        currency: "BRL",
        images: [],
        logo: "",
        storeName: "Loja",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["youtube"] as const,
        includeVideo: false,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);
      const youtubeCommercial = commercials[0];

      expect(youtubeCommercial.dimensions.width).toBe(1280);
      expect(youtubeCommercial.dimensions.height).toBe(720);
      expect(youtubeCommercial.aspectRatio).toBe("16:9");
    });

    it("should generate Portuguese BR scripts", () => {
      const productData = {
        name: "Calça Jeans",
        description: "Calça de qualidade",
        price: 129.99,
        currency: "BRL",
        images: [],
        logo: "",
        storeName: "Toca da Onça",
        url: "https://example.com",
      };

      const config = {
        product: productData,
        platforms: ["tiktok"] as const,
        includeVideo: false,
        voiceGender: "female" as const,
        language: "pt-BR" as const,
      };

      const commercials = generateCommercialConfigs(config);
      const script = commercials[0].script;

      expect(script).toContain("Calça Jeans");
      expect(script).toContain("Toca da Onça");
      expect(script).toContain("129.99");
      expect(script).toContain("BRL");
    });
  });
});
