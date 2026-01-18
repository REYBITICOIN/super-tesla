/**
 * Hugging Face Inference API Integration
 * Free API for upscaling and other image tasks
 * Models: Real-ESRGAN, Upscayl, etc.
 */

export interface HuggingFaceUpscaleOptions {
  imageUrl: string;
  scale?: 2 | 4; // 2x or 4x upscale
  model?: 'real-esrgan' | 'upscayl' | 'swinir';
}

/**
 * Upscale image using Hugging Face
 * Free tier available but requires HF token for better performance
 */
export async function upscaleImageWithHuggingFace(
  options: HuggingFaceUpscaleOptions
): Promise<{ url: string }> {
  const {
    imageUrl,
    scale = 4,
    model = 'real-esrgan',
  } = options;

  const hfToken = process.env.HUGGINGFACE_API_TOKEN;

  if (!hfToken) {
    console.warn('[HuggingFace] No token provided, using free tier (limited)');
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Map model names to HF model IDs
    const modelMap: Record<string, string> = {
      'real-esrgan': 'philz/RealESRGAN_x4plus',
      'upscayl': 'upscayl/upscayl-v3-real-esrgan-x4',
      'swinir': 'caidas/swinir',
    };

    const modelId = modelMap[model] || modelMap['real-esrgan'];

    // Call HF Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          ...(hfToken && { Authorization: `Bearer ${hfToken}` }),
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HuggingFace API error: ${error}`);
    }

    const upscaledBuffer = await response.arrayBuffer();

    // Convert to base64 for return
    const base64 = Buffer.from(upscaledBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return { url: dataUrl };
  } catch (error) {
    console.error('[HuggingFace] Error upscaling image:', error);
    throw new Error('Failed to upscale image with Hugging Face');
  }
}

/**
 * Get available upscale models
 */
export function getAvailableUpscaleModels(): string[] {
  return ['real-esrgan', 'upscayl', 'swinir'];
}
