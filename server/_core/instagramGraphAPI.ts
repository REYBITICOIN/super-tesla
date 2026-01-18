import { ENV } from "./env";

export interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  biography: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  access_token: string;
}

export interface InstagramMediaInsights {
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface PublishResult {
  success: boolean;
  id?: string;
  error?: {
    message: string;
    code?: string;
  };
}

class InstagramGraphAPI {
  private baseUrl = "https://graph.instagram.com";
  private apiVersion = "v18.0";

  /**
   * Validar token de acesso do Instagram
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me?fields=id,username&access_token=${accessToken}`
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !!data.id;
    } catch (error) {
      console.error("Erro ao validar token do Instagram:", error);
      return false;
    }
  }

  /**
   * Obter contas do Instagram do usuário
   */
  async getUserInstagramAccounts(
    accessToken: string
  ): Promise<InstagramAccount[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/me/instagram_business_accounts?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error("Falha ao obter contas do Instagram");
      }

      const data = await response.json();
      return (
        data.data?.map((account: any) => ({
          ...account,
          access_token: accessToken,
        })) || []
      );
    } catch (error) {
      console.error("Erro ao obter contas do Instagram:", error);
      throw error;
    }
  }

  /**
   * Publicar imagem no Instagram
   */
  async publishImage(
    instagramBusinessAccountId: string,
    imageUrl: string,
    caption: string,
    accessToken: string
  ): Promise<PublishResult> {
    try {
      // Primeiro, criar o contêiner de mídia
      const containerResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${instagramBusinessAccountId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: accessToken,
          }),
        }
      );

      if (!containerResponse.ok) {
        const error = await containerResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao criar mídia",
            code: error.error?.code,
          },
        };
      }

      const containerData = await containerResponse.json();
      const mediaContainerId = containerData.id;

      // Depois, publicar o contêiner
      const publishResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${instagramBusinessAccountId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creation_id: mediaContainerId,
            access_token: accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao publicar mídia",
            code: error.error?.code,
          },
        };
      }

      const publishData = await publishResponse.json();
      return {
        success: true,
        id: publishData.id,
      };
    } catch (error) {
      console.error("Erro ao publicar imagem no Instagram:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
        },
      };
    }
  }

  /**
   * Publicar vídeo/Reel no Instagram
   */
  async publishReel(
    instagramBusinessAccountId: string,
    videoUrl: string,
    caption: string,
    thumbnailUrl?: string,
    accessToken?: string
  ): Promise<PublishResult> {
    try {
      if (!accessToken) {
        throw new Error("Access token é obrigatório para publicar Reels");
      }
      const token = accessToken;

      // Criar contêiner de mídia para vídeo
      const containerResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${instagramBusinessAccountId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_url: videoUrl,
            media_type: "REELS",
            caption: caption,
            thumbnail_url: thumbnailUrl,
            access_token: token,
          }),
        }
      );

      if (!containerResponse.ok) {
        const error = await containerResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao criar Reel",
            code: error.error?.code,
          },
        };
      }

      const containerData = await containerResponse.json();
      const mediaContainerId = containerData.id;

      // Publicar o Reel
      const publishResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${instagramBusinessAccountId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creation_id: mediaContainerId,
            access_token: token,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao publicar Reel",
            code: error.error?.code,
          },
        };
      }

      const publishData = await publishResponse.json();
      return {
        success: true,
        id: publishData.id,
      };
    } catch (error) {
      console.error("Erro ao publicar Reel no Instagram:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
        },
      };
    }
  }

  /**
   * Obter insights de uma mídia
   */
  async getMediaInsights(
    mediaId: string,
    accessToken: string
  ): Promise<InstagramMediaInsights | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${mediaId}/insights?metric=impressions,reach,engagement,likes,comments,shares,saves&access_token=${accessToken}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const insights: InstagramMediaInsights = {
        impressions: 0,
        reach: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
      };

      data.data?.forEach((metric: any) => {
        const key = metric.name as keyof InstagramMediaInsights;
        if (key in insights) {
          insights[key] = metric.values[0]?.value || 0;
        }
      });

      return insights;
    } catch (error) {
      console.error("Erro ao obter insights do Instagram:", error);
      return null;
    }
  }

  /**
   * Deletar uma mídia publicada
   */
  async deleteMedia(mediaId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${mediaId}?access_token=${accessToken}`,
        {
          method: "DELETE",
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Erro ao deletar mídia do Instagram:", error);
      return false;
    }
  }

  /**
   * Responder comentário no Instagram
   */
  async replyToComment(
    commentId: string,
    message: string,
    accessToken: string
  ): Promise<PublishResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao responder comentário",
            code: error.error?.code,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        id: data.id,
      };
    } catch (error) {
      console.error("Erro ao responder comentário no Instagram:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
        },
      };
    }
  }
}

export const instagramAPI = new InstagramGraphAPI();
