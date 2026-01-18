import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  logo: string;
  storeName: string;
  url: string;
  sku?: string;
  rating?: number;
}

/**
 * Scraper de produtos que extrai dados de qualquer URL de e-commerce
 * Suporta: Shopify, WooCommerce, e-commerce genéricos
 */
export async function scrapeProduct(productUrl: string): Promise<ProductData> {
  try {
    const response = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const html = response.data;

    // Tentar extrair dados usando múltiplas estratégias
    const productData: ProductData = {
      name: extractProductName($, html),
      description: extractDescription($, html),
      price: extractPrice($, html),
      currency: extractCurrency($, html),
      images: extractImages($, html),
      logo: extractLogo($, html),
      storeName: extractStoreName($, html),
      url: productUrl,
      sku: extractSku($, html),
      rating: extractRating($, html),
    };

    return productData;
  } catch (error) {
    console.error('Erro ao fazer scrape do produto:', error);
    throw new Error(`Falha ao extrair dados do produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function extractProductName($: cheerio.CheerioAPI, html: string): string {
  // Tentar múltiplas estratégias
  let name = 
    $('h1').first().text() ||
    $('[data-product-name]').first().text() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    '';

  return name.trim().substring(0, 200);
}

function extractDescription($: cheerio.CheerioAPI, html: string): string {
  let description = 
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    $('[data-product-description]').first().text() ||
    $('div.product-description').first().text() ||
    '';

  return description.trim().substring(0, 500);
}

function extractPrice($: cheerio.CheerioAPI, html: string): number {
  const priceText = 
    $('[data-price]').first().attr('data-price') ||
    $('span.price').first().text() ||
    $('[itemprop="price"]').first().text() ||
    $('meta[property="product:price:amount"]').attr('content') ||
    '';

  // Extrair número da string
  const match = priceText.match(/[\d,\.]+/);
  if (match) {
    const price = parseFloat(match[0].replace(',', '.'));
    return isNaN(price) ? 0 : price;
  }

  return 0;
}

function extractCurrency($: cheerio.CheerioAPI, html: string): string {
  return (
    $('meta[property="product:price:currency"]').attr('content') ||
    'BRL'
  );
}

function extractImages($: cheerio.CheerioAPI, html: string): string[] {
  const images: string[] = [];

  // Estratégia 1: Meta tags Open Graph
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) images.push(ogImage);

  // Estratégia 2: Data attributes
  $('[data-product-image]').each((_: number, el: any) => {
    const src = $(el).attr('data-product-image') || $(el).attr('src');
    if (src && images.length < 5) images.push(src);
  });

  // Estratégia 3: Imagens em containers específicos
  $('img[alt*="produto"], img[alt*="product"]').each((_: number, el: any) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && images.length < 5) images.push(src);
  });

  // Estratégia 4: Imagens em galeria
  $('div.gallery img, div.product-gallery img').each((_: number, el: any) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && images.length < 5) images.push(src);
  });

  // Remover duplicatas e URLs inválidas
  const uniqueImages = Array.from(new Set(images));
  return uniqueImages
    .filter(img => img && (img.startsWith('http') || img.startsWith('/')))
    .slice(0, 5);
}

function extractLogo($: cheerio.CheerioAPI, html: string): string {
  return (
    $('img[alt*="logo"]').first().attr('src') ||
    $('[data-logo]').first().attr('src') ||
    $('header img').first().attr('src') ||
    $('meta[property="og:image"]').attr('content') ||
    ''
  );
}

function extractStoreName($: cheerio.CheerioAPI, html: string): string {
  return (
    $('meta[property="og:site_name"]').attr('content') ||
    $('[data-store-name]').first().text() ||
    $('header h1').first().text() ||
    'Loja'
  ).trim();
}

function extractSku($: cheerio.CheerioAPI, html: string): string | undefined {
  const sku = 
    $('[data-sku]').first().attr('data-sku') ||
    $('[itemprop="sku"]').first().text() ||
    undefined;

  return sku?.trim();
}

function extractRating($: cheerio.CheerioAPI, html: string): number | undefined {
  const ratingText = 
    $('[data-rating]').first().attr('data-rating') ||
    $('[itemprop="ratingValue"]').first().text() ||
    undefined;

  if (ratingText) {
    const rating = parseFloat(ratingText);
    return isNaN(rating) ? undefined : rating;
  }

  return undefined;
}

/**
 * Converter URL relativa em absoluta
 */
export function resolveImageUrl(imageUrl: string, baseUrl: string): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('//')) return 'https:' + imageUrl;
  
  try {
    const base = new URL(baseUrl);
    return new URL(imageUrl, base).toString();
  } catch {
    return imageUrl;
  }
}
