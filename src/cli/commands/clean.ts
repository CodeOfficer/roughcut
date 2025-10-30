import { rm } from 'fs/promises';
import { logger } from '../../core/logger.js';
import { getTutorialPaths } from '../../utils/paths.js';
import { exists } from '../../utils/fs.js';

/**
 * Clean generated assets for a tutorial
 */
export async function cleanTutorial(tutorialName: string): Promise<void> {
  logger.section(`Cleaning Tutorial Assets: ${tutorialName}`);

  const paths = getTutorialPaths(tutorialName);

  try {
    // Verify tutorial exists
    if (!(await exists(paths.root))) {
      throw new Error(`Tutorial not found: ${tutorialName}`);
    }

    let cleaned = 0;

    // Clean audio directory
    if (await exists(paths.audio)) {
      logger.step('Removing audio files');
      await rm(paths.audio, { recursive: true, force: true });
      cleaned++;
    }

    // Clean screenshots directory
    if (await exists(paths.screenshots)) {
      logger.step('Removing screenshot files');
      await rm(paths.screenshots, { recursive: true, force: true });
      cleaned++;
    }

    // Clean output directory
    if (await exists(paths.output)) {
      logger.step('Removing output files');
      await rm(paths.output, { recursive: true, force: true });
      cleaned++;
    }

    if (cleaned === 0) {
      logger.info('No generated assets found to clean');
    } else {
      logger.success(`Cleaned ${cleaned} asset directories`);
      logger.info('Script and config preserved');
    }
  } catch (error) {
    logger.error('Failed to clean tutorial assets', error);
    throw error;
  }
}
