/**
 * Tests for RevealSpeechGenerator
 * Validates audio generation for reveal.js presentations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RevealSpeechGenerator } from '../revealjs-speech.js';
import type { RevealPresentation, RevealSlide } from '../../core/revealjs-types.js';

// Mock dependencies
vi.mock('../elevenlabs.js');
vi.mock('../../utils/timing.js');
vi.mock('fs/promises');

// Import mocked modules
import { ElevenLabsClient } from '../elevenlabs.js';
import { getAudioDuration } from '../../utils/timing.js';
import { mkdir, stat } from 'fs/promises';

describe('RevealSpeechGenerator', () => {
  let generator: RevealSpeechGenerator;
  let mockElevenLabsClient: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock ElevenLabsClient
    mockElevenLabsClient = {
      generateSpeech: vi.fn().mockResolvedValue(undefined),
    };

    generator = new RevealSpeechGenerator(mockElevenLabsClient);

    // Mock getAudioDuration to return predictable values
    vi.mocked(getAudioDuration).mockResolvedValue(5.5);

    // Mock stat to return file size
    vi.mocked(stat).mockResolvedValue({ size: 102400 } as any);

    // Mock mkdir
    vi.mocked(mkdir).mockResolvedValue(undefined);
  });

  // ==========================================================================
  // SINGLE SLIDE AUDIO GENERATION
  // ==========================================================================

  describe('generateSlideAudio', () => {
    it('should generate audio for slide with audio block', async () => {
      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: {
          rawText: 'Hello [2s] world',
          cleanText: 'Hello world',
          expectedDuration: null,
          pauses: [{ position: 5, durationSeconds: 2 }],
        },
        playwright: null,
        notes: null,
        metadata: {
          duration: null,
          pauseAfter: 1,
          fragments: [],
        },
      };

      const result = await generator.generateSlideAudio(
        slide,
        '/output/slide-001.mp3',
        'adam'
      );

      // Verify ElevenLabs was called with clean text
      expect(mockElevenLabsClient.generateSpeech).toHaveBeenCalledWith(
        'Hello world',
        'adam',
        '/output/slide-001.mp3'
      );

      // Verify result structure
      expect(result.slideId).toBe('slide-001');
      expect(result.filePath).toBe('/output/slide-001.mp3');
      expect(result.durationSeconds).toBe(5.5);
      expect(result.sizeBytes).toBe(102400);

      // Verify slide's audio block was updated
      expect(slide.audio?.actualDuration).toBe(5.5);
      expect(slide.audio?.audioPath).toBe('/output/slide-001.mp3');
    });

    it('should throw error if slide has no audio block', async () => {
      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: null,
        playwright: null,
        notes: null,
        metadata: {
          duration: null,
          pauseAfter: 1,
          fragments: [],
        },
      };

      await expect(
        generator.generateSlideAudio(slide, '/output/slide-001.mp3', 'adam')
      ).rejects.toThrow('has no audio block');
    });

    it('should throw error if audio text is empty', async () => {
      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: {
          rawText: '',
          cleanText: '',
          expectedDuration: null,
          pauses: [],
        },
        playwright: null,
        notes: null,
        metadata: {
          duration: null,
          pauseAfter: 1,
          fragments: [],
        },
      };

      await expect(
        generator.generateSlideAudio(slide, '/output/slide-001.mp3', 'adam')
      ).rejects.toThrow('empty audio text');
    });

    it('should use clean text without pause markers', async () => {
      const slide: RevealSlide = {
        id: 'slide-001',
        index: 0,
        content: '# Test',
        audio: {
          rawText: 'Part 1 [2s] Part 2 [3s] Part 3',
          cleanText: 'Part 1  Part 2  Part 3',
          expectedDuration: null,
          pauses: [
            { position: 6, durationSeconds: 2 },
            { position: 14, durationSeconds: 3 },
          ],
        },
        playwright: null,
        notes: null,
        metadata: {
          duration: null,
          pauseAfter: 1,
          fragments: [],
        },
      };

      await generator.generateSlideAudio(slide, '/output/slide-001.mp3', 'adam');

      // Should send clean text to ElevenLabs
      expect(mockElevenLabsClient.generateSpeech).toHaveBeenCalledWith(
        'Part 1  Part 2  Part 3',
        'adam',
        '/output/slide-001.mp3'
      );
    });
  });

  // ==========================================================================
  // BATCH AUDIO GENERATION
  // ==========================================================================

  describe('generateAllSlideAudio', () => {
    it('should generate audio for all slides with audio blocks', async () => {
      const presentation: RevealPresentation = {
        title: 'Test Presentation',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: {
              rawText: 'First slide',
              cleanText: 'First slide',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# Slide 2',
            audio: {
              rawText: 'Second slide',
              cleanText: 'Second slide',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const results = await generator.generateAllSlideAudio(
        presentation,
        '/output/audio'
      );

      // Verify mkdir was called
      expect(mkdir).toHaveBeenCalledWith('/output/audio', { recursive: true });

      // Verify both slides were processed
      expect(results.size).toBe(2);
      expect(results.has('slide-001')).toBe(true);
      expect(results.has('slide-002')).toBe(true);

      // Verify ElevenLabs was called twice
      expect(mockElevenLabsClient.generateSpeech).toHaveBeenCalledTimes(2);
    });

    it('should skip slides without audio blocks', async () => {
      const presentation: RevealPresentation = {
        title: 'Test Presentation',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: {
              rawText: 'First slide',
              cleanText: 'First slide',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# Slide 2',
            audio: null, // No audio
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const results = await generator.generateAllSlideAudio(
        presentation,
        '/output/audio'
      );

      // Only slide with audio should be in results
      expect(results.size).toBe(1);
      expect(results.has('slide-001')).toBe(true);
      expect(results.has('slide-002')).toBe(false);

      // ElevenLabs called once
      expect(mockElevenLabsClient.generateSpeech).toHaveBeenCalledTimes(1);
    });

    it('should handle empty presentation', async () => {
      const presentation: RevealPresentation = {
        title: 'Empty Presentation',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const results = await generator.generateAllSlideAudio(
        presentation,
        '/output/audio'
      );

      expect(results.size).toBe(0);
      expect(mockElevenLabsClient.generateSpeech).not.toHaveBeenCalled();
    });

    it('should use voice from presentation', async () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'bella', // Different voice
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test',
            audio: {
              rawText: 'Test',
              cleanText: 'Test',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      await generator.generateAllSlideAudio(presentation, '/output/audio');

      // Verify correct voice was used
      expect(mockElevenLabsClient.generateSpeech).toHaveBeenCalledWith(
        'Test',
        'bella',
        expect.any(String)
      );
    });
  });

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  describe('validateAudioGeneration', () => {
    it('should pass validation when all slides have audio', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test',
            audio: {
              rawText: 'Test',
              cleanText: 'Test',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const results = new Map([
        [
          'slide-001',
          {
            slideId: 'slide-001',
            filePath: '/output/slide-001.mp3',
            durationSeconds: 5,
            sizeBytes: 100000,
          },
        ],
      ]);

      expect(() => generator.validateAudioGeneration(presentation, results)).not.toThrow();
    });

    it('should throw error when audio is missing for slides', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test',
            audio: {
              rawText: 'Test',
              cleanText: 'Test',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const results = new Map(); // Empty results

      expect(() => generator.validateAudioGeneration(presentation, results)).toThrow(
        'Missing audio for slides: slide-001'
      );
    });

    it('should pass validation when some slides have no audio', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test',
            audio: {
              rawText: 'Test',
              cleanText: 'Test',
              expectedDuration: null,
              pauses: [],
            },
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# No audio',
            audio: null, // Slides without audio should be ignored
            playwright: null,
            notes: null,
            metadata: { duration: null, pauseAfter: 1, fragments: [] },
          },
        ],
      };

      const results = new Map([
        [
          'slide-001',
          {
            slideId: 'slide-001',
            filePath: '/output/slide-001.mp3',
            durationSeconds: 5,
            sizeBytes: 100000,
          },
        ],
      ]);

      // Should not throw - slide-002 has no audio so it's expected to not be in results
      expect(() => generator.validateAudioGeneration(presentation, results)).not.toThrow();
    });
  });
});
