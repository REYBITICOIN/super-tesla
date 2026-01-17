import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getTokenBalance,
  initializeTokenBalance,
  getTokenTransactions,
  createCreation,
  getUserCreations,
  getCreationsByType,
  updateCreationStatus,
  deductTokens,
} from "./db";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tokens: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const balance = await getTokenBalance(ctx.user.id);
      if (!balance) {
        // Initialize balance for new users
        await initializeTokenBalance(ctx.user.id, 1000);
        return { balance: 1000, totalAllocated: 1000 };
      }
      return balance;
    }),

    getTransactions: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getTokenTransactions(ctx.user.id, input.limit);
      }),
  }),

  ai: aiRouter,

  creations: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getUserCreations(ctx.user.id, input.limit);
      }),

    listByType: protectedProcedure
      .input(z.object({ type: z.string(), limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getCreationsByType(ctx.user.id, input.type, input.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["image", "video", "upscale", "tts", "flow"]),
          prompt: z.string(),
          s3Key: z.string(),
          s3Url: z.string(),
          mimeType: z.string().optional(),
          tokensUsed: z.number(),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user has enough tokens
        const balance = await getTokenBalance(ctx.user.id);
        if (!balance || balance.balance < input.tokensUsed) {
          throw new Error("Insufficient tokens");
        }

        // Create the creation record
        const result = await createCreation({
          userId: ctx.user.id,
          type: input.type,
          prompt: input.prompt,
          s3Key: input.s3Key,
          s3Url: input.s3Url,
          mimeType: input.mimeType,
          tokensUsed: input.tokensUsed,
          metadata: input.metadata,
          status: "completed",
        });

        // Deduct tokens
        const transactionType =
          input.type === "image"
            ? "image_generation"
            : input.type === "video"
              ? "video_generation"
              : input.type === "upscale"
                ? "upscale"
                : input.type === "tts"
                  ? "tts"
                  : "image_generation";

        await deductTokens(
          ctx.user.id,
          input.tokensUsed,
          transactionType,
          undefined,
          `${input.type} generation`
        );

        return result;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          creationId: z.number(),
          status: z.enum(["pending", "completed", "failed"]),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateCreationStatus(
          input.creationId,
          input.status,
          input.errorMessage
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
