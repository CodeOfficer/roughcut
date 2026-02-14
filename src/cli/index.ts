#!/usr/bin/env node

import * as path from 'path';
import { Command } from 'commander';
import { config } from '../config/config-manager.js';
import { logger } from '../core/logger.js';
import {
  createBuildCommand,
  type BuildOptions,
} from './commands/index.js';
import { createDevCommand } from './commands/dev.js';
import { createInitCommand } from './commands/init.js';
import { createLintCommand } from './commands/lint.js';
import { createDoctorCommand } from './commands/doctor.js';
import { createVoicesCommand } from './commands/voices.js';

/**
 * Main CLI program
 */
const program = new Command();

program
  .name('roughcut')
  .description('Generate RevealJS presentations and videos from markdown')
  .version('3.0.0');

/**
 * Load config before any command runs.
 * Uses the input file's directory for project config discovery.
 */
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  const inputPath = opts['input'] as string | undefined;
  const projectDir = inputPath ? path.dirname(path.resolve(inputPath)) : process.cwd();
  config.load(opts, projectDir);
  logger.setLevel(config.get().logLevel);
});

/**
 * Build reveal.js presentation
 */
program
  .command('build')
  .description('Build reveal.js presentation from markdown')
  .requiredOption('-i, --input <path>', 'Input markdown file')
  .option('-o, --output <path>', 'Output directory (default: .build/ next to input)')
  .option('--no-video', 'Skip video generation')
  .option('--skip-audio', 'Skip audio generation (reuse existing audio files)')
  .option('--skip-images', 'Skip image generation (reuse existing images)')
  .option('--bundle', 'Bundle reveal.js assets')
  .option('--voice <id>', 'ElevenLabs voice ID')
  .option('--log-level <level>', 'Log level (debug, info, warn, error)')
  .action(async (options: BuildOptions) => {
    try {
      // Default output to .build/ next to input file
      if (!options.output) {
        options.output = path.join(
          path.dirname(path.resolve(options.input)),
          '.build'
        );
      }

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

/**
 * Dev mode - interactive presentation testing
 */
program.addCommand(createDevCommand());

/**
 * Additional commands
 */
program.addCommand(createInitCommand());
program.addCommand(createLintCommand());
program.addCommand(createDoctorCommand());
program.addCommand(createVoicesCommand());

// Parse command line arguments
program.parse();
