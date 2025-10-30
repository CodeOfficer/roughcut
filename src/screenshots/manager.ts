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
  private screenshotCapture: ScreenshotCapture;
  private viewport: { width: number; height: number };

  constructor(resolution?: string) {
    this.screenshotCapture = new ScreenshotCapture();
    const [width, height] = this.parseResolution(resolution || '1920x1080');
    this.viewport = { width, height };
  }

  /**
   * Initialize the screenshot capture system
   */
  async initialize(): Promise<void> {
    await this.screenshotCapture.initialize(this.viewport);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.screenshotCapture.cleanup();
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
      const instructions = this.screenshotCapture.parseInstructions(
        segment.screenshot.playwrightInstructions
      );

      // Execute and capture
      await this.screenshotCapture.captureWithInstructions(instructions, outputPath);

      // Get screenshot metadata
      const metadata = await sharp(outputPath).metadata();
      const sizeBytes = await getFileSize(outputPath);
      const imgWidth = metadata.width || this.viewport.width;
      const imgHeight = metadata.height || this.viewport.height;

      logger.success(
        `Captured ${segment.id}.png (${imgWidth}x${imgHeight}, ${Math.round(sizeBytes / 1024)}KB)`
      );

      return {
        filePath: outputPath,
        sizeBytes,
        width: imgWidth,
        height: imgHeight,
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
  async captureScreenshot(options: ScreenshotCaptureOptions): Promise<ScreenshotCaptureResult> {
    await this.initialize();

    try {
      const instructions = this.screenshotCapture.parseInstructions(options.instructions);
      await this.screenshotCapture.captureWithInstructions(instructions, options.outputPath);

      const metadata = await sharp(options.outputPath).metadata();
      const sizeBytes = await getFileSize(options.outputPath);
      const imgWidth = metadata.width || this.viewport.width;
      const imgHeight = metadata.height || this.viewport.height;

      return {
        filePath: options.outputPath,
        sizeBytes,
        width: imgWidth,
        height: imgHeight,
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Parse resolution string
   */
  private parseResolution(resolution: string): [number, number] {
    const parts = resolution.split('x').map(Number);
    const width = parts[0] || 1920;
    const height = parts[1] || 1080;
    return [width, height];
  }
}

/**
 * Create a screenshot manager instance
 */
export function createScreenshotManager(resolution?: string): ScreenshotManager {
  return new ScreenshotManager(resolution);
}
