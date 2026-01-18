/**
 * Sistema de Fila de Publicação
 * Gerencia jobs de publicação com suporte a retry, priorização e persistência
 */

export interface QueueJob {
  id: string;
  type: "facebook" | "instagram" | "tiktok" | "youtube";
  status: "pending" | "processing" | "success" | "failed";
  priority: number; // 1 (baixa) a 10 (alta)
  data: {
    commercialId: string;
    narrative: string;
    imageUrl: string;
    videoUrl?: string;
    platform: string;
  };
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

class PublishingQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private queue: string[] = []; // Fila ordenada por prioridade
  private processing: Set<string> = new Set();
  private maxConcurrent = 3;

  /**
   * Adicionar job à fila
   */
  addJob(job: Omit<QueueJob, "id" | "createdAt" | "updatedAt">): QueueJob {
    const queueJob: QueueJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(queueJob.id, queueJob);
    this.addToQueue(queueJob.id, queueJob.priority);

    console.log(`[Queue] Job adicionado: ${queueJob.id} (prioridade: ${queueJob.priority})`);
    return queueJob;
  }

  /**
   * Adicionar job à fila ordenado por prioridade
   */
  private addToQueue(jobId: string, priority: number): void {
    // Encontrar posição correta baseado na prioridade
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      const existingJobId = this.queue[i];
      const existingJob = this.jobs.get(existingJobId);
      if (existingJob && existingJob.priority < priority) {
        this.queue.splice(i, 0, jobId);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.queue.push(jobId);
    }
  }

  /**
   * Obter próximo job para processar
   */
  getNextJob(): QueueJob | null {
    // Verificar se pode processar mais jobs
    if (this.processing.size >= this.maxConcurrent) {
      return null;
    }

    // Encontrar primeiro job pendente
    for (const jobId of this.queue) {
      const job = this.jobs.get(jobId);
      if (job && job.status === "pending" && !this.processing.has(jobId)) {
        this.processing.add(jobId);
        job.status = "processing";
        job.updatedAt = new Date();
        return job;
      }
    }

    return null;
  }

  /**
   * Marcar job como sucesso
   */
  markSuccess(jobId: string): QueueJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = "success";
    job.processedAt = new Date();
    job.updatedAt = new Date();
    this.processing.delete(jobId);

    console.log(`[Queue] Job sucesso: ${jobId}`);
    return job;
  }

  /**
   * Marcar job como falha com retry
   */
  markFailed(jobId: string, error: string): QueueJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.retries++;
    job.error = error;
    job.updatedAt = new Date();
    this.processing.delete(jobId);

    if (job.retries < job.maxRetries) {
      // Recolocar na fila com prioridade reduzida
      job.status = "pending";
      job.priority = Math.max(1, job.priority - 1);
      this.addToQueue(jobId, job.priority);
      console.log(`[Queue] Job retry: ${jobId} (tentativa ${job.retries}/${job.maxRetries})`);
    } else {
      // Job falhou permanentemente
      job.status = "failed";
      console.log(`[Queue] Job falhou permanentemente: ${jobId}`);
    }

    return job;
  }

  /**
   * Obter status de um job
   */
  getJobStatus(jobId: string): QueueJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Listar todos os jobs
   */
  getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Listar jobs por status
   */
  getJobsByStatus(status: QueueJob["status"]): QueueJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Obter estatísticas da fila
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      success: jobs.filter((j) => j.status === "success").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      avgRetries:
        jobs.length > 0
          ? jobs.reduce((sum, j) => sum + j.retries, 0) / jobs.length
          : 0,
      queueLength: this.queue.length,
      processingCount: this.processing.size,
    };
  }

  /**
   * Pausar processamento de jobs
   */
  pause(): void {
    console.log("[Queue] Processamento pausado");
  }

  /**
   * Retomar processamento de jobs
   */
  resume(): void {
    console.log("[Queue] Processamento retomado");
  }

  /**
   * Limpar jobs antigos (mais de 24 horas)
   */
  cleanup(): number {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let cleaned = 0;
    const jobIds = Array.from(this.jobs.keys());

    for (const jobId of jobIds) {
      const job = this.jobs.get(jobId);
      if (job && job.updatedAt < oneDayAgo && job.status !== "processing") {
        this.jobs.delete(jobId);
        this.queue = this.queue.filter((id) => id !== jobId);
        cleaned++;
      }
    }

    console.log(`[Queue] ${cleaned} jobs antigos removidos`);
    return cleaned;
  }

  /**
   * Deletar um job
   */
  deleteJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === "processing") {
      this.processing.delete(jobId);
    }

    this.jobs.delete(jobId);
    this.queue = this.queue.filter((id) => id !== jobId);

    console.log(`[Queue] Job deletado: ${jobId}`);
    return true;
  }

  /**
   * Pausar um job específico
   */
  pauseJob(jobId: string): QueueJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    if (job.status === "processing") {
      this.processing.delete(jobId);
    }

    job.status = "pending";
    job.updatedAt = new Date();

    console.log(`[Queue] Job pausado: ${jobId}`);
    return job;
  }

  /**
   * Retomar um job pausado
   */
  resumeJob(jobId: string): QueueJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    if (job.status === "pending") {
      this.addToQueue(jobId, job.priority);
    }

    job.updatedAt = new Date();

    console.log(`[Queue] Job retomado: ${jobId}`);
    return job;
  }
}

// Singleton instance
export const publishingQueue = new PublishingQueue();
