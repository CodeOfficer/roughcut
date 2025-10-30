import { join } from 'path';
import { ElevenLabsClient } from './elevenlabs.js';
import { env } from '../config/env.js';
import { logger } from '../core/logger.js';
import { getAudioDuration } from '../utils/timing.js';
import { ensureDir, getFileSize } from '../utils/fs.js';
import type { TutorialSegment } from '../core/types.js';
import type { SpeechGenerationOptions, SpeechGenerationResult } from './types.js';

/**
 * Speech generation service for tutorial narration
 */
export class SpeechGenerator {
  private client: ElevenLabsClient;
  private voiceId: string;

  constructor(voiceId?: string) {
    this.client = new ElevenLabsClient();
    this.voiceId = voiceId || env.ELEVENLABS_VOICE_ID;
  }

  /**
   * Generate narration audio for a single segment
   */
  async generateSegmentAudio(
    segment: TutorialSegment,
    outputDir: string
  ): Promise<SpeechGenerationResult> {
    const outputPath = join(outputDir, `${segment.id}.mp3`);

    logger.step(`Generating audio for ${segment.id}: "${segment.title}"`);

    try {
      // Ensure output directory exists
      await ensureDir(outputDir);

      // Generate speech
      await this.client.generateSpeech(
        segment.narration,
        this.voiceId,
        outputPath
      );

      // Get audio metadata
      const durationSeconds = await getAudioDuration(outputPath);
      const sizeBytes = await getFileSize(outputPath);

      logger.success(
        `Generated ${segment.id}.mp3 (${durationSeconds.toFixed(2)}s, ${Math.round(sizeBytes / 1024)}KB)`
      );

      return {
        filePath: outputPath,
        durationSeconds,
        sizeBytes,
      };
    } catch (error) {
      logger.error(`Failed to generate audio for ${segment.id}`, error);
      throw error;
    }
  }

  /**
   * Generate narration audio for all segments in a tutorial
   */
  async generateAllAudio(
    segments: TutorialSegment[],
    outputDir: string
  ): Promise<Map<string, SpeechGenerationResult>> {
    logger.section(`Generating Narration Audio (${segments.length} segments)`);

    const results = new Map<string, SpeechGenerationResult>();

    for (const segment of segments) {
      const result = await this.generateSegmentAudio(segment, outputDir);
      results.set(segment.id, result);
    }

    // Calculate totals
    const totalDuration = Array.from(results.values())
      .reduce((sum, r) => sum + r.durationSeconds, 0);
    const totalSize = Array.from(results.values())
      .reduce((sum, r) => sum + r.sizeBytes, 0);

    logger.success(
      `Generated ${results.size} audio files (${totalDuration.toFixed(2)}s total, ${Math.round(totalSize / 1024)}KB)`
    );

    return results;
  }

  /**
   * Generate audio from custom options
   */
  async generate(options: SpeechGenerationOptions): Promise<SpeechGenerationResult> {
    await this.client.generateSpeech(
      options.text,
      options.voiceId,
      options.outputPath,
      {
        model: options.model,
        stability: options.stability,
        similarityBoost: options.similarityBoost,
      }
    );

    const durationSeconds = await getAudioDuration(options.outputPath);
    const sizeBytes = await getFileSize(options.outputPath);

    return {
      filePath: options.outputPath,
      durationSeconds,
      sizeBytes,
    };
  }
}

/**
 * Create a speech generator instance
 */
export function createSpeechGenerator(voiceId?: string): SpeechGenerator {
  return new SpeechGenerator(voiceId);
}
