/**
 * Complete RevealJS Configuration Schema
 *
 * Based on RevealJS documentation: revealjs-docs/docs/19-config-options.md
 * Phase 2 of RevealJS Best Practices Migration
 *
 * This file defines all 60+ RevealJS configuration options and provides
 * config presets for common use cases (video recording, manual presentation, etc.)
 */

/**
 * Complete RevealJS configuration interface
 * All options are optional and will default to RevealJS defaults if not specified
 */
export interface RevealJSConfig {
  // ============================================================================
  // DISPLAY & CONTROLS
  // ============================================================================

  /**
   * Display presentation control arrows
   * - true: Display controls on all screens
   * - false: Hide controls on all screens
   * - "speaker-only": Only display controls in the speaker view
   */
  controls?: boolean | 'speaker-only';

  /** Help the user learn the controls by providing hints */
  controlsTutorial?: boolean;

  /** Determines where controls appear */
  controlsLayout?: 'bottom-right' | 'edges';

  /** Visibility rule for backwards navigation arrows */
  controlsBackArrows?: 'faded' | 'hidden' | 'visible';

  /** Display a presentation progress bar */
  progress?: boolean;

  /**
   * Display the page number of the current slide
   * - false: No slide numbers
   * - true: Show slide numbers
   * - "h.v": Horizontal . vertical slide number (default)
   * - "h/v": Horizontal / vertical slide number
   * - "c": Flattened slide number
   * - "c/t": Flattened slide number / total slides
   */
  slideNumber?: boolean | 'h.v' | 'h/v' | 'c' | 'c/t';

  /**
   * Can be used to limit the contexts in which the slide number appears
   * - "all": Always show the slide number
   * - "print": Only when printing to PDF
   * - "speaker": Only in the speaker view
   */
  showSlideNumber?: 'all' | 'print' | 'speaker';

  // ============================================================================
  // NAVIGATION & KEYBOARD
  // ============================================================================

  /** Use 1 based indexing for # links to match slide number */
  hashOneBasedIndex?: boolean;

  /** Add the current slide number to the URL hash */
  hash?: boolean;

  /** Flags if we should monitor the hash and change slides accordingly */
  respondToHashChanges?: boolean;

  /** Enable support for jump-to-slide navigation shortcuts */
  jumpToSlide?: boolean;

  /** Push each slide change to the browser history */
  history?: boolean;

  /** Enable keyboard shortcuts for navigation */
  keyboard?: boolean;

  /**
   * Optional function that blocks keyboard events when returning false
   * If you set this to 'focused', we will only capture keyboard events
   * for embedded decks when they are in focus
   */
  keyboardCondition?: null | 'focused';

  /** Disables the default reveal.js slide layout (scaling and centering) */
  disableLayout?: boolean;

  /** Enable the slide overview mode */
  overview?: boolean;

  /** Vertical centering of slides */
  center?: boolean;

  /** Enables touch navigation on devices with touch input */
  touch?: boolean;

  /** Loop the presentation */
  loop?: boolean;

  /** Change the presentation direction to be RTL */
  rtl?: boolean;

  /**
   * Changes the behavior of our navigation directions
   * - "default": Left/right arrows step horizontal, up/down step vertical
   * - "linear": Removes up/down arrows, left/right step through all
   * - "grid": When stepping left/right from a vertical stack to adjacent
   *           vertical stack, land at same vertical index
   */
  navigationMode?: 'default' | 'linear' | 'grid';

  /** Randomizes the order of slides each time the presentation loads */
  shuffle?: boolean;

  // ============================================================================
  // FRAGMENTS
  // ============================================================================

  /** Turns fragments on and off globally */
  fragments?: boolean;

  /** Flags whether to include the current fragment in the URL */
  fragmentInURL?: boolean;

  // ============================================================================
  // EMBEDDED & HELP
  // ============================================================================

  /** Flags if the presentation is running in an embedded mode */
  embedded?: boolean;

  /** Flags if we should show a help overlay when the question-mark key is pressed */
  help?: boolean;

  /** Flags if it should be possible to pause the presentation (blackout) */
  pause?: boolean;

  /** Flags if speaker notes should be visible to all viewers */
  showNotes?: boolean;

  // ============================================================================
  // MEDIA & IFRAMES
  // ============================================================================

  /**
   * Global override for autoplaying embedded media (video/audio/iframe)
   * - null: Media will only autoplay if data-autoplay is present
   * - true: All media will autoplay, regardless of individual setting
   * - false: No media will autoplay, regardless of individual setting
   */
  autoPlayMedia?: boolean | null;

  /**
   * Global override for preloading lazy-loaded iframes
   * - null: Iframes with data-src AND data-preload will be loaded when within
   *         the viewDistance, iframes with only data-src will be loaded when visible
   * - true: All iframes with data-src will be loaded when within the viewDistance
   * - false: All iframes with data-src will be loaded only when visible
   */
  preloadIframes?: boolean | null;

  // ============================================================================
  // AUTO-ANIMATE
  // ============================================================================

  /** Can be used to globally disable auto-animation */
  autoAnimate?: boolean;

  /** Optionally provide a custom element matcher for auto-animation */
  autoAnimateMatcher?: null | ((fromElement: Element, toElement: Element) => boolean);

  /** Default settings for auto-animate transitions */
  autoAnimateEasing?: string;
  autoAnimateDuration?: number;
  autoAnimateUnmatched?: boolean;

  /**
   * CSS properties that can be auto-animated
   * Default includes: opacity, color, background-color, padding, font-size, etc.
   */
  autoAnimateStyles?: string[];

  // ============================================================================
  // AUTO-SLIDE (TIMING)
  // ============================================================================

  /**
   * Controls automatic progression to the next slide
   * - 0: Auto-sliding only happens if the data-autoslide HTML attribute
   *      is present on the current slide or fragment
   * - 1+: All slides will progress automatically at the given interval (ms)
   * - false: No auto-sliding, even if data-autoslide is present
   */
  autoSlide?: number | false;

  /** Stop auto-sliding after user input */
  autoSlideStoppable?: boolean;

  /** Use this method for navigation when auto-sliding */
  autoSlideMethod?: null | (() => void);

  /**
   * Specify the average time in seconds that you think you will spend
   * presenting each slide (used for speaker view pacing timer)
   */
  defaultTiming?: number | null;

  // ============================================================================
  // MOUSE & INTERACTION
  // ============================================================================

  /** Enable slide navigation via mouse wheel */
  mouseWheel?: boolean;

  /** Opens links in an iframe preview overlay */
  previewLinks?: boolean;

  /** Exposes the reveal.js API through window.postMessage */
  postMessage?: boolean;

  /** Dispatches all reveal.js events to the parent window through postMessage */
  postMessageEvents?: boolean;

  /** Focuses body when page changes visibility to ensure keyboard shortcuts work */
  focusBodyOnPageVisibilityChange?: boolean;

  // ============================================================================
  // TRANSITIONS
  // ============================================================================

  /** Transition style between slides */
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';

  /** Transition speed */
  transitionSpeed?: 'default' | 'fast' | 'slow';

  /** Transition style for full page slide backgrounds */
  backgroundTransition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';

  // ============================================================================
  // PDF EXPORT
  // ============================================================================

  /** The maximum number of pages a single slide can expand onto when printing to PDF */
  pdfMaxPagesPerSlide?: number;

  /** Prints each fragment on a separate slide */
  pdfSeparateFragments?: boolean;

  /** Offset used to reduce the height of content within exported PDF pages */
  pdfPageHeightOffset?: number;

  // ============================================================================
  // VIEWPORT & PERFORMANCE
  // ============================================================================

  /** Number of slides away from the current that are visible */
  viewDistance?: number;

  /** Number of slides away from the current that are visible on mobile devices */
  mobileViewDistance?: number;

  /** The display mode that will be used to show slides */
  display?: string;

  // ============================================================================
  // CURSOR
  // ============================================================================

  /** Hide cursor if inactive */
  hideInactiveCursor?: boolean;

  /** Time before the cursor is hidden (in ms) */
  hideCursorTime?: number;

  // ============================================================================
  // PRESENTATION SIZE (additional options not in base config)
  // ============================================================================

  /** Presentation width (pixels) */
  width?: number;

  /** Presentation height (pixels) */
  height?: number;

  /** Factor of the display size that should remain empty around the content */
  margin?: number;

  /** Bounds for smallest/largest possible scale to apply to content */
  minScale?: number;
  maxScale?: number;
}

/**
 * Config presets for common use cases
 * These provide sensible defaults for different modes
 */
export const CONFIG_PRESETS: Record<string, Partial<RevealJSConfig>> = {
  /**
   * VIDEO RECORDING MODE
   * Optimized for Playwright-driven video recording
   * - Disables all interactive controls
   * - Maximizes viewport for pre-rendering
   * - Prevents user interaction from interrupting recording
   */
  'video-recording': {
    controls: false,
    progress: false,
    slideNumber: false,
    keyboard: false,
    overview: false,
    touch: false,
    help: false,
    center: true,
    loop: false,
    fragments: true,
    fragmentInURL: false,
    autoSlide: 0, // Use per-slide data-autoslide
    autoSlideStoppable: false,
    pause: false,
    mouseWheel: false,
    shuffle: false,
    viewDistance: 999, // Pre-render all slides for smooth recording
    mobileViewDistance: 999,
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    hash: false,
    history: false,
    embedded: true,
  },

  /**
   * MANUAL PRESENTATION MODE
   * Optimized for live presentations with full user control
   * - Enables all navigation controls
   * - Shows progress indicators
   * - Allows keyboard/mouse navigation
   */
  'manual-presentation': {
    controls: true,
    progress: true,
    slideNumber: 'c/t',
    keyboard: true,
    overview: true,
    touch: true,
    help: true,
    center: true,
    loop: false,
    fragments: true,
    fragmentInURL: true,
    autoSlide: 0,
    autoSlideStoppable: true,
    pause: true,
    mouseWheel: true,
    hash: true,
    history: true,
    transition: 'slide',
    transitionSpeed: 'default',
  },

  /**
   * AUTO DEMO MODE
   * Optimized for dev:auto testing (visible browser automation)
   * - Disables user controls (automation-driven)
   * - Shows progress for visibility
   * - Useful for debugging timing and sync
   */
  'auto-demo': {
    controls: false,
    progress: true,
    slideNumber: false,
    keyboard: false,
    overview: false,
    touch: false,
    help: false,
    center: true,
    loop: false,
    fragments: true,
    fragmentInURL: false,
    autoSlide: 0,
    pause: false,
    mouseWheel: false,
    transition: 'slide',
    transitionSpeed: 'default',
  },

  /**
   * SPEAKER MODE
   * Optimized for speaker notes view
   * - Enables all controls
   * - Shows slide numbers in speaker view
   * - Full keyboard navigation
   */
  'speaker-mode': {
    controls: true,
    progress: true,
    slideNumber: 'c/t',
    showSlideNumber: 'speaker',
    keyboard: true,
    overview: true,
    touch: true,
    help: true,
    center: true,
    loop: false,
    fragments: true,
    fragmentInURL: true,
    autoSlide: 0,
    pause: true,
    hash: true,
    history: true,
  },
};

/**
 * Default RevealJS configuration
 * These are the baseline defaults used when no config is specified
 */
export const DEFAULT_REVEAL_CONFIG: Partial<RevealJSConfig> = {
  autoSlide: 0,
  hash: true,
  history: true,
  fragments: true,
  fragmentInURL: false,
  transition: 'slide',
  transitionSpeed: 'default',
  autoPlayMedia: false,
  controls: true,
  progress: true,
  slideNumber: false,
  center: true,
  overview: true,
};

/**
 * Resolve and merge configuration from multiple sources
 * Priority order (highest to lowest):
 * 1. User config (from frontmatter)
 * 2. Preset config (if preset specified)
 * 3. Default config
 *
 * @param userConfig - User-specified config from frontmatter
 * @param preset - Optional preset name to apply
 * @returns Merged configuration object
 */
export function resolveConfig(
  userConfig?: Partial<RevealJSConfig>,
  preset?: string
): RevealJSConfig {
  // Start with default config
  let config = { ...DEFAULT_REVEAL_CONFIG };

  // Apply preset if specified
  if (preset && CONFIG_PRESETS[preset]) {
    config = {
      ...config,
      ...CONFIG_PRESETS[preset],
    };
  }

  // Apply user config (highest priority)
  if (userConfig) {
    config = {
      ...config,
      ...userConfig,
    };
  }

  return config;
}

/**
 * Get list of all available preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(CONFIG_PRESETS);
}

/**
 * Validate that a preset name exists
 */
export function isValidPreset(preset: string): boolean {
  return preset in CONFIG_PRESETS;
}
