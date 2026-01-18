import { Router } from "express";
import { getDb } from "../db";
import { socialMediaAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  exchangeFacebookCode,
  exchangeTikTokCode,
  getFacebookUserInfo,
  getFacebookPages,
  getInstagramAccounts,
  getTikTokUserInfo,
  getFacebookAuthUrl,
  getTikTokAuthUrl,
} from "./socialMedia";

const router = Router();

/**
 * Inicia OAuth para Facebook
 */
router.get("/facebook", (req, res) => {
  const authUrl = getFacebookAuthUrl();
  res.redirect(authUrl);
});

/**
 * Callback do OAuth do Facebook
 */
router.get("/facebook/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Código de autorização não fornecido" });
    }

    // Trocar código por token de acesso
    const tokenData = await exchangeFacebookCode(code as string);

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Falha ao obter token de acesso" });
    }

    // Obter informações do usuário
    const userInfo = await getFacebookUserInfo(tokenData.access_token);

    // Obter páginas do Facebook
    const pages = await getFacebookPages(tokenData.access_token);

    // Salvar no banco de dados
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível" });
    }

    // Salvar conta do Facebook
    await db
      .insert(socialMediaAccounts)
      .values({
        userId,
        platform: "facebook",
        platformUserId: userInfo.id,
        platformUsername: userInfo.name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        isConnected: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          isConnected: 1,
        },
      });

    // Redirecionar para página de sucesso
    res.redirect("/social-connect?success=facebook");
  } catch (error) {
    console.error("Erro no callback do Facebook:", error);
    res.redirect("/social-connect?error=facebook");
  }
});

/**
 * Inicia OAuth para TikTok
 */
router.get("/tiktok", (req, res) => {
  const authUrl = getTikTokAuthUrl();
  res.redirect(authUrl);
});

/**
 * Callback do OAuth do TikTok
 */
router.get("/tiktok/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Código de autorização não fornecido" });
    }

    // Trocar código por token de acesso
    const tokenData = await exchangeTikTokCode(code as string);

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Falha ao obter token de acesso" });
    }

    // Obter informações do usuário
    const userInfo = await getTikTokUserInfo(tokenData.access_token);

    // Salvar no banco de dados
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível" });
    }

    // Salvar conta do TikTok
    await db
      .insert(socialMediaAccounts)
      .values({
        userId,
        platform: "tiktok",
        platformUserId: userInfo.open_id,
        platformUsername: userInfo.display_name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        isConnected: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          isConnected: 1,
        },
      });

    // Redirecionar para página de sucesso
    res.redirect("/social-connect?success=tiktok");
  } catch (error) {
    console.error("Erro no callback do TikTok:", error);
    res.redirect("/social-connect?error=tiktok");
  }
});

/**
 * Inicia OAuth para Instagram (via Facebook)
 */
router.get("/instagram", (req, res) => {
  const authUrl = getFacebookAuthUrl();
  res.redirect(authUrl);
});

/**
 * Callback do OAuth do Instagram (via Facebook)
 */
router.get("/instagram/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Código de autorização não fornecido" });
    }

    // Trocar código por token de acesso
    const tokenData = await exchangeFacebookCode(code as string);

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Falha ao obter token de acesso" });
    }

    // Obter informações do usuário
    const userInfo = await getFacebookUserInfo(tokenData.access_token);

    // Obter páginas do Facebook
    const pages = await getFacebookPages(tokenData.access_token);

    // Obter contas do Instagram
    let instagramAccounts: any[] = [];
    if (pages.data && pages.data.length > 0) {
      for (const page of pages.data) {
        try {
          const igAccounts = await getInstagramAccounts(tokenData.access_token, page.id);
          if (igAccounts.instagram_business_account) {
            instagramAccounts.push(igAccounts.instagram_business_account);
          }
        } catch (error) {
          console.log(`Nenhuma conta Instagram encontrada para página ${page.id}`);
        }
      }
    }

    // Salvar no banco de dados
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível" });
    }

    // Salvar conta do Instagram
    await db
      .insert(socialMediaAccounts)
      .values({
        userId,
        platform: "instagram",
        platformUserId: instagramAccounts[0]?.id || userInfo.id,
        platformUsername: userInfo.name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        isConnected: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          isConnected: 1,
        },
      });

    // Redirecionar para página de sucesso
    res.redirect("/social-connect?success=instagram");
  } catch (error) {
    console.error("Erro no callback do Instagram:", error);
    res.redirect("/social-connect?error=instagram");
  }
});

/**
 * Desconectar uma rede social
 */
router.post("/disconnect/:platform", async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível" });
    }

    await db
      .delete(socialMediaAccounts)
      .where(
        and(
          eq(socialMediaAccounts.userId, userId),
          eq(socialMediaAccounts.platform, platform)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao desconectar rede social:", error);
    res.status(500).json({ error: "Erro ao desconectar" });
  }
});

/**
 * Obter contas conectadas do usuário
 */
router.get("/accounts", async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Banco de dados indisponível" });
    }

    const accounts = await db
      .select()
      .from(socialMediaAccounts)
      .where(eq(socialMediaAccounts.userId, userId));

    res.json(accounts);
  } catch (error) {
    console.error("Erro ao obter contas:", error);
    res.status(500).json({ error: "Erro ao obter contas" });
  }
});

export default router;
