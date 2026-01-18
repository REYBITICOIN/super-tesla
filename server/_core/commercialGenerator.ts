import { ProductData } from './productScraper';

export interface CommercialAd {
  platform: 'tiktok' | 'whatsapp' | 'facebook' | 'instagram' | 'youtube';
  type: 'image' | 'video';
  dimensions: { width: number; height: number };
  aspectRatio: string;
  description: string;
  script: string;
}

export interface CommercialConfig {
  product: ProductData;
  platforms: CommercialAd['platform'][];
  includeVideo: boolean;
  voiceGender: 'male' | 'female';
  language: 'pt-BR' | 'en-US';
}

/**
 * Gerar configurações de anúncios para múltiplas plataformas
 */
export function generateCommercialConfigs(config: CommercialConfig): CommercialAd[] {
  const ads: CommercialAd[] = [];

  const platformConfigs = {
    tiktok: {
      image: { width: 1080, height: 1920, aspectRatio: '9:16' },
      video: { width: 1080, height: 1920, aspectRatio: '9:16' },
    },
    whatsapp: {
      image: { width: 1080, height: 1920, aspectRatio: '9:16' },
      video: { width: 1080, height: 1920, aspectRatio: '9:16' },
    },
    facebook: {
      image: { width: 1200, height: 628, aspectRatio: '1.91:1' },
      video: { width: 1080, height: 1080, aspectRatio: '1:1' },
    },
    instagram: {
      image: { width: 1080, height: 1080, aspectRatio: '1:1' },
      video: { width: 1080, height: 1920, aspectRatio: '9:16' },
    },
    youtube: {
      image: { width: 1280, height: 720, aspectRatio: '16:9' },
      video: { width: 1920, height: 1080, aspectRatio: '16:9' },
    },
  };

  for (const platform of config.platforms) {
    const platformConfig = platformConfigs[platform];

    // Anúncio em imagem
    ads.push({
      platform,
      type: 'image',
      dimensions: platformConfig.image,
      aspectRatio: platformConfig.image.aspectRatio,
      description: `Anúncio em imagem para ${platform} (${platformConfig.image.width}x${platformConfig.image.height})`,
      script: generateImageScript(config, platform),
    });

    // Anúncio em vídeo (se solicitado)
    if (config.includeVideo) {
      ads.push({
        platform,
        type: 'video',
        dimensions: platformConfig.video,
        aspectRatio: platformConfig.video.aspectRatio,
        description: `Anúncio em vídeo para ${platform} (${platformConfig.video.width}x${platformConfig.video.height})`,
        script: generateVideoScript(config, platform),
      });
    }
  }

  return ads;
}

/**
 * Gerar script de narração para anúncio em imagem
 */
function generateImageScript(config: CommercialConfig, platform: string): string {
  const { product } = config;
  const storeName = product.storeName || 'Nossa Loja';
  const productName = product.name || 'Produto';
  const price = product.price.toFixed(2);
  const currency = product.currency || 'BRL';

  const scripts = {
    tiktok: `Olha só que incrível! 😍 ${productName} da ${storeName}! Por apenas ${currency} ${price}. Não perca essa oportunidade! Link na bio! 🛍️ #moda #promoção #compre`,
    whatsapp: `Oi! 👋 Veja que legal! ${productName} da ${storeName}. Preço especial: ${currency} ${price}. Aproveita! 🛍️`,
    facebook: `Confira nosso novo produto! ${productName} - ${product.description} Apenas ${currency} ${price}. Compre agora na ${storeName}!`,
    instagram: `✨ ${productName} ✨ ${product.description} 💙 Preço: ${currency} ${price} 🛍️ Link na bio! #moda #estilo #${storeName.toLowerCase().replace(/\\s/g, '')}`,
    youtube: `Apresentamos: ${productName}! Confira todos os detalhes e características. Disponível na ${storeName} por apenas ${currency} ${price}. Clique no link para mais informações!`,
  };

  return scripts[platform as keyof typeof scripts] || scripts.facebook;
}

/**
 * Gerar script de narração para anúncio em vídeo
 */
function generateVideoScript(config: CommercialConfig, platform: string): string {
  const { product } = config;
  const storeName = product.storeName || 'Nossa Loja';
  const productName = product.name || 'Produto';
  const price = product.price.toFixed(2);
  const currency = product.currency || 'BRL';

  const scripts = {
    tiktok: `Meninas, olhem só isso! Essa ${productName} é simplesmente perfeita! Feita com material de altíssima qualidade, oferece conforto máximo. Na ${storeName} por apenas ${currency} ${price}. É imperdível! Não percam essa oportunidade! Vem conferir!`,
    whatsapp: `Oi! Temos uma novidade incrível para você! ${productName} com qualidade premium. Apenas ${currency} ${price} na ${storeName}. Aproveita enquanto tem estoque!`,
    facebook: `Conheça o ${productName}! Feito com os melhores materiais, oferece qualidade e conforto incomparáveis. ${product.description} Encontre na ${storeName} por apenas ${currency} ${price}. Clique para saber mais!`,
    instagram: `Apresentamos o ${productName}! Perfeito para você que busca qualidade e estilo. ${product.description} Disponível na ${storeName} por ${currency} ${price}. Vem conferir! Link na bio!`,
    youtube: `Bem-vindo ao nosso canal! Hoje vamos apresentar o ${productName}, um produto de qualidade excepcional. Confira todas as características e benefícios. Disponível na ${storeName} por apenas ${currency} ${price}. Não esqueça de se inscrever e ativar as notificações!`,
  };

  return scripts[platform as keyof typeof scripts] || scripts.facebook;
}

/**
 * Gerar dimensões e configurações de exportação por plataforma
 */
export function getPlatformExportConfig(platform: CommercialAd['platform'], type: 'image' | 'video') {
  const configs = {
    tiktok: {
      image: {
        width: 1080,
        height: 1920,
        format: 'png',
        quality: 95,
      },
      video: {
        width: 1080,
        height: 1920,
        format: 'mp4',
        fps: 30,
        bitrate: '5000k',
        duration: 15, // segundos
      },
    },
    whatsapp: {
      image: {
        width: 1080,
        height: 1920,
        format: 'jpg',
        quality: 90,
      },
      video: {
        width: 1080,
        height: 1920,
        format: 'mp4',
        fps: 30,
        bitrate: '3000k',
        duration: 30,
      },
    },
    facebook: {
      image: {
        width: 1200,
        height: 628,
        format: 'jpg',
        quality: 90,
      },
      video: {
        width: 1080,
        height: 1080,
        format: 'mp4',
        fps: 30,
        bitrate: '5000k',
        duration: 30,
      },
    },
    instagram: {
      image: {
        width: 1080,
        height: 1080,
        format: 'jpg',
        quality: 95,
      },
      video: {
        width: 1080,
        height: 1920,
        format: 'mp4',
        fps: 30,
        bitrate: '5000k',
        duration: 30,
      },
    },
    youtube: {
      image: {
        width: 1280,
        height: 720,
        format: 'jpg',
        quality: 95,
      },
      video: {
        width: 1920,
        height: 1080,
        format: 'mp4',
        fps: 30,
        bitrate: '8000k',
        duration: 60,
      },
    },
  };

  return configs[platform]?.[type] || configs.facebook[type];
}
