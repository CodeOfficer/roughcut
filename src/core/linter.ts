/**
 * Markdown Linting Engine
 * Validates markdown presentations against directive registry before build
 */

import {
  DirectiveContext,
  DirectiveFormat,
  getDirectiveDefinition,
  getRequiredDirectives,
  validateDirectiveValue,
  findSimilarDirectives,
  validatePauseMarker,
  DIRECTIVE_REGISTRY,
} from './directive-registry.js';
import {
  LintingResult,
  LintingError,
  ErrorSeverity,
  ErrorCategory,
  ErrorFactories,
} from './linting-errors.js';

/**
 * Markdown linting engine
 */
export class MarkdownLinter {
  /**
   * Lint a markdown file
   */
  lint(markdown: string, filePath: string): LintingResult {
    const result = new LintingResult(filePath);
    const lines = markdown.split('\n');

    // Parse and validate frontmatter
    const frontmatterEnd = this.validateFrontmatter(lines, result);
    if (frontmatterEnd === -1) {
      // Fatal error - no frontmatter
      return result;
    }

    // Split into slides and validate each
    this.validateSlides(lines, frontmatterEnd, result);

    return result;
  }

  /**
   * Validate frontmatter block
   * Returns line number where frontmatter ends, or -1 if missing
   */
  private validateFrontmatter(lines: string[], result: LintingResult): number {
    // Check for opening ---
    const firstLine = lines[0];
    if (lines.length === 0 || !firstLine || firstLine.trim() !== '---') {
      result.addError(ErrorFactories.missingFrontmatter(1));
      return -1;
    }

    // Find closing ---
    let endLine = -1;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim() === '---') {
        endLine = i;
        break;
      }
    }

    if (endLine === -1) {
      result.addError(
        ErrorFactories.invalidFrontmatterFormat(1, 'Missing closing "---"')
      );
      return -1;
    }

    // Parse frontmatter fields
    const frontmatterLines = lines.slice(1, endLine);
    const foundFields = new Set<string>();

    for (let i = 0; i < frontmatterLines.length; i++) {
      const line = frontmatterLines[i];
      if (!line) continue;

      const lineNumber = i + 2; // +1 for array index, +1 for opening ---

      // Skip empty lines and comments
      if (line.trim().length === 0 || line.trim().startsWith('#')) {
        continue;
      }

      // Parse field: value
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (!match || !match[1] || !match[2]) {
        result.addError(
          new LintingError(
            ErrorSeverity.ERROR,
            ErrorCategory.FRONTMATTER,
            'Invalid frontmatter line format',
            lineNumber,
            {
              currentValue: line,
              expectedValue: 'field: value',
              example: 'title: "My Presentation"',
            }
          )
        );
        continue;
      }

      const fieldName = match[1];
      const fieldValue = match[2].replace(/^["']|["']$/g, '').trim(); // Remove quotes

      // Check if field is known
      const directive = getDirectiveDefinition(fieldName, DirectiveContext.FRONTMATTER);

      if (!directive) {
        // Unknown frontmatter field
        const similar = findSimilarDirectives(fieldName, DirectiveContext.FRONTMATTER);
        result.addError(ErrorFactories.unknownDirective(fieldName, lineNumber, similar));
        continue;
      }

      // Validate value
      const validation = validateDirectiveValue(directive, fieldValue);
      if (!validation.valid && validation.error) {
        result.addError(
          ErrorFactories.invalidValue(fieldName, fieldValue, lineNumber, validation.error, directive)
        );
      }

      foundFields.add(fieldName);
    }

    // Check for required fields
    const requiredDirectives = getRequiredDirectives(DirectiveContext.FRONTMATTER);
    for (const directive of requiredDirectives) {
      if (!foundFields.has(directive.name)) {
        result.addError(
          ErrorFactories.missingRequiredFrontmatter(directive.name, 1, directive)
        );
      }
    }

    return endLine;
  }

  /**
   * Validate all slides
   */
  private validateSlides(
    lines: string[],
    startLine: number,
    result: LintingResult
  ): void {
    // Split content into slides (separated by ---)
    const slideStarts: number[] = [startLine + 1]; // First slide starts after frontmatter

    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim() === '---') {
        slideStarts.push(i + 1);
      }
    }

    // Validate each slide
    for (let i = 0; i < slideStarts.length; i++) {
      const slideStartLine = slideStarts[i];
      const nextSlideStart = slideStarts[i + 1];
      if (slideStartLine === undefined) continue;

      const slideEndLine = nextSlideStart !== undefined ? nextSlideStart - 2 : lines.length;
      const slideLines = lines.slice(slideStartLine, slideEndLine + 1);

      this.validateSlide(slideLines, slideStartLine, i + 1, result);
    }
  }

  /**
   * Validate a single slide
   */
  private validateSlide(
    lines: string[],
    startLineNumber: number,
    slideNumber: number,
    result: LintingResult
  ): void {
    const foundDirectives = new Set<string>();
    let hasContent = false;
    let inAudioBlock = false;
    let audioBlockStartLine = -1;
    let audioBlockLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const lineNumber = startLineNumber + i;

      // Skip empty lines
      if (line.trim().length === 0) {
        continue;
      }

      // Check for directives
      const directiveMatch = line.match(/^@([\w-]+):\s*(.*)$/);

      if (directiveMatch && directiveMatch[1] && directiveMatch[2] !== undefined) {
        const directiveName = directiveMatch[1];
        const directiveValue = directiveMatch[2].trim();

        // Special handling for @audio (multi-line)
        if (directiveName === 'audio') {
          inAudioBlock = true;
          if (audioBlockStartLine === -1) {
            audioBlockStartLine = lineNumber;
          }
          audioBlockLines.push(directiveValue);
          foundDirectives.add(directiveName);
          continue;
        }

        // End audio block if we hit another directive
        if (inAudioBlock) {
          this.validateAudioBlock(audioBlockLines, audioBlockStartLine, result);
          inAudioBlock = false;
          audioBlockStartLine = -1;
          audioBlockLines = [];
        }

        // Check if directive is known
        const directive = getDirectiveDefinition(directiveName, DirectiveContext.SLIDE);

        if (!directive) {
          const similar = findSimilarDirectives(directiveName, DirectiveContext.SLIDE);
          result.addError(ErrorFactories.unknownDirective(directiveName, lineNumber, similar));
          continue;
        }

        // Validate single-line directive has value
        if (directive.format === DirectiveFormat.SINGLE_LINE && directiveValue.length === 0) {
          result.addError(
            ErrorFactories.invalidSyntax(
              directiveName,
              lineNumber,
              `@${directiveName}: value`,
              directive.example
            )
          );
          continue;
        }

        // Validate value
        const validation = validateDirectiveValue(directive, directiveValue);
        if (!validation.valid && validation.error) {
          result.addError(
            ErrorFactories.invalidValue(
              directiveName,
              directiveValue,
              lineNumber,
              validation.error,
              directive
            )
          );
        }

        foundDirectives.add(directiveName);
      } else {
        // End audio block if we hit non-directive content
        if (inAudioBlock) {
          this.validateAudioBlock(audioBlockLines, audioBlockStartLine, result);
          inAudioBlock = false;
          audioBlockStartLine = -1;
          audioBlockLines = [];
        }

        // Check for pause markers outside @audio blocks
        const pauseMarkers = line.match(/\[(\d+(?:\.\d+)?)s\]/g);
        if (pauseMarkers) {
          for (const marker of pauseMarkers) {
            result.addError(ErrorFactories.pauseMarkerOutsideAudio(marker, lineNumber));
          }
        }

        // Check for inline @fragment directives
        if (line.includes('@fragment')) {
          // Must be on list items
          if (!line.trim().match(/^[-*+]\s+.*@fragment/)) {
            result.addError(
              new LintingError(
                ErrorSeverity.ERROR,
                ErrorCategory.INVALID_SYNTAX,
                '@fragment can only be used on list items',
                lineNumber,
                {
                  currentValue: line.trim(),
                  example: '- Item text @fragment',
                }
              )
            );
          }
        }

        // This line has actual content
        hasContent = true;
      }
    }

    // Validate final audio block if still open
    if (inAudioBlock) {
      this.validateAudioBlock(audioBlockLines, audioBlockStartLine, result);
    }

    // Check if slide has content
    if (!hasContent) {
      result.addError(ErrorFactories.emptySlide(slideNumber, startLineNumber));
    }
  }

  /**
   * Validate @audio block
   */
  private validateAudioBlock(
    lines: string[],
    startLineNumber: number,
    result: LintingResult
  ): void {
    // Combine all lines
    const fullText = lines.join(' ').trim();

    if (fullText.length === 0) {
      result.addError(ErrorFactories.emptyAudioBlock(startLineNumber));
      return;
    }

    // Check for any bracket patterns that might be pause markers
    // Match any [...] pattern to validate
    const allBrackets = fullText.match(/\[[^\]]+\]/g);
    if (allBrackets) {
      for (const bracket of allBrackets) {
        // Only validate if it looks like a pause marker (contains digits)
        if (/\d/.test(bracket)) {
          const validation = validatePauseMarker(bracket);
          if (!validation.valid && validation.error) {
            result.addError(
              ErrorFactories.invalidPauseMarker(bracket, startLineNumber, validation.error)
            );
          }
        }
      }
    }
  }
}

/**
 * Create a new markdown linter
 */
export function createMarkdownLinter(): MarkdownLinter {
  return new MarkdownLinter();
}

/**
 * Convenience function to lint a markdown file
 */
export function lintMarkdown(markdown: string, filePath: string): LintingResult {
  const linter = createMarkdownLinter();
  return linter.lint(markdown, filePath);
}

/**
 * Get a summary of all supported directives (for documentation)
 */
export function getDirectiveSummary(): string {
  const lines: string[] = [];

  lines.push('# Supported Directives');
  lines.push('');

  // Group by context
  const contexts = [
    DirectiveContext.FRONTMATTER,
    DirectiveContext.SLIDE,
    DirectiveContext.INLINE,
  ];

  for (const context of contexts) {
    const directives = DIRECTIVE_REGISTRY.filter((d) => d.context === context);

    lines.push(`## ${context.toUpperCase()}`);
    lines.push('');

    for (const directive of directives) {
      const requiredBadge = directive.required ? ' (REQUIRED)' : '';
      lines.push(`### @${directive.name}${requiredBadge}`);
      lines.push('');
      lines.push(`**Description:** ${directive.description}`);
      lines.push('');
      lines.push(`**Format:** ${directive.format}`);
      lines.push('');
      lines.push(`**Example:**`);
      lines.push('```');
      lines.push(directive.example);
      lines.push('```');
      lines.push('');

      if (directive.notes) {
        lines.push(`**Notes:** ${directive.notes}`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}
