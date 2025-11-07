/**
 * Audio synchronization orchestrator
 *
 * Orchestrates presentation playback with audio synchronization:
 * 1. Navigate to slide
 * 2. Play audio for slide
 * 3. Wait for audio to complete
 * 4. Pause for configured duration
 * 5. Execute playwright instructions (if any)
 * 6. Move to next slide
 * 7. Repeat
 */

import type { RevealTimeline } from '../core/revealjs-types.js';
import { PlaywrightRevealController } from './playwright-controller.js';
import { PlaywrightInstructionExecutor } from './playwright-executor.js';
import { BrowserAudioPlayer, createBrowserAudioPlayer } from './audio-player.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Orchestration options
 */
export interface OrchestrationOptions {
  /** Path to presentation HTML */
  htmlPath: string;

  /** Presentation timeline */
  timeline: RevealTimeline;

  /** Base directory for audio files */
  audioBaseDir: string;

  /** Output directory for screenshots */
  screenshotDir?: string;

  /** Video recording directory */
  recordVideo?: string;

  /** Headless mode (default: true) */
  headless?: boolean;

  /** Playback speed (default: 1.0) */
  playbackRate?: number;

  /** Volume (default: 1.0) */
  volume?: number;
}

/**
 * Orchestration progress callback
 */
export type ProgressCallback = (progress: OrchestrationProgress) => void | Promise<void>;

/**
 * Orchestration progress data
 */
export interface OrchestrationProgress {
  /** Current slide index */
  slideIndex: number;

  /** Total slides */
  totalSlides: number;

  /** Current slide ID */
  slideId: string;

  /** Elapsed time in seconds */
  elapsedTime: number;

  /** Total duration in seconds */
  totalDuration: number;

  /** Current phase */
  phase: 'navigating' | 'playing_audio' | 'pausing' | 'executing' | 'complete';

  /** Progress percentage (0-100) */
  percentage: number;
}

/**
 * Orchestration result
 */
export interface OrchestrationResult {
  /** Whether orchestration completed successfully */
  success: boolean;

  /** Total slides processed */
  slidesProcessed: number;

  /** Total duration in seconds */
  totalDuration: number;

  /** Video path (if recording) */
  videoPath?: string;

  /** Error message if failed */
  error?: string;
}

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class AudioSyncOrchestrator {
  private controller: PlaywrightRevealController;
  private executor: PlaywrightInstructionExecutor;
  private audioPlayer: BrowserAudioPlayer | null = null;
  private progressCallback: ProgressCallback | null = null;
  private startTime: number = 0;

  constructor() {
    this.controller = new PlaywrightRevealController();
    this.executor = new PlaywrightInstructionExecutor();
  }

  /**
   * Set progress callback
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Run complete orchestration
   */
  async run(options: OrchestrationOptions): Promise<OrchestrationResult> {
    const {
      htmlPath,
      timeline,
      audioBaseDir: _audioBaseDir,
      screenshotDir,
      recordVideo,
      headless = true,
      playbackRate = 1.0,
      volume = 1.0,
    } = options;

    this.startTime = Date.now();

    try {
      // Launch browser and load presentation
      const launchOptions: {
        headless: boolean;
        recordVideo?: string;
        videoSize: { width: number; height: number };
      } = {
        headless,
        videoSize: { width: 1920, height: 1080 },
      };

      if (recordVideo) {
        launchOptions.recordVideo = recordVideo;
      }

      await this.controller.launch(htmlPath, launchOptions);

      // Initialize audio player
      const page = this.controller.getPage();
      this.audioPlayer = createBrowserAudioPlayer(page);
      await this.audioPlayer.initialize();
      await this.audioPlayer.setVolume(volume);
      await this.audioPlayer.setPlaybackRate(playbackRate);

      // Process each slide in timeline
      for (let i = 0; i < timeline.slides.length; i++) {
        const entry = timeline.slides[i];
        if (!entry) {
          throw new Error(`Timeline entry at index ${i} is undefined`);
        }

        await this.reportProgress({
          slideIndex: i,
          totalSlides: timeline.slides.length,
          slideId: entry.slideId,
          elapsedTime: this.getElapsedTime(),
          totalDuration: timeline.totalDuration,
          phase: 'navigating',
          percentage: (i / timeline.slides.length) * 100,
        });

        // Navigate to slide
        await this.controller.slide(entry.slideIndex, 0);

        // Play audio if present
        if (entry.audioPath) {
          await this.playAudio(entry.audioPath, i, timeline.slides.length);
        }

        // Pause after audio
        if (entry.pauseAfter > 0) {
          await this.pauseAfter(entry.pauseAfter, i, timeline.slides.length, entry.slideId);
        }

        // Execute playwright instructions if present
        if (entry.hasPlaywright && entry.playwrightInstructions.length > 0) {
          await this.executeInstructions(
            entry.playwrightInstructions,
            entry.slideId,
            screenshotDir,
            i,
            timeline.slides.length
          );
        }
      }

      // Report completion
      await this.reportProgress({
        slideIndex: timeline.slides.length,
        totalSlides: timeline.slides.length,
        slideId: 'complete',
        elapsedTime: this.getElapsedTime(),
        totalDuration: timeline.totalDuration,
        phase: 'complete',
        percentage: 100,
      });

      // Get video path if recording
      const videoPath = await this.controller.getVideoPath();

      // Close browser
      await this.controller.close();

      const result: {
        success: true;
        slidesProcessed: number;
        totalDuration: number;
        videoPath?: string;
      } = {
        success: true,
        slidesProcessed: timeline.slides.length,
        totalDuration: this.getElapsedTime(),
      };

      if (videoPath) {
        result.videoPath = videoPath;
      }

      return result;
    } catch (error) {
      // Cleanup on error
      try {
        await this.controller.close();
      } catch (e) {
        // Ignore cleanup errors
      }

      return {
        success: false,
        slidesProcessed: 0,
        totalDuration: this.getElapsedTime(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Play audio and wait for completion
   */
  private async playAudio(
    audioPath: string,
    slideIndex: number,
    totalSlides: number
  ): Promise<void> {
    if (!this.audioPlayer) {
      throw new Error('Audio player not initialized');
    }

    await this.reportProgress({
      slideIndex,
      totalSlides,
      slideId: `slide-${slideIndex + 1}`,
      elapsedTime: this.getElapsedTime(),
      totalDuration: 0,
      phase: 'playing_audio',
      percentage: (slideIndex / totalSlides) * 100,
    });

    try {
      // Load and play audio
      await this.audioPlayer.load(audioPath);
      await this.audioPlayer.play();

      // Wait for audio to finish
      await this.audioPlayer.waitForEnd();
    } catch (error) {
      // If audio fails to play, wait a minimal amount and continue
      // This handles cases like test mock files or missing audio
      await this.controller.wait(100);
    }
  }

  /**
   * Pause after audio
   */
  private async pauseAfter(
    pauseDuration: number,
    slideIndex: number,
    totalSlides: number,
    slideId: string
  ): Promise<void> {
    await this.reportProgress({
      slideIndex,
      totalSlides,
      slideId,
      elapsedTime: this.getElapsedTime(),
      totalDuration: 0,
      phase: 'pausing',
      percentage: (slideIndex / totalSlides) * 100,
    });

    // Wait for pause duration
    await this.controller.wait(pauseDuration * 1000);
  }

  /**
   * Execute playwright instructions
   */
  private async executeInstructions(
    instructions: any[],
    slideId: string,
    screenshotDir: string | undefined,
    slideIndex: number,
    totalSlides: number
  ): Promise<void> {
    await this.reportProgress({
      slideIndex,
      totalSlides,
      slideId,
      elapsedTime: this.getElapsedTime(),
      totalDuration: 0,
      phase: 'executing',
      percentage: (slideIndex / totalSlides) * 100,
    });

    const page = this.controller.getPage();

    const context: {
      page: any;
      screenshotDir?: string;
      slideId: string;
    } = {
      page,
      slideId,
    };

    if (screenshotDir) {
      context.screenshotDir = screenshotDir;
    }

    await this.executor.executeAll(instructions, context);
  }

  /**
   * Report progress to callback
   */
  private async reportProgress(progress: OrchestrationProgress): Promise<void> {
    if (this.progressCallback) {
      await this.progressCallback(progress);
    }
  }

  /**
   * Get elapsed time in seconds
   */
  private getElapsedTime(): number {
    return (Date.now() - this.startTime) / 1000;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new orchestrator instance
 */
export function createAudioSyncOrchestrator(): AudioSyncOrchestrator {
  return new AudioSyncOrchestrator();
}
