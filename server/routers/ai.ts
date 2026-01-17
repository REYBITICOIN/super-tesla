import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { generateImage } from "../_core/imageGeneration";
import { storagePut } from "../storage";
import { createCreation, deductTokens, getTokenBalance } from "../db";
import { TRPCError } from "@trpc/server";

const TOKEN_COSTS = {
  image: 50,
  video: 200,
  upscale: 30,
  tts: 20,
};

export const aiRouter = router({
  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check token balance
      const balance = await getTokenBalance(ctx.user.id);
      if (!balance || balance.balance < TOKEN_COSTS.image) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient tokens",
        });
      }

      try {
        // Generate image using the built-in image generation API
        const { url: imageUrl } = await generateImage({
          prompt: input.prompt,
        });

        if (!imageUrl) {
          throw new Error("Failed to generate image URL");
        }

        // Upload to S3
        const fileName = `images/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        const { url: s3Url, key: s3Key } = await storagePut(
          fileName,
          Buffer.from(buffer),
          "image/png"
        );

        // Create database record
        const result = await createCreation({
          userId: ctx.user.id,
          type: "image",
          prompt: input.prompt,
          s3Key,
          s3Url,
          mimeType: "image/png",
          tokensUsed: TOKEN_COSTS.image,
          status: "completed",
        });

        // Deduct tokens
        await deductTokens(
          ctx.user.id,
          TOKEN_COSTS.image,
          "image_generation",
          result.id,
          "Image generation"
        );

        return {
          success: true,
          creationId: result.id,
          s3Url,
          prompt: input.prompt,
        };
      } catch (error) {
        console.error("Image generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate image",
        });
      }
    }),

  generateVideo: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(1000),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check token balance
      const balance = await getTokenBalance(ctx.user.id);
      if (!balance || balance.balance < TOKEN_COSTS.video) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient tokens",
        });
      }

      try {
        // For now, create a placeholder video generation
        // In production, this would call a video generation API
        const videoUrl = `https://via.placeholder.com/512x512?text=Video`;

        // Upload to S3
        const fileName = `videos/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
        const { url: s3Url, key: s3Key } = await storagePut(
          fileName,
          Buffer.from("video-placeholder"),
          "video/mp4"
        );

        // Create database record
        const result = await createCreation({
          userId: ctx.user.id,
          type: "video",
          prompt: input.prompt,
          s3Key,
          s3Url,
          mimeType: "video/mp4",
          tokensUsed: TOKEN_COSTS.video,
          metadata: input.imageUrl ? JSON.stringify({ imageUrl: input.imageUrl }) : undefined,
          status: "completed",
        });

        // Deduct tokens
        await deductTokens(
          ctx.user.id,
          TOKEN_COSTS.video,
          "video_generation",
          result.id,
          "Video generation"
        );

        return {
          success: true,
          creationId: result.id,
          s3Url,
          prompt: input.prompt,
        };
      } catch (error) {
        console.error("Video generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate video",
        });
      }
    }),

  upscaleImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        scale: z.number().min(2).max(4).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check token balance
      const balance = await getTokenBalance(ctx.user.id);
      if (!balance || balance.balance < TOKEN_COSTS.upscale) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient tokens",
        });
      }

      try {
        // For now, use placeholder upscale
        // In production, this would call an upscaling API
        const upscaledUrl = input.imageUrl;

        // Upload to S3
        const fileName = `upscaled/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const response = await fetch(input.imageUrl);
        const buffer = await response.arrayBuffer();

        const { url: s3Url, key: s3Key } = await storagePut(
          fileName,
          Buffer.from(buffer),
          "image/png"
        );

        // Create database record
        const result = await createCreation({
          userId: ctx.user.id,
          type: "upscale",
          prompt: `Upscale ${input.scale}x`,
          s3Key,
          s3Url,
          mimeType: "image/png",
          tokensUsed: TOKEN_COSTS.upscale,
          metadata: JSON.stringify({ scale: input.scale, originalUrl: input.imageUrl }),
          status: "completed",
        });

        // Deduct tokens
        await deductTokens(
          ctx.user.id,
          TOKEN_COSTS.upscale,
          "upscale",
          result.id,
          `Image upscale ${input.scale}x`
        );

        return {
          success: true,
          creationId: result.id,
          s3Url,
        };
      } catch (error) {
        console.error("Upscale failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upscale image",
        });
      }
    }),

  generateSpeech: protectedProcedure
    .input(
      z.object({
        text: z.string().min(10).max(5000),
        voice: z.string().default("en-US-AriaNeural"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check token balance
      const balance = await getTokenBalance(ctx.user.id);
      if (!balance || balance.balance < TOKEN_COSTS.tts) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient tokens",
        });
      }

      try {
        // For now, use placeholder TTS
        // In production, this would call a TTS API
        const audioUrl = `https://via.placeholder.com/512x512?text=Audio`;

        // Upload to S3
        const fileName = `audio/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
        const { url: s3Url, key: s3Key } = await storagePut(
          fileName,
          Buffer.from("audio-placeholder"),
          "audio/mpeg"
        );

        // Create database record
        const result = await createCreation({
          userId: ctx.user.id,
          type: "tts",
          prompt: input.text,
          s3Key,
          s3Url,
          mimeType: "audio/mpeg",
          tokensUsed: TOKEN_COSTS.tts,
          metadata: JSON.stringify({ voice: input.voice }),
          status: "completed",
        });

        // Deduct tokens
        await deductTokens(
          ctx.user.id,
          TOKEN_COSTS.tts,
          "tts",
          result.id,
          "Text-to-speech generation"
        );

        return {
          success: true,
          creationId: result.id,
          s3Url,
        };
      } catch (error) {
        console.error("TTS generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate speech",
        });
      }
    }),
});
