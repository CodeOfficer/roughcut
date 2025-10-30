import { logger } from '../../core/logger.js';
import { parseTutorialScript } from '../../core/parser.js';
import { createImageGenerator } from '../../images/generator.js';
import { createScreenshotManager } from '../../screenshots/manager.js';
import { getTutorialPaths } from '../../utils/paths.js';
import { exists } from '../../utils/fs.js';

/**
 * Generate images and capture screenshots for a tutorial
 */
export async function captureScreenshots(tutorialName: string): Promise<void> {
  logger.section(`Capturing Screenshots and Generating Images: ${tutorialName}`);

  const paths = getTutorialPaths(tutorialName);

  try {
    // Verify tutorial exists
    if (!(await exists(paths.script))) {
      throw new Error(`Tutorial script not found: ${paths.script}`);
    }

    // Parse tutorial script
    logger.step('Parsing tutorial script');
    const script = await parseTutorialScript(paths.script);

    // Count segment types
    const staticCount = script.segments.filter(s => s.screenshot.mode === 'static').length;
    const autoCount = script.segments.filter(s => s.screenshot.mode === 'auto').length;
    const noneCount = script.segments.filter(s => s.screenshot.mode === 'none').length;

    logger.info(`Segments: ${staticCount} static, ${autoCount} auto, ${noneCount} none`);

    // Generate static images
    if (staticCount > 0) {
      const imageGen = createImageGenerator();
      await imageGen.generateAllImages(script.segments, paths.screenshots);
    }

    // Capture auto screenshots
    if (autoCount > 0) {
      const screenshotMgr = createScreenshotManager();
      await screenshotMgr.captureAllScreenshots(script.segments, paths.screenshots);
    }

    logger.success(`\nScreenshots and images generated successfully!`);
    logger.info(`Files saved to: ${paths.screenshots}`);
    logger.info(`\nNext step:`);
    logger.info(`  npm run tutorial:build ${tutorialName}`);
  } catch (error) {
    logger.error('Failed to capture screenshots', error);
    throw error;
  }
}
