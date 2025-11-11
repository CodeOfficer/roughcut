/**
 * Speech generation for reveal.js presentations
 * Generates audio per slide using ElevenLabs API with intelligent caching
 */

import { mkdir } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';
import { existsSync } from 'fs';
import { ElevenLabsClient } from './elevenlabs.js';
import { getAudioDuration } from '../utils/timing.js';
import { logger } from '../core/logger.js';
import { env } from '../config/env.js';
import {
  loadCacheManifest,
  saveCacheManifest,
  hashAudioText,
  findCachedAudio,
  updateCacheEntry,
} from './audio-cache.js';
import type {
  RevealPresentation,
  RevealSlide,
  AudioGenerationResult,
} from '../core/types.js';

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
   * Uses intelligent caching to only regenerate changed audio
   * Returns map of slideId to audio generation result
   */
  async generateAllSlideAudio(
    presentation: RevealPresentation,
    outputDir: string
  ): Promise<Map<string, AudioGenerationResult>> {
    // Create output directory if it doesn't exist
    await mkdir(outputDir, { recursive: true });

    // Load cache manifest
    const manifest = await loadCacheManifest(outputDir);
    let cacheHits = 0;
    let cacheMisses = 0;

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
        // Compute hash of audio content
        const audioHash = hashAudioText(slide.audio.cleanText);

        // Check cache
        const cached = findCachedAudio(manifest, slide.id, audioHash);

        if (cached && existsSync(join(outputDir, cached.file))) {
          // Cache hit! Reuse existing audio
          cacheHits++;
          const cachedPath = join(outputDir, cached.file);

          // Get file size
          const stats = await stat(cachedPath);

          results.set(slide.id, {
            slideId: slide.id,
            filePath: cachedPath,
            durationSeconds: cached.duration,
            sizeBytes: stats.size,
          });

          // Update slide's audio block
          slide.audio.actualDuration = cached.duration;
          slide.audio.audioPath = cachedPath;

          logger.info(`[CACHE] Reusing audio for ${slide.id} (${cached.duration.toFixed(2)}s)`);
          continue;
        }

        // Cache miss - generate new audio
        cacheMisses++;

        // Use voice from presentation or fall back to environment variable
        const voiceId = presentation.voice || env.ELEVENLABS_VOICE_ID;

        const result = await this.generateSlideAudio(
          slide,
          outputPath,
          voiceId
        );

        results.set(slide.id, result);

        // Update cache manifest
        updateCacheEntry(manifest, slide.id, {
          hash: audioHash,
          text: slide.audio.cleanText,
          file: `${slide.id}.mp3`,
          duration: result.durationSeconds,
        });

        logger.info(
          `[TTS] Generated audio for ${slide.id}: ${result.durationSeconds.toFixed(2)}s (${result.sizeBytes} bytes)`
        );
      } catch (error) {
        logger.error(`Failed to generate audio for ${slide.id}`, error);
        throw error;
      }
    }

    // Save updated manifest
    await saveCacheManifest(outputDir, manifest);

    logger.info(
      `Audio generation complete: ${results.size} slides (${cacheHits} cached, ${cacheMisses} generated)`
    );

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

    // Generate speech using ElevenLabs (with timestamps)
    const { alignment, durationSeconds: apiDuration } = await this.elevenlabsClient.generateSpeech(
      text,
      voiceId,
      outputPath
    );

    // Use API duration if available, otherwise fallback to analyzing the file
    const durationSeconds = apiDuration || await getAudioDuration(outputPath);

    // Get file size
    const stats = await stat(outputPath);
    const sizeBytes = stats.size;

    // TODO: Store alignment data in manifest for future features (word highlighting, subtitles)
    if (alignment) {
      logger.debug(`Received ${alignment.characters.length} character timestamps for ${slide.id}`);
    }

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
