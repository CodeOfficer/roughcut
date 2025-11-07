/**
 * Speech generation for reveal.js presentations
 * Generates audio per slide using ElevenLabs API
 */

import { mkdir } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';
import { ElevenLabsClient } from './elevenlabs.js';
import { getAudioDuration } from '../utils/timing.js';
import { logger } from '../core/logger.js';
import type {
  RevealPresentation,
  RevealSlide,
  AudioGenerationResult,
} from '../core/revealjs-types.js';

/**
 * Generate audio narration for reveal.js presentations
 */
export class RevealSpeechGenerator {
  private elevenlabsClient: ElevenLabsClient;

  constructor(elevenlabsClient?: ElevenLabsClient) {
    this.elevenlabsClient = elevenlabsClient || new ElevenLabsClient();
  }

  /**
   * Generate audio for all slides in a presentation
   * Returns map of slideId to audio generation result
   */
  async generateAllSlideAudio(
    presentation: RevealPresentation,
    outputDir: string
  ): Promise<Map<string, AudioGenerationResult>> {
    // Create output directory if it doesn't exist
    await mkdir(outputDir, { recursive: true });

    const results = new Map<string, AudioGenerationResult>();

    // Process each slide
    for (const slide of presentation.slides) {
      // Skip slides without audio
      if (!slide.audio) {
        logger.debug(`Skipping slide ${slide.id} - no audio block`);
        continue;
      }

      const outputPath = join(outputDir, `${slide.id}.mp3`);

      try {
        const result = await this.generateSlideAudio(
          slide,
          outputPath,
          presentation.voice
        );

        results.set(slide.id, result);

        logger.info(
          `Generated audio for ${slide.id}: ${result.durationSeconds.toFixed(2)}s (${result.sizeBytes} bytes)`
        );
      } catch (error) {
        logger.error(`Failed to generate audio for ${slide.id}`, error);
        throw error;
      }
    }

    logger.info(`Generated audio for ${results.size} slides`);

    return results;
  }

  /**
   * Generate audio for a single slide
   */
  async generateSlideAudio(
    slide: RevealSlide,
    outputPath: string,
    voiceId: string
  ): Promise<AudioGenerationResult> {
    if (!slide.audio) {
      throw new Error(`Slide ${slide.id} has no audio block`);
    }

    // Use clean text (pause markers already removed by parser)
    const text = slide.audio.cleanText;

    if (text.trim().length === 0) {
      throw new Error(`Slide ${slide.id} has empty audio text`);
    }

    logger.debug(`Generating audio for slide ${slide.id} with voice ${voiceId}`);
    logger.debug(`Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Generate speech using ElevenLabs
    await this.elevenlabsClient.generateSpeech(text, voiceId, outputPath);

    // Get actual duration from generated file
    const durationSeconds = await getAudioDuration(outputPath);

    // Get file size
    const stats = await stat(outputPath);
    const sizeBytes = stats.size;

    // Update slide's audio block with actual duration and path
    slide.audio.actualDuration = durationSeconds;
    slide.audio.audioPath = outputPath;

    return {
      slideId: slide.id,
      filePath: outputPath,
      durationSeconds,
      sizeBytes,
    };
  }

  /**
   * Validate that all slides with audio have been generated
   */
  validateAudioGeneration(
    presentation: RevealPresentation,
    results: Map<string, AudioGenerationResult>
  ): void {
    const slidesWithAudio = presentation.slides.filter((s) => s.audio !== null);
    const missingAudio = slidesWithAudio.filter((s) => !results.has(s.id));

    if (missingAudio.length > 0) {
      const ids = missingAudio.map((s) => s.id).join(', ');
      throw new Error(`Missing audio for slides: ${ids}`);
    }

    logger.info(`✓ Validated audio for ${slidesWithAudio.length} slides`);
  }
}

/**
 * Factory function to create a speech generator
 */
export function createRevealSpeechGenerator(
  elevenlabsClient?: ElevenLabsClient
): RevealSpeechGenerator {
  return new RevealSpeechGenerator(elevenlabsClient);
}
