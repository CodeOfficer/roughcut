/**
 * Tests for reveal.js type definitions
 * These tests verify the type contracts compile correctly
 */

import {
  RevealPresentation,
  RevealSlide,
  AudioBlock,
  PlaywrightBlock,
  SlideMetadata,
  RevealTimeline,
  SlideTimelineEntry,
  hasAudio,
  hasPlaywright,
  hasSpeakerNotes,
  DEFAULT_SLIDE_METADATA,
  DEFAULT_REVEAL_CONFIG,
} from '../types';

describe('RevealJS Type Definitions', () => {
  describe('Contract: RevealPresentation', () => {
    it('should accept valid presentation structure', () => {
      const presentation: RevealPresentation = {
        title: 'Test Presentation',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
        totalDuration: 0,
      };

      expect(presentation.title).toBe('Test Presentation');
      expect(presentation.slides).toHaveLength(0);
    });
  });

  describe('Contract: RevealSlide', () => {
    it('should accept slide with all properties', () => {
      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Hello World',
        audio: null,
        playwright: null,
        notes: null,
        metadata: {
          duration: 5,
          pauseAfter: 2,
          fragments: [],
        },
      };

      expect(slide.id).toBe('slide-001');
      expect(slide.audio).toBeNull();
    });

    it('should accept slide with audio block', () => {
      const audioBlock: AudioBlock = {
        rawText: 'Hello [2s] world',
        cleanText: 'Hello world',
        expectedDuration: 5,
        actualDuration: 4.8,
        audioPath: '/audio/slide-001.mp3',
        pauses: [
          {
            position: 6,
            durationSeconds: 2,
          },
        ],
      };

      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: audioBlock,
        playwright: null,
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      expect(slide.audio?.cleanText).toBe('Hello world');
      expect(slide.audio?.pauses).toHaveLength(1);
    });

    it('should accept slide with playwright block', () => {
      const playwrightBlock: PlaywrightBlock = {
        instructions: [
          {
            type: 'action',
            content: 'Click button',
          },
          {
            type: 'wait',
            content: '2s',
          },
        ],
      };

      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: null,
        playwright: playwrightBlock,
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      expect(slide.playwright?.instructions).toHaveLength(2);
      expect(slide.playwright?.instructions[0].type).toBe('action');
    });
  });

  describe('Contract: SlideMetadata', () => {
    it('should use default values', () => {
      const metadata = DEFAULT_SLIDE_METADATA;

      expect(metadata.pauseAfter).toBe(1);
      expect(metadata.fragments).toEqual([]);
    });

    it('should accept custom values', () => {
      const metadata: SlideMetadata = {
        duration: 10,
        pauseAfter: 3,
        transition: 'zoom',
        background: '#ff0000',
        fragments: [
          {
            index: 0,
            effect: 'fade',
            content: 'First point',
            timingOffset: 0,
          },
          {
            index: 1,
            effect: 'fade',
            content: 'Second point',
            timingOffset: 2,
          },
        ],
        autoAnimate: true,
      };

      expect(metadata.transition).toBe('zoom');
      expect(metadata.fragments).toHaveLength(2);
    });
  });

  describe('Contract: RevealTimeline', () => {
    it('should build timeline with cumulative timing', () => {
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
            metadata: DEFAULT_SLIDE_METADATA,
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
            metadata: DEFAULT_SLIDE_METADATA,
          },
        ],
        totalDuration: 16,
      };

      expect(timeline.slides).toHaveLength(2);
      expect(timeline.slides[0].startTime).toBe(0);
      expect(timeline.slides[0].endTime).toBe(7);
      expect(timeline.slides[1].startTime).toBe(7);
      expect(timeline.slides[1].endTime).toBe(16);
      expect(timeline.totalDuration).toBe(16);
    });
  });

  describe('Type Guards', () => {
    it('hasAudio should narrow type correctly', () => {
      const slideWithAudio: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: {
          rawText: 'Hello',
          cleanText: 'Hello',
          expectedDuration: null,
          pauses: [],
        },
        playwright: null,
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      const slideWithoutAudio: RevealSlide = {
        id: 'slide-002',
        index: 1,
        content: '# Test',
        audio: null,
        playwright: null,
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      expect(hasAudio(slideWithAudio)).toBe(true);
      expect(hasAudio(slideWithoutAudio)).toBe(false);

      if (hasAudio(slideWithAudio)) {
        // Type should be narrowed, audio is not null
        expect(slideWithAudio.audio.cleanText).toBe('Hello');
      }
    });

    it('hasPlaywright should narrow type correctly', () => {
      const slideWithPlaywright: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: null,
        playwright: {
          instructions: [],
        },
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      const slideWithoutPlaywright: RevealSlide = {
        id: 'slide-002',
        index: 1,
        content: '# Test',
        audio: null,
        playwright: null,
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      expect(hasPlaywright(slideWithPlaywright)).toBe(true);
      expect(hasPlaywright(slideWithoutPlaywright)).toBe(false);

      if (hasPlaywright(slideWithPlaywright)) {
        expect(Array.isArray(slideWithPlaywright.playwright.instructions)).toBe(true);
      }
    });

    it('hasSpeakerNotes should narrow type correctly', () => {
      const slideWithNotes: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: null,
        playwright: null,
        notes: 'Speaker notes here',
        metadata: DEFAULT_SLIDE_METADATA,
      };

      const slideWithoutNotes: RevealSlide = {
        id: 'slide-002',
        index: 1,
        content: '# Test',
        audio: null,
        playwright: null,
        notes: null,
        metadata: DEFAULT_SLIDE_METADATA,
      };

      expect(hasSpeakerNotes(slideWithNotes)).toBe(true);
      expect(hasSpeakerNotes(slideWithoutNotes)).toBe(false);

      if (hasSpeakerNotes(slideWithNotes)) {
        expect(slideWithNotes.notes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Constants', () => {
    it('DEFAULT_REVEAL_CONFIG should have correct values', () => {
      const config = DEFAULT_REVEAL_CONFIG;

      expect(config.autoSlide).toBe(0); // Playwright controls
      expect(config.hash).toBe(true);
      expect(config.fragments).toBe(true);
      expect(config.autoPlayMedia).toBe(false);
      expect(config.plugins).toContain('RevealMarkdown');
    });
  });
});
