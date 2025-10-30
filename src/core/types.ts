/**
 * Core type definitions for the tutorial factory system
 */

/**
 * Screenshot capture modes
 */
export type ScreenshotMode = 'manual' | 'auto' | 'none';

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

  /** Screenshot configuration */
  screenshot: {
    /** Screenshot capture mode */
    mode: ScreenshotMode;

    /** Instructions for capturing or identifying the screenshot */
    instructions?: string;

    /** Path to screenshot file (if already captured) */
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
 * Screenshot capture options
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
