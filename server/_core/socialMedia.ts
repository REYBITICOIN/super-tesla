import axios from "axios";

/**
 * Helper para integração com redes sociais
 * Suporta Facebook, Instagram e TikTok
 */

export interface SocialMediaConfig {
  facebook: {
    appId: string;
    appSecret: string;
    redirectUri: string;
  };
  instagram: {
    appId: string;
    appSecret: string;
    redirectUri: string;
  };
  tiktok: {
    clientKey: string;
    clientSecret: string;
    redirectUri: string;
  };
}

// Configurações padrão (usar variáveis de ambiente em produção)
const config: SocialMediaConfig = {
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || "",
    appSecret: process.env.FACEBOOK_APP_SECRET || "",
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3000/oauth/facebook/callback",
  },
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || "",
    appSecret: process.env.INSTAGRAM_APP_SECRET || "",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/oauth/instagram/callback",
  },
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    redirectUri: process.env.TIKTOK_REDIRECT_URI || "http://localhost:3000/oauth/tiktok/callback",
  },
};

/**
 * Gera URL de autenticação para Facebook
 */
export function getFacebookAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: config.facebook.appId,
    redirect_uri: config.facebook.redirectUri,
    scope: "pages_manage_metadata,pages_read_engagement,instagram_basic,instagram_manage_messages",
    response_type: "code",
    state: Math.random().toString(36).substring(7),
  });
  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

/**
 * Gera URL de autenticação para TikTok
 */
export function getTikTokAuthUrl(): string {
  const params = new URLSearchParams({
    client_key: config.tiktok.clientKey,
    redirect_uri: config.tiktok.redirectUri,
    scope: "user.info.basic,video.upload,video.publish",
    response_type: "code",
    state: Math.random().toString(36).substring(7),
  });
  return `https://www.tiktok.com/v1/oauth/authorize?${params.toString()}`;
}

/**
 * Troca código de autorização por token de acesso (Facebook)
 */
export async function exchangeFacebookCode(code: string): Promise<any> {
  try {
    const response = await axios.get("https://graph.facebook.com/v18.0/oauth/access_token", {
      params: {
        client_id: config.facebook.appId,
        client_secret: config.facebook.appSecret,
        redirect_uri: config.facebook.redirectUri,
        code,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao trocar código Facebook:", error);
    throw error;
  }
}

/**
 * Troca código de autorização por token de acesso (TikTok)
 */
export async function exchangeTikTokCode(code: string): Promise<any> {
  try {
    const response = await axios.post("https://open.tiktokapis.com/v1/oauth/token/", {
      client_key: config.tiktok.clientKey,
      client_secret: config.tiktok.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.tiktok.redirectUri,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao trocar código TikTok:", error);
    throw error;
  }
}

/**
 * Publica vídeo no Facebook/Instagram
 */
export async function publishToFacebook(
  accessToken: string,
  pageId: string,
  videoUrl: string,
  caption: string,
  isInstagram: boolean = false
): Promise<any> {
  try {
    const endpoint = isInstagram
      ? `https://graph.instagram.com/v18.0/${pageId}/media`
      : `https://graph.facebook.com/v18.0/${pageId}/videos`;

    const response = await axios.post(endpoint, {
      source: videoUrl,
      description: caption,
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao publicar no Facebook/Instagram:", error);
    throw error;
  }
}

/**
 * Publica vídeo no TikTok
 */
export async function publishToTikTok(
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<any> {
  try {
    // Primeiro, faz upload do vídeo
    const uploadResponse = await axios.post(
      "https://open.tiktokapis.com/v1/post/publish/action/upload/",
      {
        source_info: {
          source: "FILE_UPLOAD",
          video_size: 0, // Será preenchido pelo servidor
        },
        post_info: {
          desc: caption,
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return uploadResponse.data;
  } catch (error) {
    console.error("Erro ao publicar no TikTok:", error);
    throw error;
  }
}

/**
 * Obtém informações do usuário do Facebook
 */
export async function getFacebookUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await axios.get("https://graph.facebook.com/v18.0/me", {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter informações do usuário Facebook:", error);
    throw error;
  }
}

/**
 * Obtém páginas do Facebook do usuário
 */
export async function getFacebookPages(accessToken: string): Promise<any> {
  try {
    const response = await axios.get("https://graph.facebook.com/v18.0/me/accounts", {
      params: {
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter páginas do Facebook:", error);
    throw error;
  }
}

/**
 * Obtém contas do Instagram conectadas ao Facebook
 */
export async function getInstagramAccounts(accessToken: string, pageId: string): Promise<any> {
  try {
    const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/instagram_business_account`, {
      params: {
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter contas Instagram:", error);
    throw error;
  }
}

/**
 * Obtém informações do usuário do TikTok
 */
export async function getTikTokUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await axios.get("https://open.tiktokapis.com/v1/user/info/", {
      params: {
        fields: "open_id,union_id,avatar_url,display_name",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter informações do usuário TikTok:", error);
    throw error;
  }
}
