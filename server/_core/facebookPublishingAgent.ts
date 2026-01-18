import { getDb } from "../db";
import { publishedPosts, socialMediaAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "./llm";

export interface PublishingJob {
  id: string;
  commercialId: string;
  platforms: ("facebook" | "instagram" | "tiktok" | "youtube")[];
  content: {
    title: string;
    description: string;
    imageUrl: string;
    videoUrl?: string;
  };
  status: "pending" | "publishing" | "success" | "failed";
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

class FacebookPublishingAgent {
  private jobs: Map<string, PublishingJob> = new Map();
  private maxRetries = 3;
  private retryDelay = 5000; // 5 segundos

  /**
   * Criar um novo job de publicação
   */
  async createPublishingJob(
    commercialId: string,
    platforms: ("facebook" | "instagram" | "tiktok" | "youtube")[],
    content: PublishingJob["content"]
  ): Promise<PublishingJob> {
    const job: PublishingJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commercialId,
      platforms,
      content,
      status: "pending",
      retries: 0,
      maxRetries: this.maxRetries,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Processar um job de publicação com retry automático
   */
  async processPublishingJob(jobId: string): Promise<PublishingJob | null> {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = "publishing";
    job.updatedAt = new Date();

    try {
      // Tentar publicar em cada plataforma
      for (const platform of job.platforms) {
        await this.publishToPlatform(platform, job.content);
      }

      job.status = "success";
      job.updatedAt = new Date();

      // Salvar no banco de dados
      await this.savePublishingResult(job);

      return job;
    } catch (error) {
      job.retries++;
      job.error = error instanceof Error ? error.message : String(error);

      if (job.retries < job.maxRetries) {
        // Agendar retry
        setTimeout(() => {
          this.processPublishingJob(jobId);
        }, this.retryDelay * job.retries);

        job.status = "pending";
      } else {
        job.status = "failed";
      }

      job.updatedAt = new Date();
      return job;
    }
  }

  /**
   * Publicar em uma plataforma específica
   */
  private async publishToPlatform(
    platform: "facebook" | "instagram" | "tiktok" | "youtube",
    content: PublishingJob["content"]
  ): Promise<void> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    // Buscar conta conectada da plataforma
    const account = await dbInstance
      .select()
      .from(socialMediaAccounts)
      .where(eq(socialMediaAccounts.platform, platform))
      .limit(1);

    if (!account || account.length === 0) {
      throw new Error(`Nenhuma conta conectada para ${platform}`);
    }

    const socialAccount = account[0];

    // Validar token de acesso
    if (!socialAccount.accessToken) {
      throw new Error(`Token de acesso expirado para ${platform}`);
    }

    // Gerar narrativa específica para a plataforma usando LLM
    const narrative = await this.generateNarrative(platform, content);

    // Publicar baseado na plataforma
    switch (platform) {
      case "facebook":
        await this.publishToFacebook(socialAccount.accessToken, narrative, content);
        break;
      case "instagram":
        await this.publishToInstagram(socialAccount.accessToken, narrative, content);
        break;
      case "tiktok":
        await this.publishToTikTok(socialAccount.accessToken, narrative, content);
        break;
      case "youtube":
        await this.publishToYouTube(socialAccount.accessToken, narrative, content);
        break;
    }
  }

  /**
   * Gerar narrativa específica para cada plataforma usando LLM
   */
  private async generateNarrative(
    platform: "facebook" | "instagram" | "tiktok" | "youtube",
    content: PublishingJob["content"]
  ): Promise<string> {
    const platformGuidelines = {
      facebook:
        "Crie uma descrição engajante para Facebook com até 2000 caracteres. Inclua CTA (Call-to-Action) claro.",
      instagram:
        "Crie uma legenda para Instagram com até 2200 caracteres. Use hashtags relevantes (#). Máximo 30 hashtags.",
      tiktok:
        "Crie uma descrição para TikTok com até 150 caracteres. Seja criativo e use trending sounds.",
      youtube:
        "Crie uma descrição para YouTube com até 5000 caracteres. Inclua timestamps se aplicável.",
    };

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em marketing de redes sociais. ${platformGuidelines[platform]}`,
        },
        {
          role: "user",
          content: `Crie uma narrativa para publicar este produto:
Título: ${content.title}
Descrição: ${content.description}
Plataforma: ${platform}`,
        },
      ],
    });

    const message = response.choices[0]?.message;
    if (message && typeof message.content === "string") {
      return message.content;
    }

    return content.description;
  }

  /**
   * Publicar no Facebook
   */
  private async publishToFacebook(
    accessToken: string,
    narrative: string,
    content: PublishingJob["content"]
  ): Promise<void> {
    // Simulação - Em produção, usar Facebook Graph API
    console.log(`[Facebook] Publicando: ${narrative.substring(0, 100)}...`);

    // Validar token
    if (!accessToken || accessToken.length < 10) {
      throw new Error("Token de acesso inválido para Facebook");
    }

    // Aqui você faria a chamada real para a API do Facebook
    // const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message: narrative,
    //     link: content.imageUrl,
    //   }),
    // });
  }

  /**
   * Publicar no Instagram
   */
  private async publishToInstagram(
    accessToken: string,
    narrative: string,
    content: PublishingJob["content"]
  ): Promise<void> {
    console.log(`[Instagram] Publicando: ${narrative.substring(0, 100)}...`);

    if (!accessToken || accessToken.length < 10) {
      throw new Error("Token de acesso inválido para Instagram");
    }

    // Aqui você faria a chamada real para a API do Instagram
  }

  /**
   * Publicar no TikTok
   */
  private async publishToTikTok(
    accessToken: string,
    narrative: string,
    content: PublishingJob["content"]
  ): Promise<void> {
    console.log(`[TikTok] Publicando: ${narrative.substring(0, 100)}...`);

    if (!accessToken || accessToken.length < 10) {
      throw new Error("Token de acesso inválido para TikTok");
    }

    // Aqui você faria a chamada real para a API do TikTok
  }

  /**
   * Publicar no YouTube
   */
  private async publishToYouTube(
    accessToken: string,
    narrative: string,
    content: PublishingJob["content"]
  ): Promise<void> {
    console.log(`[YouTube] Publicando: ${narrative.substring(0, 100)}...`);

    if (!accessToken || accessToken.length < 10) {
      throw new Error("Token de acesso inválido para YouTube");
    }

    // Aqui você faria a chamada real para a API do YouTube
  }

  /**
   * Salvar resultado da publicação no banco de dados
   */
  private async savePublishingResult(job: PublishingJob): Promise<void> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    for (const platform of job.platforms) {
      const metrics = JSON.stringify({
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      });

      await dbInstance.insert(publishedPosts).values({
        userId: 1,
        creationId: parseInt(job.commercialId) || 0,
        platform,
        status: job.status,
        platformPostId: `${platform}-${job.id}`,
        title: job.content.title,
        description: job.content.description,
        mediaUrl: job.content.imageUrl,
        publishedAt: new Date(),
        engagementMetrics: metrics,
      });
    }
  }

  /**
   * Obter status de um job
   */
  getJobStatus(jobId: string): PublishingJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Listar todos os jobs
   */
  getAllJobs(): PublishingJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Reiniciar um job que falhou
   */
  async restartFailedJob(jobId: string): Promise<PublishingJob | null> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "failed") return null;

    job.retries = 0;
    job.status = "pending";
    job.error = undefined;
    job.updatedAt = new Date();

    return this.processPublishingJob(jobId);
  }

  /**
   * Limpar jobs antigos (mais de 24 horas)
   */
  cleanupOldJobs(): number {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let cleaned = 0;
    const entries = Array.from(this.jobs.entries());
    for (const [jobId, job] of entries) {
      if (job.updatedAt < oneDayAgo) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const facebookPublishingAgent = new FacebookPublishingAgent();
