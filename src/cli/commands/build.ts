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
import { createRevealParser } from '../../core/parser.js';
import { RevealHTMLGenerator } from '../../presentation/revealjs-generator.js';
import { RevealSpeechGenerator } from '../../narration/speech.js';
import { ElevenLabsClient } from '../../narration/elevenlabs.js';
import { createRevealTimelineBuilder } from '../../video/timeline.js';
import { AudioSyncOrchestrator } from '../../presentation/audio-sync-orchestrator.js';
import { createRevealVideoAssembler } from '../../video/assembler.js';
import { ImageGenerator } from '../../images/generator.js';
import { createDebugLogger } from '../../core/debug-logger.js';
import { createBuildSummaryGenerator, type BuildSummaryData, type StageTiming } from '../../core/build-summary.js';
import { lintMarkdown } from '../../core/linter.js';
import { logger } from '../../core/logger.js';
import type { RevealPresentation } from '../../core/types.js';

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

  /** Whether to skip image generation (use existing images) */
  skipImages?: boolean;

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

    // Initialize debug logger early (outside try block for error handling)
    let debugLogger: ReturnType<typeof createDebugLogger> | null = null;

    // Track stage timings for summary
    const stages: StageTiming[] = [];
    let audioCacheHits = 0;
    let audioCacheMisses = 0;

    try {
      // Validate options
      this.validateOptions(options);

      // Setup output directories
      await this.setupOutputDirectories(options.output);

      // Initialize debug logger
      debugLogger = createDebugLogger(options.output);
      await debugLogger.info('Build started', {
        input: options.input,
        output: options.output,
        skipAudio: options.skipAudio,
        skipImages: options.skipImages,
        video: options.video,
      });

      // Phase 1: Parse markdown
      await debugLogger.startOperation('parse_markdown');
      this.reportProgress({
        phase: 'parsing',
        percentage: 0,
        message: `Reading ${path.basename(options.input)}...`,
      });

      const markdown = await fs.readFile(options.input, 'utf-8');

      // Lint markdown BEFORE parsing (fail fast on errors)
      await debugLogger.startOperation('lint_markdown');
      this.reportProgress({
        phase: 'parsing',
        percentage: 5,
        message: 'Validating markdown format...',
      });

      const lintingResult = lintMarkdown(markdown, options.input);
      const lintDuration = await debugLogger.endOperation('lint_markdown', {
        errors: lintingResult.errors.length,
        warnings: lintingResult.warnings.length,
      });
      stages.push({ name: 'lint_markdown', durationMs: lintDuration });

      if (!lintingResult.passed) {
        // Linting failed - log all errors and stop build
        await debugLogger.error('Linting failed', {
          errors: lintingResult.errors.length,
          warnings: lintingResult.warnings.length,
        });

        // Print errors to console
        logger.error('\n' + lintingResult.toString());

        throw new Error(`Markdown linting failed with ${lintingResult.errors.length} error(s). See above for details.`);
      }

      if (lintingResult.warnings.length > 0) {
        logger.warn(`Found ${lintingResult.warnings.length} warning(s) during linting:`);
        for (const warning of lintingResult.warnings) {
          logger.warn(warning.toString());
        }
      }

      // Parse markdown
      const parser = createRevealParser();
      const presentation = parser.parse(markdown);
      const parseDuration = await debugLogger.endOperation('parse_markdown', {
        slides: presentation.slides.length,
        title: presentation.title,
      });
      stages.push({ name: 'parse_markdown', durationMs: parseDuration });

      this.reportProgress({
        phase: 'parsing',
        percentage: 10,
        message: `Parsed ${presentation.slides.length} slides`,
      });

      // Phase 1.5: Generate images (if not skipped)
      if (!options.skipImages) {
        const slidesWithImagePrompts = presentation.slides.filter(
          slide => slide.metadata.imagePrompt
        );

        if (slidesWithImagePrompts.length > 0) {
          await debugLogger.startOperation('generate_images', {
            count: slidesWithImagePrompts.length,
          });

          this.reportProgress({
            phase: 'parsing',
            percentage: 12,
            message: `Generating ${slidesWithImagePrompts.length} AI images...`,
          });

          await this.generateImages(presentation, options);

          const imagesDuration = await debugLogger.endOperation('generate_images');
          stages.push({
            name: 'generate_images',
            durationMs: imagesDuration,
            metadata: { count: slidesWithImagePrompts.length },
          });

          this.reportProgress({
            phase: 'parsing',
            percentage: 14,
            message: `Generated ${slidesWithImagePrompts.length} images`,
          });
        }
      }

      // Phase 2: Generate audio (if not skipped)
      let audioResults: Map<string, any> | null = null;

      if (!options.skipAudio) {
        await debugLogger.startOperation('generate_audio');

        this.reportProgress({
          phase: 'audio_generation',
          percentage: 15,
          message: 'Generating audio narration...',
        });

        const audioData = await this.generateAudio(presentation, options);
        audioResults = audioData.results;
        audioCacheHits = audioData.cacheHits;
        audioCacheMisses = audioData.cacheMisses;

        const audioDuration = await debugLogger.endOperation('generate_audio', {
          slides_with_audio: audioResults?.size || 0,
        });
        stages.push({
          name: 'generate_audio',
          durationMs: audioDuration,
          metadata: {
            slides_with_audio: audioResults?.size || 0,
            cached: audioCacheHits,
            generated: audioCacheMisses,
          },
        });

        this.reportProgress({
          phase: 'audio_generation',
          percentage: 40,
          message: `Generated audio for ${audioResults?.size || 0} slides`,
        });
      } else {
        // Load existing audio files
        await debugLogger.startOperation('load_existing_audio');
        audioResults = await this.loadExistingAudio(presentation, options);
        const loadDuration = await debugLogger.endOperation('load_existing_audio', {
          slides_with_audio: audioResults?.size || 0,
        });
        stages.push({
          name: 'load_existing_audio',
          durationMs: loadDuration,
          metadata: { slides_with_audio: audioResults?.size || 0 },
        });
      }

      // Phase 3: Generate HTML
      await debugLogger.startOperation('generate_html');

      this.reportProgress({
        phase: 'html_generation',
        percentage: 45,
        message: 'Generating HTML presentation...',
      });

      const htmlPath = await this.generateHTML(presentation, options);

      const htmlDuration = await debugLogger.endOperation('generate_html', {
        path: htmlPath,
      });
      stages.push({ name: 'generate_html', durationMs: htmlDuration });

      this.reportProgress({
        phase: 'html_generation',
        percentage: 55,
        message: 'HTML generated successfully',
      });

      // Phase 4: Build timeline
      await debugLogger.startOperation('build_timeline');

      this.reportProgress({
        phase: 'timeline_building',
        percentage: 60,
        message: 'Building presentation timeline...',
      });

      const timeline = this.buildTimeline(presentation, audioResults);

      const timelineDuration = await debugLogger.endOperation('build_timeline', {
        total_duration: timeline.totalDuration,
        slides: timeline.slides.length,
      });
      stages.push({ name: 'build_timeline', durationMs: timelineDuration });

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
        await debugLogger.startOperation('record_video');

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

        const recordDuration = await debugLogger.endOperation('record_video', {
          path: recordedVideoPath,
        });
        stages.push({ name: 'record_video', durationMs: recordDuration });

        this.reportProgress({
          phase: 'video_recording',
          percentage: 85,
          message: 'Video recorded successfully',
        });

        // Assemble final video with audio
        await debugLogger.startOperation('assemble_video');

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

          const assemblyDuration = await debugLogger.endOperation('assemble_video', {
            output_path: assemblyResult.outputPath,
            size_bytes: assemblyResult.sizeBytes,
            size_mb: (assemblyResult.sizeBytes / (1024 * 1024)).toFixed(2),
          });
          stages.push({ name: 'assemble_video', durationMs: assemblyDuration });

          this.reportProgress({
            phase: 'video_assembly',
            percentage: 95,
            message: 'Video assembled successfully',
          });
        }
      }

      // Complete
      const durationSeconds = (Date.now() - startTime) / 1000;

      // Generate build summary
      const summaryGenerator = createBuildSummaryGenerator();
      const summaryData: BuildSummaryData = {
        totalDurationMs: Date.now() - startTime,
        success: true,
        stages,
        slidesProcessed: presentation.slides.length,
        presentationDuration: timeline.totalDuration,
        audioCacheHits,
        audioCacheMisses,
        htmlPath,
      };
      if (videoSize !== undefined) {
        summaryData.videoSizeBytes = videoSize;
      }
      if (videoPath) {
        summaryData.videoPath = videoPath;
      }
      await summaryGenerator.generate(options.output, summaryData);

      // Write debug summary
      await debugLogger.info('Build completed successfully', {
        duration_seconds: durationSeconds,
        slides_processed: presentation.slides.length,
        audio_files: audioResults?.size || 0,
        video_generated: options.video !== false,
      });
      await debugLogger.writeSummary();

      this.reportProgress({
        phase: 'complete',
        percentage: 100,
        message: 'Build complete!',
      });

      const stats: {
        slidesProcessed: number;
        audioFilesGenerated: number;
        totalDuration: number;
        videoSize?: number;
      } = {
        slidesProcessed: presentation.slides.length,
        audioFilesGenerated: audioResults?.size || 0,
        totalDuration: timeline.totalDuration,
      };

      if (videoSize !== undefined) {
        stats.videoSize = videoSize;
      }

      const result: {
        success: true;
        htmlPath: string;
        videoPath?: string;
        durationSeconds: number;
        stats: typeof stats;
      } = {
        success: true,
        htmlPath,
        durationSeconds,
        stats,
      };

      if (videoPath) {
        result.videoPath = videoPath;
      }

      return result;
    } catch (error) {
      // Generate build summary for failed build (only if output directory is valid)
      if (options.output) {
        try {
          const summaryGenerator = createBuildSummaryGenerator();
          const summaryData: BuildSummaryData = {
            totalDurationMs: Date.now() - startTime,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stages,
            slidesProcessed: 0,
            audioCacheHits,
            audioCacheMisses,
          };
          await summaryGenerator.generate(options.output, summaryData);
        } catch (summaryError) {
          // Ignore summary generation errors
        }
      }

      // Log error to debug file if available
      if (debugLogger) {
        await debugLogger.error('Build failed', error);
        await debugLogger.writeSummary();
      }

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
   * Generate AI images for slides with @image-prompt
   */
  private async generateImages(
    presentation: RevealPresentation,
    options: BuildOptions
  ): Promise<void> {
    const imagesDir = path.join(options.output, 'images');
    await fs.mkdir(imagesDir, { recursive: true });

    const imageGenerator = new ImageGenerator(presentation.resolution);

    // Collect all slides that need images
    const imagesToGenerate: Array<{ prompt: string; filename: string; slideId: string }> = [];

    for (const slide of presentation.slides) {
      if (slide.metadata.imagePrompt) {
        imagesToGenerate.push({
          prompt: slide.metadata.imagePrompt,
          filename: `${slide.id}.png`,
          slideId: slide.id,
        });
      }
    }

    // Generate images
    for (const { prompt, filename, slideId } of imagesToGenerate) {
      const result = await imageGenerator.generateImage(prompt, imagesDir, filename);

      // Update slide metadata with generated image path
      const slide = presentation.slides.find(s => s.id === slideId);
      if (slide) {
        slide.metadata.imagePath = result.filePath;
        // If no background is set, use the generated image as background
        if (!slide.metadata.background) {
          slide.metadata.background = `../images/${filename}`;
        }
      }
    }
  }

  /**
   * Generate audio for all slides
   */
  private async generateAudio(
    presentation: RevealPresentation,
    options: BuildOptions
  ): Promise<{
    results: Map<string, any>;
    cacheHits: number;
    cacheMisses: number;
  }> {
    const audioDir = path.join(options.output, 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const apiKey = options.apiKey || process.env['ELEVENLABS_API_KEY'] || '';
    const elevenlabsClient = new ElevenLabsClient(apiKey);
    const speechGenerator = new RevealSpeechGenerator(elevenlabsClient);

    return await speechGenerator.generateAllSlideAudio(
      presentation,
      audioDir
    );
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
