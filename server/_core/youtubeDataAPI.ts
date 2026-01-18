/**
 * YouTube Data API Integration
 * Gerencia publicação de vídeos e obtenção de métricas no YouTube
 */

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  subscriber_count: number;
  view_count: number;
  video_count: number;
  access_token: string;
}

export interface YouTubeVideoInsights {
  video_id: string;
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  average_view_duration: number;
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

class YouTubeDataAPI {
  private baseUrl = "https://www.googleapis.com/youtube/v3";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || "";
  }

  /**
   * Validar token de acesso do YouTube
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=id&mine=true&access_token=${accessToken}`
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !!data.items?.[0]?.id;
    } catch (error) {
      console.error("Erro ao validar token do YouTube:", error);
      return false;
    }
  }

  /**
   * Obter informações do canal do YouTube
   */
  async getChannelInfo(accessToken: string): Promise<YouTubeChannel | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=snippet,statistics&mine=true&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error("Falha ao obter informações do canal");
      }

      const data = await response.json();
      const channel = data.items?.[0];

      if (!channel) {
        return null;
      }

      return {
        id: channel.id,
        title: channel.snippet?.title || "",
        description: channel.snippet?.description || "",
        thumbnail_url: channel.snippet?.thumbnails?.default?.url || "",
        subscriber_count: parseInt(channel.statistics?.subscriberCount || "0"),
        view_count: parseInt(channel.statistics?.viewCount || "0"),
        video_count: parseInt(channel.statistics?.videoCount || "0"),
        access_token: accessToken,
      };
    } catch (error) {
      console.error("Erro ao obter informações do YouTube:", error);
      return null;
    }
  }

  /**
   * Publicar vídeo no YouTube
   */
  async publishVideo(
    videoUrl: string,
    title: string,
    description: string,
    tags: string[],
    accessToken: string,
    privacyStatus: "public" | "unlisted" | "private" = "public"
  ): Promise<PublishResult> {
    try {
      // Fazer upload do vídeo
      const uploadResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,status&access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              title: title,
              description: description,
              tags: tags,
              categoryId: "22", // Categoria: People & Blogs
              defaultLanguage: "pt",
            },
            status: {
              privacyStatus: privacyStatus,
              embeddable: true,
              publicStatsViewable: true,
            },
          }),
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        return {
          success: false,
          error: {
            message: error.error?.message || "Erro ao publicar vídeo",
            code: error.error?.code,
          },
        };
      }

      const uploadData = await uploadResponse.json();
      return {
        success: true,
        video_id: uploadData.id,
      };
    } catch (error) {
      console.error("Erro ao publicar vídeo no YouTube:", error);
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
  ): Promise<YouTubeVideoInsights | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics&id=${videoId}&access_token=${accessToken}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const video = data.items?.[0];

      if (!video) {
        return null;
      }

      const viewCount = parseInt(video.statistics?.viewCount || "0");
      const likeCount = parseInt(video.statistics?.likeCount || "0");
      const commentCount = parseInt(video.statistics?.commentCount || "0");

      const totalEngagement = likeCount + commentCount;
      const engagementRate =
        viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

      return {
        video_id: videoId,
        title: video.snippet?.title || "",
        view_count: viewCount,
        like_count: likeCount,
        comment_count: commentCount,
        share_count: 0, // YouTube não expõe share count na API pública
        average_view_duration: 0, // Requer YouTube Analytics API
        engagement_rate: engagementRate,
      };
    } catch (error) {
      console.error("Erro ao obter insights do YouTube:", error);
      return null;
    }
  }

  /**
   * Deletar um vídeo publicado
   */
  async deleteVideo(videoId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?id=${videoId}&access_token=${accessToken}`,
        {
          method: "DELETE",
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Erro ao deletar vídeo do YouTube:", error);
      return false;
    }
  }

  /**
   * Obter vídeos do canal
   */
  async getChannelVideos(
    accessToken: string,
    limit: number = 10
  ): Promise<YouTubeVideoInsights[]> {
    try {
      // Primeiro, obter ID do canal
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=contentDetails&mine=true&access_token=${accessToken}`
      );

      if (!channelResponse.ok) {
        return [];
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId =
        channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        return [];
      }

      // Depois, obter vídeos da playlist de uploads
      const videosResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${limit}&access_token=${accessToken}`
      );

      if (!videosResponse.ok) {
        return [];
      }

      const videosData = await videosResponse.json();
      const videoIds = videosData.items
        ?.map((item: any) => item.contentDetails?.videoId)
        .filter(Boolean);

      if (!videoIds || videoIds.length === 0) {
        return [];
      }

      // Finalmente, obter detalhes dos vídeos
      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics&id=${videoIds.join(",")}&access_token=${accessToken}`
      );

      if (!detailsResponse.ok) {
        return [];
      }

      const detailsData = await detailsResponse.json();

      return detailsData.items?.map((video: any) => {
        const viewCount = parseInt(video.statistics?.viewCount || "0");
        const likeCount = parseInt(video.statistics?.likeCount || "0");
        const commentCount = parseInt(video.statistics?.commentCount || "0");

        const totalEngagement = likeCount + commentCount;
        const engagementRate =
          viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

        return {
          video_id: video.id,
          title: video.snippet?.title || "",
          view_count: viewCount,
          like_count: likeCount,
          comment_count: commentCount,
          share_count: 0,
          average_view_duration: 0,
          engagement_rate: engagementRate,
        };
      }) || [];
    } catch (error) {
      console.error("Erro ao obter vídeos do YouTube:", error);
      return [];
    }
  }

  /**
   * Adicionar vídeo a uma playlist
   */
  async addVideoToPlaylist(
    videoId: string,
    playlistId: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/playlistItems?part=snippet&access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              playlistId: playlistId,
              resourceId: {
                kind: "youtube#video",
                videoId: videoId,
              },
            },
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Erro ao adicionar vídeo à playlist:", error);
      return false;
    }
  }

  /**
   * Criar uma nova playlist
   */
  async createPlaylist(
    title: string,
    description: string,
    accessToken: string,
    privacyStatus: "public" | "unlisted" | "private" = "public"
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/playlists?part=snippet,status&access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              title: title,
              description: description,
            },
            status: {
              privacyStatus: privacyStatus,
            },
          }),
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Erro ao criar playlist:", error);
      return null;
    }
  }
}

export const youtubeAPI = new YouTubeDataAPI();
