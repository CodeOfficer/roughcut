/**
 * Playwright video recorder for presentation capture
 *
 * Handles video recording configuration and file management
 * Integrates with Playwright's built-in video recording
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Video recording configuration
 */
export interface VideoRecordingConfig {
  /** Output directory for video files */
  outputDir: string;

  /** Video width in pixels (default: 1920) */
  width?: number;

  /** Video height in pixels (default: 1080) */
  height?: number;

  /** Video filename (without extension, default: auto-generated) */
  filename?: string;
}

/**
 * Video recording result with metadata
 */
export interface VideoRecordingResult {
  /** Path to the recorded video file */
  videoPath: string;

  /** Video duration in seconds */
  durationSeconds: number;

  /** Video file size in bytes */
  sizeBytes: number;

  /** Video resolution */
  resolution: {
    width: number;
    height: number;
  };

  /** Video format */
  format: string;
}

/**
 * Playwright context options for video recording
 */
export interface RecordingContextOptions {
  recordVideo: {
    dir: string;
    size: {
      width: number;
      height: number;
    };
  };
  viewport: {
    width: number;
    height: number;
  };
}

// ============================================================================
// RECORDER CLASS
// ============================================================================

export class PlaywrightVideoRecorder {
  /**
   * Generate context options for Playwright with video recording enabled
   */
  generateContextOptions(
    config: VideoRecordingConfig,
  ): RecordingContextOptions {
    const width = config.width || 1920;
    const height = config.height || 1080;

    return {
      recordVideo: {
        dir: config.outputDir,
        size: { width, height },
      },
      viewport: {
        width,
        height,
      },
    };
  }

  /**
   * Process recorded video and extract metadata
   *
   * @param videoPath - Path to the recorded video file
   * @param targetFilename - Optional target filename (without extension)
   */
  async processRecordedVideo(
    videoPath: string,
    targetFilename?: string,
  ): Promise<VideoRecordingResult> {
    // Verify video file exists
    const exists = await fs
      .access(videoPath)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      throw new Error(`Recorded video not found: ${videoPath}`);
    }

    // Get file stats
    const stats = await fs.stat(videoPath);

    // If target filename is provided, rename the file
    let finalPath = videoPath;
    if (targetFilename) {
      const dir = path.dirname(videoPath);
      const ext = path.extname(videoPath);
      const newPath = path.join(dir, `${targetFilename}${ext}`);

      await fs.rename(videoPath, newPath);
      finalPath = newPath;
    }

    // Extract metadata
    const resolution = await this.extractResolution(finalPath);
    const duration = await this.extractDuration(finalPath);

    return {
      videoPath: finalPath,
      durationSeconds: duration,
      sizeBytes: stats.size,
      resolution,
      format: this.getVideoFormat(finalPath),
    };
  }

  /**
   * Wait for video file to be written and closed
   *
   * Playwright may take a moment to finalize the video after closing
   */
  async waitForVideoFile(
    videoDir: string,
    timeout: number = 10000,
  ): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const files = await fs.readdir(videoDir);
        const videoFiles = files.filter(
          (f) => f.endsWith(".webm") || f.endsWith(".mp4"),
        );

        if (videoFiles.length > 0 && videoFiles[0]) {
          const videoPath = path.join(videoDir, videoFiles[0]);

          // Wait a bit more to ensure file is fully written
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Verify file has content
          const stats = await fs.stat(videoPath);
          if (stats.size > 0) {
            return videoPath;
          }
        }
      } catch (error) {
        // Continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Video file not found in ${videoDir} after ${timeout}ms`);
  }

  // ============================================================================
  // METADATA EXTRACTION
  // ============================================================================

  /**
   * Extract video resolution
   *
   * For now, returns configured resolution
   * Could be enhanced with ffprobe integration
   */
  private async extractResolution(
    _videoPath: string,
  ): Promise<{ width: number; height: number }> {
    // Default to standard HD resolution
    // In production, could use ffprobe to extract actual resolution
    return { width: 1920, height: 1080 };
  }

  /**
   * Extract video duration
   *
   * For now, returns 0 (unknown)
   * Could be enhanced with ffprobe integration
   */
  private async extractDuration(_videoPath: string): Promise<number> {
    // In production, could use ffprobe to extract duration
    // For now, return 0 (unknown) as this will be calculated from timeline
    return 0;
  }

  /**
   * Get video format from file extension
   */
  private getVideoFormat(videoPath: string): string {
    const ext = path.extname(videoPath).toLowerCase();

    switch (ext) {
      case ".webm":
        return "webm";
      case ".mp4":
        return "mp4";
      default:
        return "unknown";
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir(outputDir: string): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });
  }

  /**
   * Clean up video files in directory
   */
  async cleanupVideoFiles(outputDir: string): Promise<void> {
    try {
      const files = await fs.readdir(outputDir);
      const videoFiles = files.filter(
        (f) => f.endsWith(".webm") || f.endsWith(".mp4"),
      );

      for (const file of videoFiles) {
        await fs.unlink(path.join(outputDir, file));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Generate default video filename with timestamp
   */
  generateDefaultFilename(presentationTitle?: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);

    if (presentationTitle) {
      const sanitized = presentationTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return `${sanitized}-${timestamp}`;
    }

    return `presentation-${timestamp}`;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new video recorder instance
 */
export function createPlaywrightRecorder(): PlaywrightVideoRecorder {
  return new PlaywrightVideoRecorder();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get standard video resolutions
 */
export const VIDEO_RESOLUTIONS = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "4K": { width: 3840, height: 2160 },
} as const;

/**
 * Parse resolution string to dimensions
 */
export function parseResolution(resolution: string): {
  width: number;
  height: number;
} {
  // Check if it's a preset
  if (resolution in VIDEO_RESOLUTIONS) {
    return VIDEO_RESOLUTIONS[resolution as keyof typeof VIDEO_RESOLUTIONS];
  }

  // Parse "widthxheight" format
  const match = resolution.match(/^(\d+)x(\d+)$/);
  if (match && match[1] && match[2]) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }

  // Default to 1080p
  return VIDEO_RESOLUTIONS["1080p"];
}
