/**
 * Dev command - interactive presentation testing
 */

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createDevServer } from '../../dev-server.js';
import { createRevealParser } from '../../core/parser.js';
import { createRevealTimelineBuilder } from '../../video/timeline.js';

export function createDevCommand(): Command {
  const cmd = new Command('dev');

  cmd
    .description('Open presentation in browser for interactive testing')
    .requiredOption('-i, --input <file>', 'Input markdown file')
    .option('-o, --output <dir>', 'Output directory (default: same directory as input)')
    .option('--auto', 'Auto-advance slides (like video recording but visible)', false)
    .option('--slow-mo <ms>', 'Slow down automation (milliseconds)', '100')
    .action(async (options) => {
      try {
        await runDev(options);
      } catch (error) {
        console.error('❌ Dev server failed:', error);
        process.exit(1);
      }
    });

  return cmd;
}

async function runDev(options: any): Promise<void> {
  const { input, auto, slowMo } = options;

  // Resolve paths
  const inputPath = path.resolve(input);
  const inputDir = path.dirname(inputPath);
  const outputDir = options.output
    ? path.resolve(options.output)
    : path.join(inputDir, 'output');

  const htmlPath = path.join(outputDir, 'presentation', 'index.html');

  // Check if HTML exists
  try {
    await fs.access(htmlPath);
  } catch {
    console.error(`❌ HTML not found: ${htmlPath}`);
    console.error('   Run build first: npm run build:html');
    process.exit(1);
  }

  // For auto mode, we need timeline
  let timeline = null;
  let audioBaseDir = null;

  if (auto) {
    // Parse presentation to build timeline
    console.log('📖 Parsing presentation...');
    const markdown = await fs.readFile(inputPath, 'utf-8');
    const parser = createRevealParser();
    const presentation = parser.parse(markdown);

    // Check if audio files exist
    audioBaseDir = path.join(outputDir, 'audio');
    try {
      await fs.access(audioBaseDir);
    } catch {
      console.error(`❌ Audio directory not found: ${audioBaseDir}`);
      console.error('   Run build with audio first: TUTORIAL=<name> npm run build:full');
      process.exit(1);
    }

    // Build timeline (without audio results, using metadata durations)
    const timelineBuilder = createRevealTimelineBuilder();

    // Load audio manifest if available
    const manifestPath = path.join(audioBaseDir, 'manifest.json');
    const audioResults = new Map();

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      // Manifest structure: { "slide-001": [{ hash, text, file, duration, ... }] }
      for (const [slideId, lines] of Object.entries(manifest) as [string, any[]][]) {
        if (Array.isArray(lines) && lines.length > 0) {
          // Sum durations of all audio lines for this slide
          const totalDuration = lines.reduce((sum, line) => sum + (line.duration || 0), 0);

          // Use the first line's file path (HTTP server-relative)
          // The file is already relative in the manifest
          const filePath = `/audio/${lines[0].file}`;

          audioResults.set(slideId, {
            filePath,
            durationSeconds: totalDuration,
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Audio manifest not found, using metadata durations');
    }

    timeline = timelineBuilder.build(presentation, audioResults);

    console.log(`📊 Timeline: ${timeline.slides.length} slides, ${timeline.totalDuration.toFixed(1)}s total`);
    console.log('');
  }

  // Start dev server
  const devServer = createDevServer();
  await devServer.start({
    htmlPath,
    autoAdvance: auto,
    timeline,
    audioBaseDir: audioBaseDir || null,
    slowMo: parseInt(slowMo, 10),
  });
}
