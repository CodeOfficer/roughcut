/**
 * Linting error types and formatting utilities
 * Provides detailed, actionable error messages with line numbers and examples
 */

import type { DirectiveDefinition } from './directive-registry.js';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
}

/**
 * Error category for classification
 */
export enum ErrorCategory {
  FRONTMATTER = 'frontmatter',
  UNKNOWN_DIRECTIVE = 'unknown_directive',
  INVALID_SYNTAX = 'invalid_syntax',
  INVALID_VALUE = 'invalid_value',
  MISSING_REQUIRED = 'missing_required',
  STRUCTURAL = 'structural',
  PAUSE_MARKER = 'pause_marker',
}

/**
 * Linting error with location and context
 */
export class LintingError {
  /** Error severity */
  severity: ErrorSeverity;

  /** Error category */
  category: ErrorCategory;

  /** Error message */
  message: string;

  /** Line number where error occurred */
  line: number;

  /** Column number (optional) */
  column?: number;

  /** Current (incorrect) value */
  currentValue?: string;

  /** Expected value or format */
  expectedValue?: string;

  /** Example of correct usage */
  example?: string;

  /** Suggestions for fixing */
  suggestions?: string[];

  constructor(
    severity: ErrorSeverity,
    category: ErrorCategory,
    message: string,
    line: number,
    options?: {
      column?: number;
      currentValue?: string;
      expectedValue?: string;
      example?: string;
      suggestions?: string[];
    }
  ) {
    this.severity = severity;
    this.category = category;
    this.message = message;
    this.line = line;
    if (options?.column !== undefined) {
      this.column = options.column;
    }
    if (options?.currentValue !== undefined) {
      this.currentValue = options.currentValue;
    }
    if (options?.expectedValue !== undefined) {
      this.expectedValue = options.expectedValue;
    }
    if (options?.example !== undefined) {
      this.example = options.example;
    }
    if (options?.suggestions !== undefined) {
      this.suggestions = options.suggestions;
    }
  }

  /**
   * Format error as human-readable string
   */
  toString(filePath?: string): string {
    const parts: string[] = [];

    // Header: [ERROR] file.md:12:5
    const location = filePath ? `${filePath}:${this.line}` : `line ${this.line}`;
    const locationWithColumn =
      this.column !== undefined ? `${location}:${this.column}` : location;
    parts.push(`[${this.severity.toUpperCase()}] ${locationWithColumn}`);

    // Message
    parts.push(`  ${this.message}`);

    // Current value
    if (this.currentValue !== undefined) {
      parts.push(`  Current: ${this.currentValue}`);
    }

    // Expected value
    if (this.expectedValue !== undefined) {
      parts.push(`  Expected: ${this.expectedValue}`);
    }

    // Example
    if (this.example !== undefined) {
      parts.push(`  Example: ${this.example}`);
    }

    // Suggestions
    if (this.suggestions && this.suggestions.length > 0) {
      parts.push(`  Suggestions:`);
      for (const suggestion of this.suggestions) {
        parts.push(`    - ${suggestion}`);
      }
    }

    return parts.join('\n');
  }
}

/**
 * Collection of linting errors
 */
export class LintingResult {
  /** File path being linted */
  filePath: string;

  /** All errors found */
  errors: LintingError[];

  /** All warnings found */
  warnings: LintingError[];

  constructor(filePath: string) {
    this.filePath = filePath;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Add an error
   */
  addError(error: LintingError): void {
    if (error.severity === ErrorSeverity.ERROR) {
      this.errors.push(error);
    } else {
      this.warnings.push(error);
    }
  }

  /**
   * Check if linting passed (no errors)
   */
  get passed(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Get total count of issues
   */
  get totalIssues(): number {
    return this.errors.length + this.warnings.length;
  }

  /**
   * Format all errors as string
   */
  toString(): string {
    const parts: string[] = [];

    parts.push('='.repeat(80));
    parts.push('MARKDOWN LINTING ERRORS');
    parts.push('='.repeat(80));
    parts.push('');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      parts.push('✓ No issues found');
      return parts.join('\n');
    }

    // Errors
    if (this.errors.length > 0) {
      parts.push(`Found ${this.errors.length} error${this.errors.length > 1 ? 's' : ''}:`);
      parts.push('');
      for (const error of this.errors) {
        parts.push(error.toString(this.filePath));
        parts.push('');
      }
    }

    // Warnings
    if (this.warnings.length > 0) {
      parts.push(`Found ${this.warnings.length} warning${this.warnings.length > 1 ? 's' : ''}:`);
      parts.push('');
      for (const warning of this.warnings) {
        parts.push(warning.toString(this.filePath));
        parts.push('');
      }
    }

    parts.push('='.repeat(80));
    parts.push('');
    parts.push('Build cannot proceed until all errors are fixed.');
    parts.push('See docs/LINTING_SPEC.md for complete specification.');
    parts.push('');

    return parts.join('\n');
  }
}

/**
 * Error factory functions for common error types
 */
export const ErrorFactories = {
  /**
   * Missing required frontmatter field
   */
  missingRequiredFrontmatter(
    field: string,
    line: number,
    directive: DirectiveDefinition
  ): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.MISSING_REQUIRED,
      `Missing required frontmatter field: "${field}"`,
      line,
      {
        expectedValue: directive.description,
        example: directive.example,
      }
    );
  },

  /**
   * Unknown directive
   */
  unknownDirective(
    directiveName: string,
    line: number,
    similarNames: string[]
  ): LintingError {
    const suggestions: string[] = [];

    if (similarNames.length > 0) {
      suggestions.push(`Did you mean: @${similarNames[0]}?`);
    }

    suggestions.push('See docs/LINTING_SPEC.md for all supported directives');

    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.UNKNOWN_DIRECTIVE,
      `Unknown directive: @${directiveName}`,
      line,
      {
        currentValue: `@${directiveName}`,
        suggestions,
      }
    );
  },

  /**
   * Invalid directive syntax
   */
  invalidSyntax(
    directiveName: string,
    line: number,
    expected: string,
    example: string
  ): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.INVALID_SYNTAX,
      `Invalid syntax for @${directiveName}`,
      line,
      {
        expectedValue: expected,
        example,
      }
    );
  },

  /**
   * Invalid directive value
   */
  invalidValue(
    directiveName: string,
    value: string,
    line: number,
    error: string,
    directive: DirectiveDefinition
  ): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.INVALID_VALUE,
      `Invalid value for @${directiveName}: ${error}`,
      line,
      {
        currentValue: value,
        example: directive.example,
      }
    );
  },

  /**
   * Invalid pause marker
   */
  invalidPauseMarker(marker: string, line: number, error: string): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.PAUSE_MARKER,
      `Invalid pause marker: ${error}`,
      line,
      {
        currentValue: marker,
        expectedValue: 'Use [1s], [2s], [2.5s], etc.',
        example: '@audio: Text here [2s] more text [1s] end.',
      }
    );
  },

  /**
   * Pause marker outside @audio block
   */
  pauseMarkerOutsideAudio(marker: string, line: number): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.PAUSE_MARKER,
      'Pause markers [Xs] can only be used inside @audio: blocks',
      line,
      {
        currentValue: marker,
        suggestions: [
          'Move pause marker inside an @audio: block',
          'Remove pause marker if not needed',
        ],
      }
    );
  },

  /**
   * Empty slide content
   */
  emptySlide(slideNumber: number, line: number): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.STRUCTURAL,
      `Slide ${slideNumber} has no content (only directives)`,
      line,
      {
        suggestions: [
          'Add markdown content to the slide',
          'Remove empty slide if not needed',
        ],
      }
    );
  },

  /**
   * Empty audio block
   */
  emptyAudioBlock(line: number): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.STRUCTURAL,
      'Empty @audio: block (no text provided)',
      line,
      {
        example: '@audio: Your narration text here',
        suggestions: ['Add narration text after @audio:', 'Remove @audio: if not needed'],
      }
    );
  },

  /**
   * Missing frontmatter
   */
  missingFrontmatter(line: number): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.FRONTMATTER,
      'Missing frontmatter block at start of file',
      line,
      {
        example: '---\ntitle: "My Presentation"\ntheme: dracula\n---',
        suggestions: [
          'Add frontmatter block at the beginning of the file',
          'Frontmatter must include: title, theme',
        ],
      }
    );
  },

  /**
   * Invalid frontmatter format
   */
  invalidFrontmatterFormat(line: number, reason: string): LintingError {
    return new LintingError(
      ErrorSeverity.ERROR,
      ErrorCategory.FRONTMATTER,
      `Invalid frontmatter format: ${reason}`,
      line,
      {
        example: '---\ntitle: "My Presentation"\ntheme: dracula\n---',
      }
    );
  },
};
