import { join } from 'path';
import { exists } from '../utils/fs.js';
import { logger } from '../core/logger.js';
import type { TutorialSegment } from '../core/types.js';
import type { VideoTimeline, TimelineEntry } from './types.js';

/**
 * Create video timeline from tutorial segments and generated assets
 */
export class TimelineBuilder {
  /**
   * Build timeline from segments and asset directories
   */
  async build(
    segments: TutorialSegment[],
    audioDir: string,
    imageDir: string,
    audioDurations: Map<string, number>
  ): Promise<VideoTimeline> {
    logger.debug('Building video timeline');

    const entries: TimelineEntry[] = [];
    let currentTime = 0;

    for (const segment of segments) {
      const audioPath = join(audioDir, `${segment.id}.mp3`);
      const imagePath = join(imageDir, `${segment.id}.png`);

      // Verify assets exist
      const audioExists = await exists(audioPath);
      const imageExists = await exists(imagePath);

      if (!audioExists) {
        throw new Error(`Missing audio file for segment ${segment.id}: ${audioPath}`);
      }

      if (segment.screenshot.mode !== 'none' && !imageExists) {
        throw new Error(`Missing image file for segment ${segment.id}: ${imagePath}`);
      }

      // Get actual audio duration
      const duration = audioDurations.get(segment.id) || segment.duration;

      entries.push({
        segmentId: segment.id,
        audioPath,
        imagePath: imageExists ? imagePath : '',
        duration,
        startTime: currentTime,
      });

      currentTime += duration;
    }

    const timeline: VideoTimeline = {
      entries,
      totalDuration: currentTime,
    };

    logger.debug(
      `Timeline built: ${entries.length} segments, ${timeline.totalDuration.toFixed(2)}s total`
    );

    return timeline;
  }

  /**
   * Validate that all required assets exist for timeline
   */
  async validate(timeline: VideoTimeline): Promise<boolean> {
    for (const entry of timeline.entries) {
      const audioExists = await exists(entry.audioPath);
      if (!audioExists) {
        logger.error(`Missing audio: ${entry.audioPath}`);
        return false;
      }

      if (entry.imagePath) {
        const imageExists = await exists(entry.imagePath);
        if (!imageExists) {
          logger.error(`Missing image: ${entry.imagePath}`);
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Create a timeline builder instance
 */
export function createTimelineBuilder(): TimelineBuilder {
  return new TimelineBuilder();
}
