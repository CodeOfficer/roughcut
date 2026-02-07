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
 * Style extensions
 */
const STYLE_EXTENSIONS = ['.css'];

/**
 * All supported asset extensions
 */
const ASSET_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS, ...STYLE_EXTENSIONS];

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

    // Recursively find and copy asset files, preserving directory structure
    const copiedFiles: string[] = [];
    const presentationDir = path.join(outputDir, 'presentation');

    const copyDir = async (dir: string, relPath: string = '') => {
      const entries = await fs.readdir(dir);

      for (const entry of entries) {
        // Skip presentation.md and hidden files/directories
        if (entry === 'presentation.md' || entry.startsWith('.')) {
          continue;
        }

        const sourcePath = path.join(dir, entry);
        const stat = await fs.stat(sourcePath);
        const entryRelPath = relPath ? path.join(relPath, entry) : entry;

        if (stat.isDirectory()) {
          await copyDir(sourcePath, entryRelPath);
          continue;
        }

        // Check if it's an asset we should copy
        const ext = path.extname(entry).toLowerCase();
        if (!ASSET_EXTENSIONS.includes(ext)) {
          logger.debug(`Skipping non-asset file: ${entryRelPath}`);
          continue;
        }

        // Copy to both assets/ (flat) and preserve relative path for direct references
        const flatDestPath = path.join(assetsOutputDir, entry);
        await fs.copyFile(sourcePath, flatDestPath);

        // Also copy preserving directory structure for relative path references (e.g., customCSS)
        if (relPath) {
          const structuredDestPath = path.join(presentationDir, entryRelPath);
          await fs.mkdir(path.dirname(structuredDestPath), { recursive: true });
          await fs.copyFile(sourcePath, structuredDestPath);
        }

        copiedFiles.push(entryRelPath);
        logger.debug(`Copied asset: ${entryRelPath}`);
      }
    };

    await copyDir(sourceDir);

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
