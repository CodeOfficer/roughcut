#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '../core/logger.js';
import {
  createBuildCommand,
  type BuildOptions,
} from './commands/index.js';

/**
 * Main CLI program
 */
const program = new Command();

program
  .name('genai-tutorial-factory')
  .description('Generate reveal.js presentations with video from markdown')
  .version('2.0.0');

/**
 * Build reveal.js presentation
 */
program
  .command('build')
  .description('Build reveal.js presentation from markdown')
  .requiredOption('-i, --input <path>', 'Input markdown file')
  .requiredOption('-o, --output <path>', 'Output directory')
  .option('--no-video', 'Skip video generation')
  .option('--skip-audio', 'Skip audio generation (reuse existing audio files)')
  .option('--skip-images', 'Skip image generation (reuse existing images)')
  .option('--bundle', 'Bundle reveal.js assets')
  .option('--voice <id>', 'ElevenLabs voice ID')
  .action(async (options: BuildOptions) => {
    try {
      const command = createBuildCommand();

      // Report progress
      command.onProgress((progress) => {
        logger.info(`[${progress.phase}] ${progress.message} (${progress.percentage.toFixed(0)}%)`);
      });

      // Execute build
      const result = await command.execute(options);

      if (result.success) {
        logger.info('Build completed successfully!');
        logger.info(`HTML: ${result.htmlPath}`);
        if (result.videoPath) {
          logger.info(`Video: ${result.videoPath}`);
        }
        if (result.stats) {
          logger.info(`Slides: ${result.stats.slidesProcessed}`);
          logger.info(`Duration: ${result.stats.totalDuration.toFixed(2)}s`);
        }
        process.exit(0);
      } else {
        logger.error('Build failed:', result.error);
        process.exit(1);
      }
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
