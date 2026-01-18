/**
 * Facebook Graph API Integration
 * Handles real API calls to Facebook for publishing content
 */

import axios, { AxiosInstance } from "axios";

interface FacebookAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookPageInfo {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookPostResponse {
  id: string;
  post_id?: string;
  success?: boolean;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export class FacebookGraphAPI {
  private client: AxiosInstance;
  private appId: string;
  private appSecret: string;
  private businessId: string;
  private apiVersion = "v18.0";

  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID || "";
    this.appSecret = process.env.FACEBOOK_APP_SECRET || "";
    this.businessId = process.env.FACEBOOK_BUSINESS_ID || "";

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      timeout: 30000,
    });
  }

  /**
   * Get app access token for server-to-server communication
   */
  async getAppAccessToken(): Promise<string> {
    try {
      const response = await axios.get<FacebookAccessToken>(
        `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`,
        {
          params: {
            client_id: this.appId,
            client_secret: this.appSecret,
            grant_type: "client_credentials",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("Failed to get app access token:", error);
      throw new Error("Failed to authenticate with Facebook");
    }
  }

  /**
   * Get user pages accessible by the app
   */
  async getUserPages(userAccessToken: string): Promise<FacebookPageInfo[]> {
    try {
      const response = await this.client.get("/me/accounts", {
        params: {
          access_token: userAccessToken,
          fields: "id,name,access_token",
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Failed to get user pages:", error);
      return [];
    }
  }

  /**
   * Publish image to Facebook page
   */
  async publishImageToPage(
    pageId: string,
    pageAccessToken: string,
    imageUrl: string,
    caption: string,
    link?: string
  ): Promise<FacebookPostResponse> {
    try {
      const params: Record<string, string> = {
        access_token: pageAccessToken,
        url: imageUrl,
        caption: caption,
      };

      if (link) {
        params.link = link;
      }

      const response = await this.client.post<FacebookPostResponse>(
        `/${pageId}/photos`,
        params
      );

      return {
        id: response.data.id,
        success: true,
      };
    } catch (error: any) {
      console.error("Failed to publish image to Facebook:", error);
      return {
        id: "",
        success: false,
        error: {
          message: error.response?.data?.error?.message || error.message,
          type: error.response?.data?.error?.type || "unknown",
          code: error.response?.status || 500,
        },
      };
    }
  }

  /**
   * Publish video to Facebook page
   */
  async publishVideoToPage(
    pageId: string,
    pageAccessToken: string,
    videoUrl: string,
    title: string,
    description: string
  ): Promise<FacebookPostResponse> {
    try {
      const response = await this.client.post<FacebookPostResponse>(
        `/${pageId}/videos`,
        {
          access_token: pageAccessToken,
          file_url: videoUrl,
          title: title,
          description: description,
        }
      );

      return {
        id: response.data.id,
        success: true,
      };
    } catch (error: any) {
      console.error("Failed to publish video to Facebook:", error);
      return {
        id: "",
        success: false,
        error: {
          message: error.response?.data?.error?.message || error.message,
          type: error.response?.data?.error?.type || "unknown",
          code: error.response?.status || 500,
        },
      };
    }
  }

  /**
   * Publish feed post to Facebook page
   */
  async publishFeedPost(
    pageId: string,
    pageAccessToken: string,
    message: string,
    link?: string,
    imageUrl?: string
  ): Promise<FacebookPostResponse> {
    try {
      const params: Record<string, string> = {
        access_token: pageAccessToken,
        message: message,
      };

      if (link) {
        params.link = link;
      }

      if (imageUrl) {
        params.picture = imageUrl;
      }

      const response = await this.client.post<FacebookPostResponse>(
        `/${pageId}/feed`,
        params
      );

      return {
        id: response.data.id,
        success: true,
      };
    } catch (error: any) {
      console.error("Failed to publish feed post to Facebook:", error);
      return {
        id: "",
        success: false,
        error: {
          message: error.response?.data?.error?.message || error.message,
          type: error.response?.data?.error?.type || "unknown",
          code: error.response?.status || 500,
        },
      };
    }
  }

  /**
   * Get insights for a post
   */
  async getPostInsights(
    postId: string,
    pageAccessToken: string,
    metrics: string[] = ["impressions", "engagement", "reach"]
  ): Promise<Record<string, number>> {
    try {
      const response = await this.client.get(`/${postId}/insights`, {
        params: {
          access_token: pageAccessToken,
          metric: metrics.join(","),
        },
      });

      const insights: Record<string, number> = {};
      response.data.data?.forEach((item: any) => {
        insights[item.name] = item.values?.[0]?.value || 0;
      });

      return insights;
    } catch (error) {
      console.error("Failed to get post insights:", error);
      return {};
    }
  }

  /**
   * Delete a post
   */
  async deletePost(
    postId: string,
    pageAccessToken: string
  ): Promise<boolean> {
    try {
      await this.client.delete(`/${postId}`, {
        params: {
          access_token: pageAccessToken,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to delete post:", error);
      return false;
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await this.client.get("/me", {
        params: {
          access_token: accessToken,
          fields: "id",
        },
      });

      return !!response.data.id;
    } catch (error) {
      console.error("Invalid access token:", error);
      return false;
    }
  }
}

// Export singleton instance
export const facebookAPI = new FacebookGraphAPI();
