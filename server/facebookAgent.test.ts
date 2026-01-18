import { describe, it, expect, beforeEach } from "vitest";
import { facebookPublishingAgent, PublishingJob } from "./_core/facebookPublishingAgent";

describe("FacebookPublishingAgent", () => {
  beforeEach(() => {
    // Limpar jobs antes de cada teste
    facebookPublishingAgent.cleanupOldJobs();
  });

  describe("createPublishingJob", () => {
    it("deve criar um novo job de publicação", async () => {
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook", "instagram"],
        {
          title: "Produto Incrível",
          description: "Descrição do produto",
          imageUrl: "https://example.com/image.jpg",
        }
      );

      expect(job).toBeDefined();
      expect(job.commercialId).toBe("commercial-123");
      expect(job.platforms).toEqual(["facebook", "instagram"]);
      expect(job.status).toBe("pending");
      expect(job.retries).toBe(0);
      expect(job.maxRetries).toBe(3);
    });

    it("deve gerar um ID único para cada job", async () => {
      const job1 = await facebookPublishingAgent.createPublishingJob(
        "commercial-1",
        ["facebook"],
        {
          title: "Produto 1",
          description: "Descrição 1",
          imageUrl: "https://example.com/1.jpg",
        }
      );

      const job2 = await facebookPublishingAgent.createPublishingJob(
        "commercial-2",
        ["instagram"],
        {
          title: "Produto 2",
          description: "Descrição 2",
          imageUrl: "https://example.com/2.jpg",
        }
      );

      expect(job1.id).not.toBe(job2.id);
    });

    it("deve definir timestamps corretos", async () => {
      const beforeCreation = new Date();
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
        }
      );
      const afterCreation = new Date();

      expect(job.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime()
      );
      expect(job.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime()
      );
      expect(job.updatedAt).toEqual(job.createdAt);
    });
  });

  describe("getJobStatus", () => {
    it("deve retornar o status de um job existente", async () => {
      const createdJob = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
        }
      );

      const job = facebookPublishingAgent.getJobStatus(createdJob.id);
      expect(job).toBeDefined();
      expect(job?.id).toBe(createdJob.id);
      expect(job?.status).toBe("pending");
    });

    it("deve retornar null para job inexistente", () => {
      const job = facebookPublishingAgent.getJobStatus("job-inexistente");
      expect(job).toBeNull();
    });
  });

  describe("getAllJobs", () => {

    it("deve retornar todos os jobs criados", async () => {
      const initialCount = facebookPublishingAgent.getAllJobs().length;

      await facebookPublishingAgent.createPublishingJob(
        "commercial-1",
        ["facebook"],
        {
          title: "Produto 1",
          description: "Descrição 1",
          imageUrl: "https://example.com/1.jpg",
        }
      );

      await facebookPublishingAgent.createPublishingJob(
        "commercial-2",
        ["instagram", "tiktok"],
        {
          title: "Produto 2",
          description: "Descrição 2",
          imageUrl: "https://example.com/2.jpg",
        }
      );

      const jobs = facebookPublishingAgent.getAllJobs();
      expect(jobs.length).toBeGreaterThanOrEqual(initialCount + 2);
    });
  });

  describe("cleanupOldJobs", () => {
    it("deve retornar 0 quando não há jobs antigos", async () => {
      await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
        }
      );

      const cleaned = facebookPublishingAgent.cleanupOldJobs();
      expect(cleaned).toBe(0);
    });

    it("deve limpar jobs com mais de 24 horas", async () => {
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
        }
      );

      // Simular job antigo alterando a data
      const oneDayAgoPlus1Hour = new Date(
        Date.now() - 25 * 60 * 60 * 1000
      );
      job.updatedAt = oneDayAgoPlus1Hour;

      const cleaned = facebookPublishingAgent.cleanupOldJobs();
      expect(cleaned).toBe(1);

      const retrievedJob = facebookPublishingAgent.getJobStatus(job.id);
      expect(retrievedJob).toBeNull();
    });
  });

  describe("restartFailedJob", () => {
    it("deve retornar null se job não existe", async () => {
      const result = await facebookPublishingAgent.restartFailedJob(
        "job-inexistente"
      );
      expect(result).toBeNull();
    });

    it("deve retornar null se job não está em estado failed", async () => {
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
        }
      );

      const result = await facebookPublishingAgent.restartFailedJob(job.id);
      expect(result).toBeNull();
    });


  });

  describe("PublishingJob structure", () => {
    it("deve ter todas as propriedades obrigatórias", async () => {
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook", "instagram"],
        {
          title: "Produto Incrível",
          description: "Descrição do produto",
          imageUrl: "https://example.com/image.jpg",
          videoUrl: "https://example.com/video.mp4",
        }
      );

      expect(job).toHaveProperty("id");
      expect(job).toHaveProperty("commercialId");
      expect(job).toHaveProperty("platforms");
      expect(job).toHaveProperty("content");
      expect(job).toHaveProperty("status");
      expect(job).toHaveProperty("retries");
      expect(job).toHaveProperty("maxRetries");
      expect(job).toHaveProperty("createdAt");
      expect(job).toHaveProperty("updatedAt");
    });

    it("deve ter content com todas as propriedades", async () => {
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
          videoUrl: "https://example.com/video.mp4",
        }
      );

      expect(job.content).toHaveProperty("title");
      expect(job.content).toHaveProperty("description");
      expect(job.content).toHaveProperty("imageUrl");
      expect(job.content.title).toBe("Produto");
      expect(job.content.description).toBe("Descrição");
    });
  });

  describe("Platform support", () => {
    it("deve suportar todas as plataformas", async () => {
      const platforms: Array<
        "facebook" | "instagram" | "tiktok" | "youtube"
      > = ["facebook", "instagram", "tiktok", "youtube"];

      for (const platform of platforms) {
        const job = await facebookPublishingAgent.createPublishingJob(
          `commercial-${platform}`,
          [platform],
          {
            title: "Produto",
            description: "Descrição",
            imageUrl: "https://example.com/image.jpg",
          }
        );

        expect(job.platforms).toContain(platform);
      }
    });

    it("deve permitir múltiplas plataformas em um job", async () => {
      const job = await facebookPublishingAgent.createPublishingJob(
        "commercial-123",
        ["facebook", "instagram", "tiktok", "youtube"],
        {
          title: "Produto",
          description: "Descrição",
          imageUrl: "https://example.com/image.jpg",
        }
      );

      expect(job.platforms).toHaveLength(4);
      expect(job.platforms).toContain("facebook");
      expect(job.platforms).toContain("instagram");
      expect(job.platforms).toContain("tiktok");
      expect(job.platforms).toContain("youtube");
    });
  });
});
