/**
 * Comprehensive test suite for markdown linter
 * Tests all validation rules and error cases
 */

import { describe, it, expect } from 'vitest';
import { lintMarkdown } from '../linter.js';
import { ErrorCategory } from '../linting-errors.js';

describe('MarkdownLinter', () => {
  // ==========================================================================
  // FRONTMATTER VALIDATION
  // ==========================================================================

  describe('Frontmatter Validation', () => {
    it('should pass with valid minimal frontmatter', () => {
      const markdown = `---
title: "Test Presentation"
theme: dracula
---

# Slide 1

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should error on missing frontmatter', () => {
      const markdown = `# Slide 1

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.category).toBe(ErrorCategory.FRONTMATTER);
      expect(result.errors[0]?.message).toContain('Missing frontmatter');
    });

    it('should error on missing closing --- in frontmatter', () => {
      const markdown = `---
title: "Test"
theme: dracula

# Slide 1`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.message).toContain('Missing closing "---"');
    });

    it('should error on missing required title field', () => {
      const markdown = `---
theme: dracula
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      const titleError = result.errors.find(e => e.message.includes('title'));
      expect(titleError).toBeDefined();
      expect(titleError?.category).toBe(ErrorCategory.MISSING_REQUIRED);
    });

    it('should error on missing required theme field', () => {
      const markdown = `---
title: "Test"
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      const themeError = result.errors.find(e => e.message.includes('theme'));
      expect(themeError).toBeDefined();
      expect(themeError?.category).toBe(ErrorCategory.MISSING_REQUIRED);
    });

    it('should error on invalid frontmatter line format', () => {
      const markdown = `---
title: "Test"
theme: dracula
invalid line without colon
---

# Slide 1`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid frontmatter line format'))).toBe(true);
    });

    it('should error on unknown frontmatter field', () => {
      const markdown = `---
title: "Test"
theme: dracula
unknownField: "value"
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      const unknownError = result.errors.find(e => e.message.includes('Unknown directive: @unknownField'));
      expect(unknownError).toBeDefined();
      expect(unknownError?.category).toBe(ErrorCategory.UNKNOWN_DIRECTIVE);
    });

    it('should suggest similar field names for typos', () => {
      const markdown = `---
title: "Test"
thme: dracula
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      const typoError = result.errors.find(e => e.message.includes('thme'));
      expect(typoError?.suggestions).toBeDefined();
      expect(typoError?.suggestions?.[0]).toContain('theme');
    });

    it('should error on invalid theme value', () => {
      const markdown = `---
title: "Test"
theme: invalid-theme-name
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      const themeError = result.errors.find(e => e.message.includes('Invalid value for @theme'));
      expect(themeError).toBeDefined();
      expect(themeError?.message).toContain('Valid options:');
    });

    it('should accept all valid theme values', () => {
      const validThemes = ['black', 'white', 'league', 'beige', 'sky', 'night', 'serif', 'simple', 'solarized', 'blood', 'moon', 'dracula'];

      for (const theme of validThemes) {
        const markdown = `---
title: "Test"
theme: ${theme}
---

# Slide 1

Content.`;

        const result = lintMarkdown(markdown, 'test.md');
        expect(result.passed).toBe(true);
      }
    });

    it('should error on invalid resolution format', () => {
      const markdown = `---
title: "Test"
theme: dracula
resolution: invalid
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid resolution format'))).toBe(true);
    });

    it('should error on resolution too small', () => {
      const markdown = `---
title: "Test"
theme: dracula
resolution: 320x240
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Resolution too small'))).toBe(true);
    });

    it('should accept valid resolution', () => {
      const markdown = `---
title: "Test"
theme: dracula
resolution: 1920x1080
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept valid voice ID', () => {
      const markdown = `---
title: "Test"
theme: dracula
voice: adam
---

# Slide 1

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });
  });

  // ==========================================================================
  // SLIDE DIRECTIVES
  // ==========================================================================

  describe('Slide Directive Validation', () => {
    it('should accept valid @duration directive', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration: 5s

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept duration with milliseconds', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration: 500ms

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept duration with decimals', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration: 2.5s

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should error on invalid duration format', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration: 5 seconds

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid duration format'))).toBe(true);
    });

    it('should error on unknown directive', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@unknownDirective: value

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.category).toBe(ErrorCategory.UNKNOWN_DIRECTIVE);
    });

    it('should suggest similar directive names for typos', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duraton: 5s

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      const typoError = result.errors.find(e => e.message.includes('duraton'));
      expect(typoError?.suggestions?.[0]).toContain('duration');
    });

    it('should accept valid transition values', () => {
      const validTransitions = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];

      for (const transition of validTransitions) {
        const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@transition: ${transition}

Content here.`;

        const result = lintMarkdown(markdown, 'test.md');
        expect(result.passed).toBe(true);
      }
    });

    it('should error on invalid transition value', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@transition: invalid-transition

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid value for @transition'))).toBe(true);
    });

    it('should accept valid hex color backgrounds', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@background: #1e1e1e

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept rgb color backgrounds', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@background: rgb(30, 30, 30)

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept named color backgrounds', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@background: black

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept gradient backgrounds', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@background: linear-gradient(to right, red, blue)

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept URL backgrounds', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@background: https://example.com/image.jpg

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept valid image prompts', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@image-prompt: A futuristic cityscape at sunset

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should error on image prompt too short', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@image-prompt: short

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('at least 10 characters'))).toBe(true);
    });

    it('should error on empty single-line directive', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration:

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid syntax'))).toBe(true);
    });
  });

  // ==========================================================================
  // AUDIO BLOCKS
  // ==========================================================================

  describe('Audio Block Validation', () => {
    it('should accept valid single-line audio', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: This is the narration text.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept valid multi-line audio', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: First sentence.
@audio: Second sentence.
@audio: Third sentence.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept valid pause markers in audio', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: First part [2s] second part [1s] third part.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept decimal pause markers', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: Text here [2.5s] more text.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should error on invalid pause marker format', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: Text here [2 seconds] more text.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.category === ErrorCategory.PAUSE_MARKER)).toBe(true);
    });

    it('should error on pause marker with zero duration', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: Text here [0s] more text.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('must be greater than 0'))).toBe(true);
    });

    it('should error on pause marker too long', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio: Text here [35s] more text.

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('too long'))).toBe(true);
    });

    it('should error on pause markers outside audio blocks', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

Regular content with pause marker [2s] should error.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.category).toBe(ErrorCategory.PAUSE_MARKER);
      expect(result.errors[0]?.message).toContain('only be used inside @audio');
    });

    it('should error on empty audio block', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@audio:

Content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Empty @audio'))).toBe(true);
    });
  });

  // ==========================================================================
  // FRAGMENT VALIDATION
  // ==========================================================================

  describe('Fragment Validation', () => {
    it('should accept @fragment on bullet list items', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

- Item one @fragment
- Item two @fragment
- Item three @fragment`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should accept @fragment with timing offset', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

- Item one @fragment +2s
- Item two @fragment +1.5s`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should error on @fragment on numbered lists', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

1. Item one @fragment
2. Item two @fragment`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0]?.message).toContain('@fragment can only be used on list items');
    });

    it('should error on @fragment on regular text', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

Regular text @fragment should error.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.message).toContain('@fragment can only be used on list items');
    });
  });

  // ==========================================================================
  // STRUCTURAL VALIDATION
  // ==========================================================================

  describe('Structural Validation', () => {
    it('should error on empty slide (only directives)', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

@duration: 5s
@pause-after: 2s

---

# Slide 2

Real content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('has no content'))).toBe(true);
    });

    it('should accept slide with content and directives', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration: 5s
@audio: Narration text.

Real content here.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should handle multiple slides correctly', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

Content for slide 1.

---

# Slide 2

Content for slide 2.

---

# Slide 3

Content for slide 3.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });
  });

  // ==========================================================================
  // COMPLEX SCENARIOS
  // ==========================================================================

  describe('Complex Scenarios', () => {
    it('should handle slide with all valid directives', () => {
      const markdown = `---
title: "Test"
theme: dracula
voice: adam
resolution: 1920x1080
---

# Slide 1

@duration: 5s
@pause-after: 2s
@transition: fade
@background: #1e1e1e
@image-prompt: A beautiful sunset over mountains
@audio: This is the narration [2s] with a pause.
@notes: Remember to emphasize this point.

## Content

- Point one @fragment
- Point two @fragment +1s
- Point three @fragment +2s`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(true);
    });

    it('should report multiple errors on same slide', () => {
      const markdown = `---
title: "Test"
theme: invalid-theme
---

# Slide 1

@duraton: 5 seconds
@transiton: invalid
@audio:

Regular text [2s] with pause marker.
1. Numbered item @fragment`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(4); // Multiple errors
    });

    it('should handle empty markdown', () => {
      const markdown = '';

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.message.includes('Missing frontmatter'))).toBe(true);
    });
  });

  // ==========================================================================
  // ERROR MESSAGE QUALITY
  // ==========================================================================

  describe('Error Message Quality', () => {
    it('should include line numbers in errors', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@unknownDirective: value

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.line).toBeGreaterThan(0);
    });

    it('should include helpful suggestions for typos', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duraton: 5s

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.suggestions).toBeDefined();
      expect(result.errors[0]?.suggestions?.length).toBeGreaterThan(0);
    });

    it('should include examples in error messages', () => {
      const markdown = `---
title: "Test"
theme: dracula
---

# Slide 1

@duration:

Content.`;

      const result = lintMarkdown(markdown, 'test.md');
      expect(result.passed).toBe(false);
      expect(result.errors[0]?.example).toBeDefined();
    });
  });
});
