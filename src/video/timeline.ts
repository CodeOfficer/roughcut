/**
 * Timeline builder for reveal.js presentations
 * Maps slides to audio segments with cumulative timing
 */

import { logger } from '../core/logger.js';
import type {
  RevealPresentation,
  RevealTimeline,
  SlideTimelineEntry,
  AudioGenerationResult,
  FragmentTiming,
} from '../core/types.js';

/**
 * Build timeline for reveal.js presentation orchestration
 */
export class RevealTimelineBuilder {
  /**
   * Build timeline from presentation and audio generation results
   * Calculates cumulative timing for each slide
   */
  build(
    presentation: RevealPresentation,
    audioResults: Map<string, AudioGenerationResult>
  ): RevealTimeline {
    const entries: SlideTimelineEntry[] = [];
    let cumulativeTime = 0;

    for (const slide of presentation.slides) {
      const audioResult = audioResults.get(slide.id);

      // Determine audio duration
      let audioDuration = 0;
      let audioPath: string | null = null;

      if (audioResult) {
        audioDuration = audioResult.durationSeconds;
        audioPath = audioResult.filePath;
      } else if (slide.metadata.duration !== null) {
        // Use metadata duration if no audio was generated
        audioDuration = slide.metadata.duration;
      }

      // Get pause-after duration
      const pauseAfter = slide.metadata.pauseAfter;

      // Calculate total slide duration
      const totalSlideDuration = audioDuration + pauseAfter;

      // Calculate fragment timings
      const fragmentTimings = this.calculateFragmentTimings(
        slide.metadata.fragments,
        audioDuration
      );

      // Build timeline entry
      const entry: SlideTimelineEntry = {
        slideId: slide.id,
        slideIndex: slide.index,
        audioPath,
        audioDuration,
        pauseAfter,
        totalSlideDuration,
        startTime: cumulativeTime,
        endTime: cumulativeTime + totalSlideDuration,
        hasPlaywright: slide.playwright !== null,
        playwrightInstructions: slide.playwright?.instructions || [],
        metadata: slide.metadata,
        fragmentTimings,
      };

      entries.push(entry);

      // Update cumulative time
      cumulativeTime += totalSlideDuration;

      logger.debug(
        `Timeline entry for ${slide.id}: ${entry.startTime.toFixed(2)}s - ${entry.endTime.toFixed(2)}s (audio: ${audioDuration.toFixed(2)}s, pause: ${pauseAfter.toFixed(2)}s)`
      );
    }

    const totalDuration = cumulativeTime;

    logger.info(`Built timeline: ${entries.length} slides, ${totalDuration.toFixed(2)}s total`);

    return {
      slides: entries,
      totalDuration,
    };
  }

  /**
   * Calculate fragment reveal timings for a slide
   *
   * Strategy:
   * - If fragment has explicit timingOffset, use it (relative to slide start)
   * - Otherwise, space fragments evenly across audio duration
   *
   * Example with 3 fragments and 10s audio:
   * - Fragment 0: 2.5s (10 / 4 * 1)
   * - Fragment 1: 5.0s (10 / 4 * 2)
   * - Fragment 2: 7.5s (10 / 4 * 3)
   */
  private calculateFragmentTimings(
    fragments: Array<{ index: number; timingOffset?: number }>,
    audioDuration: number
  ): FragmentTiming[] {
    if (fragments.length === 0) {
      return [];
    }

    const timings: FragmentTiming[] = [];

    for (const fragment of fragments) {
      let timestamp: number;

      if (fragment.timingOffset !== undefined) {
        // Use explicit timing offset (relative to slide start)
        timestamp = fragment.timingOffset;
      } else {
        // Space evenly across audio duration
        // Divide duration into (fragments.length + 1) segments
        // Place each fragment at segment boundaries
        const segmentDuration = audioDuration / (fragments.length + 1);
        timestamp = segmentDuration * (fragment.index + 1);
      }

      timings.push({
        fragmentIndex: fragment.index,
        timestamp,
      });

      logger.debug(
        `Fragment ${fragment.index} timing: ${timestamp.toFixed(2)}s ` +
        `(${fragment.timingOffset !== undefined ? 'explicit' : 'auto-spaced'})`
      );
    }

    return timings;
  }

  /**
   * Validate timeline is correctly constructed
   */
  validateTimeline(timeline: RevealTimeline): void {
    if (timeline.slides.length === 0) {
      throw new Error('Timeline has no slides');
    }

    // Verify cumulative timing
    for (let i = 0; i < timeline.slides.length; i++) {
      const entry = timeline.slides[i];
      if (!entry) {
        throw new Error(`Timeline entry at index ${i} is undefined`);
      }

      // Verify slide index matches array position
      if (entry.slideIndex !== i) {
        throw new Error(`Timeline entry ${i} has incorrect slide index: ${entry.slideIndex}`);
      }

      // Verify timing consistency
      if (entry.endTime !== entry.startTime + entry.totalSlideDuration) {
        throw new Error(
          `Timeline entry ${entry.slideId} has inconsistent timing: ` +
            `startTime=${entry.startTime}, endTime=${entry.endTime}, ` +
            `totalDuration=${entry.totalSlideDuration}`
        );
      }

      // Verify totalSlideDuration calculation
      if (entry.totalSlideDuration !== entry.audioDuration + entry.pauseAfter) {
        throw new Error(
          `Timeline entry ${entry.slideId} has incorrect totalSlideDuration: ` +
            `expected ${entry.audioDuration + entry.pauseAfter}, ` +
            `got ${entry.totalSlideDuration}`
        );
      }

      // Verify next slide starts where this one ends
      if (i < timeline.slides.length - 1) {
        const nextEntry = timeline.slides[i + 1];
        if (!nextEntry) {
          throw new Error(`Timeline entry at index ${i + 1} is undefined`);
        }
        if (nextEntry.startTime !== entry.endTime) {
          throw new Error(
            `Timeline gap between ${entry.slideId} and ${nextEntry.slideId}: ` +
              `${entry.endTime} !== ${nextEntry.startTime}`
          );
        }
      }
    }

    // Verify total duration matches last slide end time
    const lastEntry = timeline.slides[timeline.slides.length - 1];
    if (!lastEntry) {
      throw new Error('Timeline has no last entry');
    }
    if (Math.abs(timeline.totalDuration - lastEntry.endTime) > 0.01) {
      throw new Error(
        `Timeline totalDuration mismatch: ` +
          `expected ${lastEntry.endTime}, got ${timeline.totalDuration}`
      );
    }

    logger.info('✓ Timeline validation passed');
  }

  /**
   * Get timeline entry for a specific slide
   */
  getSlideEntry(timeline: RevealTimeline, slideId: string): SlideTimelineEntry | null {
    return timeline.slides.find((entry) => entry.slideId === slideId) || null;
  }

  /**
   * Get timeline entries with audio
   */
  getSlidesWithAudio(timeline: RevealTimeline): SlideTimelineEntry[] {
    return timeline.slides.filter((entry) => entry.audioPath !== null);
  }

  /**
   * Get timeline entries with playwright instructions
   */
  getSlidesWithPlaywright(timeline: RevealTimeline): SlideTimelineEntry[] {
    return timeline.slides.filter((entry) => entry.hasPlaywright);
  }

  /**
   * Get presentation timing summary
   */
  getTimingSummary(timeline: RevealTimeline): {
    totalSlides: number;
    slidesWithAudio: number;
    slidesWithPlaywright: number;
    totalDuration: number;
    averageSlideDuration: number;
    audioOnlyDuration: number;
    pauseDuration: number;
  } {
    const totalSlides = timeline.slides.length;
    const slidesWithAudio = this.getSlidesWithAudio(timeline).length;
    const slidesWithPlaywright = this.getSlidesWithPlaywright(timeline).length;
    const totalDuration = timeline.totalDuration;

    const averageSlideDuration =
      totalSlides > 0 ? totalDuration / totalSlides : 0;

    const audioOnlyDuration = timeline.slides.reduce(
      (sum, entry) => sum + entry.audioDuration,
      0
    );

    const pauseDuration = timeline.slides.reduce(
      (sum, entry) => sum + entry.pauseAfter,
      0
    );

    return {
      totalSlides,
      slidesWithAudio,
      slidesWithPlaywright,
      totalDuration,
      averageSlideDuration,
      audioOnlyDuration,
      pauseDuration,
    };
  }
}

/**
 * Factory function to create timeline builder
 */
export function createRevealTimelineBuilder(): RevealTimelineBuilder {
  return new RevealTimelineBuilder();
}
