import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { env } from '../config/env.js';
import { logger } from '../core/logger.js';
import { ensureParentDir, getFileSize } from '../utils/fs.js';
import { getAudioDuration } from '../utils/timing.js';
import type { VideoTimeline, VideoSettings, VideoAssemblyOptions, VideoAssemblyResult } from './types.js';

const execAsync = promisify(exec);

/**
 * Video assembler using FFmpeg
 */
export class VideoAssembler {
  private ffmpegPath: string;

  constructor(ffmpegPath?: string) {
    this.ffmpegPath = ffmpegPath || env.FFMPEG_PATH;
  }

  /**
   * Assemble video from timeline and settings
   */
  async assemble(options: VideoAssemblyOptions): Promise<VideoAssemblyResult> {
    logger.section('Assembling Video');

    const { timeline, outputPath, settings } = options;

    // Ensure output directory exists
    await ensureParentDir(outputPath);

    // Create FFmpeg command
    const command = await this.buildFFmpegCommand(timeline, outputPath, settings);

    // Save command to file for debugging
    const commandFile = outputPath.replace('.mp4', '.ffmpeg.txt');
    await writeFile(commandFile, command);
    logger.debug(`FFmpeg command saved to ${commandFile}`);

    try {
      logger.step('Running FFmpeg...');

      // Execute FFmpeg
      const { stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      if (stderr) {
        logger.debug('FFmpeg stderr:', stderr);
      }

      // Get output file metadata
      const durationSeconds = await getAudioDuration(outputPath);
      const sizeBytes = await getFileSize(outputPath);

      const result: VideoAssemblyResult = {
        filePath: outputPath,
        durationSeconds,
        sizeBytes,
        resolution: settings.resolution,
      };

      logger.success(
        `Video assembled: ${outputPath}\n` +
        `  Duration: ${durationSeconds.toFixed(2)}s\n` +
        `  Size: ${Math.round(sizeBytes / (1024 * 1024))}MB\n` +
        `  Resolution: ${settings.resolution}`
      );

      return result;
    } catch (error) {
      logger.error('FFmpeg failed', error);
      throw error;
    }
  }

  /**
   * Build FFmpeg command for video assembly
   *
   * This creates a video by:
   * 1. Using images as video frames (looped for audio duration)
   * 2. Combining with audio tracks
   * 3. Concatenating all segments
   */
  private async buildFFmpegCommand(
    timeline: VideoTimeline,
    outputPath: string,
    settings: VideoSettings
  ): Promise<string> {
    // Build FFmpeg command
    // For simplicity, we'll use a basic approach:
    // Create individual segment videos, then concat them

    const inputFiles = timeline.entries
      .map((_entry) => `-loop 1 -t ${_entry.duration} -i "${_entry.imagePath}" -i "${_entry.audioPath}"`)
      .join(' ');

    const filterComplex = this.buildFilterComplex(timeline, settings);

    const command = `"${this.ffmpegPath}" ${inputFiles} \
      -filter_complex "${filterComplex}" \
      -c:v libx264 -preset medium -crf 23 \
      -c:a aac -b:a 192k \
      -r ${settings.fps} \
      -s ${settings.resolution} \
      -y "${outputPath}"`;

    return command.replace(/\s+/g, ' ').trim();
  }

  /**
   * Build filter complex for FFmpeg
   */
  private buildFilterComplex(timeline: VideoTimeline, settings: VideoSettings): string {
    const filters: string[] = [];

    // Scale and format each video input
    timeline.entries.forEach((_entry, i) => {
      const videoIdx = i * 2;
      filters.push(`[${videoIdx}:v]scale=${settings.resolution},setsar=1,fps=${settings.fps}[v${i}]`);
    });

    // Concatenate videos
    const videoInputs = timeline.entries.map((_, i) => `[v${i}]`).join('');
    const audioInputs = timeline.entries.map((_, i) => `[${i * 2 + 1}:a]`).join('');

    filters.push(`${videoInputs}concat=n=${timeline.entries.length}:v=1:a=0[outv]`);
    filters.push(`${audioInputs}concat=n=${timeline.entries.length}:v=0:a=1[outa]`);

    return filters.join(';');
  }


  /**
   * Validate FFmpeg installation
   */
  async validateFFmpeg(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`"${this.ffmpegPath}" -version`);
      logger.debug(`FFmpeg version: ${stdout.split('\n')[0]}`);
      return true;
    } catch (error) {
      logger.error('FFmpeg not found or not working', error);
      return false;
    }
  }
}

/**
 * Create a video assembler instance
 */
export function createVideoAssembler(ffmpegPath?: string): VideoAssembler {
  return new VideoAssembler(ffmpegPath);
}
