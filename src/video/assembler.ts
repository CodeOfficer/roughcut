/**
 * Video assembler for reveal.js presentations
 *
 * Combines recorded video with generated audio using FFmpeg
 * Produces final MP4 video with ElevenLabs narration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import type { RevealTimeline } from '../core/types.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Video assembly configuration
 */
export interface VideoAssemblyConfig {
  /** Path to input video file (from Playwright) */
  inputVideoPath: string;

  /** Path to audio file to overlay */
  audioPath: string;

  /** Path to output video file */
  outputPath: string;

  /** Video codec (default: libx264) */
  videoCodec?: string;

  /** Audio codec (default: aac) */
  audioCodec?: string;

  /** Video quality preset (default: medium) */
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow' | 'veryslow';

  /** Constant Rate Factor for video quality (default: 23, lower = better) */
  crf?: number;

  /** Audio bitrate (default: 192k) */
  audioBitrate?: string;
}

/**
 * Video assembly result
 */
export interface VideoAssemblyResult {
  /** Path to assembled video file */
  outputPath: string;

  /** File size in bytes */
  sizeBytes: number;

  /** Whether assembly was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Duration in seconds */
  durationSeconds?: number;
}

/**
 * Assembly progress update
 */
export interface AssemblyProgress {
  /** Current phase */
  phase: 'preparing' | 'encoding' | 'finalizing' | 'complete';

  /** Progress percentage (0-100) */
  percentage: number;

  /** Current frame being processed */
  frame?: number;

  /** Encoding speed (e.g., "1.5x") */
  speed?: string;

  /** Estimated time remaining in seconds */
  timeRemaining?: number;
}

// ============================================================================
// ASSEMBLER CLASS
// ============================================================================

export class RevealVideoAssembler {
  private progressCallback?: (progress: AssemblyProgress) => void;

  /**
   * Register progress callback
   */
  onProgress(callback: (progress: AssemblyProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Assemble video by replacing audio track
   *
   * Uses FFmpeg to replace the video's audio with generated narration
   */
  async assemble(config: VideoAssemblyConfig): Promise<VideoAssemblyResult> {
    try {
      // Validate inputs
      await this.validateInputs(config);

      // Report preparing phase
      this.reportProgress({
        phase: 'preparing',
        percentage: 0,
      });

      // Ensure output directory exists
      const outputDir = path.dirname(config.outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Build FFmpeg command
      const command = this.buildFFmpegCommand(config);

      // Report encoding phase
      this.reportProgress({
        phase: 'encoding',
        percentage: 10,
      });

      // Execute FFmpeg
      await this.executeFFmpeg(command, config);

      // Report finalizing phase
      this.reportProgress({
        phase: 'finalizing',
        percentage: 95,
      });

      // Get output file stats
      const stats = await fs.stat(config.outputPath);

      // Report complete
      this.reportProgress({
        phase: 'complete',
        percentage: 100,
      });

      return {
        outputPath: config.outputPath,
        sizeBytes: stats.size,
        success: true,
      };
    } catch (error) {
      return {
        outputPath: config.outputPath,
        sizeBytes: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Assemble multiple videos with audio (one per slide)
   *
   * Creates individual video segments per slide, then concatenates them
   */
  async assembleFromTimeline(
    inputVideoPath: string,
    timeline: RevealTimeline,
    audioBaseDir: string,
    outputPath: string
  ): Promise<VideoAssemblyResult> {
    try {
      // For now, use simple audio replacement approach
      // Future enhancement: could split video by timeline and use per-slide audio

      // Find combined audio file or create it
      const audioPath = path.join(audioBaseDir, 'combined-audio.mp3');
      const audioExists = await fs
        .access(audioPath)
        .then(() => true)
        .catch(() => false);

      if (!audioExists) {
        // If no combined audio, try to concatenate individual slide audio files
        await this.concatenateSlideAudio(timeline, audioBaseDir, audioPath);
      }

      // Assemble video with audio
      return await this.assemble({
        inputVideoPath,
        audioPath,
        outputPath,
      });
    } catch (error) {
      return {
        outputPath,
        sizeBytes: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ============================================================================
  // FFMPEG COMMAND BUILDING
  // ============================================================================

  /**
   * Build FFmpeg command for audio replacement
   */
  private buildFFmpegCommand(config: VideoAssemblyConfig): string[] {
    const {
      inputVideoPath,
      audioPath,
      outputPath,
      videoCodec = 'libx264',
      audioCodec = 'aac',
      preset = 'medium',
      crf = 23,
      audioBitrate = '192k',
    } = config;

    return [
      'ffmpeg',
      '-y', // Overwrite output file
      '-i',
      inputVideoPath, // Input video
      '-i',
      audioPath, // Input audio
      '-c:v',
      videoCodec, // Video codec
      '-preset',
      preset, // Encoding preset
      '-crf',
      String(crf), // Quality
      '-c:a',
      audioCodec, // Audio codec
      '-b:a',
      audioBitrate, // Audio bitrate
      '-map',
      '0:v:0', // Take video from first input
      '-map',
      '1:a:0', // Take audio from second input
      '-shortest', // Match shortest stream duration
      outputPath,
    ];
  }

  // ============================================================================
  // FFMPEG EXECUTION
  // ============================================================================

  /**
   * Execute FFmpeg command
   */
  private async executeFFmpeg(
    command: string[],
    _config: VideoAssemblyConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command;
      if (!cmd) {
        reject(new Error('FFmpeg command is empty'));
        return;
      }

      const ffmpeg = spawn(cmd, args, { shell: false });

      let stderr = '';

      if (ffmpeg.stderr) {
        ffmpeg.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();

          // Parse FFmpeg progress output
          const progressMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2})/);
          if (progressMatch && progressMatch[1] && progressMatch[2] && progressMatch[3]) {
            const hours = parseInt(progressMatch[1], 10);
            const minutes = parseInt(progressMatch[2], 10);
            const seconds = parseInt(progressMatch[3], 10);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;

            // Estimate progress (assuming we know expected duration)
            // For now, just report encoding phase with increasing percentage
            const percentage = Math.min(90, 10 + totalSeconds * 2);
            this.reportProgress({
              phase: 'encoding',
              percentage,
            });
          }
        });
      }

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg error: ${error.message}`));
      });
    });
  }

  // ============================================================================
  // AUDIO CONCATENATION
  // ============================================================================

  /**
   * Concatenate individual slide audio files into one
   */
  private async concatenateSlideAudio(
    timeline: RevealTimeline,
    audioBaseDir: string,
    outputPath: string
  ): Promise<void> {
    // Build audio segments with pauses
    const segments: Array<{ audioPath: string; pauseAfter: number }> = [];

    for (const slide of timeline.slides) {
      if (slide.audioPath) {
        const audioPath = path.join(audioBaseDir, path.basename(slide.audioPath));
        const exists = await fs.access(audioPath).then(() => true).catch(() => false);

        if (exists) {
          segments.push({ audioPath, pauseAfter: slide.pauseAfter });
        }
      }
    }

    if (segments.length === 0) {
      throw new Error('No audio files found for concatenation');
    }

    // Build FFmpeg filter to concatenate audio with silence for pauses
    const inputs: string[] = [];
    const filterParts: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      inputs.push('-i', segments[i]!.audioPath);

      if (segments[i]!.pauseAfter > 0) {
        // Add silence after this audio
        const silenceDuration = segments[i]!.pauseAfter;
        filterParts.push(
          `[${i}:a]apad=pad_dur=${silenceDuration}[a${i}]`
        );
      } else {
        // No pause, just use audio as-is
        filterParts.push(`[${i}:a]anull[a${i}]`);
      }
    }

    // Concatenate all segments
    const concatInputs = segments.map((_, i) => `[a${i}]`).join('');
    const concatFilter = `${concatInputs}concat=n=${segments.length}:v=0:a=1[out]`;
    filterParts.push(concatFilter);

    // Build complete filter_complex
    const filterComplex = filterParts.join(';');

    // Execute FFmpeg with filter
    const command = [
      'ffmpeg',
      '-y',
      ...inputs,
      '-filter_complex',
      filterComplex,
      '-map',
      '[out]',
      outputPath,
    ];

    await this.executeFFmpeg(command, {
      inputVideoPath: '',
      audioPath: '',
      outputPath,
    });
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate input files exist
   */
  private async validateInputs(config: VideoAssemblyConfig): Promise<void> {
    const videoExists = await fs
      .access(config.inputVideoPath)
      .then(() => true)
      .catch(() => false);

    if (!videoExists) {
      throw new Error(`Input video not found: ${config.inputVideoPath}`);
    }

    const audioExists = await fs
      .access(config.audioPath)
      .then(() => true)
      .catch(() => false);

    if (!audioExists) {
      throw new Error(`Audio file not found: ${config.audioPath}`);
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Report progress update
   */
  private reportProgress(progress: AssemblyProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Check if FFmpeg is available
   */
  async checkFFmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn('ffmpeg', ['-version']);

      ffmpeg.on('close', (code) => {
        resolve(code === 0);
      });

      ffmpeg.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get video metadata using FFprobe
   */
  async getVideoMetadata(videoPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
  }> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        videoPath,
      ]);

      let stdout = '';
      let stderr = '';

      ffprobe.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      ffprobe.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            const data = JSON.parse(stdout);
            const videoStream = data.streams.find((s: any) => s.codec_type === 'video');

            resolve({
              duration: parseFloat(data.format.duration) || 0,
              width: videoStream?.width || 0,
              height: videoStream?.height || 0,
              format: data.format.format_name || 'unknown',
            });
          } catch (error) {
            reject(new Error(`Failed to parse FFprobe output: ${error}`));
          }
        } else {
          reject(new Error(`FFprobe failed with code ${code}: ${stderr}`));
        }
      });

      ffprobe.on('error', (error) => {
        reject(new Error(`FFprobe error: ${error.message}`));
      });
    });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new video assembler instance
 */
export function createRevealVideoAssembler(): RevealVideoAssembler {
  return new RevealVideoAssembler();
}
