/**
 * Asset Copier - Handles copying user-provided assets from tutorial directory
 *
 * Copies images, videos, and other assets from the tutorial source directory
 * to the build output, making them available for the presentation.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../core/logger.js';

/**
 * Asset copier options
 */
export interface AssetCopierOptions {
  /** Source directory containing presentation.md and assets */
  sourceDir: string;

  /** Output directory for the build (.build folder) */
  outputDir: string;
}

/**
 * Asset copier result
 */
export interface AssetCopierResult {
  /** Number of files copied */
  filesCopied: number;

  /** Paths of copied files (relative to source) */
  copiedFiles: string[];
}

/**
 * Common image extensions
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];

/**
 * Common video extensions
 */
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

/**
 * Common audio extensions
 */
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

/**
 * All supported asset extensions
 */
const ASSET_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS];

/**
 * Copies user-provided assets from tutorial directory to build output
 */
export class AssetCopier {
  /**
   * Copy all user assets from source directory to output
   */
  async copyAssets(options: AssetCopierOptions): Promise<AssetCopierResult> {
    const { sourceDir, outputDir } = options;

    // Ensure output assets directory exists
    const assetsOutputDir = path.join(outputDir, 'presentation', 'assets');
    await fs.mkdir(assetsOutputDir, { recursive: true });

    // Read source directory
    const files = await fs.readdir(sourceDir);

    const copiedFiles: string[] = [];

    for (const file of files) {
      // Skip presentation.md and hidden files/directories
      if (file === 'presentation.md' || file.startsWith('.')) {
        continue;
      }

      const sourcePath = path.join(sourceDir, file);
      const stat = await fs.stat(sourcePath);

      // Only copy files (not directories)
      if (!stat.isFile()) {
        continue;
      }

      // Check if it's an asset we should copy
      const ext = path.extname(file).toLowerCase();
      if (!ASSET_EXTENSIONS.includes(ext)) {
        logger.debug(`Skipping non-asset file: ${file}`);
        continue;
      }

      // Copy the file
      const destPath = path.join(assetsOutputDir, file);
      await fs.copyFile(sourcePath, destPath);
      copiedFiles.push(file);

      logger.debug(`Copied asset: ${file} -> assets/${file}`);
    }

    if (copiedFiles.length > 0) {
      logger.info(`Copied ${copiedFiles.length} user asset(s) to presentation/assets/`);
    }

    return {
      filesCopied: copiedFiles.length,
      copiedFiles,
    };
  }
}

/**
 * Create a new asset copier instance
 */
export function createAssetCopier(): AssetCopier {
  return new AssetCopier();
}
