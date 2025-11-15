/**
 * Markdown parser for Option 3 format (Minimalist @directive: syntax)
 *
 * Parses markdown files with:
 * - Front matter (---\ntitle: ...\n---)
 * - Slide delimiter (---)
 * - @directive: syntax for metadata
 * - @audio: narration with [Xs] pauses
 * - @playwright: automation instructions
 * - @fragment markers with optional +Xs timing
 */

import type {
  RevealPresentation,
  RevealSlide,
  AudioBlock,
  AudioLine,
  PlaywrightBlock,
  PlaywrightInstruction,
  SlideMetadata,
  PauseMarker,
  FragmentDefinition,
  PresentationFrontMatter,
} from './types.js';
import { DEFAULT_SLIDE_METADATA } from './types.js';
import { resolveConfig } from './revealjs-config-schema.js';
import { validateConfig, validatePreset, formatValidationErrors } from '../validation/config-validator.js';

// ============================================================================
// MAIN PARSER CLASS
// ============================================================================

export class RevealMarkdownParser {
  /**
   * Parse a markdown file into a RevealPresentation structure
   */
  parse(markdown: string): RevealPresentation {
    // 1. Extract front matter
    const { frontMatter, content } = this.extractFrontMatter(markdown);

    // 2. Split into slides
    const slideStrings = this.splitIntoSlides(content);

    // 3. Parse each slide
    const slides: RevealSlide[] = slideStrings.map((slideMarkdown, index) =>
      this.parseSlide(slideMarkdown, index)
    );

    // 4. Build presentation
    const presentation: RevealPresentation = {
      title: frontMatter.title,
      theme: frontMatter.theme,
      resolution: frontMatter.resolution || '1920x1080',
      slides,
    };

    // Only set voice if it's defined (exactOptionalPropertyTypes requirement)
    if (frontMatter.voice) {
      presentation.voice = frontMatter.voice;
    }

    // Phase 2: Validate and resolve config with preset support
    if (frontMatter.preset || frontMatter.config) {
      // Validate preset if provided
      if (frontMatter.preset) {
        const presetValidation = validatePreset(frontMatter.preset);
        if (!presetValidation.valid) {
          throw new Error(formatValidationErrors(presetValidation.errors));
        }
      }

      // Validate config options if provided
      if (frontMatter.config) {
        const configValidation = validateConfig(frontMatter.config);
        if (!configValidation.valid) {
          throw new Error(formatValidationErrors(configValidation.errors));
        }
      }

      // Resolve final config (merges preset + user config + defaults)
      presentation.config = resolveConfig(frontMatter.config, frontMatter.preset);
    }

    return presentation;
  }

  // ============================================================================
  // FRONT MATTER EXTRACTION
  // ============================================================================

  /**
   * Extract YAML front matter from markdown
   * Format:
   * ---
   * title: "Presentation Title"
   * theme: dracula
   * voice: adam
   * resolution: 1920x1080
   * config:
   *   controls: true
   *   progress: false
   *   slideNumber: 'c/t'
   * ---
   */
  private extractFrontMatter(markdown: string): {
    frontMatter: PresentationFrontMatter;
    content: string;
  } {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = markdown.match(frontMatterRegex);

    if (!match || !match[1]) {
      throw new Error('Missing front matter. Format should start with:\n---\ntitle: "..."\n---');
    }

    const frontMatterText = match[1];
    const content = markdown.slice(match[0].length);

    // Parse front matter lines (with support for nested config)
    const lines = frontMatterText.split('\n');
    const frontMatter: Partial<PresentationFrontMatter> = {};
    let currentSection: string | null = null;

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Check if this is a nested section (e.g., "config:")
      if (line.match(/^[a-zA-Z]+:\s*$/) && line.startsWith('config:')) {
        currentSection = 'config';
        frontMatter.config = {};
        continue;
      }

      // Parse indented lines under config section
      if (currentSection === 'config' && line.match(/^\s+/)) {
        const [key, ...valueParts] = line.trim().split(':');
        if (key && valueParts.length > 0) {
          let value: string | boolean | number = valueParts.join(':').trim().replace(/^["']|["']$/g, '');

          // Parse boolean values
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          // Parse numbers
          else if (!isNaN(Number(value)) && value !== '') value = Number(value);

          (frontMatter.config as any)[key.trim()] = value;
        }
        continue;
      }

      // Reset section if we hit a non-indented line after a section
      if (currentSection && !line.match(/^\s+/)) {
        currentSection = null;
      }

      // Parse top-level key-value pairs
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0 && !currentSection) {
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        if (key.trim() !== 'config') {
          frontMatter[key.trim() as keyof PresentationFrontMatter] = value as any;
        }
      }
    }

    if (!frontMatter.title) {
      throw new Error('Front matter must include "title"');
    }
    if (!frontMatter.theme) {
      throw new Error('Front matter must include "theme"');
    }

    return {
      frontMatter: frontMatter as PresentationFrontMatter,
      content,
    };
  }

  // ============================================================================
  // SLIDE SPLITTING
  // ============================================================================

  /**
   * Split markdown into slides using --- delimiter
   * Must be on own line: \n---\n
   */
  private splitIntoSlides(content: string): string[] {
    // Split on --- with newlines before/after
    const slides = content.split(/\n---\n/);

    // Filter out empty slides
    return slides.filter((slide) => slide.trim().length > 0);
  }

  // ============================================================================
  // SLIDE PARSING
  // ============================================================================

  /**
   * Parse a single slide markdown into RevealSlide structure
   */
  parseSlide(slideMarkdown: string, index: number): RevealSlide {
    const id = `slide-${String(index + 1).padStart(3, '0')}`;

    // Extract directives
    const directives = this.extractDirectives(slideMarkdown);

    // Extract audio block
    const audio = this.extractAudioBlock(slideMarkdown);

    // Extract playwright block
    const playwright = this.extractPlaywrightBlock(slideMarkdown);

    // Extract speaker notes (Note: sections in markdown)
    const notes = this.extractNotes(slideMarkdown);

    // Parse metadata from directives
    const metadata = this.parseMetadata(directives);

    // Parse fragments from content
    const fragments = this.extractFragments(slideMarkdown);
    metadata.fragments = fragments;

    // Clean content of all directives
    const content = this.cleanContent(slideMarkdown);

    return {
      id,
      index,
      content,
      audio,
      playwright,
      notes,
      metadata,
    };
  }

  // ============================================================================
  // DIRECTIVE EXTRACTION
  // ============================================================================

  /**
   * Extract all @directive: value pairs from slide
   * Returns Map of directive name to value
   */
  private extractDirectives(markdown: string): Map<string, string> {
    const directives = new Map<string, string>();

    // Match @directive: value (single line only, not multi-line blocks)
    // Excludes @audio: and @playwright: which are multi-line
    const directiveRegex = /^@([\w-]+):\s*(.+)$/gm;

    let match;
    while ((match = directiveRegex.exec(markdown)) !== null) {
      const [, name, value] = match;

      // Skip audio and playwright (handled separately)
      if (name && value && name !== 'audio' && name !== 'playwright') {
        directives.set(name, value.trim());
      }
    }

    return directives;
  }

  /**
   * Parse metadata from extracted directives
   */
  private parseMetadata(directives: Map<string, string>): SlideMetadata {
    const metadata: SlideMetadata = { ...DEFAULT_SLIDE_METADATA };

    // @duration: 8s
    if (directives.has('duration')) {
      const duration = directives.get('duration')!;
      metadata.duration = this.parseDuration(duration);
    }

    // @pause-after: 2s
    if (directives.has('pause-after')) {
      const pauseAfter = directives.get('pause-after')!;
      metadata.pauseAfter = this.parseDuration(pauseAfter);
    }

    // @transition: zoom
    if (directives.has('transition')) {
      metadata.transition = directives.get('transition')!;
    }

    // @background: #1e1e1e
    if (directives.has('background')) {
      metadata.background = directives.get('background')!;
    }

    // @image-prompt: A futuristic data center
    if (directives.has('image-prompt')) {
      metadata.imagePrompt = directives.get('image-prompt')!;
    }

    return metadata;
  }

  /**
   * Parse duration string to seconds
   * Supports: "5s", "1.5s", "500ms"
   */
  private parseDuration(durationStr: string): number {
    const match = durationStr.match(/^([\d.]+)(s|ms)$/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid duration format: ${durationStr}. Use "5s" or "500ms"`);
    }

    const [, value, unit] = match;
    const num = parseFloat(value);

    return unit === 's' ? num : num / 1000;
  }

  // ============================================================================
  // AUDIO BLOCK EXTRACTION
  // ============================================================================

  /**
   * Extract @audio: block
   * Supports both single-line and multi-line formats:
   *
   * Single-line:
   *   @audio: Text here [2s] more text [3s] end.
   *
   * Multi-line (recommended):
   *   @audio: First sentence here.
   *   @audio: Second sentence here.
   *   @audio: Third sentence here.
   *
   * Multi-line format automatically inserts 1s pauses between lines.
   * You can still use [Xs] markers for custom pauses within lines.
   */
  private extractAudioBlock(markdown: string): AudioBlock | null {
    // Try to match multiple consecutive @audio: lines
    const multiLineRegex = /^@audio:\s*(.+)$/gm;
    const matches = Array.from(markdown.matchAll(multiLineRegex));

    if (matches.length === 0) {
      return null;
    }

    // Extract individual lines for fingerprinting
    const lines: AudioLine[] = matches
      .filter(match => match[1]) // Filter out undefined matches
      .map(match => ({
        text: match[1]!.trim(), // Non-null assertion since we filtered
      }));

    // Join lines with automatic 1s pauses
    const rawText = lines.map(line => line.text).join(' [1s] ');

    // Extract pause markers [Xs]
    const pauses: PauseMarker[] = [];
    let cleanText = rawText;

    const pauseRegex = /\[(\d+(?:\.\d+)?)s\]/g;
    let pauseMatch;

    while ((pauseMatch = pauseRegex.exec(rawText)) !== null) {
      if (!pauseMatch[1]) continue;
      const durationSeconds = parseFloat(pauseMatch[1]);

      // Position is where the pause marker was in clean text (before removal)
      // We need to track cumulative removals
      const markerStart = pauseMatch.index;
      const markerLength = pauseMatch[0].length;

      pauses.push({
        position: markerStart - (pauses.length * markerLength), // Adjust for previous removals
        durationSeconds,
      });
    }

    // Remove all pause markers from text
    cleanText = rawText.replace(/\[\d+(?:\.\d+)?s\]/g, '');

    return {
      rawText,
      cleanText: cleanText.trim(),
      expectedDuration: null,
      pauses,
      lines,
    };
  }

  // ============================================================================
  // PLAYWRIGHT BLOCK EXTRACTION
  // ============================================================================

  /**
   * Extract @playwright: block
   * Format:
   * @playwright:
   * - Action: Click button
   * - Wait 2s
   * - Type: "text" + Enter
   */
  private extractPlaywrightBlock(markdown: string): PlaywrightBlock | null {
    const playwrightRegex = /@playwright:\s*\n((?:- .+\n?)+)/m;
    const match = markdown.match(playwrightRegex);

    if (!match || !match[1]) {
      return null;
    }

    const blockText = match[1];
    const lines = blockText.split('\n').filter((line) => line.trim().startsWith('-'));

    const instructions: PlaywrightInstruction[] = lines.map((line) => {
      const content = line.trim().replace(/^-\s*/, '');
      return this.parsePlaywrightInstruction(content);
    });

    return {
      instructions,
    };
  }

  /**
   * Parse a single playwright instruction
   * Examples:
   * - "Action: Click button" -> { type: 'action', content: 'Click button' }
   * - "Wait 2s" -> { type: 'wait', content: '2s' }
   * - "Screenshot: name" -> { type: 'screenshot', content: 'name' }
   */
  private parsePlaywrightInstruction(line: string): PlaywrightInstruction {
    // Check for "Type: Value" format
    const colonMatch = line.match(/^(Action|Screenshot):\s*(.+)$/i);
    if (colonMatch && colonMatch[1] && colonMatch[2]) {
      const [, type, content] = colonMatch;
      return {
        type: type.toLowerCase() as 'action' | 'screenshot',
        content: content.trim(),
      };
    }

    // Check for "Wait Xs" format
    const waitMatch = line.match(/^Wait\s+(\d+(?:\.\d+)?s?)$/i);
    if (waitMatch && waitMatch[1]) {
      return {
        type: 'wait',
        content: waitMatch[1],
      };
    }

    // Default to action
    return {
      type: 'action',
      content: line,
    };
  }

  // ============================================================================
  // FRAGMENT EXTRACTION
  // ============================================================================

  /**
   * Extract @fragment markers from content
   * Format:
   * - Item 1 @fragment
   * - Item 2 @fragment +2s
   *
   * Note: Only matches @fragment on content lines (not directive lines starting with @)
   */
  private extractFragments(markdown: string): FragmentDefinition[] {
    const fragments: FragmentDefinition[] = [];
    const fragmentRegex = /(.+?)\s+@fragment(?:\s+\+(\d+(?:\.\d+)?)s)?/g;

    let match;
    let index = 0;

    while ((match = fragmentRegex.exec(markdown)) !== null) {
      const [, content, timingOffset] = match;

      if (!content) continue;

      // Skip if this is a directive line (starts with @)
      // This prevents matching "@fragment" when it appears in @audio: or other directives
      const trimmedContent = content.trim();
      if (trimmedContent.startsWith('@')) {
        continue;
      }

      const fragment: FragmentDefinition = {
        index,
        effect: 'fade', // Default effect
        content: trimmedContent,
      };

      if (timingOffset) {
        fragment.timingOffset = parseFloat(timingOffset);
      }

      fragments.push(fragment);
      index++;
    }

    return fragments;
  }

  // ============================================================================
  // SPEAKER NOTES EXTRACTION
  // ============================================================================

  /**
   * Extract speaker notes (not implemented in Option 3 format yet)
   * Could be added as @notes: directive if needed
   */
  private extractNotes(markdown: string): string | null {
    // Option 3 format doesn't have explicit notes syntax yet
    // Could add: @notes: Speaker notes here
    const notesRegex = /^@notes:\s*(.+)$/m;
    const match = markdown.match(notesRegex);

    return match && match[1] ? match[1].trim() : null;
  }

  // ============================================================================
  // CONTENT CLEANING
  // ============================================================================

  /**
   * Clean content by removing all @directive lines
   * Preserves markdown content for reveal.js
   */
  private cleanContent(markdown: string): string {
    let cleaned = markdown;

    // Remove all @directive: lines (single line directives)
    cleaned = cleaned.replace(/^@[\w-]+:.+$/gm, '');

    // Remove @audio: block
    cleaned = cleaned.replace(/^@audio:.+$/gm, '');

    // Remove @playwright: block (multi-line)
    cleaned = cleaned.replace(/@playwright:\s*\n(?:- .+\n?)+/gm, '');

    // Remove @fragment markers from content
    cleaned = cleaned.replace(/\s+@fragment(?:\s+\+\d+(?:\.\d+)?s)?/g, '');

    // Remove extra blank lines (more than 2 consecutive)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace
    return cleaned.trim();
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new parser instance
 */
export function createRevealParser(): RevealMarkdownParser {
  return new RevealMarkdownParser();
}
