/**
 * Tests for reveal.js HTML generator
 * Verifies HTML generation, slide sections, data attributes, etc.
 */

import { RevealHTMLGenerator } from '../revealjs-generator.js';
import {
  RevealPresentation,
  RevealSlide,
  DEFAULT_SLIDE_METADATA,
} from '../../core/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('RevealHTMLGenerator', () => {
  let generator: RevealHTMLGenerator;

  beforeEach(() => {
    generator = new RevealHTMLGenerator();
  });

  // ==========================================================================
  // HTML STRUCTURE TESTS
  // ==========================================================================

  describe('HTML Structure', () => {
    it('should generate valid HTML document structure', () => {
      const presentation: RevealPresentation = {
        title: 'Test Presentation',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1\n\nContent here',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      // Basic structure
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');

      // Title
      expect(html).toContain('<title>Test Presentation</title>');

      // Reveal.js structure
      expect(html).toContain('<div class="reveal">');
      expect(html).toContain('<div class="slides">');
    });

    it('should include reveal.js CSS and theme', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('dist/reveal.css');
      expect(html).toContain('dist/theme/black.css');
      expect(html).toContain('plugin/highlight/monokai.css');
    });

    it('should include reveal.js scripts and plugins', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('dist/reveal.js');
      expect(html).toContain('plugin/markdown/markdown.js');
      expect(html).toContain('plugin/highlight/highlight.js');
      expect(html).toContain('plugin/notes/notes.js');
    });

    it('should follow RevealJS required DOM hierarchy (Phase 1 validation)', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test Slide',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      // Required hierarchy: .reveal > .slides > section
      // Based on revealjs-docs/docs/06-markup.md

      // 1. Must have <div class="reveal"> as root container
      expect(html).toContain('<div class="reveal">');

      // 2. Must have <div class="slides"> as direct child of .reveal
      const revealMatch = html.match(/<div class="reveal">\s*<div class="slides">/);
      expect(revealMatch).toBeTruthy();

      // 3. Must have <section> as direct children of .slides
      const slidesMatch = html.match(/<div class="slides">([\s\S]*?)<\/div>\s*<\/div>/);
      expect(slidesMatch).toBeTruthy();

      // 4. Section must have required attributes
      expect(html).toContain('<section id="slide-001"');
      expect(html).toContain('data-markdown');

      // 5. No hardcoded font styles (should use theme CSS variables)
      expect(html).not.toContain('.reveal h1 {');
      expect(html).not.toContain('font-size: 2em');
      expect(html).not.toContain('font-size: 2.5em');
    });

    it('should initialize reveal.js with config', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('Reveal.initialize');
      expect(html).toContain('autoSlide: 0');
      expect(html).toContain('hash: true');
      expect(html).toContain('fragments: true');
      expect(html).toContain('plugins: [RevealMarkdown, RevealHighlight, RevealNotes]');
    });
  });

  // ==========================================================================
  // SLIDE GENERATION TESTS
  // ==========================================================================

  describe('Slide Generation', () => {
    it('should generate section for each slide', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# Slide 2',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      // Should have 2 sections
      const sectionMatches = html.match(/<section/g);
      expect(sectionMatches).toHaveLength(2);

      // Should have slide IDs
      expect(html).toContain('id="slide-001"');
      expect(html).toContain('id="slide-002"');
    });

    it('should include data-markdown attribute', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('data-markdown');
      expect(html).toContain('<textarea data-template>');
    });

    it('should include slide content in textarea', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Welcome\n\nThis is a test slide.',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('# Welcome');
      expect(html).toContain('This is a test slide.');
    });
  });

  // ==========================================================================
  // DATA ATTRIBUTE TESTS
  // ==========================================================================

  describe('Data Attributes', () => {
    it('should apply transition data attribute', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              transition: 'zoom',
            },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('data-transition="zoom"');
    });

    it('should apply background color data attribute', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              background: '#1e1e1e',
            },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('data-background-color="#1e1e1e"');
    });

    it('should apply background image data attribute', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              background: 'image.jpg',
            },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('data-background-image="image.jpg"');
    });

    it('should apply background gradient data attribute', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('data-background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"');
    });

    it('should apply auto-animate data attribute', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              autoAnimate: true,
            },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('data-auto-animate');
    });
  });

  // ==========================================================================
  // SPEAKER NOTES TESTS
  // ==========================================================================

  describe('Speaker Notes', () => {
    it('should include speaker notes when present', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: 'These are speaker notes for the presenter.',
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('<aside class="notes">');
      expect(html).toContain('These are speaker notes for the presenter.');
    });

    it('should not include notes section when notes are null', () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).not.toContain('<aside class="notes">');
    });
  });

  // ==========================================================================
  // THEME TESTS
  // ==========================================================================

  describe('Theme Support', () => {
    it('should support different themes', () => {
      const themes = ['black', 'white', 'league', 'beige', 'sky', 'night', 'serif', 'simple', 'solarized', 'dracula'];

      themes.forEach((theme) => {
        const presentation: RevealPresentation = {
          title: 'Test',
          theme,
          voice: 'adam',
          resolution: '1920x1080',
          slides: [],
        };

        const html = generator.generateHTML(presentation, './node_modules/reveal.js');
        expect(html).toContain(`dist/theme/${theme}.css`);
      });
    });
  });

  // ==========================================================================
  // FILE WRITING TESTS
  // ==========================================================================

  describe('File Writing', () => {
    let tempDir: string;

    beforeEach(async () => {
      // Create temporary directory for test outputs
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'revealjs-test-'));
    });

    afterEach(async () => {
      // Clean up temporary directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should write HTML file to disk', async () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test Slide',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const outputPath = path.join(tempDir, 'output', 'index.html');

      await generator.generate(presentation, outputPath, './node_modules/reveal.js');

      // Verify file exists
      const exists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Verify content
      const content = await fs.readFile(outputPath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('Test Slide');
    });

    it('should create output directory if it does not exist', async () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const outputPath = path.join(tempDir, 'nested', 'deep', 'path', 'index.html');

      await generator.generate(presentation, outputPath, './node_modules/reveal.js');

      // Verify file exists
      const exists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });
  });

  // ==========================================================================
  // HTML ESCAPING TESTS
  // ==========================================================================

  describe('HTML Escaping', () => {
    it('should escape HTML special characters in title', () => {
      const presentation: RevealPresentation = {
        title: 'Test <script>alert("xss")</script>',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });
  });

  // ==========================================================================
  // MULTIPLE SLIDES TESTS
  // ==========================================================================

  describe('Multiple Slides', () => {
    it('should generate multiple slides with different metadata', () => {
      const presentation: RevealPresentation = {
        title: 'Multi-Slide Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1',
            audio: null,
            playwright: null,
            notes: 'Notes for slide 1',
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              transition: 'fade',
              background: '#ff0000',
            },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# Slide 2',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              transition: 'zoom',
            },
          },
          {
            id: 'slide-003',
            index: 2,
            content: '# Slide 3',
            audio: null,
            playwright: null,
            notes: null,
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              background: 'background.jpg',
            },
          },
        ],
      };

      const html = generator.generateHTML(presentation, './node_modules/reveal.js');

      // Verify all slides present
      expect(html).toContain('slide-001');
      expect(html).toContain('slide-002');
      expect(html).toContain('slide-003');

      // Verify metadata
      expect(html).toContain('data-transition="fade"');
      expect(html).toContain('data-transition="zoom"');
      expect(html).toContain('data-background-color="#ff0000"');
      expect(html).toContain('data-background-image="background.jpg"');

      // Verify notes only on slide 1
      expect(html).toContain('Notes for slide 1');
    });
  });
});
