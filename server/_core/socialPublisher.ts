import axios from "axios";
import { getDb } from "../db";
import { publishedPosts } from "../../drizzle/schema";

export interface PublishConfig {
  platform: "facebook" | "instagram" | "tiktok" | "youtube";
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  hashtags?: string[];
  accessToken: string;
  platformUserId: string;
  targetGroups?: string[]; // Para Facebook Groups
  scheduledTime?: Date;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  platform: string;
  timestamp: Date;
}

/**
 * Publicar em Facebook
 */
export async function publishToFacebook(config: PublishConfig): Promise<PublishResult> {
  try {
    const { imageUrl, caption, accessToken, platformUserId, targetGroups } = config;

    if (!imageUrl && !config.videoUrl) {
      throw new Error("Imagem ou vídeo é obrigatório");
    }

    // Publicar na timeline do usuário
    const timelineResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${platformUserId}/photos`,
      {
        url: imageUrl,
        caption,
        access_token: accessToken,
      }
    );

    const postId = timelineResponse.data.id;

    // Publicar em grupos se especificado
    if (targetGroups && targetGroups.length > 0) {
      for (const groupId of targetGroups) {
        try {
          await axios.post(
            `https://graph.facebook.com/v18.0/${groupId}/photos`,
            {
              url: imageUrl,
              caption,
              access_token: accessToken,
            }
          );
        } catch (error) {
          console.error(`Erro ao publicar em grupo ${groupId}:`, error);
        }
      }
    }

    // Armazenar no banco de dados
    const dbInstance = await getDb();
    if (dbInstance) {
      await dbInstance.insert(publishedPosts).values({
        userId: 1, // TODO: obter do contexto
        platform: "facebook",
        platformPostId: postId,
        mediaUrl: imageUrl || config.videoUrl,
        title: "Facebook Post",
        description: "Comercial automático",
        status: "published",
        publishedAt: new Date(),
        engagementMetrics: JSON.stringify({
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        }),
      });
    }

    return {
      success: true,
      postId,
      url: `https://facebook.com/${postId}`,
      platform: "facebook",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao publicar no Facebook",
      platform: "facebook",
      timestamp: new Date(),
    };
  }
}

/**
 * Publicar em Instagram
 */
export async function publishToInstagram(config: PublishConfig): Promise<PublishResult> {
  try {
    const { imageUrl, caption, accessToken, platformUserId } = config;

    if (!imageUrl) {
      throw new Error("Imagem é obrigatória para Instagram");
    }

    // Criar container de mídia
    const containerResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${platformUserId}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }
    );

    const containerId = containerResponse.data.id;

    // Publicar o container
    const publishResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${platformUserId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken,
      }
    );

    const postId = publishResponse.data.id;

    // Armazenar no banco de dados
    const dbInstance = await getDb();
    if (dbInstance) {
      await dbInstance.insert(publishedPosts).values({
        userId: 1, // TODO: obter do contexto
        platform: "instagram",
        platformPostId: postId,
        mediaUrl: imageUrl,
        title: "Instagram Post",
        description: "Comercial automático",
        status: "published",
        publishedAt: new Date(),
        engagementMetrics: JSON.stringify({
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        }),
      });
    }

    return {
      success: true,
      postId,
      url: `https://instagram.com/p/${postId}`,
      platform: "instagram",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao publicar no Instagram",
      platform: "instagram",
      timestamp: new Date(),
    };
  }
}

/**
 * Publicar em TikTok
 */
export async function publishToTikTok(config: PublishConfig): Promise<PublishResult> {
  try {
    const { videoUrl, caption, accessToken, platformUserId } = config;

    if (!videoUrl) {
      throw new Error("Vídeo é obrigatório para TikTok");
    }

    // Upload do vídeo
    const uploadResponse = await axios.post(
      `https://open.tiktokapis.com/v1/post/publish/action/upload/`,
      {
        source_info: {
          source: "FILE_UPLOAD",
          video_size: 0, // Será preenchido pelo servidor
          chunk_size: 5242880, // 5MB chunks
          total_chunk_count: 1,
        },
        access_token: accessToken,
      }
    );

    const uploadUrl = uploadResponse.data.data.upload_url;

    // Fazer upload do vídeo
    await axios.put(uploadUrl, {
      video: videoUrl,
    });

    // Publicar o vídeo
    const publishResponse = await axios.post(
      `https://open.tiktokapis.com/v1/post/publish/action/publish/`,
      {
        post_info: {
          description: caption,
          title: caption.substring(0, 150),
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: 0,
        },
        access_token: accessToken,
      }
    );

    const postId = publishResponse.data.data.publish_id;

    // Armazenar no banco de dados
    const dbInstance = await getDb();
    if (dbInstance) {
      await dbInstance.insert(publishedPosts).values({
        userId: 1, // TODO: obter do contexto
        platform: "tiktok",
        platformPostId: postId,
        mediaUrl: config.videoUrl,
        title: "TikTok Video",
        description: "Comercial automático",
        status: "published",
        publishedAt: new Date(),
        engagementMetrics: JSON.stringify({
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        }),
      });
    }

    return {
      success: true,
      postId,
      url: `https://tiktok.com/@${platformUserId}/video/${postId}`,
      platform: "tiktok",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao publicar no TikTok",
      platform: "tiktok",
      timestamp: new Date(),
    };
  }
}

/**
 * Publicar em YouTube
 */
export async function publishToYouTube(config: PublishConfig): Promise<PublishResult> {
  try {
    const { videoUrl, caption, accessToken } = config;

    if (!videoUrl) {
      throw new Error("Vídeo é obrigatório para YouTube");
    }

    // Upload do vídeo
    const uploadResponse = await axios.post(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status`,
      {
        snippet: {
          title: caption.substring(0, 100),
          description: caption,
          tags: ["comercial", "produto"],
          categoryId: "22", // People & Blogs
        },
        status: {
          privacyStatus: "public",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const postId = uploadResponse.data.id;

    // Armazenar no banco de dados
    const dbInstance = await getDb();
    if (dbInstance) {
      await dbInstance.insert(publishedPosts).values({
        userId: 1, // TODO: obter do contexto
        platform: "youtube",
        platformPostId: postId,
        mediaUrl: config.videoUrl,
        title: "YouTube Video",
        description: "Comercial automático",
        status: "published",
        publishedAt: new Date(),
        engagementMetrics: JSON.stringify({
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        }),
      });
    }

    return {
      success: true,
      postId,
      url: `https://youtube.com/watch?v=${postId}`,
      platform: "youtube",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao publicar no YouTube",
      platform: "youtube",
      timestamp: new Date(),
    };
  }
}

/**
 * Publicar em múltiplas plataformas simultaneamente
 */
export async function publishToMultiplePlatforms(
  platforms: PublishConfig[]
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  for (const config of platforms) {
    try {
      let result: PublishResult;

      switch (config.platform) {
        case "facebook":
          result = await publishToFacebook(config);
          break;
        case "instagram":
          result = await publishToInstagram(config);
          break;
        case "tiktok":
          result = await publishToTikTok(config);
          break;
        case "youtube":
          result = await publishToYouTube(config);
          break;
        default:
          result = {
            success: false,
            error: `Plataforma ${config.platform} não suportada`,
            platform: config.platform,
            timestamp: new Date(),
          };
      }

      results.push(result);

      // Aguardar um pouco entre publicações para respeitar rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        platform: config.platform,
        timestamp: new Date(),
      });
    }
  }

  return results;
}
