import { logger } from '../../core/logger.js';
import { parseTutorialScript } from '../../core/parser.js';
import { createSpeechGenerator } from '../../narration/speech.js';
import { getTutorialPaths } from '../../utils/paths.js';
import { exists } from '../../utils/fs.js';

/**
 * Generate narration audio for a tutorial
 */
export async function narrateTutorial(tutorialName: string): Promise<void> {
  logger.section(`Generating Narration: ${tutorialName}`);

  const paths = getTutorialPaths(tutorialName);

  try {
    // Verify tutorial exists
    if (!(await exists(paths.script))) {
      throw new Error(`Tutorial script not found: ${paths.script}`);
    }

    // Parse tutorial script
    logger.step('Parsing tutorial script');
    const script = await parseTutorialScript(paths.script);
    logger.info(`Parsed ${script.segments.length} segments`);

    // Generate speech for all segments
    const generator = createSpeechGenerator();
    const results = await generator.generateAllAudio(script.segments, paths.audio);

    logger.success(`\nNarration generated successfully!`);
    logger.info(`Audio files saved to: ${paths.audio}`);
    logger.info(`\nNext step:`);
    logger.info(`  npm run tutorial:screenshots ${tutorialName}`);
  } catch (error) {
    logger.error('Failed to generate narration', error);
    throw error;
  }
}
