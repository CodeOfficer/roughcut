import { join } from 'path';
import sharp from 'sharp';
import { ScreenshotCapture } from './capture.js';
import { logger } from '../core/logger.js';
import { getFileSize } from '../utils/fs.js';
import type { TutorialSegment } from '../core/types.js';
import type { ScreenshotCaptureOptions, ScreenshotCaptureResult } from './types.js';

/**
 * Screenshot management service for tutorial screenshots
 */
export class ScreenshotManager {
  private capture: ScreenshotCapture;
  private viewport: { width: number; height: number };

  constructor(resolution?: string) {
    this.capture = new ScreenshotCapture();
    const [width, height] = this.parseResolution(resolution || '1920x1080');
    this.viewport = { width, height };
  }

  /**
   * Initialize the screenshot capture system
   */
  async initialize(): Promise<void> {
    await this.capture.initialize(this.viewport);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.capture.cleanup();
  }

  /**
   * Capture screenshot for a single segment
   */
  async captureSegmentScreenshot(
    segment: TutorialSegment,
    outputDir: string
  ): Promise<ScreenshotCaptureResult> {
    if (segment.screenshot.mode !== 'auto') {
      throw new Error(`Segment ${segment.id} is not in auto mode`);
    }

    if (!segment.screenshot.playwrightInstructions) {
      throw new Error(`Segment ${segment.id} is missing playwrightInstructions`);
    }

    const outputPath = join(outputDir, `${segment.id}.png`);

    logger.step(`Capturing screenshot for ${segment.id}: "${segment.title}"`);

    try {
      // Parse instructions
      const instructions = this.capture.parseInstructions(
        segment.screenshot.playwrightInstructions
      );

      // Execute and capture
      await this.capture.captureWithInstructions(instructions, outputPath);

      // Get screenshot metadata
      const metadata = await sharp(outputPath).metadata();
      const sizeBytes = await getFileSize(outputPath);

      logger.success(
        `Captured ${segment.id}.png (${metadata.width}x${metadata.height}, ${Math.round(sizeBytes / 1024)}KB)`
      );

      return {
        filePath: outputPath,
        sizeBytes,
        width: metadata.width || this.viewport.width,
        height: metadata.height || this.viewport.height,
      };
    } catch (error) {
      logger.error(`Failed to capture screenshot for ${segment.id}`, error);
      throw error;
    }
  }

  /**
   * Capture screenshots for all auto segments in a tutorial
   */
  async captureAllScreenshots(
    segments: TutorialSegment[],
    outputDir: string
  ): Promise<Map<string, ScreenshotCaptureResult>> {
    const autoSegments = segments.filter(s => s.screenshot.mode === 'auto');

    if (autoSegments.length === 0) {
      logger.info('No auto screenshot segments to capture');
      return new Map();
    }

    logger.section(`Capturing Screenshots (${autoSegments.length} segments)`);

    // Initialize browser once for all screenshots
    await this.initialize();

    const results = new Map<string, ScreenshotCaptureResult>();

    try {
      for (const segment of autoSegments) {
        const result = await this.captureSegmentScreenshot(segment, outputDir);
        results.set(segment.id, result);
      }

      // Calculate totals
      const totalSize = Array.from(results.values())
        .reduce((sum, r) => sum + r.sizeBytes, 0);

      logger.success(
        `Captured ${results.size} screenshots (${Math.round(totalSize / 1024)}KB total)`
      );
    } finally {
      // Always cleanup browser
      await this.cleanup();
    }

    return results;
  }

  /**
   * Capture screenshot from custom options
   */
  async capture(options: ScreenshotCaptureOptions): Promise<ScreenshotCaptureResult> {
    await this.initialize();

    try {
      const instructions = this.capture.parseInstructions(options.instructions);
      await this.capture.captureWithInstructions(instructions, options.outputPath);

      const metadata = await sharp(options.outputPath).metadata();
      const sizeBytes = await getFileSize(options.outputPath);

      return {
        filePath: options.outputPath,
        sizeBytes,
        width: metadata.width || this.viewport.width,
        height: metadata.height || this.viewport.height,
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Parse resolution string
   */
  private parseResolution(resolution: string): [number, number] {
    const [width, height] = resolution.split('x').map(Number);
    return [width, height];
  }
}

/**
 * Create a screenshot manager instance
 */
export function createScreenshotManager(resolution?: string): ScreenshotManager {
  return new ScreenshotManager(resolution);
}
