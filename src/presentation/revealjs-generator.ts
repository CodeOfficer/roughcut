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

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  RevealPresentation,
  RevealSlide,
  RevealConfig,
} from '../core/types.js';
import { DEFAULT_REVEAL_CONFIG } from '../core/types.js';
import type { BundledAssets } from './revealjs-assets.js';
import { createRevealAssetBundler, getDefaultRevealJsPath } from './revealjs-assets.js';

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
    } = {}
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
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Generate HTML string with direct paths (useful for testing)
   */
  generateHTML(presentation: RevealPresentation, revealJsPath: string): string {
    const config = DEFAULT_REVEAL_CONFIG;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(presentation.title)}</title>

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="${revealJsPath}/dist/reveal.css">
  <link rel="stylesheet" href="${revealJsPath}/dist/theme/${presentation.theme}.css">

  <!-- Syntax highlighting -->
  <link rel="stylesheet" href="${revealJsPath}/plugin/highlight/monokai.css">

  <style>
    /* Custom styles */
    .reveal {
      font-size: 2em;
    }
    .reveal h1 {
      font-size: 2.5em;
    }
    .reveal h2 {
      font-size: 2em;
    }
    .reveal h3 {
      font-size: 1.5em;
    }
  </style>
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
  generateHTMLWithBundledAssets(presentation: RevealPresentation, assets: BundledAssets): string {
    const config = DEFAULT_REVEAL_CONFIG;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(presentation.title)}</title>

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="${assets.revealCss}">
  <link rel="stylesheet" href="${assets.themeCss}">

  <!-- Syntax highlighting -->
  <link rel="stylesheet" href="${assets.highlightCss}">

  <style>
    /* Custom styles */
    .reveal {
      font-size: 2em;
    }
    .reveal h1 {
      font-size: 2.5em;
    }
    .reveal h2 {
      font-size: 2em;
    }
    .reveal h3 {
      font-size: 1.5em;
    }
  </style>
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
   */
  private generateSlides(slides: RevealSlide[]): string {
    return slides.map((slide) => this.generateSlide(slide)).join('\n');
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
    attrs.push('data-markdown');

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
        slide.metadata.background.startsWith('#') ||
        slide.metadata.background.startsWith('rgb')
      ) {
        attrs.push(`data-background-color="${slide.metadata.background}"`);
      } else if (
        slide.metadata.background.includes('linear-gradient') ||
        slide.metadata.background.includes('radial-gradient')
      ) {
        // Use generic data-background for gradients
        attrs.push(`data-background="${slide.metadata.background}"`);
      } else {
        // Assume it's an image URL
        attrs.push(`data-background-image="${slide.metadata.background}"`);
      }
    }

    // Auto-animate
    if (slide.metadata.autoAnimate) {
      attrs.push('data-auto-animate');
    }

    return attrs.join(' ');
  }

  /**
   * Generate slide content (markdown)
   */
  private generateSlideContent(slide: RevealSlide): string {
    let content = slide.content;

    // If slide has fragments, inject RevealJS fragment directives
    if (slide.metadata.fragments && slide.metadata.fragments.length > 0) {
      content = this.injectFragmentDirectives(content, slide.metadata.fragments);
    }

    return content;
  }

  /**
   * Inject RevealJS fragment directives into markdown content
   * Converts @fragment markers to HTML comment syntax for RevealJS
   */
  private injectFragmentDirectives(content: string, fragments: Array<{ index: number; content: string; effect?: string }>): string {
    let result = content;

    // Process fragments in reverse order to avoid offset issues
    for (let i = fragments.length - 1; i >= 0; i--) {
      const fragment = fragments[i];
      if (!fragment) continue;

      const fragmentContent = fragment.content.trim();

      // Find the line containing this fragment's content
      const lines = result.split('\n');
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        if (!line) continue;

        // Match the fragment content (trimmed for flexibility)
        if (line.trim() === fragmentContent) {
          // Append RevealJS fragment directive as HTML comment
          const effect = fragment.effect || 'fade';
          const directive = ` <!-- .element: class="fragment ${effect}-in" data-fragment-index="${fragment.index}" -->`;
          lines[lineIndex] = line + directive;
          break;
        }
      }

      result = lines.join('\n');
    }

    return result;
  }

  /**
   * Generate speaker notes
   */
  private generateSpeakerNotes(slide: RevealSlide): string {
    if (!slide.notes) {
      return '';
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
  private generateConfig(config: RevealConfig): string {
    return `{
      autoSlide: ${config.autoSlide},
      hash: ${config.hash},
      history: ${config.history},
      fragments: ${config.fragments},
      fragmentInURL: ${config.fragmentInURL},
      transition: '${config.transition}',
      transitionSpeed: '${config.transitionSpeed}',
      autoPlayMedia: ${config.autoPlayMedia},
      plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
    }`;
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
    return './node_modules/reveal.js';
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return text.replace(/[&<>"']/g, (char) => map[char] || char);
  }

  /**
   * Indent content by specified number of spaces
   */
  private indentContent(content: string, spaces: number): string {
    const indent = ' '.repeat(spaces);
    return content
      .split('\n')
      .map((line) => (line.trim() ? indent + line : ''))
      .join('\n');
  }

  /**
   * Generate audio controller JavaScript for interactive playback
   */
  private generateAudioControllerScript(): string {
    return `  <script>
    // Audio controller for interactive presentation
    (function() {
      let currentAudio = null;

      // Load and play audio for a slide
      function playSlideAudio(slide) {
        // Stop any currently playing audio
        stopCurrentAudio();

        // Get audio path from data attribute
        const audioPath = slide.dataset.audio;
        if (!audioPath) {
          return; // No audio for this slide
        }

        // Create and play audio element
        currentAudio = new Audio(audioPath);
        currentAudio.play().catch(err => {
          console.warn('Audio autoplay failed:', err);
          // Browser may block autoplay - this is expected
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

      // Listen for slide changes
      Reveal.on('slidechanged', event => {
        playSlideAudio(event.currentSlide);
      });

      // Listen for fragment changes (optional: could restart audio or continue)
      Reveal.on('fragmentshown', event => {
        // Currently: do nothing, let audio continue
        // Alternative: could restart audio or sync with fragment timing
      });

      // Play audio for initial slide after reveal is ready
      Reveal.on('ready', event => {
        playSlideAudio(event.currentSlide);
      });

      // Expose audio controller globally for dev mode
      window.revealAudioController = {
        play: () => playSlideAudio(Reveal.getCurrentSlide()),
        stop: stopCurrentAudio,
        getCurrentAudio: () => currentAudio
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

  /** Custom reveal.js config (optional, uses defaults if not provided) */
  config?: Partial<RevealConfig>;
}
