/**
 * TikTok Graph API Integration
 * Gerencia publicação de vídeos e obtenção de métricas no TikTok
 */

export interface TikTokAccount {
  id: string;
  username: string;
  display_name: string;
  avatar_large_url: string;
  follower_count: number;
  following_count: number;
  video_count: number;
  access_token: string;
}

export interface TikTokVideoInsights {
  video_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  engagement_rate: number;
}

export interface PublishResult {
  success: boolean;
  video_id?: string;
  error?: {
    message: string;
    code?: string;
  };
}

class TikTokGraphAPI {
  private baseUrl = "https://open.tiktokapis.com/v1";
  private clientKey: string;
  private clientSecret: string;

  constructor(clientKey?: string, clientSecret?: string) {
    this.clientKey = clientKey || process.env.TIKTOK_CLIENT_KEY || "";
    this.clientSecret = clientSecret || process.env.TIKTOK_CLIENT_SECRET || "";
  }

  /**
   * Validar token de acesso do TikTok
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/info/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !!data.data?.user?.id;
    } catch (error) {
      console.error("Erro ao validar token do TikTok:", error);
      return false;
    }
  }

  /**
   * Obter informações da conta do TikTok
   */
  async getUserInfo(accessToken: string): Promise<TikTokAccount | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/info/?fields=open_id,union_id,avatar_large_url,display_name,follower_count,following_count,video_count`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao obter informações da conta do TikTok");
      }

      const data = await response.json();
      const user = data.data?.user;

      if (!user) {
        return null;
      }

      return {
        id: user.open_id,
        username: user.union_id || user.open_id,
        display_name: user.display_name || "TikTok User",
        avatar_large_url: user.avatar_large_url || "",
        follower_count: user.follower_count || 0,
        following_count: user.following_count || 0,
        video_count: user.video_count || 0,
        access_token: accessToken,
      };
    } catch (error) {
      console.error("Erro ao obter informações do TikTok:", error);
      return null;
    }
  }

  /**
   * Publicar vídeo no TikTok
   */
  async publishVideo(
    videoUrl: string,
    caption: string,
    accessToken: string,
    coverImageUrl?: string
  ): Promise<PublishResult> {
    try {
      // Primeiro, fazer upload do vídeo
      const uploadResponse = await fetch(
        `${this.baseUrl}/post/publish/action/upload/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_info: {
              source: "FILE_UPLOAD",
              video_size: 0, // Será preenchido pelo servidor
              chunk_size: 5242880, // 5MB chunks
              total_chunk_count: 1,
            },
          }),
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao fazer upload do vídeo",
            code: error.error?.code,
          },
        };
      }

      const uploadData = await uploadResponse.json();
      const uploadToken = uploadData.data?.upload_token;

      if (!uploadToken) {
        return {
          success: false,
          error: {
            message: "Não foi possível obter token de upload",
          },
        };
      }

      // Depois, publicar o vídeo
      const publishResponse = await fetch(
        `${this.baseUrl}/post/publish/action/publish/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_info: {
              title: caption,
              description: caption,
              privacy_level: "PUBLIC_TO_EVERYONE",
              video_cover_timestamp_ms: 0,
            },
            source_info: {
              source: "FILE_UPLOAD",
              upload_token: uploadToken,
            },
            post_mode: "PUBLISH_TO_FEED",
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao publicar vídeo",
            code: error.error?.code,
          },
        };
      }

      const publishData = await publishResponse.json();
      return {
        success: true,
        video_id: publishData.data?.video_id,
      };
    } catch (error) {
      console.error("Erro ao publicar vídeo no TikTok:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
        },
      };
    }
  }

  /**
   * Obter insights de um vídeo
   */
  async getVideoInsights(
    videoId: string,
    accessToken: string
  ): Promise<TikTokVideoInsights | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/query/?fields=id,create_time,like_count,comment_count,share_count,view_count&filters={"video_ids":["${videoId}"]}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const video = data.data?.videos?.[0];

      if (!video) {
        return null;
      }

      const totalEngagement =
        (video.like_count || 0) +
        (video.comment_count || 0) +
        (video.share_count || 0);
      const engagementRate =
        video.view_count > 0
          ? (totalEngagement / video.view_count) * 100
          : 0;

      return {
        video_id: videoId,
        view_count: video.view_count || 0,
        like_count: video.like_count || 0,
        comment_count: video.comment_count || 0,
        share_count: video.share_count || 0,
        engagement_rate: engagementRate,
      };
    } catch (error) {
      console.error("Erro ao obter insights do TikTok:", error);
      return null;
    }
  }

  /**
   * Deletar um vídeo publicado
   */
  async deleteVideo(videoId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/post/publish/action/delete/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_id: videoId,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Erro ao deletar vídeo do TikTok:", error);
      return false;
    }
  }

  /**
   * Obter vídeos da conta
   */
  async getUserVideos(
    accessToken: string,
    limit: number = 10
  ): Promise<TikTokVideoInsights[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/video/list/?fields=id,create_time,like_count,comment_count,share_count,view_count&max_count=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const videos = data.data?.videos || [];

      return videos.map((video: any) => {
        const totalEngagement =
          (video.like_count || 0) +
          (video.comment_count || 0) +
          (video.share_count || 0);
        const engagementRate =
          video.view_count > 0
            ? (totalEngagement / video.view_count) * 100
            : 0;

        return {
          video_id: video.id,
          view_count: video.view_count || 0,
          like_count: video.like_count || 0,
          comment_count: video.comment_count || 0,
          share_count: video.share_count || 0,
          engagement_rate: engagementRate,
        };
      });
    } catch (error) {
      console.error("Erro ao obter vídeos do TikTok:", error);
      return [];
    }
  }
}

export const tiktokAPI = new TikTokGraphAPI();
