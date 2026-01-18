/**
 * Pollinations.ai Image Generation
 * Free API - No authentication required
 * Supports Flux and other models
 */

export interface PollinationsImageOptions {
  prompt: string;
  model?: 'flux' | 'flux-pro' | 'flux-realism' | 'flux-anime';
  width?: number;
  height?: number;
  seed?: number;
}

/**
 * Generate image using Pollinations.ai
 * @param options - Image generation options
 * @returns Image URL
 */
export async function generateImageWithPollinations(
  options: PollinationsImageOptions
): Promise<{ url: string }> {
  const {
    prompt,
    model = 'flux',
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 1000000),
  } = options;

  try {
    // Pollinations.ai generates images directly from URL
    // No API call needed - just construct the image URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return { url: imageUrl };
  } catch (error) {
    console.error('[Pollinations] Error generating image:', error);
    throw new Error('Failed to generate image with Pollinations.ai');
  }
}

/**
 * Get available models
 */
export function getAvailablePollinationsModels(): string[] {
  return ['flux', 'flux-pro', 'flux-realism', 'flux-anime'];
}
