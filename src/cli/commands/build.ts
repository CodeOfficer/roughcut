import { join } from 'path';
import { readFile } from 'fs/promises';
import { logger } from '../../core/logger.js';
import { parseTutorialScript } from '../../core/parser.js';
import { createTimelineBuilder } from '../../video/timeline.js';
import { createVideoAssembler } from '../../video/assembler.js';
import { getAudioDuration } from '../../utils/timing.js';
import { getTutorialPaths } from '../../utils/paths.js';
import { exists } from '../../utils/fs.js';
import type { VideoSettings } from '../../video/types.js';

/**
 * Build tutorial video from generated assets
 */
export async function buildTutorial(tutorialName: string): Promise<void> {
  logger.section(`Building Video: ${tutorialName}`);

  const paths = getTutorialPaths(tutorialName);

  try {
    // Verify tutorial exists
    if (!(await exists(paths.script))) {
      throw new Error(`Tutorial script not found: ${paths.script}`);
    }

    // Parse tutorial script
    logger.step('Parsing tutorial script');
    const script = await parseTutorialScript(paths.script);

    // Load config
    logger.step('Loading configuration');
    const configContent = await readFile(paths.config, 'utf-8');
    const config = JSON.parse(configContent);
    const videoSettings: VideoSettings = config.videoSettings || {
      resolution: '1920x1080',
      fps: 30,
      transition: 'fade',
      transitionDuration: 0.5,
    };

    // Get audio durations
    logger.step('Calculating audio durations');
    const audioDurations = new Map<string, number>();
    for (const segment of script.segments) {
      const audioPath = join(paths.audio, `${segment.id}.mp3`);
      if (await exists(audioPath)) {
        const duration = await getAudioDuration(audioPath);
        audioDurations.set(segment.id, duration);
      }
    }

    // Build timeline
    logger.step('Building video timeline');
    const timelineBuilder = createTimelineBuilder();
    const timeline = await timelineBuilder.build(
      script.segments,
      paths.audio,
      paths.screenshots,
      audioDurations
    );

    // Validate timeline
    const isValid = await timelineBuilder.validate(timeline);
    if (!isValid) {
      throw new Error('Timeline validation failed - missing assets');
    }

    logger.info(`Timeline: ${timeline.entries.length} segments, ${timeline.totalDuration.toFixed(2)}s total`);

    // Assemble video
    const outputPath = join(paths.output, 'tutorial.mp4');
    const assembler = createVideoAssembler();

    const result = await assembler.assemble({
      timeline,
      outputPath,
      settings: videoSettings,
    });

    logger.success(`\nVideo built successfully!`);
    logger.info(`Output: ${result.filePath}`);
  } catch (error) {
    logger.error('Failed to build video', error);
    throw error;
  }
}
