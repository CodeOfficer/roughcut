import { logger } from '../../core/logger.js';
import { narrateTutorial } from './narrate.js';
import { captureScreenshots } from './screenshots.js';
import { buildTutorial } from './build.js';

/**
 * Run full tutorial generation workflow
 */
export async function fullWorkflow(tutorialName: string): Promise<void> {
  logger.section(`Full Tutorial Generation: ${tutorialName}`);

  try {
    // Step 1: Generate narration
    await narrateTutorial(tutorialName);

    // Step 2: Capture screenshots and generate images
    await captureScreenshots(tutorialName);

    // Step 3: Build video
    await buildTutorial(tutorialName);

    logger.success(`\n✅ Full workflow completed successfully!`);
    logger.info(`Your tutorial video is ready to watch.`);
  } catch (error) {
    logger.error('Full workflow failed', error);
    throw error;
  }
}
