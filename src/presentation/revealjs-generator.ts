/**
 * HTML generator for reveal.js presentations
 *
 * Generates standalone HTML files with:
 * - Embedded reveal.js and plugins
 * - Slide sections with data attributes
 * - Markdown content
 * - Theme styling
 * - Speaker notes
 */

import * as fs from "fs/promises";
import * as path from "path";
import type {
  RevealPresentation,
  RevealSlide,
  RevealConfig,
} from "../core/types.js";
import { DEFAULT_REVEAL_CONFIG } from "../core/types.js";
import type { RevealJSConfig } from "../core/revealjs-config-schema.js";
import type { BundledAssets } from "./revealjs-assets.js";
import {
  createRevealAssetBundler,
  getDefaultRevealJsPath,
} from "./revealjs-assets.js";

// ============================================================================
// FAVICON
// ============================================================================

/** Inline SVG favicon — movie reel icon for Roughcut branding */
export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#1a1a2e" stroke="#667eea" stroke-width="2"/>
  <circle cx="32" cy="32" r="12" fill="none" stroke="#667eea" stroke-width="2"/>
  <circle cx="32" cy="32" r="4" fill="#667eea"/>
  <circle cx="32" cy="10" r="5" fill="none" stroke="#667eea" stroke-width="2"/>
  <circle cx="32" cy="54" r="5" fill="none" stroke="#667eea" stroke-width="2"/>
  <circle cx="10" cy="32" r="5" fill="none" stroke="#667eea" stroke-width="2"/>
  <circle cx="54" cy="32" r="5" fill="none" stroke="#667eea" stroke-width="2"/>
</svg>`;

const FAVICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;

// ============================================================================
// GENERATOR CLASS
// ============================================================================

export class RevealHTMLGenerator {
  /**
   * Generate standalone HTML presentation with optional asset bundling
   *
   * @param presentation - Parsed presentation data
   * @param outputPath - Path where HTML file will be written
   * @param options - Generation options
   */
  async generate(
    presentation: RevealPresentation,
    outputPath: string,
    options: {
      revealJsPath?: string;
      bundleAssets?: boolean;
    } = {},
  ): Promise<void> {
    const { revealJsPath, bundleAssets = false } = options;

    // Determine output directory
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    let html: string;

    if (bundleAssets) {
      // Bundle assets and use bundled paths
      const sourcePath = revealJsPath || getDefaultRevealJsPath();
      const bundler = createRevealAssetBundler();

      const bundledAssets = await bundler.bundle({
        revealJsSourcePath: sourcePath,
        outputDir,
        theme: presentation.theme,
      });

      html = this.generateHTMLWithBundledAssets(presentation, bundledAssets);
    } else {
      // Use direct paths to node_modules
      const revealPath = revealJsPath || this.detectRevealJsPath();
      html = this.generateHTML(presentation, revealPath);
    }

    // Write HTML file
    await fs.writeFile(outputPath, html, "utf-8");
  }

  /**
   * Generate HTML string with direct paths (useful for testing)
   */
  generateHTML(presentation: RevealPresentation, revealJsPath: string): string {
    // Merge user config with defaults (user config overrides defaults)
    // Phase 2: Now supports comprehensive RevealJSConfig with 60+ options
    const config = Object.assign(
      {},
      DEFAULT_REVEAL_CONFIG,
      presentation.config,
    ) as RevealConfig & RevealJSConfig;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(presentation.title)}</title>
  <link rel="icon" href="${FAVICON_DATA_URI}">

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="${revealJsPath}/dist/reveal.css">
  <link rel="stylesheet" href="${revealJsPath}/dist/theme/${presentation.theme}.css">

  <!-- Syntax highlighting -->
  <link rel="stylesheet" href="${revealJsPath}/plugin/highlight/monokai.css">

  <style>
    /* Phase 1: Removed hardcoded font sizes - using theme CSS variables instead */
    /* Themes define: --r-main-font-size, --r-heading1-size, --r-heading2-size, --r-heading3-size */
  </style>

  <!-- Phase 3: Custom CSS Injection -->
${this.generateCustomCSSIncludes(presentation)}
</head>
<body>
  <div class="reveal">
    <div class="slides">
${this.generateSlides(presentation.slides)}
    </div>
  </div>

  <!-- Reveal.js and plugins -->
  <script src="${revealJsPath}/dist/reveal.js"></script>
  <script src="${revealJsPath}/plugin/markdown/markdown.js"></script>
  <script src="${revealJsPath}/plugin/highlight/highlight.js"></script>
  <script src="${revealJsPath}/plugin/notes/notes.js"></script>

  <script>
    // Initialize reveal.js
    Reveal.initialize(${this.generateConfig(config)});
  </script>

${this.generateAudioControllerScript()}
</body>
</html>`;
  }

  /**
   * Generate HTML string with bundled assets (standalone mode)
   */
  generateHTMLWithBundledAssets(
    presentation: RevealPresentation,
    assets: BundledAssets,
  ): string {
    // Merge user config with defaults (user config overrides defaults)
    // Phase 2: Now supports comprehensive RevealJSConfig with 60+ options
    const config = Object.assign(
      {},
      DEFAULT_REVEAL_CONFIG,
      presentation.config,
    ) as RevealConfig & RevealJSConfig;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(presentation.title)}</title>
  <link rel="icon" href="${FAVICON_DATA_URI}">

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="${assets.revealCss}">
  <link rel="stylesheet" href="${assets.themeCss}">

  <!-- Syntax highlighting -->
  <link rel="stylesheet" href="${assets.highlightCss}">

  <style>
    /* Phase 1: Removed hardcoded font sizes - using theme CSS variables instead */
    /* Themes define: --r-main-font-size, --r-heading1-size, --r-heading2-size, --r-heading3-size */
  </style>

  <!-- Phase 3: Custom CSS Injection -->
${this.generateCustomCSSIncludes(presentation)}
</head>
<body>
  <div class="reveal">
    <div class="slides">
${this.generateSlides(presentation.slides)}
    </div>
  </div>

  <!-- Reveal.js and plugins -->
  <script src="${assets.revealJs}"></script>
  <script src="${assets.markdownPlugin}"></script>
  <script src="${assets.highlightPlugin}"></script>
  <script src="${assets.notesPlugin}"></script>

  <script>
    // Initialize reveal.js
    Reveal.initialize(${this.generateConfig(config)});
  </script>

${this.generateAudioControllerScript()}
</body>
</html>`;
  }

  // ============================================================================
  // SLIDE GENERATION
  // ============================================================================

  /**
   * Generate all slide sections
   * Phase 3: Now supports vertical slides with nested <section> elements
   */
  private generateSlides(slides: RevealSlide[]): string {
    const groups = this.groupSlidesByVertical(slides);

    return groups
      .map((group) => {
        if (group.length === 1) {
          // Single slide (horizontal)
          return this.generateSlide(group[0]!);
        } else {
          // Vertical slide group (nested sections)
          const verticalSlides = group
            .map((slide) => this.generateSlide(slide))
            .join("\n");
          return `      <section>\n${verticalSlides}\n      </section>`;
        }
      })
      .join("\n");
  }

  /**
   * Group slides into arrays based on vertical groups
   * Phase 3: Supports 2D navigation
   *
   * Example:
   *   Input: [H1, V1, V2, H2, V3] (H=horizontal, V=vertical)
   *   Output: [[H1, V1, V2], [H2, V3]]
   */
  private groupSlidesByVertical(slides: RevealSlide[]): RevealSlide[][] {
    const groups: RevealSlide[][] = [];
    let currentGroup: RevealSlide[] = [];

    for (const slide of slides) {
      if (slide.isVertical) {
        // Vertical slide: add to current group
        currentGroup.push(slide);
      } else {
        // Horizontal slide: start new group
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        currentGroup.push(slide);
      }
    }

    // Push remaining group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Generate a single slide section
   */
  private generateSlide(slide: RevealSlide): string {
    const dataAttrs = this.generateDataAttributes(slide);
    const content = this.generateSlideContent(slide);
    const notes = this.generateSpeakerNotes(slide);

    // Use data-markdown for markdown content
    // Reveal.js will parse this automatically
    return `      <section ${dataAttrs}>
        <textarea data-template>
${this.indentContent(content, 10)}
        </textarea>
${notes}
      </section>`;
  }

  /**
   * Generate data attributes for slide section
   */
  private generateDataAttributes(slide: RevealSlide): string {
    const attrs: string[] = [];

    // Slide ID
    attrs.push(`id="${slide.id}"`);

    // Markdown attribute
    attrs.push("data-markdown");

    // Audio path (relative to HTML file)
    if (slide.audio) {
      // Construct audio path from slide ID (e.g., slide-001 -> slide-001.mp3)
      const audioFilename = `${slide.id}.mp3`;
      attrs.push(`data-audio="../audio/${audioFilename}"`);
    }

    // Transition
    if (slide.metadata.transition) {
      attrs.push(`data-transition="${slide.metadata.transition}"`);
    }

    // Background
    if (slide.metadata.background) {
      // Check if it's a color, gradient, or image
      if (
        slide.metadata.background.startsWith("#") ||
        slide.metadata.background.startsWith("rgb")
      ) {
        attrs.push(`data-background-color="${slide.metadata.background}"`);
      } else if (
        slide.metadata.background.includes("linear-gradient") ||
        slide.metadata.background.includes("radial-gradient") ||
        slide.metadata.background.includes("conic-gradient")
      ) {
        attrs.push(`data-background-gradient="${slide.metadata.background}"`);
      } else {
        // Assume it's an image URL
        attrs.push(`data-background-image="${slide.metadata.background}"`);
      }
    }

    // Phase 3: Video background
    if (slide.metadata.backgroundVideo) {
      attrs.push(`data-background-video="${slide.metadata.backgroundVideo}"`);

      // Video loop
      if (slide.metadata.backgroundVideoLoop !== undefined) {
        attrs.push(
          `data-background-video-loop="${slide.metadata.backgroundVideoLoop}"`,
        );
      }

      // Video muted
      if (slide.metadata.backgroundVideoMuted !== undefined) {
        attrs.push(
          `data-background-video-muted="${slide.metadata.backgroundVideoMuted}"`,
        );
      }
    }

    // Auto-animate
    if (slide.metadata.autoAnimate) {
      attrs.push("data-auto-animate");
    }

    return attrs.join(" ");
  }

  /**
   * Generate slide content (markdown)
   */
  private generateSlideContent(slide: RevealSlide): string {
    let content = slide.content;

    // If slide has fragments, inject RevealJS fragment directives
    if (slide.metadata.fragments && slide.metadata.fragments.length > 0) {
      content = this.injectFragmentDirectives(
        content,
        slide.metadata.fragments,
      );
    }

    return content;
  }

  /**
   * Inject RevealJS fragment directives into markdown content
   * Converts @fragment markers to HTML comment syntax for RevealJS
   */
  private injectFragmentDirectives(
    content: string,
    fragments: Array<{ index: number; content: string; effect?: string }>,
  ): string {
    let result = content;

    // Process fragments in reverse order to avoid offset issues
    for (let i = fragments.length - 1; i >= 0; i--) {
      const fragment = fragments[i];
      if (!fragment) continue;

      const fragmentContent = fragment.content.trim();

      // Find the line containing this fragment's content
      const lines = result.split("\n");
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        if (!line) continue;

        // Match the fragment content (trimmed for flexibility)
        if (line.trim() === fragmentContent) {
          // Append RevealJS fragment directive as HTML comment
          const effect = fragment.effect || "fade";
          const directive = ` <!-- .element: class="fragment ${effect}-in" data-fragment-index="${fragment.index}" -->`;
          lines[lineIndex] = line + directive;
          break;
        }
      }

      result = lines.join("\n");
    }

    return result;
  }

  /**
   * Generate speaker notes
   */
  private generateSpeakerNotes(slide: RevealSlide): string {
    if (!slide.notes) {
      return "";
    }

    return `        <aside class="notes">
${this.indentContent(slide.notes, 10)}
        </aside>`;
  }

  // ============================================================================
  // CONFIG GENERATION
  // ============================================================================

  /**
   * Generate reveal.js config object as JavaScript
   */
  private generateConfig(config: RevealConfig | RevealJSConfig): string {
    // Build config options array
    const options: string[] = [
      // Presentation sizing (ensure content fits viewport)
      `width: ${config.width ?? 1200}`,
      `height: ${config.height ?? 900}`,
      `margin: ${config.margin ?? 0.1}`,
      `minScale: ${config.minScale ?? 0.2}`,
      `maxScale: ${config.maxScale ?? 1.5}`,

      // Core behavior
      `autoSlide: ${config.autoSlide}`,
      `hash: ${config.hash}`,
      `history: ${config.history}`,
      `fragments: ${config.fragments}`,
      `fragmentInURL: ${config.fragmentInURL}`,
      `transition: '${config.transition}'`,
      `transitionSpeed: '${config.transitionSpeed}'`,
      `autoPlayMedia: ${config.autoPlayMedia}`,
      `plugins: [RevealMarkdown, RevealHighlight, RevealNotes]`,
    ];

    // Add Phase 1 core config options if defined
    if (config.controls !== undefined) {
      options.push(`controls: ${config.controls}`);
    }
    if (config.progress !== undefined) {
      options.push(`progress: ${config.progress}`);
    }
    if (config.slideNumber !== undefined) {
      // Handle both boolean and string values for slideNumber
      const slideNumberValue =
        typeof config.slideNumber === "string"
          ? `'${config.slideNumber}'`
          : config.slideNumber;
      options.push(`slideNumber: ${slideNumberValue}`);
    }
    if (config.center !== undefined) {
      options.push(`center: ${config.center}`);
    }
    if (config.overview !== undefined) {
      options.push(`overview: ${config.overview}`);
    }
    if ("help" in config && config.help !== undefined) {
      options.push(`help: ${config.help}`);
    }
    if ("keyboard" in config && config.keyboard !== undefined) {
      options.push(`keyboard: ${config.keyboard}`);
    }

    return `{\n      ${options.join(",\n      ")}\n    }`;
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Detect reveal.js path in node_modules
   */
  private detectRevealJsPath(): string {
    // Default to relative node_modules path
    // In production, this should be customizable
    return "./node_modules/reveal.js";
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return text.replace(/[&<>"']/g, (char) => map[char] || char);
  }

  /**
   * Generate custom CSS includes (Phase 3: Custom CSS Injection)
   * Supports both external CSS files and inline styles
   */
  private generateCustomCSSIncludes(presentation: RevealPresentation): string {
    const includes: string[] = [];

    // External CSS file
    if (presentation.customCSS) {
      includes.push(
        `  <link rel="stylesheet" href="${presentation.customCSS}">`,
      );
    }

    // Inline styles
    if (presentation.customStyles) {
      includes.push("  <style>");
      includes.push("    /* Custom user styles */");
      // Indent each line of custom styles
      const indentedStyles = presentation.customStyles
        .split("\n")
        .map((line) => (line.trim() ? `    ${line}` : ""))
        .join("\n");
      includes.push(indentedStyles);
      includes.push("  </style>");
    }

    return includes.length > 0 ? includes.join("\n") : "";
  }

  /**
   * Indent content by specified number of spaces
   */
  private indentContent(content: string, spaces: number): string {
    const indent = " ".repeat(spaces);
    return content
      .split("\n")
      .map((line) => (line.trim() ? indent + line : ""))
      .join("\n");
  }

  /**
   * Generate audio controller JavaScript for interactive playback
   */
  private generateAudioControllerScript(): string {
    return `  <script>
    // Audio controller for interactive presentation
    (function() {
      const startTime = performance.now();
      const logWithTime = (msg) => {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        console.log(\`[\${elapsed}s] \${msg}\`);
      };

      logWithTime('🎬 Audio controller initializing...');

      let currentAudio = null;
      let audioEnabled = false;
      let isPaused = false;
      let wasAutoSliding = false;

      // Enable audio on first user interaction
      function enableAudio() {
        if (!audioEnabled) {
          audioEnabled = true;
          logWithTime('✅ Audio enabled - narration will play on slide changes');
          playSlideAudio(Reveal.getCurrentSlide());
        }
      }

      // Check for autoplay parameter (used in dev:auto mode)
      const urlParams = new URLSearchParams(window.location.search);
      const autoplay = urlParams.get('autoplay') === 'true';
      if (autoplay) {
        logWithTime('🎵 Autoplay enabled - audio will start automatically');
        enableAudio();
      }

      // Toggle pause/resume for audio and auto-slide
      function togglePause() {
        if (isPaused) {
          // Resume
          isPaused = false;
          logWithTime('▶️  Resumed - continuing playback');

          // Resume audio if we have one
          if (currentAudio && currentAudio.paused && currentAudio.currentTime > 0) {
            currentAudio.play().then(() => {
              logWithTime('🔊 Audio resumed');
            }).catch(err => {
              logWithTime(\`⚠️ Audio resume failed: \${err.message}\`);
            });
          }

          // Resume auto-slide if it was running before pause
          if (wasAutoSliding) {
            Reveal.configure({ autoSlide: Reveal.getConfig().autoSlide || 5000 });
            logWithTime('⏩ Auto-slide resumed');
          }

          // Update pause indicator
          updatePauseIndicator(false);
        } else {
          // Pause
          isPaused = true;
          logWithTime('⏸️  Paused - press Space to resume');

          // Pause audio (but don't reset position)
          if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            logWithTime(\`🔇 Audio paused at \${currentAudio.currentTime.toFixed(2)}s\`);
          }

          // Check if auto-slide is active and pause it
          const config = Reveal.getConfig();
          wasAutoSliding = config.autoSlide > 0;
          if (wasAutoSliding) {
            Reveal.configure({ autoSlide: 0 });
            logWithTime('⏹️  Auto-slide paused');
          }

          // Update pause indicator
          updatePauseIndicator(true);
        }

        return isPaused;
      }

      // Create and update pause indicator overlay
      function updatePauseIndicator(show) {
        let indicator = document.getElementById('pause-indicator');

        if (show) {
          if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pause-indicator';
            indicator.innerHTML = '⏸️ PAUSED <span style="font-size: 14px; opacity: 0.8;">(Press Space to resume)</span>';
            indicator.style.cssText = \`
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.85);
              color: #fff;
              padding: 12px 24px;
              border-radius: 8px;
              font-family: system-ui, sans-serif;
              font-size: 18px;
              font-weight: bold;
              z-index: 10001;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              animation: fadeIn 0.2s ease;
            \`;
            document.body.appendChild(indicator);

            // Add animation keyframes if not already present
            if (!document.getElementById('pause-indicator-styles')) {
              const style = document.createElement('style');
              style.id = 'pause-indicator-styles';
              style.textContent = \`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                  to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes fadeOut {
                  from { opacity: 1; transform: translateX(-50%) translateY(0); }
                  to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                }
              \`;
              document.head.appendChild(style);
            }
          }
          indicator.style.display = 'block';
          indicator.style.animation = 'fadeIn 0.2s ease';
        } else if (indicator) {
          indicator.style.animation = 'fadeOut 0.2s ease';
          setTimeout(() => {
            if (indicator) indicator.style.display = 'none';
          }, 200);
        }
      }

      // Load and play audio for a slide
      function playSlideAudio(slide) {
        logWithTime(\`🎵 playSlideAudio called (audioEnabled=\${audioEnabled}, slide=\${slide?.id})\`);

        // If paused, don't start new audio
        if (isPaused) {
          logWithTime('🔇 Skipping audio - presentation is paused');
          return;
        }

        // Stop any currently playing audio
        stopCurrentAudio();

        // Get audio path from data attribute
        const audioPath = slide.dataset.audio;
        logWithTime(\`🎵 audioPath=\${audioPath}\`);
        if (!audioPath) {
          logWithTime('🔇 No audio path for this slide');
          return; // No audio for this slide
        }

        // Don't try to play if audio not enabled yet (prevents autoplay errors)
        if (!audioEnabled) {
          logWithTime('🔇 Audio not enabled yet - click anywhere to start');
          return;
        }

        // Create and play audio element
        logWithTime(\`🎵 Creating Audio object for: \${audioPath}\`);
        const audioStartTime = performance.now();
        currentAudio = new Audio(audioPath);
        currentAudio.preload = 'auto'; // Preload for faster playback

        logWithTime(\`🎵 Calling audio.play()...\`);
        currentAudio.play().then(() => {
          const loadTime = ((performance.now() - audioStartTime) / 1000).toFixed(2);
          logWithTime(\`🔊 Audio playing (loaded in \${loadTime}s)\`);
        }).catch(err => {
          // Ignore AbortError (happens when navigating quickly)
          if (err.name === 'AbortError') {
            logWithTime('🔇 Audio aborted (navigation)');
            return;
          }
          logWithTime(\`⚠️ Audio playback failed: \${err.message}\`);
        });
      }

      // Stop currently playing audio
      function stopCurrentAudio() {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio = null;
        }
      }

      // Log user interactions
      document.addEventListener('click', (e) => {
        const target = e.target.tagName || 'unknown';
        logWithTime(\`👆 User clicked: \${target}\`);
      });

      document.addEventListener('keydown', (e) => {
        logWithTime(\`⌨️  User pressed: \${e.key}\`);
      });

      // Enable audio on any user interaction (except spacebar which has its own handler)
      document.addEventListener('click', enableAudio, { once: true });

      // Listen for slide changes
      Reveal.on('slidechanged', event => {
        const slideNum = event.indexh + 1;
        const slideId = event.currentSlide.id || 'unknown';
        logWithTime(\`📍 Slide changed: #\${slideNum} (\${slideId})\`);
        playSlideAudio(event.currentSlide);
      });

      // Listen for fragment changes
      Reveal.on('fragmentshown', event => {
        const fragmentIndex = event.fragment.dataset.fragmentIndex || 'unknown';
        logWithTime(\`✨ Fragment shown: index \${fragmentIndex}\`);
        // Currently: do nothing, let audio continue
        // Alternative: could restart audio or sync with fragment timing
      });

      Reveal.on('fragmenthidden', event => {
        const fragmentIndex = event.fragment.dataset.fragmentIndex || 'unknown';
        logWithTime(\`💨 Fragment hidden: index \${fragmentIndex}\`);
      });

      // Try to play audio for initial slide after reveal is ready
      Reveal.on('ready', event => {
        logWithTime('✅ Presentation ready - click anywhere to enable audio, Space to pause/resume');
        playSlideAudio(event.currentSlide);
      });

      // Register Space as a custom hotkey so it appears in the ? help overlay
      Reveal.addKeyBinding(
        { keyCode: 32, key: 'SPACE', description: 'Pause / Resume narration' },
        function(e) {
          e.preventDefault();
          if (!audioEnabled) {
            enableAudio();
            return;
          }
          togglePause();
        }
      );

      // Expose audio controller globally for dev mode
      window.revealAudioController = {
        play: () => playSlideAudio(Reveal.getCurrentSlide()),
        stop: stopCurrentAudio,
        getCurrentAudio: () => currentAudio,
        enable: enableAudio,
        togglePause: togglePause,
        isPaused: () => isPaused
      };
    })();
  </script>`;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new HTML generator instance
 */
export function createRevealHTMLGenerator(): RevealHTMLGenerator {
  return new RevealHTMLGenerator();
}

// ============================================================================
// OPTIONS INTERFACE
// ============================================================================

/**
 * Options for HTML generation
 */
export interface GenerateHTMLOptions {
  /** Output file path */
  outputPath: string;

  /** Custom reveal.js path (optional, will auto-detect if not provided) */
  revealJsPath?: string;

  /** Custom reveal.js config (optional, uses defaults if not provided - Phase 2: supports 60+ options) */
  config?: Partial<RevealConfig | RevealJSConfig>;
}
