/**
 * Image generation types for Gemini integration
 */

/**
 * Configuration for generating images
 */
export interface ImageGenerationOptions {
  prompt: string;
  outputPath: string;
  resolution?: string;
  aspectRatio?: string;
  maxRetries?: number;
}

/**
 * Result of image generation
 */
export interface ImageGenerationResult {
  filePath: string;
  sizeBytes: number;
  width: number;
  height: number;
}

/**
 * Gemini image generation request configuration
 */
export interface GeminiImageConfig {
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number;
  aspectRatio?: string;
}
