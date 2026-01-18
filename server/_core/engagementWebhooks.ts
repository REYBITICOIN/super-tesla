/**
 * Engagement Webhooks System
 * Recebe atualizações de engajamento das plataformas em tempo real
 */

export interface EngagementEvent {
  id: string;
  platform: "facebook" | "instagram" | "tiktok" | "youtube";
  event_type:
    | "like"
    | "comment"
    | "share"
    | "view"
    | "follower"
    | "message";
  video_id: string;
  user_id: string;
  user_name: string;
  content?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface WebhookConfig {
  platform: "facebook" | "instagram" | "tiktok" | "youtube";
  webhook_url: string;
  verify_token: string;
  is_active: boolean;
  subscribed_events: string[];
}

class EngagementWebhooksManager {
  private webhookConfigs: Map<string, WebhookConfig> = new Map();
  private eventListeners: Map<
    string,
    ((event: EngagementEvent) => void)[]
  > = new Map();

  /**
   * Registrar webhook para uma plataforma
   */
  registerWebhook(config: WebhookConfig): void {
    const key = `${config.platform}-webhook`;
    this.webhookConfigs.set(key, config);
    console.log(`[Webhooks] Webhook registrado para ${config.platform}`);
  }

  /**
   * Desregistrar webhook
   */
  unregisterWebhook(platform: string): boolean {
    const key = `${platform}-webhook`;
    const removed = this.webhookConfigs.delete(key);
    if (removed) {
      console.log(`[Webhooks] Webhook removido para ${platform}`);
    }
    return removed;
  }

  /**
   * Processar evento de webhook do Facebook/Instagram
   */
  processFacebookWebhook(payload: any): void {
    try {
      const entries = payload.entry || [];

      for (const entry of entries) {
        const messaging = entry.messaging || [];

        for (const message of messaging) {
          const event: EngagementEvent = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            platform: "facebook",
            event_type: this.getFacebookEventType(message),
            video_id: message.recipient?.id || "",
            user_id: message.sender?.id || "",
            user_name: message.sender?.name || "Unknown",
            content: message.message?.text || message.postback?.title,
            timestamp: new Date(),
            metadata: message,
          };

          this.emitEvent(event);
        }
      }
    } catch (error) {
      console.error("[Webhooks] Erro ao processar webhook do Facebook:", error);
    }
  }

  /**
   * Processar evento de webhook do TikTok
   */
  processTikTokWebhook(payload: any): void {
    try {
      const events = payload.events || [];

      for (const event of events) {
        const tiktokEvent: EngagementEvent = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          platform: "tiktok",
          event_type: this.getTikTokEventType(event.type),
          video_id: event.video_id || "",
          user_id: event.user_id || "",
          user_name: event.user_name || "Unknown",
          content: event.comment_text || "",
          timestamp: new Date(event.timestamp * 1000),
          metadata: event,
        };

        this.emitEvent(tiktokEvent);
      }
    } catch (error) {
      console.error("[Webhooks] Erro ao processar webhook do TikTok:", error);
    }
  }

  /**
   * Processar evento de webhook do YouTube
   */
  processYouTubeWebhook(payload: any): void {
    try {
      const feed = payload.feed || {};
      const entries = feed.entry || [];

      for (const entry of entries) {
        const youtubeEvent: EngagementEvent = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          platform: "youtube",
          event_type: this.getYouTubeEventType(entry),
          video_id: entry["yt:videoId"]?.[0] || "",
          user_id: entry.author?.[0]?.uri?.[0]?.split("/").pop() || "",
          user_name: entry.author?.[0]?.name?.[0] || "Unknown",
          content: entry.summary?.[0] || entry.title?.[0],
          timestamp: new Date(entry.updated?.[0]),
          metadata: entry,
        };

        this.emitEvent(youtubeEvent);
      }
    } catch (error) {
      console.error("[Webhooks] Erro ao processar webhook do YouTube:", error);
    }
  }

  /**
   * Registrar listener para eventos
   */
  on(
    platform: string,
    callback: (event: EngagementEvent) => void
  ): () => void {
    const key = `${platform}-listener`;

    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }

    this.eventListeners.get(key)!.push(callback);

    // Retornar função para remover listener
    return () => {
      const listeners = this.eventListeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emitir evento para todos os listeners
   */
  private emitEvent(event: EngagementEvent): void {
    const key = `${event.platform}-listener`;
    const listeners = this.eventListeners.get(key) || [];

    console.log(
      `[Webhooks] Evento emitido: ${event.platform} - ${event.event_type}`
    );

    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("[Webhooks] Erro ao executar listener:", error);
      }
    }
  }

  /**
   * Obter tipo de evento do Facebook
   */
  private getFacebookEventType(
    message: any
  ): EngagementEvent["event_type"] {
    if (message.message) {
      return "comment";
    } else if (message.postback) {
      return "like";
    } else if (message.reaction) {
      return "like";
    } else if (message.delivery) {
      return "view";
    }
    return "message";
  }

  /**
   * Obter tipo de evento do TikTok
   */
  private getTikTokEventType(
    type: string
  ): EngagementEvent["event_type"] {
    switch (type) {
      case "like":
        return "like";
      case "comment":
        return "comment";
      case "share":
        return "share";
      case "follow":
        return "follower";
      default:
        return "view";
    }
  }

  /**
   * Obter tipo de evento do YouTube
   */
  private getYouTubeEventType(
    entry: any
  ): EngagementEvent["event_type"] {
    const summary = entry.summary?.[0] || "";

    if (summary.includes("liked")) {
      return "like";
    } else if (summary.includes("commented")) {
      return "comment";
    } else if (summary.includes("shared")) {
      return "share";
    } else if (summary.includes("subscribed")) {
      return "follower";
    }

    return "view";
  }

  /**
   * Obter configuração de webhook
   */
  getWebhookConfig(platform: string): WebhookConfig | null {
    const key = `${platform}-webhook`;
    return this.webhookConfigs.get(key) || null;
  }

  /**
   * Listar todos os webhooks
   */
  listWebhooks(): WebhookConfig[] {
    return Array.from(this.webhookConfigs.values());
  }

  /**
   * Verificar webhook (para validação inicial)
   */
  verifyWebhook(
    platform: string,
    verifyToken: string,
    challenge?: string
  ): boolean {
    const config = this.getWebhookConfig(platform);

    if (!config) {
      console.warn(`[Webhooks] Webhook não encontrado para ${platform}`);
      return false;
    }

    if (config.verify_token !== verifyToken) {
      console.warn(`[Webhooks] Token de verificação inválido para ${platform}`);
      return false;
    }

    console.log(`[Webhooks] Webhook verificado para ${platform}`);
    return true;
  }

  /**
   * Obter estatísticas de webhooks
   */
  getStats() {
    return {
      total_webhooks: this.webhookConfigs.size,
      active_webhooks: Array.from(this.webhookConfigs.values()).filter(
        (w) => w.is_active
      ).length,
      total_listeners: Array.from(this.eventListeners.values()).reduce(
        (sum, listeners) => sum + listeners.length,
        0
      ),
    };
  }
}

// Singleton instance
export const engagementWebhooks = new EngagementWebhooksManager();
