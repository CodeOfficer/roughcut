/**
 * Core type definitions for the tutorial factory system
 */

/**
 * Screenshot capture modes
 */
export type ScreenshotMode = 'static' | 'auto' | 'none';

/**
 * Video transition types
 */
export type TransitionType = 'fade' | 'dissolve' | 'wipe' | 'none';

/**
 * Tutorial segment representing a single narrated section
 */
export interface TutorialSegment {
  /** Unique identifier for the segment */
  id: string;

  /** Segment title */
  title: string;

  /** Expected duration in seconds */
  duration: number;

  /** Narration text to be converted to speech */
  narration: string;

  /** Screenshot/Image configuration */
  screenshot: {
    /** Screenshot capture mode */
    mode: ScreenshotMode;

    /** Gemini prompt for static image generation (used when mode is 'static') */
    geminiPrompt?: string;

    /** Playwright instructions for auto capture (used when mode is 'auto') */
    playwrightInstructions?: string;

    /** Path to screenshot/image file (if already captured/generated) */
    filepath?: string;
  };

  /** Actual audio duration (set after narration generation) */
  actualDuration?: number;

  /** Path to generated audio file */
  audioPath?: string;
}

/**
 * Complete tutorial script with all segments
 */
export interface TutorialScript {
  /** Tutorial title */
  title: string;

  /** Tutorial description */
  description?: string;

  /** Array of tutorial segments */
  segments: TutorialSegment[];
}

/**
 * Tutorial configuration
 */
export interface TutorialConfig {
  /** Tutorial title */
  title: string;

  /** Brief description */
  description: string;

  /** Voice ID for narration */
  voice: string;

  /** Video generation settings */
  videoSettings: {
    /** Video resolution (e.g., "1920x1080") */
    resolution: string;

    /** Frames per second */
    fps: number;

    /** Transition effect between segments */
    transition: TransitionType;

    /** Transition duration in seconds */
    transitionDuration: number;
  };

  /** Metadata about the tutorial */
  metadata: {
    /** Creation timestamp */
    created: string | null;

    /** Last modification timestamp */
    lastModified: string | null;

    /** Tutorial version */
    version: string;
  };

  /** Generated segment metadata (populated during build) */
  segments?: Array<{
    id: string;
    audioPath?: string;
    screenshotPath?: string;
    duration?: number;
  }>;
}

/**
 * Video timeline entry for FFmpeg assembly
 */
export interface TimelineEntry {
  /** Start time in seconds */
  startTime: number;

  /** Duration in seconds */
  duration: number;

  /** Path to audio file */
  audioPath: string;

  /** Path to screenshot/image file */
  imagePath: string;

  /** Segment ID reference */
  segmentId: string;
}

/**
 * Video assembly options
 */
export interface VideoAssemblyOptions {
  /** Output file path */
  outputPath: string;

  /** Video resolution */
  resolution: string;

  /** Frames per second */
  fps: number;

  /** Transition type */
  transition: TransitionType;

  /** Transition duration in seconds */
  transitionDuration: number;

  /** Timeline entries */
  timeline: TimelineEntry[];
}

/**
 * Narration generation options
 */
export interface NarrationOptions {
  /** Text to convert to speech */
  text: string;

  /** Output file path */
  outputPath: string;

  /** Voice ID */
  voiceId: string;

  /** Model ID */
  modelId: string;

  /** Voice stability (0-1) */
  stability: number;

  /** Similarity boost (0-1) */
  similarityBoost: number;
}

/**
 * Screenshot capture options (for Playwright automation)
 */
export interface ScreenshotCaptureOptions {
  /** Output file path */
  outputPath: string;

  /** Playwright automation instructions */
  instructions: string;

  /** Optional URL to navigate to */
  url?: string;

  /** Wait time before capture (milliseconds) */
  waitTime?: number;

  /** Viewport dimensions */
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Gemini image generation options
 */
export interface GeminiImageOptions {
  /** Text prompt describing the desired image */
  prompt: string;

  /** Output file path */
  outputPath: string;

  /** Image resolution (e.g., "1920x1080") */
  resolution?: string;

  /** Optional aspect ratio override */
  aspectRatio?: string;

  /** Number of generation attempts before failing */
  maxRetries?: number;
}

/**
 * CLI command context
 */
export interface CommandContext {
  /** Tutorial name/identifier */
  tutorialName: string;

  /** Tutorial root directory */
  tutorialDir: string;

  /** Tutorial configuration */
  config: TutorialConfig;

  /** Parsed tutorial script */
  script?: TutorialScript;
}
