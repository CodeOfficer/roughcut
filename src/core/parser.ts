import { readFile } from 'fs/promises';
import type { TutorialScript, TutorialSegment, ScreenshotMode } from './types.js';
import { logger } from './logger.js';

/**
 * Parse tutorial markdown script into structured data
 */
export class TutorialParser {
  /**
   * Parse a tutorial script from a file path
   */
  async parseFile(filePath: string): Promise<TutorialScript> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return this.parse(content);
    } catch (error) {
      logger.error('Failed to read tutorial script', error);
      throw new Error(`Failed to read tutorial script at ${filePath}`);
    }
  }

  /**
   * Parse tutorial script content
   */
  parse(content: string): TutorialScript {
    // Extract title (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (!titleMatch) {
      throw new Error('Tutorial script must have a title (# heading)');
    }
    const title = titleMatch[1].trim();

    // Split content into segments by ## headings
    const segments = this.extractSegments(content);

    if (segments.length === 0) {
      throw new Error('Tutorial script must have at least one segment (## heading)');
    }

    logger.debug(`Parsed tutorial: ${title} with ${segments.length} segments`);

    return {
      title,
      segments,
    };
  }

  /**
   * Extract all segments from the content
   */
  private extractSegments(content: string): TutorialSegment[] {
    // First, split by --- to get individual segment blocks
    const blocks = content.split(/\n---\n/).filter(block => block.trim());

    const segments: TutorialSegment[] = [];

    for (const block of blocks) {
      // Check if this block contains a ## heading
      const headingMatch = block.match(/^##\s+(.+)$/m);
      if (headingMatch) {
        const segmentTitle = headingMatch[1].trim();
        const segmentContent = block.substring(headingMatch.index! + headingMatch[0].length).trim();
        segments.push(this.parseSegment(segmentTitle, segmentContent, segments.length));
      }
    }

    return segments;
  }

  /**
   * Parse a single segment
   */
  private parseSegment(title: string, content: string, index: number): TutorialSegment {
    const id = `segment-${String(index + 1).padStart(3, '0')}`;

    // Extract metadata
    const duration = this.extractDuration(content);
    const screenshotMode = this.extractScreenshotMode(content);

    // Extract narration
    const narration = this.extractBlock(content, 'NARRATION');
    if (!narration) {
      throw new Error(`Segment "${title}" is missing [NARRATION] block`);
    }

    // Extract screenshot instructions based on mode
    const screenshot = this.extractScreenshotData(content, screenshotMode);

    logger.debug(`Parsed segment ${id}: ${title} (${duration}s, ${screenshotMode} mode)`);

    return {
      id,
      title,
      duration,
      narration: narration.trim(),
      screenshot,
    };
  }

  /**
   * Extract duration from metadata
   */
  private extractDuration(content: string): number {
    const match = content.match(/^>\s*Duration:\s*(\d+)s?$/m);
    if (!match) {
      throw new Error('Segment is missing duration metadata (> Duration: Xs)');
    }
    return parseInt(match[1], 10);
  }

  /**
   * Extract screenshot mode from metadata
   */
  private extractScreenshotMode(content: string): ScreenshotMode {
    const match = content.match(/^>\s*Screenshot:\s*(\w+)$/m);
    if (!match) {
      throw new Error('Segment is missing screenshot mode (> Screenshot: static|auto|none)');
    }

    const mode = match[1].toLowerCase();
    if (!['static', 'auto', 'none'].includes(mode)) {
      throw new Error(`Invalid screenshot mode: ${mode}. Must be static, auto, or none`);
    }

    return mode as ScreenshotMode;
  }

  /**
   * Extract screenshot data based on mode
   */
  private extractScreenshotData(content: string, mode: ScreenshotMode) {
    if (mode === 'static') {
      const prompt = this.extractBlock(content, 'IMAGE_PROMPT');
      if (!prompt) {
        throw new Error('Static screenshot mode requires [IMAGE_PROMPT] block');
      }
      return {
        mode: 'static' as const,
        geminiPrompt: prompt.trim(),
      };
    }

    if (mode === 'auto') {
      const instructions = this.extractBlock(content, 'PLAYWRIGHT_INSTRUCTIONS');
      if (!instructions) {
        throw new Error('Auto screenshot mode requires [PLAYWRIGHT_INSTRUCTIONS] block');
      }
      return {
        mode: 'auto' as const,
        playwrightInstructions: instructions.trim(),
      };
    }

    // mode === 'none'
    return {
      mode: 'none' as const,
    };
  }

  /**
   * Extract content between [TAG] and [/TAG] blocks
   */
  private extractBlock(content: string, tag: string): string | null {
    const pattern = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)\\s*\\[\\/${tag}\\]`, 'i');
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
  }
}

/**
 * Parse a tutorial script file
 */
export async function parseTutorialScript(filePath: string): Promise<TutorialScript> {
  const parser = new TutorialParser();
  return parser.parseFile(filePath);
}
