/**
 * Integration tests for HTML generation with asset bundling
 * Tests the complete flow from presentation to standalone HTML + assets
 */

import { RevealHTMLGenerator } from '../revealjs-generator.js';
import type { RevealPresentation } from '../../core/revealjs-types.js';
import { DEFAULT_SLIDE_METADATA } from '../../core/revealjs-types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('HTML + Asset Integration', () => {
  let generator: RevealHTMLGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new RevealHTMLGenerator();
    // Create temporary directory for test outputs
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'revealjs-integration-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  // ==========================================================================
  // STANDALONE GENERATION TESTS
  // ==========================================================================

  describe('Standalone Generation (bundleAssets: true)', () => {
    it('should generate HTML with bundled assets', async () => {
      const presentation: RevealPresentation = {
        title: 'Integration Test',
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

      const outputPath = path.join(tempDir, 'index.html');

      await generator.generate(presentation, outputPath, {
        bundleAssets: true,
      });

      // Verify HTML file exists
      const htmlExists = await fs.access(outputPath).then(() => true).catch(() => false);
      expect(htmlExists).toBe(true);

      // Verify HTML content uses bundled paths
      const html = await fs.readFile(outputPath, 'utf-8');
      expect(html).toContain('reveal/dist/reveal.css');
      expect(html).toContain('reveal/dist/reveal.js');
      expect(html).toContain('reveal/dist/theme/dracula.css');
      expect(html).toContain('reveal/plugin/markdown/markdown.js');
      expect(html).toContain('reveal/plugin/highlight/highlight.js');
      expect(html).toContain('reveal/plugin/notes/notes.js');
    });

    it('should create asset directory structure', async () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const outputPath = path.join(tempDir, 'presentation', 'index.html');

      await generator.generate(presentation, outputPath, {
        bundleAssets: true,
      });

      // Verify asset directories exist
      const assetDirs = [
        path.join(tempDir, 'presentation', 'reveal', 'dist'),
        path.join(tempDir, 'presentation', 'reveal', 'dist', 'theme'),
        path.join(tempDir, 'presentation', 'reveal', 'plugin', 'markdown'),
        path.join(tempDir, 'presentation', 'reveal', 'plugin', 'highlight'),
        path.join(tempDir, 'presentation', 'reveal', 'plugin', 'notes'),
      ];

      for (const dir of assetDirs) {
        const exists = await fs.access(dir).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it('should copy all necessary asset files', async () => {
      const presentation: RevealPresentation = {
        title: 'Test',
        theme: 'dracula',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const outputPath = path.join(tempDir, 'output', 'index.html');

      await generator.generate(presentation, outputPath, {
        bundleAssets: true,
      });

      // Verify all asset files exist
      const assetFiles = [
        'reveal/dist/reveal.css',
        'reveal/dist/reveal.js',
        'reveal/dist/theme/dracula.css',
        'reveal/plugin/markdown/markdown.js',
        'reveal/plugin/highlight/highlight.js',
        'reveal/plugin/highlight/monokai.css',
        'reveal/plugin/notes/notes.js',
      ];

      const outputDir = path.dirname(outputPath);

      for (const file of assetFiles) {
        const filePath = path.join(outputDir, file);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        // Verify file has content
        const stats = await fs.stat(filePath);
        expect(stats.size).toBeGreaterThan(0);
      }
    });

    it('should create truly standalone presentation', async () => {
      const presentation: RevealPresentation = {
        title: 'Standalone Test',
        theme: 'night',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Slide 1\n\nContent here',
            audio: null,
            playwright: null,
            notes: 'Speaker notes',
            metadata: {
              ...DEFAULT_SLIDE_METADATA,
              transition: 'zoom',
              background: '#2c3e50',
            },
          },
          {
            id: 'slide-002',
            index: 1,
            content: '# Slide 2\n\n```javascript\nconsole.log("test");\n```',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const outputPath = path.join(tempDir, 'standalone', 'index.html');

      await generator.generate(presentation, outputPath, {
        bundleAssets: true,
      });

      // Verify HTML
      const html = await fs.readFile(outputPath, 'utf-8');

      // Should not reference node_modules
      expect(html).not.toContain('node_modules');

      // Should have all content
      expect(html).toContain('Standalone Test');
      expect(html).toContain('Slide 1');
      expect(html).toContain('Slide 2');
      expect(html).toContain('Speaker notes');

      // Should have metadata
      expect(html).toContain('data-transition="zoom"');
      expect(html).toContain('data-background-color="#2c3e50"');

      // Count files in output directory
      const outputDir = path.dirname(outputPath);
      const allFiles = await getAllFiles(outputDir);

      // Should have HTML + all asset files (10+)
      expect(allFiles.length).toBeGreaterThan(10);
    });
  });

  // ==========================================================================
  // NON-STANDALONE GENERATION TESTS
  // ==========================================================================

  describe('Non-Standalone Generation (bundleAssets: false)', () => {
    it('should generate HTML without bundling assets', async () => {
      const presentation: RevealPresentation = {
        title: 'Non-Standalone Test',
        theme: 'black',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [
          {
            id: 'slide-001',
            index: 0,
            content: '# Test',
            audio: null,
            playwright: null,
            notes: null,
            metadata: { ...DEFAULT_SLIDE_METADATA },
          },
        ],
      };

      const outputPath = path.join(tempDir, 'index.html');

      await generator.generate(presentation, outputPath, {
        bundleAssets: false,
        revealJsPath: './node_modules/reveal.js',
      });

      // Verify HTML file exists
      const htmlExists = await fs.access(outputPath).then(() => true).catch(() => false);
      expect(htmlExists).toBe(true);

      // Verify HTML uses direct paths
      const html = await fs.readFile(outputPath, 'utf-8');
      expect(html).toContain('./node_modules/reveal.js/dist/reveal.css');
      expect(html).toContain('./node_modules/reveal.js/dist/reveal.js');

      // Verify assets were NOT copied
      const assetDir = path.join(tempDir, 'reveal');
      const assetExists = await fs.access(assetDir).then(() => true).catch(() => false);
      expect(assetExists).toBe(false);
    });

    it('should default to non-bundled mode', async () => {
      const presentation: RevealPresentation = {
        title: 'Default Test',
        theme: 'white',
        voice: 'adam',
        resolution: '1920x1080',
        slides: [],
      };

      const outputPath = path.join(tempDir, 'index.html');

      // Call without options (should default to bundleAssets: false)
      await generator.generate(presentation, outputPath);

      const html = await fs.readFile(outputPath, 'utf-8');
      expect(html).toContain('node_modules/reveal.js');
    });
  });

});

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}
