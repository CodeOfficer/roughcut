/**
 * Video assembly types for FFmpeg integration
 */

/**
 * Video configuration settings
 */
export interface VideoSettings {
  resolution: string;
  fps: number;
  transition: "none" | "fade" | "dissolve";
  transitionDuration: number;
}

/**
 * Timeline entry for a single segment
 */
export interface TimelineEntry {
  segmentId: string;
  audioPath: string;
  imagePath: string;
  duration: number;
  startTime: number;
}

/**
 * Complete video timeline
 */
export interface VideoTimeline {
  entries: TimelineEntry[];
  totalDuration: number;
}

/**
 * Video assembly options
 */
export interface VideoAssemblyOptions {
  timeline: VideoTimeline;
  outputPath: string;
  settings: VideoSettings;
}

/**
 * Result of video assembly
 */
export interface VideoAssemblyResult {
  filePath: string;
  durationSeconds: number;
  sizeBytes: number;
  resolution: string;
}
