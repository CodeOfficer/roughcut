/**
 * Tests for RevealTimelineBuilder
 * Validates timeline construction and timing calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RevealTimelineBuilder } from '../timeline.js';
import type {
  RevealPresentation,
  AudioGenerationResult,
  RevealTimeline,
} from '../../core/types.js';

describe('RevealTimelineBuilder', () => {
  let builder: RevealTimelineBuilder;

  beforeEach(() => {
    builder = new RevealTimelineBuilder();
  });

  // ==========================================================================
  // BASIC TIMELINE BUILDING
  // ==========================================================================

  describe('build', () => {
    it('should build timeline with cumulative timing', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: {
              rawText: 'First',
              cleanText: 'First',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# Slide 2',
            audio: {
              rawText: 'Second',
              cleanText: 'Second',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const audioResults = new Map<string, AudioGenerationResult>([
        [
          'slide-001',
          {
            slideId: 'slide-001',
            filePath: '/audio/slide-001.mp3',
            durationSeconds: 5,
            sizeBytes: 100000,
          },
        ],
        [
          'slide-002',
          {
            slideId: 'slide-002',
            filePath: '/audio/slide-002.mp3',
            durationSeconds: 8,
            sizeBytes: 150000,
          },
        ],
      ]);

      const timeline = builder.build(presentation, audioResults);

      // Verify slide count
      expect(timeline.slides).toHaveLength(2);

      // Verify first slide timing
      expect(timeline.slides[0].slideId).toBe('slide-001');
      expect(timeline.slides[0].audioDuration).toBe(5);
      expect(timeline.slides[0].pauseAfter).toBe(2);
      expect(timeline.slides[0].totalSlideDuration).toBe(7); // 5 + 2
      expect(timeline.slides[0].startTime).toBe(0);
      expect(timeline.slides[0].endTime).toBe(7);

      // Verify second slide timing
      expect(timeline.slides[1].slideId).toBe('slide-002');
      expect(timeline.slides[1].audioDuration).toBe(8);
      expect(timeline.slides[1].pauseAfter).toBe(1);
      expect(timeline.slides[1].totalSlideDuration).toBe(9); // 8 + 1
      expect(timeline.slides[1].startTime).toBe(7);
      expect(timeline.slides[1].endTime).toBe(16); // 7 + 9

      // Verify total duration
      expect(timeline.totalDuration).toBe(16);
    });

    it('should handle slides without audio using metadata duration', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null, // No audio
            playwright: null,
            notes: null,
            metadata: { duration: 5, pauseAfter: 2, fragments: [] },
          },
        ],
      };

      const audioResults = new Map<string, AudioGenerationResult>();

      const timeline = builder.build(presentation, audioResults);

      // Should use metadata duration
      expect(timeline.slides[0].audioDuration).toBe(5);
      expect(timeline.slides[0].audioPath).toBeNull();
      expect(timeline.slides[0].totalSlideDuration).toBe(7); // 5 + 2
    });

    it('should handle slides without audio and no metadata duration', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
        ],
      };

      const audioResults = new Map<string, AudioGenerationResult>();

      const timeline = builder.build(presentation, audioResults);

      // Should have zero audio duration, only pause
      expect(timeline.slides[0].audioDuration).toBe(0);
      expect(timeline.slides[0].totalSlideDuration).toBe(2); // 0 + 2 (pause only)
      expect(timeline.totalDuration).toBe(2);
    });

    it('should include playwright instruction info', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: {
              instructions: [
                { type: 'action', content: 'Click button' },
                { type: 'wait', content: '2s' },
              ],
            },
            notes: null,
            metadata: { duration: 5, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const audioResults = new Map<string, AudioGenerationResult>();

      const timeline = builder.build(presentation, audioResults);

      expect(timeline.slides[0].hasPlaywright).toBe(true);
      expect(timeline.slides[0].playwrightInstructions).toHaveLength(2);
    });
  });

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  describe('validateTimeline', () => {
    it('should pass validation for correct timeline', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 0,
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 7,
            startTime: 0,
            endTime: 7,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
          {
            slideId: 'slide-002',
            slideIndex: 1,
            audioPath: '/audio/slide-002.mp3',
            audioDuration: 8,
            pauseAfter: 1,
            totalSlideDuration: 9,
            startTime: 7,
            endTime: 16,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
        totalDuration: 16,
      };

      expect(() => builder.validateTimeline(timeline)).not.toThrow();
    });

    it('should throw error for empty timeline', () => {
      const timeline: RevealTimeline = {
        slides: [],
        totalDuration: 0,
      };

      expect(() => builder.validateTimeline(timeline)).toThrow('has no slides');
    });

    it('should throw error for incorrect slide index', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 5, // Wrong index
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 7,
            startTime: 0,
            endTime: 7,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
        ],
        totalDuration: 7,
      };

      expect(() => builder.validateTimeline(timeline)).toThrow('incorrect slide index');
    });

    it('should throw error for timing gap between slides', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 0,
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 7,
            startTime: 0,
            endTime: 7,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
          {
            slideId: 'slide-002',
            slideIndex: 1,
            audioPath: '/audio/slide-002.mp3',
            audioDuration: 8,
            pauseAfter: 1,
            totalSlideDuration: 9,
            startTime: 10, // Gap! Should be 7
            endTime: 19,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
        totalDuration: 19,
      };

      expect(() => builder.validateTimeline(timeline)).toThrow('Timeline gap');
    });

    it('should throw error for incorrect totalSlideDuration', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 0,
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 10, // Wrong! Should be 7
            startTime: 0,
            endTime: 10,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
        ],
        totalDuration: 10,
      };

      expect(() => builder.validateTimeline(timeline)).toThrow(
        'incorrect totalSlideDuration'
      );
    });
  });

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  describe('getSlideEntry', () => {
    it('should find slide by id', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 0,
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 7,
            startTime: 0,
            endTime: 7,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
        ],
        totalDuration: 7,
      };

      const entry = builder.getSlideEntry(timeline, 'slide-001');

      expect(entry).not.toBeNull();
      expect(entry?.slideId).toBe('slide-001');
    });

    it('should return null for non-existent slide', () => {
      const timeline: RevealTimeline = {
        slides: [],
        totalDuration: 0,
      };

      const entry = builder.getSlideEntry(timeline, 'slide-999');

      expect(entry).toBeNull();
    });
  });

  describe('getSlidesWithAudio', () => {
    it('should filter slides with audio', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 0,
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 7,
            startTime: 0,
            endTime: 7,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
          {
            slideId: 'slide-002',
            slideIndex: 1,
            audioPath: null,
            audioDuration: 0,
            pauseAfter: 2,
            totalSlideDuration: 2,
            startTime: 7,
            endTime: 9,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
        ],
        totalDuration: 9,
      };

      const withAudio = builder.getSlidesWithAudio(timeline);

      expect(withAudio).toHaveLength(1);
      expect(withAudio[0].slideId).toBe('slide-001');
    });
  });

  describe('getTimingSummary', () => {
    it('should calculate timing summary', () => {
      const timeline: RevealTimeline = {
        slides: [
          {
            slideId: 'slide-001',
            slideIndex: 0,
            audioPath: '/audio/slide-001.mp3',
            audioDuration: 5,
            pauseAfter: 2,
            totalSlideDuration: 7,
            startTime: 0,
            endTime: 7,
            hasPlaywright: false,
            playwrightInstructions: [],
            metadata: { duration: null, pauseAfter: 2, fragments: [] },
          },
          {
            slideId: 'slide-002',
            slideIndex: 1,
            audioPath: '/audio/slide-002.mp3',
            audioDuration: 8,
            pauseAfter: 1,
            totalSlideDuration: 9,
            startTime: 7,
            endTime: 16,
            hasPlaywright: true,
            playwrightInstructions: [{ type: 'action', content: 'Click' }],
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
        totalDuration: 16,
      };

      const summary = builder.getTimingSummary(timeline);

      expect(summary.totalSlides).toBe(2);
      expect(summary.slidesWithAudio).toBe(2);
      expect(summary.slidesWithPlaywright).toBe(1);
      expect(summary.totalDuration).toBe(16);
      expect(summary.averageSlideDuration).toBe(8); // 16 / 2
      expect(summary.audioOnlyDuration).toBe(13); // 5 + 8
      expect(summary.pauseDuration).toBe(3); // 2 + 1
    });
  });
});
