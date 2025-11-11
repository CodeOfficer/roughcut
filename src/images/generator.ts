import { join } from 'path';
import sharp from 'sharp';
import { GeminiClient } from './gemini.js';
import { logger } from '../core/logger.js';
import { ensureDir, getFileSize } from '../utils/fs.js';
import type { ImageGenerationOptions, ImageGenerationResult } from './types.js';

/**
 * Image generation service for tutorial static images
 */
export class ImageGenerator {
  private client: GeminiClient;
  private resolution: string;

  constructor(resolution?: string) {
    this.client = new GeminiClient();
    this.resolution = resolution || '1920x1080';
  }

  /**
   * Generate image from prompt with automatic file naming
   */
  async generateImage(
    prompt: string,
    outputDir: string,
    filename: string
  ): Promise<ImageGenerationResult> {
    const outputPath = join(outputDir, filename.endsWith('.png') ? filename : `${filename}.png`);

    logger.step(`Generating image: "${filename}"`);

    try {
      // Ensure output directory exists
      await ensureDir(outputDir);

      // Generate image as SVG first
      const svgPath = outputPath + '.svg';
      await this.client.generateImage(
        prompt,
        svgPath,
        { resolution: this.resolution }
      );

      // Convert SVG to PNG
      const parts = this.resolution.split('x').map(Number);
      const width: number = parts[0] || 1920;
      const height: number = parts[1] || 1080;
      await sharp(svgPath)
        .resize(width, height)
        .png()
        .toFile(outputPath);

      // Get image metadata
      const metadata = await sharp(outputPath).metadata();
      const sizeBytes = await getFileSize(outputPath);
      const imgWidth: number = metadata.width || width;
      const imgHeight: number = metadata.height || height;

      logger.success(
        `Generated ${filename} (${imgWidth}x${imgHeight}, ${Math.round(sizeBytes / 1024)}KB)`
      );

      // Clean up intermediate SVG
      const { unlink } = await import('fs/promises');
      await unlink(svgPath);

      return {
        filePath: outputPath,
        sizeBytes,
        width: imgWidth,
        height: imgHeight,
      };
    } catch (error) {
      logger.error(`Failed to generate image: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Generate multiple images from prompts
   */
  async generateBatch(
    prompts: Array<{ prompt: string; filename: string }>,
    outputDir: string
  ): Promise<Map<string, ImageGenerationResult>> {
    if (prompts.length === 0) {
      logger.info('No images to generate');
      return new Map();
    }

    logger.section(`Generating Images (${prompts.length} images)`);

    const results = new Map<string, ImageGenerationResult>();

    for (const item of prompts) {
      const result = await this.generateImage(item.prompt, outputDir, item.filename);
      results.set(item.filename, result);
    }

    // Calculate totals
    const totalSize = Array.from(results.values())
      .reduce((sum, r) => sum + r.sizeBytes, 0);

    logger.success(
      `Generated ${results.size} images (${Math.round(totalSize / 1024)}KB total)`
    );

    return results;
  }

  /**
   * Generate image from custom options
   */
  async generate(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const maxRetries = options.maxRetries || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const imageOptions: { resolution?: string; aspectRatio?: string } = {};
        if (options.resolution) imageOptions.resolution = options.resolution;
        if (options.aspectRatio) imageOptions.aspectRatio = options.aspectRatio;

        await this.client.generateImage(
          options.prompt,
          options.outputPath,
          imageOptions
        );

        const metadata = await sharp(options.outputPath).metadata();
        const sizeBytes = await getFileSize(options.outputPath);
        const imgWidth = metadata.width || 1920;
        const imgHeight = metadata.height || 1080;

        return {
          filePath: options.outputPath,
          sizeBytes,
          width: imgWidth,
          height: imgHeight,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          logger.warn(`Image generation attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Image generation failed after retries');
  }
}

/**
 * Create an image generator instance
 */
export function createImageGenerator(resolution?: string): ImageGenerator {
  return new ImageGenerator(resolution);
}
