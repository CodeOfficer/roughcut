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
import { config } from '../config/config-manager.js';
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
   * Returns map of slideId to audio generation result with cache statistics
   */
  async generateAllSlideAudio(
    presentation: RevealPresentation,
    outputDir: string
  ): Promise<{
    results: Map<string, AudioGenerationResult>;
    cacheHits: number;
    cacheMisses: number;
  }> {
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
        // Get voice parameters (same defaults as used during generation)
        const elevenLabsConfig = config.requireElevenLabs();
        const voiceId = presentation.voice || elevenLabsConfig.voiceId;
        const model = elevenLabsConfig.model;
        const stability = elevenLabsConfig.stability;
        const similarityBoost = elevenLabsConfig.similarityBoost;

        // Compute hash of audio content + voice parameters
        const audioHash = hashAudioText(
          slide.audio.cleanText,
          voiceId,
          model,
          stability,
          similarityBoost
        );

        // Check cache
        const cached = findCachedAudio(manifest, slide.id, audioHash);

        if (cached && existsSync(join(outputDir, cached.file))) {
          // Cache hit! Reuse existing audio with alignment data
          cacheHits++;
          const cachedPath = join(outputDir, cached.file);

          // Get file size
          const stats = await stat(cachedPath);

          const result: AudioGenerationResult = {
            slideId: slide.id,
            filePath: cachedPath,
            durationSeconds: cached.duration,
            sizeBytes: stats.size,
          };

          // Include alignment data if it exists in cache
          if (cached.alignment) {
            result.alignment = cached.alignment;
          }
          if (cached.normalizedAlignment) {
            result.normalizedAlignment = cached.normalizedAlignment;
          }

          results.set(slide.id, result);

          // Update slide's audio block
          slide.audio.actualDuration = cached.duration;
          slide.audio.audioPath = cachedPath;

          const alignmentInfo = cached.alignment ? ` with ${cached.alignment.characters.length} char timestamps` : '';
          logger.info(`[CACHE] Reusing audio for ${slide.id} (${cached.duration.toFixed(2)}s)${alignmentInfo}`);
          continue;
        }

        // Cache miss - generate new audio
        cacheMisses++;

        const result = await this.generateSlideAudio(
          slide,
          outputPath,
          voiceId
        );

        results.set(slide.id, result);

        // Update cache manifest with all data including alignment and voice parameters
        const cacheEntry: any = {
          hash: audioHash,
          text: slide.audio.cleanText,
          voiceId,
          model,
          stability,
          similarityBoost,
          file: `${slide.id}.mp3`,
          duration: result.durationSeconds,
        };

        // Only include alignment data if it exists
        if (result.alignment) {
          cacheEntry.alignment = result.alignment;
        }
        if (result.normalizedAlignment) {
          cacheEntry.normalizedAlignment = result.normalizedAlignment;
        }

        updateCacheEntry(manifest, slide.id, cacheEntry);

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

    return {
      results,
      cacheHits,
      cacheMisses,
    };
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
    const { alignment, normalizedAlignment, durationSeconds: apiDuration } = await this.elevenlabsClient.generateSpeech(
      text,
      voiceId,
      outputPath
    );

    // Use API duration if available, otherwise fallback to analyzing the file
    const durationSeconds = apiDuration || await getAudioDuration(outputPath);

    // Get file size
    const stats = await stat(outputPath);
    const sizeBytes = stats.size;

    // Log alignment data receipt
    if (alignment) {
      logger.debug(`Received ${alignment.characters.length} character timestamps for ${slide.id}`);
    }
    if (normalizedAlignment) {
      logger.debug(`Received normalized alignment (${normalizedAlignment.characters.length} chars) for ${slide.id}`);
    }

    // Update slide's audio block with actual duration and path
    slide.audio.actualDuration = durationSeconds;
    slide.audio.audioPath = outputPath;

    const result: AudioGenerationResult = {
      slideId: slide.id,
      filePath: outputPath,
      durationSeconds,
      sizeBytes,
    };

    // Only include alignment data if it exists
    if (alignment) {
      result.alignment = alignment;
    }
    if (normalizedAlignment) {
      result.normalizedAlignment = normalizedAlignment;
    }

    return result;
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
