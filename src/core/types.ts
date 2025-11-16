/**
 * TypeScript type definitions for Reveal.js integration
 *
 * These types define the contracts between components:
 * - Parser output structure
 * - Audio generation inputs/outputs
 * - Timeline building
 * - HTML generation
 * - Playwright orchestration
 */

import type { RevealJSConfig } from './revealjs-config-schema.js';

// ============================================================================
// PRESENTATION STRUCTURE
// ============================================================================

/**
 * Complete reveal.js presentation parsed from markdown
 */
export interface RevealPresentation {
  /** Presentation title */
  title: string;

  /** Reveal.js theme (black, white, dracula, etc.) */
  theme: string;

  /** ElevenLabs voice ID (falls back to ELEVENLABS_VOICE_ID env var if not specified) */
  voice?: string;

  /** Video resolution (e.g., "1920x1080") */
  resolution: string;

  /** Array of slides in presentation order */
  slides: RevealSlide[];

  /** Total presentation duration in seconds (calculated after audio generation) */
  totalDuration?: number;

  /** Optional RevealJS configuration overrides from frontmatter (Phase 2: 60+ options) */
  config?: Partial<RevealJSConfig>;

  /**
   * Path to external custom CSS file
   * Phase 3: Custom CSS Injection
   */
  customCSS?: string;

  /**
   * Inline custom CSS styles
   * Phase 3: Custom CSS Injection
   */
  customStyles?: string;
}

/**
 * Single slide in the presentation
 */
export interface RevealSlide {
  /** Unique slide identifier (e.g., "slide-001") */
  id: string;

  /** Slide index in presentation (0-based) */
  index: number;

  /** Markdown content for the slide (cleaned of directives) */
  content: string;

  /** Audio narration block (null if no audio) */
  audio: AudioBlock | null;

  /** Playwright automation instructions (null if none) */
  playwright: PlaywrightBlock | null;

  /** Speaker notes (null if none) */
  notes: string | null;

  /** Slide-specific metadata and configuration */
  metadata: SlideMetadata;

  /** Phase 3: Whether this is a vertical slide (for 2D navigation) */
  isVertical?: boolean;

  /** Phase 3: Vertical group ID (slides with same ID are in same vertical stack) */
  verticalGroup?: number;
}

// ============================================================================
// AUDIO
// ============================================================================

/**
 * Audio narration for a slide
 */
export interface AudioBlock {
  /** Raw narration text (with [Xs] pause markers) */
  rawText: string;

  /** Cleaned text for TTS (pause markers removed) */
  cleanText: string;

  /** Expected duration in seconds (from @duration directive, optional) */
  expectedDuration: number | null;

  /** Actual duration from ElevenLabs/FFmpeg (set after generation) */
  actualDuration?: number;

  /** Path to generated audio file (set after generation) */
  audioPath?: string;

  /** Inline pause markers parsed from [Xs] syntax */
  pauses: PauseMarker[];

  /** Individual audio lines for fingerprinting and incremental TTS */
  lines?: AudioLine[];
}

/**
 * Individual audio line for multi-line @audio: format
 * Enables fingerprinting and incremental TTS regeneration
 */
export interface AudioLine {
  /** Original text of this line */
  text: string;

  /** SHA256 hash for change detection */
  hash?: string;

  /** Path to generated audio file for this specific line */
  audioPath?: string;

  /** Duration of this audio segment in seconds */
  duration?: number;
}

/**
 * Pause marker within audio narration
 * Position is character offset in cleanText
 */
export interface PauseMarker {
  /** Character position in clean text where pause occurs */
  position: number;

  /** Duration of pause in seconds */
  durationSeconds: number;
}

/**
 * Result from audio generation
 */
export interface AudioGenerationResult {
  /** Slide ID this audio belongs to */
  slideId: string;

  /** Path to generated MP3 file */
  filePath: string;

  /** Actual audio duration in seconds */
  durationSeconds: number;

  /** File size in bytes */
  sizeBytes: number;

  /** Character-level alignment data from ElevenLabs (if available) */
  alignment?: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };

  /** Normalized alignment data from ElevenLabs (if available) */
  normalizedAlignment?: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

// ============================================================================
// PLAYWRIGHT AUTOMATION
// ============================================================================

/**
 * Playwright automation block for a slide
 */
export interface PlaywrightBlock {
  /** Array of instructions to execute */
  instructions: PlaywrightInstruction[];
}

/**
 * Single playwright instruction
 */
export interface PlaywrightInstruction {
  /** Instruction type */
  type: 'action' | 'wait' | 'screenshot';

  /** Raw instruction text (e.g., "Click button", "2s", "screenshot-name") */
  content: string;

  /** Parsed parameters (populated by executor) */
  params?: Record<string, any>;
}

// ============================================================================
// SLIDE METADATA
// ============================================================================

/**
 * Slide-specific metadata from @directives
 */
export interface SlideMetadata {
  /** Expected slide duration in seconds (from @duration) */
  duration: number | null;

  /** Pause after audio ends in seconds (from @pause-after) */
  pauseAfter: number;

  /** Slide transition type (from @transition) */
  transition?: string;

  /** Background color or image (from @background) */
  background?: string;

  /** AI image generation prompt (from @image-prompt) */
  imagePrompt?: string;

  /** Path to generated image file (set after generation) */
  imagePath?: string;

  /** Fragment definitions for this slide */
  fragments: FragmentDefinition[];

  /** Whether auto-animate is enabled */
  autoAnimate?: boolean;

  /** Phase 3: Video background path (from @background-video) */
  backgroundVideo?: string;

  /** Phase 3: Loop video background (from @background-video-loop) */
  backgroundVideoLoop?: boolean;

  /** Phase 3: Mute video background (from @background-video-muted) */
  backgroundVideoMuted?: boolean;
}

/**
 * Fragment definition (step-by-step reveal)
 */
export interface FragmentDefinition {
  /** Fragment index (order of appearance) */
  index: number;

  /** Fragment effect (fade, grow, highlight-red, etc.) */
  effect: string;

  /** Content/selector for the fragment */
  content: string;

  /** Relative timing offset in seconds (from @fragment +2s) */
  timingOffset?: number;
}

// ============================================================================
// TIMELINE
// ============================================================================

/**
 * Complete timeline for presentation orchestration
 */
export interface RevealTimeline {
  /** Timeline entries for each slide */
  slides: SlideTimelineEntry[];

  /** Total presentation duration in seconds */
  totalDuration: number;
}

/**
 * Fragment timing information for orchestration
 */
export interface FragmentTiming {
  /** Fragment index (0-based) */
  fragmentIndex: number;

  /** Timestamp in seconds (relative to slide start) */
  timestamp: number;
}

/**
 * Timeline entry for a single slide
 */
export interface SlideTimelineEntry {
  /** Slide ID */
  slideId: string;

  /** Slide index (0-based) */
  slideIndex: number;

  /** Phase 3: Horizontal index for 2D navigation (RevealJS h coordinate) */
  h: number;

  /** Phase 3: Vertical index for 2D navigation (RevealJS v coordinate) */
  v: number;

  /** Path to audio file (null if no audio) */
  audioPath: string | null;

  /** Audio duration in seconds */
  audioDuration: number;

  /** Pause after audio in seconds */
  pauseAfter: number;

  /** Total slide duration (audioDuration + pauseAfter) */
  totalSlideDuration: number;

  /** Cumulative start time in seconds */
  startTime: number;

  /** Cumulative end time in seconds */
  endTime: number;

  /** Whether this slide has playwright instructions */
  hasPlaywright: boolean;

  /** Playwright instructions (empty array if none) */
  playwrightInstructions: PlaywrightInstruction[];

  /** Slide metadata */
  metadata: SlideMetadata;

  /** Fragment reveal timings (empty array if no fragments) */
  fragmentTimings: FragmentTiming[];
}

// ============================================================================
// REVEAL.JS CONFIG
// ============================================================================

/**
 * Reveal.js initialization configuration
 */
export interface RevealConfig {
  /** Auto-slide interval in ms (0 = disabled, Playwright controls timing) */
  autoSlide: number;

  /** Add slide number to URL hash */
  hash: boolean;

  /** Push each slide change to browser history */
  history: boolean;

  /** Enable fragments */
  fragments: boolean;

  /** Include fragment index in URL */
  fragmentInURL: boolean;

  /** Default transition style */
  transition: string;

  /** Transition speed */
  transitionSpeed: string;

  /** Auto-play media */
  autoPlayMedia: boolean;

  /** Plugin names to load */
  plugins: string[];

  // ============================================================================
  // PHASE 1: CORE CONFIG OPTIONS (exposed to users)
  // ============================================================================

  /** Show navigation controls in the bottom right corner */
  controls?: boolean;

  /** Show progress bar at the bottom */
  progress?: boolean;

  /** Display slide numbers (true, false, 'c', 'c/t', 'h.v', 'h/v') */
  slideNumber?: boolean | string;

  /** Vertically center slide content */
  center?: boolean;

  /** Enable overview mode (press 'o') */
  overview?: boolean;
}

// ============================================================================
// PARSER CONTRACTS
// ============================================================================

/**
 * Front matter from markdown file
 */
export interface PresentationFrontMatter {
  title: string;
  theme: string;
  voice?: string;
  resolution?: string;

  /**
   * Optional config preset name
   * Available presets: 'video-recording', 'manual-presentation', 'auto-demo', 'speaker-mode'
   * Phase 2: Configuration Enhancement
   */
  preset?: string;

  /** Optional RevealJS configuration overrides (Phase 2: Now supports 60+ options) */
  config?: Partial<RevealJSConfig>;

  /**
   * Path to external custom CSS file (relative to presentation markdown file)
   * Phase 3: Custom CSS Injection
   * Example: './styles/custom.css'
   */
  customCSS?: string;

  /**
   * Inline custom CSS styles
   * Phase 3: Custom CSS Injection
   * Example: '.custom-highlight { color: #ff0; }'
   */
  customStyles?: string;
}

/**
 * Raw slide data before processing
 */
export interface RawSlideData {
  /** Slide index */
  index: number;

  /** Raw markdown content including directives */
  raw: string;

  /** Extracted directives */
  directives: Map<string, string>;

  /** Content after directive extraction */
  content: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if slide has audio
 */
export function hasAudio(slide: RevealSlide): slide is RevealSlide & { audio: AudioBlock } {
  return slide.audio !== null;
}

/**
 * Type guard to check if slide has playwright instructions
 */
export function hasPlaywright(slide: RevealSlide): slide is RevealSlide & { playwright: PlaywrightBlock } {
  return slide.playwright !== null;
}

/**
 * Type guard to check if slide has speaker notes
 */
export function hasSpeakerNotes(slide: RevealSlide): slide is RevealSlide & { notes: string } {
  return slide.notes !== null && slide.notes.length > 0;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default values for slide metadata
 */
export const DEFAULT_SLIDE_METADATA: SlideMetadata = {
  duration: null,
  pauseAfter: 1, // 1 second default pause after audio
  fragments: [],
};

/**
 * Default reveal.js configuration
 */
export const DEFAULT_REVEAL_CONFIG: RevealConfig = {
  autoSlide: 0, // Disabled - Playwright controls timing
  hash: true,
  history: true,
  fragments: true,
  fragmentInURL: true,
  transition: 'slide',
  transitionSpeed: 'default',
  autoPlayMedia: false,
  plugins: ['RevealMarkdown', 'RevealHighlight', 'RevealNotes'],

  // Phase 1: Core config options (sensible defaults)
  controls: true,
  progress: true,
  slideNumber: false,
  center: true,
  overview: true,
};

/**
 * Supported reveal.js transitions
 */
export const REVEAL_TRANSITIONS = [
  'none',
  'fade',
  'slide',
  'convex',
  'concave',
  'zoom',
] as const;

export type RevealTransition = typeof REVEAL_TRANSITIONS[number];

/**
 * Supported fragment effects
 */
export const FRAGMENT_EFFECTS = [
  'fade',
  'fade-out',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'grow',
  'shrink',
  'strike',
  'highlight-red',
  'highlight-green',
  'highlight-blue',
  'highlight-current-red',
  'highlight-current-green',
  'highlight-current-blue',
] as const;

export type FragmentEffect = typeof FRAGMENT_EFFECTS[number];
