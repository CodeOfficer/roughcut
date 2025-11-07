/**
 * Tests for Option 3 markdown parser
 * Verifies parsing of @directive: syntax, audio blocks, playwright blocks, etc.
 */

import { RevealMarkdownParser } from '../revealjs-parser.js';
import { RevealPresentation, RevealSlide } from '../revealjs-types.js';

describe('RevealMarkdownParser', () => {
  let parser: RevealMarkdownParser;

  beforeEach(() => {
    parser = new RevealMarkdownParser();
  });

  // ==========================================================================
  // FRONT MATTER PARSING
  // ==========================================================================

  describe('Front Matter Parsing', () => {
    it('should parse valid front matter', () => {
      const markdown = `---
title: "Test Presentation"
theme: dracula
voice: adam
resolution: 1920x1080
---

# Slide 1
Content here
`;

      const result = parser.parse(markdown);

      expect(result.title).toBe('Test Presentation');
      expect(result.theme).toBe('dracula');
      expect(result.voice).toBe('adam');
      expect(result.resolution).toBe('1920x1080');
    });

    it('should use default resolution if not specified', () => {
      const markdown = `---
title: "Test"
theme: black
voice: adam
---

# Slide 1
`;

      const result = parser.parse(markdown);

      expect(result.resolution).toBe('1920x1080');
    });

    it('should throw error if front matter is missing', () => {
      const markdown = `# Slide 1\nContent`;

      expect(() => parser.parse(markdown)).toThrow('Missing front matter');
    });

    it('should throw error if title is missing', () => {
      const markdown = `---
theme: black
voice: adam
---

# Slide 1
`;

      expect(() => parser.parse(markdown)).toThrow('must include "title"');
    });

    it('should throw error if theme is missing', () => {
      const markdown = `---
title: "Test"
voice: adam
---

# Slide 1
`;

      expect(() => parser.parse(markdown)).toThrow('must include "theme"');
    });

    it('should throw error if voice is missing', () => {
      const markdown = `---
title: "Test"
theme: black
---

# Slide 1
`;

      expect(() => parser.parse(markdown)).toThrow('must include "voice"');
    });
  });

  // ==========================================================================
  // SLIDE SPLITTING
  // ==========================================================================

  describe('Slide Splitting', () => {
    it('should split slides on --- delimiter', () => {
      const markdown = `---
title: "Test"
theme: black
voice: adam
---

# Slide 1
Content 1

---

# Slide 2
Content 2

---

# Slide 3
Content 3
`;

      const result = parser.parse(markdown);

      expect(result.slides).toHaveLength(3);
      expect(result.slides[0].content).toContain('Slide 1');
      expect(result.slides[1].content).toContain('Slide 2');
      expect(result.slides[2].content).toContain('Slide 3');
    });

    it('should filter out empty slides', () => {
      const markdown = `---
title: "Test"
theme: black
voice: adam
---

# Slide 1

---

---

# Slide 2
`;

      const result = parser.parse(markdown);

      expect(result.slides).toHaveLength(2);
    });

    it('should assign sequential slide IDs', () => {
      const markdown = `---
title: "Test"
theme: black
voice: adam
---

# Slide 1

---

# Slide 2
`;

      const result = parser.parse(markdown);

      expect(result.slides[0].id).toBe('slide-001');
      expect(result.slides[0].index).toBe(0);
      expect(result.slides[1].id).toBe('slide-002');
      expect(result.slides[1].index).toBe(1);
    });
  });

  // ==========================================================================
  // DIRECTIVE PARSING
  // ==========================================================================

  describe('Directive Parsing', () => {
    it('should parse @duration directive', () => {
      const slideMarkdown = `# Test Slide
@duration: 8s

Content here
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.duration).toBe(8);
    });

    it('should parse @duration with decimal seconds', () => {
      const slideMarkdown = `@duration: 5.5s\n# Test`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.duration).toBe(5.5);
    });

    it('should parse @pause-after directive', () => {
      const slideMarkdown = `@pause-after: 3s\n# Test`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.pauseAfter).toBe(3);
    });

    it('should parse @transition directive', () => {
      const slideMarkdown = `@transition: zoom\n# Test`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.transition).toBe('zoom');
    });

    it('should parse @background directive', () => {
      const slideMarkdown = `@background: #ff0000\n# Test`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.background).toBe('#ff0000');
    });

    it('should parse multiple directives together', () => {
      const slideMarkdown = `# Test Slide
@duration: 10s
@pause-after: 2s
@transition: fade
@background: #1e1e1e

Content
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.duration).toBe(10);
      expect(slide.metadata.pauseAfter).toBe(2);
      expect(slide.metadata.transition).toBe('fade');
      expect(slide.metadata.background).toBe('#1e1e1e');
    });

    it('should use default values when directives are missing', () => {
      const slideMarkdown = `# Test\nContent`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.duration).toBeNull();
      expect(slide.metadata.pauseAfter).toBe(1); // Default from DEFAULT_SLIDE_METADATA
    });

    it('should throw error for invalid duration format', () => {
      const slideMarkdown = `@duration: invalid\n# Test`;

      expect(() => parser.parseSlide(slideMarkdown, 0)).toThrow('Invalid duration format');
    });
  });

  // ==========================================================================
  // AUDIO BLOCK PARSING
  // ==========================================================================

  describe('Audio Block Parsing', () => {
    it('should parse simple audio block without pauses', () => {
      const slideMarkdown = `# Test
@audio: Hello world, this is a test.
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.audio).not.toBeNull();
      expect(slide.audio!.rawText).toBe('Hello world, this is a test.');
      expect(slide.audio!.cleanText).toBe('Hello world, this is a test.');
      expect(slide.audio!.pauses).toHaveLength(0);
    });

    it('should parse audio block with single pause marker', () => {
      const slideMarkdown = `@audio: First part [2s] second part`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.audio).not.toBeNull();
      expect(slide.audio!.rawText).toBe('First part [2s] second part');
      expect(slide.audio!.cleanText).toBe('First part  second part');
      expect(slide.audio!.pauses).toHaveLength(1);
      expect(slide.audio!.pauses[0].durationSeconds).toBe(2);
    });

    it('should parse audio block with multiple pause markers', () => {
      const slideMarkdown = `@audio: Part 1 [1s] Part 2 [2.5s] Part 3 [3s] Done`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.audio).not.toBeNull();
      expect(slide.audio!.pauses).toHaveLength(3);
      expect(slide.audio!.pauses[0].durationSeconds).toBe(1);
      expect(slide.audio!.pauses[1].durationSeconds).toBe(2.5);
      expect(slide.audio!.pauses[2].durationSeconds).toBe(3);
      expect(slide.audio!.cleanText).not.toContain('[');
    });

    it('should return null when audio block is missing', () => {
      const slideMarkdown = `# Test\nContent without audio`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.audio).toBeNull();
    });

    it('should set expectedDuration to null (will be filled after generation)', () => {
      const slideMarkdown = `@audio: Test`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.audio!.expectedDuration).toBeNull();
    });
  });

  // ==========================================================================
  // PLAYWRIGHT BLOCK PARSING
  // ==========================================================================

  describe('Playwright Block Parsing', () => {
    it('should parse playwright block with action instructions', () => {
      const slideMarkdown = `@playwright:
- Action: Click button
- Action: Type "text"
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.playwright).not.toBeNull();
      expect(slide.playwright!.instructions).toHaveLength(2);
      expect(slide.playwright!.instructions[0].type).toBe('action');
      expect(slide.playwright!.instructions[0].content).toBe('Click button');
      expect(slide.playwright!.instructions[1].type).toBe('action');
      expect(slide.playwright!.instructions[1].content).toBe('Type "text"');
    });

    it('should parse playwright block with wait instructions', () => {
      const slideMarkdown = `@playwright:
- Wait 2s
- Wait 3.5s
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.playwright).not.toBeNull();
      expect(slide.playwright!.instructions).toHaveLength(2);
      expect(slide.playwright!.instructions[0].type).toBe('wait');
      expect(slide.playwright!.instructions[0].content).toBe('2s');
      expect(slide.playwright!.instructions[1].type).toBe('wait');
      expect(slide.playwright!.instructions[1].content).toBe('3.5s');
    });

    it('should parse playwright block with screenshot instructions', () => {
      const slideMarkdown = `@playwright:
- Screenshot: terminal-output
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.playwright).not.toBeNull();
      expect(slide.playwright!.instructions).toHaveLength(1);
      expect(slide.playwright!.instructions[0].type).toBe('screenshot');
      expect(slide.playwright!.instructions[0].content).toBe('terminal-output');
    });

    it('should parse playwright block with mixed instructions', () => {
      const slideMarkdown = `@playwright:
- Action: Open tab "https://example.com"
- Wait 2s
- Action: Click button
- Screenshot: result
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.playwright).not.toBeNull();
      expect(slide.playwright!.instructions).toHaveLength(4);
      expect(slide.playwright!.instructions[0].type).toBe('action');
      expect(slide.playwright!.instructions[1].type).toBe('wait');
      expect(slide.playwright!.instructions[2].type).toBe('action');
      expect(slide.playwright!.instructions[3].type).toBe('screenshot');
    });

    it('should return null when playwright block is missing', () => {
      const slideMarkdown = `# Test\nContent`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.playwright).toBeNull();
    });
  });

  // ==========================================================================
  // FRAGMENT PARSING
  // ==========================================================================

  describe('Fragment Parsing', () => {
    it('should parse @fragment markers without timing', () => {
      const slideMarkdown = `# Test
- Point 1 @fragment
- Point 2 @fragment
- Point 3 @fragment
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.fragments).toHaveLength(3);
      expect(slide.metadata.fragments[0].index).toBe(0);
      expect(slide.metadata.fragments[0].content).toBe('- Point 1');
      expect(slide.metadata.fragments[0].timingOffset).toBeUndefined();
    });

    it('should parse @fragment markers with timing offset', () => {
      const slideMarkdown = `# Test
- Point 1 @fragment
- Point 2 @fragment +2s
- Point 3 @fragment +4s
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.fragments).toHaveLength(3);
      expect(slide.metadata.fragments[0].timingOffset).toBeUndefined();
      expect(slide.metadata.fragments[1].timingOffset).toBe(2);
      expect(slide.metadata.fragments[2].timingOffset).toBe(4);
    });

    it('should parse fragments with decimal timing offsets', () => {
      const slideMarkdown = `- Item @fragment +1.5s`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.fragments[0].timingOffset).toBe(1.5);
    });

    it('should return empty array when no fragments', () => {
      const slideMarkdown = `# Test\n- Point 1\n- Point 2`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.metadata.fragments).toHaveLength(0);
    });
  });

  // ==========================================================================
  // CONTENT CLEANING
  // ==========================================================================

  describe('Content Cleaning', () => {
    it('should remove all @directive lines from content', () => {
      const slideMarkdown = `# Test Slide
@duration: 5s
@pause-after: 2s
@transition: zoom

This is the actual content.
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.content).not.toContain('@duration');
      expect(slide.content).not.toContain('@pause-after');
      expect(slide.content).not.toContain('@transition');
      expect(slide.content).toContain('Test Slide');
      expect(slide.content).toContain('actual content');
    });

    it('should remove @audio block from content', () => {
      const slideMarkdown = `# Test
@audio: Narration here

Content here
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.content).not.toContain('@audio');
      expect(slide.content).not.toContain('Narration here');
    });

    it('should remove @playwright block from content', () => {
      const slideMarkdown = `# Test
@playwright:
- Action: Click
- Wait 2s

Content here
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.content).not.toContain('@playwright');
      expect(slide.content).not.toContain('Action: Click');
    });

    it('should remove @fragment markers from content', () => {
      const slideMarkdown = `# Test
- Point 1 @fragment
- Point 2 @fragment +2s
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.content).not.toContain('@fragment');
      expect(slide.content).toContain('Point 1');
      expect(slide.content).toContain('Point 2');
    });

    it('should preserve markdown formatting in cleaned content', () => {
      const slideMarkdown = `# Main Title
@duration: 5s

## Subtitle

- Bullet 1
- Bullet 2

**Bold text** and *italic text*

\`\`\`javascript
const code = true;
\`\`\`
`;

      const slide = parser.parseSlide(slideMarkdown, 0);

      expect(slide.content).toContain('# Main Title');
      expect(slide.content).toContain('## Subtitle');
      expect(slide.content).toContain('- Bullet 1');
      expect(slide.content).toContain('**Bold text**');
      expect(slide.content).toContain('```javascript');
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe('Full Presentation Parsing', () => {
    it('should parse complete presentation with multiple slides', () => {
      const markdown = `---
title: "Git Tutorial"
theme: dracula
voice: adam
resolution: 1920x1080
---

# Welcome to Git
@duration: 5s
@pause-after: 2s

@audio: Welcome to this tutorial on Git.

Git is a distributed version control system.

---

# Why Version Control?
@duration: 10s
@pause-after: 3s

- Track changes @fragment
- Collaborate @fragment +2s
- Revert mistakes @fragment +4s

@audio: Why use version control? [2s] Track changes. [2s] Collaborate. [2s] Revert mistakes.

---

# Demo
@duration: 15s
@pause-after: 2s

@playwright:
- Action: Open terminal
- Wait 2s
- Action: Type "git init"

@audio: Let me show you how to initialize a Git repository.
`;

      const result = parser.parse(markdown);

      // Presentation metadata
      expect(result.title).toBe('Git Tutorial');
      expect(result.theme).toBe('dracula');
      expect(result.slides).toHaveLength(3);

      // Slide 1
      expect(result.slides[0].id).toBe('slide-001');
      expect(result.slides[0].metadata.duration).toBe(5);
      expect(result.slides[0].metadata.pauseAfter).toBe(2);
      expect(result.slides[0].audio).not.toBeNull();
      expect(result.slides[0].audio!.cleanText).toBe('Welcome to this tutorial on Git.');

      // Slide 2
      expect(result.slides[1].id).toBe('slide-002');
      expect(result.slides[1].metadata.fragments).toHaveLength(3);
      expect(result.slides[1].audio!.pauses).toHaveLength(3);

      // Slide 3
      expect(result.slides[2].id).toBe('slide-003');
      expect(result.slides[2].playwright).not.toBeNull();
      expect(result.slides[2].playwright!.instructions).toHaveLength(3);
    });
  });
});
