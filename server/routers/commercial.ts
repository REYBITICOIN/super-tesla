import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { scrapeProduct, ProductData } from "../_core/productScraper";
import { generateCommercialConfigs, CommercialConfig } from "../_core/commercialGenerator";
import { generateImage } from "../_core/imageGeneration";
import { deductTokens, getTokenBalance } from "../db";

export const commercialRouter = router({
  /**
   * Fazer scraping de um produto a partir de uma URL
   */
  scrapeProduct: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const productData = await scrapeProduct(input.url);
        return {
          success: true,
          data: productData,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao fazer scraping do produto",
        };
      }
    }),

  /**
   * Gerar configurações de comerciais para múltiplas plataformas
   */
  generateConfigs: protectedProcedure
    .input(
      z.object({
        product: z.object({
          name: z.string(),
          description: z.string(),
          price: z.number(),
          currency: z.string(),
          images: z.array(z.string()),
          logo: z.string(),
          storeName: z.string(),
          url: z.string(),
        }),
        platforms: z.array(
          z.enum(["tiktok", "instagram", "facebook", "whatsapp", "youtube"])
        ),
        includeVideo: z.boolean().default(true),
        voiceGender: z.enum(["male", "female"]).default("female"),
        language: z.enum(["pt-BR", "en-US"]).default("pt-BR"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const config: CommercialConfig = {
          product: input.product as ProductData,
          platforms: input.platforms,
          includeVideo: input.includeVideo,
          voiceGender: input.voiceGender,
          language: input.language,
        };

        const commercials = generateCommercialConfigs(config);

        return {
          success: true,
          data: commercials,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar configurações",
        };
      }
    }),

  /**
   * Gerar imagem de comercial para uma plataforma específica
   */
  generateImage: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        storeName: z.string(),
        price: z.number(),
        currency: z.string(),
        platform: z.enum(["tiktok", "instagram", "facebook", "whatsapp", "youtube"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar saldo de tokens (50 tokens por imagem)
        const balance = await getTokenBalance(ctx.user.id);
        if (!balance || balance.balance < 50) {
          return {
            success: false,
            error: "Saldo insuficiente de tokens. Você precisa de 50 tokens para gerar uma imagem.",
          };
        }

        // Criar prompt para geração de imagem
        const prompt = `
          Crie um anúncio profissional para ${input.platform} para o produto: ${input.productName}
          Loja: ${input.storeName}
          Preço: ${input.currency} ${input.price.toFixed(2)}
          ${input.description ? `Descrição: ${input.description}` : ""}
          
          O anúncio deve ser atrativo, moderno e otimizado para ${input.platform}.
          Use cores vibrantes, texto legível e design profissional.
        `;

        // Gerar imagem
        const imageResult = await generateImage({ prompt });

        // Descontar tokens
        await deductTokens(
          ctx.user.id,
          50,
          "image_generation",
          undefined,
          `Commercial image for ${input.platform}`
        );

        return {
          success: true,
          data: {
            imageUrl: imageResult.url,
            tokensUsed: 50,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar imagem",
        };
      }
    }),

  /**
   * Gerar vídeo de comercial para uma plataforma específica
   */
  generateVideo: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        storeName: z.string(),
        price: z.number(),
        currency: z.string(),
        platform: z.enum(["tiktok", "instagram", "facebook", "whatsapp", "youtube"]),
        script: z.string(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar saldo de tokens (200 tokens por vídeo)
        const balance = await getTokenBalance(ctx.user.id);
        if (!balance || balance.balance < 200) {
          return {
            success: false,
            error: "Saldo insuficiente de tokens. Você precisa de 200 tokens para gerar um vídeo.",
          };
        }

        // TODO: Implementar geração de vídeo com TTS
        // Por enquanto, retornar erro informativo
        return {
          success: false,
          error: "Geração de vídeo será implementada em breve. Use a geração de imagens por enquanto.",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar vídeo",
        };
      }
    }),

  /**
   * Gerar todos os comerciais (imagens e vídeos) para múltiplas plataformas
   */
  generateAllCommercials: protectedProcedure
    .input(
      z.object({
        productUrl: z.string().url(),
        platforms: z.array(
          z.enum(["tiktok", "instagram", "facebook", "whatsapp", "youtube"])
        ),
        includeVideo: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Passo 1: Fazer scraping do produto
        const productData = await scrapeProduct(input.productUrl);

        // Passo 2: Gerar configurações de comerciais
        const config: CommercialConfig = {
          product: productData,
          platforms: input.platforms,
          includeVideo: input.includeVideo,
          voiceGender: "female",
          language: "pt-BR",
        };

        const commercials = generateCommercialConfigs(config);

        // Passo 3: Gerar imagens para cada comercial
        const results = [];
        let totalTokensUsed = 0;

        for (const commercial of commercials) {
          if (commercial.type === "image") {
            try {
              const imageResult = await generateImage({
                prompt: commercial.script,
              });

              results.push({
                platform: commercial.platform,
                type: "image",
                dimensions: commercial.dimensions,
                script: commercial.script,
                imageUrl: imageResult.url,
                tokensUsed: 50,
              });

              totalTokensUsed += 50;
            } catch (error) {
              console.error(`Erro ao gerar imagem para ${commercial.platform}:`, error);
            }
          }
        }

        // Descontar tokens totais
        if (totalTokensUsed > 0) {
          const balance = await getTokenBalance(ctx.user.id);
          if (!balance || balance.balance < totalTokensUsed) {
            return {
              success: false,
              error: `Saldo insuficiente. Você precisa de ${totalTokensUsed} tokens para gerar todos os comerciais.`,
            };
          }

          await deductTokens(
            ctx.user.id,
            totalTokensUsed,
            "image_generation",
            undefined,
            `Generated ${results.length} commercial images`
          );
        }

        return {
          success: true,
          data: {
            productData,
            commercials: results,
            totalTokensUsed,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar comerciais",
        };
      }
    }),
});
