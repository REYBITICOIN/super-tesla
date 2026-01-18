/**
 * Replicate API Client for Image Generation
 * Supports Flux and other models
 * Free tier available: https://replicate.com/pricing
 */

export interface ReplicateImageOptions {
  prompt: string;
  model?: string; // Default: flux
  width?: number;
  height?: number;
  num_outputs?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface ReplicateResponse {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

/**
 * Generate image using Replicate API
 * Requires REPLICATE_API_TOKEN environment variable
 */
export async function generateImageWithReplicate(
  options: ReplicateImageOptions
): Promise<{ urls: string[] }> {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error(
      'REPLICATE_API_TOKEN is not configured. Get free token at https://replicate.com'
    );
  }

  const {
    prompt,
    model = 'black-forest-labs/flux-dev',
    width = 1024,
    height = 1024,
    num_outputs = 1,
    guidance_scale = 7.5,
    num_inference_steps = 50,
  } = options;

  try {
    // Create prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiToken}`,
      },
      body: JSON.stringify({
        version: model,
        input: {
          prompt,
          width,
          height,
          num_outputs,
          guidance_scale,
          num_inference_steps,
        },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = (await createResponse.json()) as ReplicateResponse;

    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max

    while (!completed && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${apiToken}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error('Failed to check prediction status');
      }

      const updatedPrediction = (await statusResponse.json()) as ReplicateResponse;

      if (updatedPrediction.status === 'succeeded') {
        completed = true;
        return {
          urls: updatedPrediction.output || [],
        };
      } else if (updatedPrediction.status === 'failed') {
        throw new Error(`Image generation failed: ${updatedPrediction.error}`);
      }

      attempts++;
    }

    throw new Error('Image generation timed out');
  } catch (error) {
    console.error('[Replicate] Error generating image:', error);
    throw error;
  }
}
