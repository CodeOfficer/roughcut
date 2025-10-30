import { join } from 'path';
import sharp from 'sharp';
import { GeminiClient } from './gemini.js';
import { logger } from '../core/logger.js';
import { ensureDir, getFileSize } from '../utils/fs.js';
import type { TutorialSegment } from '../core/types.js';
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
   * Generate image for a single segment
   */
  async generateSegmentImage(
    segment: TutorialSegment,
    outputDir: string
  ): Promise<ImageGenerationResult> {
    if (segment.screenshot.mode !== 'static') {
      throw new Error(`Segment ${segment.id} is not in static mode`);
    }

    if (!segment.screenshot.geminiPrompt) {
      throw new Error(`Segment ${segment.id} is missing geminiPrompt`);
    }

    const outputPath = join(outputDir, `${segment.id}.png`);

    logger.step(`Generating image for ${segment.id}: "${segment.title}"`);

    try {
      // Ensure output directory exists
      await ensureDir(outputDir);

      // Generate image as SVG first
      const svgPath = outputPath + '.svg';
      await this.client.generateImage(
        segment.screenshot.geminiPrompt,
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
        `Generated ${segment.id}.png (${imgWidth}x${imgHeight}, ${Math.round(sizeBytes / 1024)}KB)`
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
      logger.error(`Failed to generate image for ${segment.id}`, error);
      throw error;
    }
  }

  /**
   * Generate images for all static segments in a tutorial
   */
  async generateAllImages(
    segments: TutorialSegment[],
    outputDir: string
  ): Promise<Map<string, ImageGenerationResult>> {
    const staticSegments = segments.filter(s => s.screenshot.mode === 'static');

    if (staticSegments.length === 0) {
      logger.info('No static image segments to generate');
      return new Map();
    }

    logger.section(`Generating Static Images (${staticSegments.length} segments)`);

    const results = new Map<string, ImageGenerationResult>();

    for (const segment of staticSegments) {
      const result = await this.generateSegmentImage(segment, outputDir);
      results.set(segment.id, result);
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
