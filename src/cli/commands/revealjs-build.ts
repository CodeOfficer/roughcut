/**
 * Build command for reveal.js presentations
 *
 * Orchestrates the complete build pipeline:
 * 1. Parse markdown input
 * 2. Generate audio narration
 * 3. Generate HTML presentation
 * 4. Build timeline
 * 5. Record video (optional)
 * 6. Assemble final video (optional)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createRevealParser } from '../../core/revealjs-parser.js';
import { RevealHTMLGenerator } from '../../presentation/revealjs-generator.js';
import { RevealSpeechGenerator } from '../../narration/revealjs-speech.js';
import { createRevealTimelineBuilder } from '../../video/revealjs-timeline.js';
import { AudioSyncOrchestrator } from '../../presentation/audio-sync-orchestrator.js';
import { createRevealVideoAssembler } from '../../video/revealjs-video-assembler.js';
import type { RevealPresentation } from '../../core/revealjs-types.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Build command options
 */
export interface BuildOptions {
  /** Path to input markdown file */
  input: string;

  /** Output directory for generated files */
  output: string;

  /** Whether to generate video (default: true) */
  video?: boolean;

  /** Whether to bundle reveal.js assets (default: true) */
  bundle?: boolean;

  /** Whether to skip audio generation (use existing audio files) */
  skipAudio?: boolean;

  /** Run browser in non-headless mode for debugging */
  debug?: boolean;

  /** ElevenLabs API key (from env if not provided) */
  apiKey?: string;

  /** Video resolution (default: 1920x1080) */
  resolution?: string;

  /** Video quality preset (default: medium) */
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow' | 'veryslow';
}

/**
 * Build result
 */
export interface BuildResult {
  /** Whether build was successful */
  success: boolean;

  /** Path to generated HTML file */
  htmlPath?: string;

  /** Path to generated video file */
  videoPath?: string;

  /** Total build duration in seconds */
  durationSeconds?: number;

  /** Error message if failed */
  error?: string;

  /** Build statistics */
  stats?: {
    slidesProcessed: number;
    audioFilesGenerated: number;
    totalDuration: number;
    videoSize?: number;
  };
}

/**
 * Build progress update
 */
export interface BuildProgress {
  /** Current phase */
  phase:
    | 'parsing'
    | 'audio_generation'
    | 'html_generation'
    | 'timeline_building'
    | 'video_recording'
    | 'video_assembly'
    | 'complete';

  /** Progress percentage (0-100) */
  percentage: number;

  /** Current step description */
  message: string;

  /** Additional context */
  context?: any;
}

// ============================================================================
// BUILD COMMAND CLASS
// ============================================================================

export class RevealBuildCommand {
  private progressCallback?: (progress: BuildProgress) => void;

  /**
   * Register progress callback
   */
  onProgress(callback: (progress: BuildProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Execute build command
   */
  async execute(options: BuildOptions): Promise<BuildResult> {
    const startTime = Date.now();

    try {
      // Validate options
      this.validateOptions(options);

      // Setup output directories
      await this.setupOutputDirectories(options.output);

      // Phase 1: Parse markdown
      this.reportProgress({
        phase: 'parsing',
        percentage: 0,
        message: `Reading ${path.basename(options.input)}...`,
      });

      const markdown = await fs.readFile(options.input, 'utf-8');
      const parser = createRevealParser();
      const presentation = parser.parse(markdown);

      this.reportProgress({
        phase: 'parsing',
        percentage: 10,
        message: `Parsed ${presentation.slides.length} slides`,
      });

      // Phase 2: Generate audio (if not skipped)
      let audioResults: Map<string, any> | null = null;

      if (!options.skipAudio) {
        this.reportProgress({
          phase: 'audio_generation',
          percentage: 15,
          message: 'Generating audio narration...',
        });

        audioResults = await this.generateAudio(presentation, options);

        this.reportProgress({
          phase: 'audio_generation',
          percentage: 40,
          message: `Generated audio for ${audioResults?.size || 0} slides`,
        });
      } else {
        // Load existing audio files
        audioResults = await this.loadExistingAudio(presentation, options);
      }

      // Phase 3: Generate HTML
      this.reportProgress({
        phase: 'html_generation',
        percentage: 45,
        message: 'Generating HTML presentation...',
      });

      const htmlPath = await this.generateHTML(presentation, options);

      this.reportProgress({
        phase: 'html_generation',
        percentage: 55,
        message: 'HTML generated successfully',
      });

      // Phase 4: Build timeline
      this.reportProgress({
        phase: 'timeline_building',
        percentage: 60,
        message: 'Building presentation timeline...',
      });

      const timeline = this.buildTimeline(presentation, audioResults);

      this.reportProgress({
        phase: 'timeline_building',
        percentage: 65,
        message: `Timeline built: ${timeline.totalDuration.toFixed(1)}s total`,
      });

      let videoPath: string | undefined;
      let videoSize: number | undefined;

      // Phase 5: Record and assemble video (if enabled)
      if (options.video !== false) {
        // Record video with orchestrator
        this.reportProgress({
          phase: 'video_recording',
          percentage: 70,
          message: 'Recording presentation video...',
        });

        const recordedVideoPath = await this.recordVideo(
          htmlPath,
          timeline,
          options
        );

        this.reportProgress({
          phase: 'video_recording',
          percentage: 85,
          message: 'Video recorded successfully',
        });

        // Assemble final video with audio
        this.reportProgress({
          phase: 'video_assembly',
          percentage: 90,
          message: 'Assembling final video with audio...',
        });

        const assemblyResult = await this.assembleVideo(
          recordedVideoPath,
          timeline,
          options
        );

        if (assemblyResult.success) {
          videoPath = assemblyResult.outputPath;
          videoSize = assemblyResult.sizeBytes;

          this.reportProgress({
            phase: 'video_assembly',
            percentage: 95,
            message: 'Video assembled successfully',
          });
        }
      }

      // Complete
      const durationSeconds = (Date.now() - startTime) / 1000;

      this.reportProgress({
        phase: 'complete',
        percentage: 100,
        message: 'Build complete!',
      });

      return {
        success: true,
        htmlPath,
        videoPath,
        durationSeconds,
        stats: {
          slidesProcessed: presentation.slides.length,
          audioFilesGenerated: audioResults?.size || 0,
          totalDuration: timeline.totalDuration,
          videoSize,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ============================================================================
  // PIPELINE STAGES
  // ============================================================================

  /**
   * Generate audio for all slides
   */
  private async generateAudio(
    presentation: RevealPresentation,
    options: BuildOptions
  ): Promise<Map<string, any>> {
    const audioDir = path.join(options.output, 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const speechGenerator = new RevealSpeechGenerator({
      apiKey: options.apiKey || process.env.ELEVENLABS_API_KEY || '',
      outputDir: audioDir,
    });

    const results = await speechGenerator.generateAllSlideAudio(presentation);

    // Convert array to map
    const audioResults = new Map();
    for (const result of results) {
      audioResults.set(result.slideId, result);
    }

    return audioResults;
  }

  /**
   * Load existing audio files
   */
  private async loadExistingAudio(
    presentation: RevealPresentation,
    options: BuildOptions
  ): Promise<Map<string, any>> {
    const audioDir = path.join(options.output, 'audio');
    const audioResults = new Map();

    for (const slide of presentation.slides) {
      if (slide.audio) {
        const audioPath = path.join(audioDir, `${slide.id}.mp3`);
        const exists = await fs
          .access(audioPath)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          const stats = await fs.stat(audioPath);
          audioResults.set(slide.id, {
            slideId: slide.id,
            filePath: audioPath,
            durationSeconds: slide.audio.expectedDuration || 0,
            sizeBytes: stats.size,
          });
        }
      }
    }

    return audioResults;
  }

  /**
   * Generate HTML presentation
   */
  private async generateHTML(
    presentation: RevealPresentation,
    options: BuildOptions
  ): Promise<string> {
    const htmlPath = path.join(options.output, 'presentation', 'index.html');

    const generator = new RevealHTMLGenerator();
    await generator.generate(presentation, htmlPath, {
      bundleAssets: options.bundle !== false,
    });

    return htmlPath;
  }

  /**
   * Build presentation timeline
   */
  private buildTimeline(
    presentation: RevealPresentation,
    audioResults: Map<string, any> | null
  ): any {
    const timelineBuilder = createRevealTimelineBuilder();
    return timelineBuilder.build(presentation, audioResults || new Map());
  }

  /**
   * Record video with orchestrator
   */
  private async recordVideo(
    htmlPath: string,
    timeline: any,
    options: BuildOptions
  ): Promise<string> {
    const videoDir = path.join(options.output, 'video');
    await fs.mkdir(videoDir, { recursive: true });

    const orchestrator = new AudioSyncOrchestrator();

    // Forward progress updates
    orchestrator.onProgress(async (progress) => {
      this.reportProgress({
        phase: 'video_recording',
        percentage: 70 + (progress.percentage * 0.15), // Map 0-100 to 70-85
        message: `Recording: ${progress.phase}`,
        context: progress,
      });
    });

    const result = await orchestrator.run({
      htmlPath,
      timeline,
      audioBaseDir: path.join(options.output, 'audio'),
      recordVideo: videoDir,
      headless: !options.debug,
    });

    if (!result.success || !result.videoPath) {
      throw new Error(result.error || 'Video recording failed');
    }

    return result.videoPath;
  }

  /**
   * Assemble final video with audio
   */
  private async assembleVideo(
    recordedVideoPath: string,
    timeline: any,
    options: BuildOptions
  ): Promise<any> {
    const outputPath = path.join(options.output, 'tutorial.mp4');
    const audioDir = path.join(options.output, 'audio');

    const assembler = createRevealVideoAssembler();

    // Forward progress updates
    assembler.onProgress((progress) => {
      this.reportProgress({
        phase: 'video_assembly',
        percentage: 90 + (progress.percentage * 0.05), // Map 0-100 to 90-95
        message: `Assembling: ${progress.phase}`,
        context: progress,
      });
    });

    return await assembler.assembleFromTimeline(
      recordedVideoPath,
      timeline,
      audioDir,
      outputPath
    );
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Validate build options
   */
  private validateOptions(options: BuildOptions): void {
    if (!options.input) {
      throw new Error('Input file is required');
    }

    if (!options.output) {
      throw new Error('Output directory is required');
    }
  }

  /**
   * Setup output directories
   */
  private async setupOutputDirectories(outputDir: string): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'audio'), { recursive: true });
    await fs.mkdir(path.join(outputDir, 'presentation'), { recursive: true });
    await fs.mkdir(path.join(outputDir, 'video'), { recursive: true });
  }

  /**
   * Report progress update
   */
  private reportProgress(progress: BuildProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new build command instance
 */
export function createBuildCommand(): RevealBuildCommand {
  return new RevealBuildCommand();
}
