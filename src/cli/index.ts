#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '../core/logger.js';
import {
  createTutorial,
  narrateTutorial,
  captureScreenshots,
  buildTutorial,
  fullWorkflow,
  cleanTutorial,
} from './commands/index.js';

/**
 * Main CLI program
 */
const program = new Command();

program
  .name('genai-tutorial-factory')
  .description('Generate tutorial videos from markdown scripts')
  .version('1.0.0');

/**
 * Create new tutorial
 */
program
  .command('create <name>')
  .description('Create a new tutorial project')
  .action(async (name: string) => {
    try {
      await createTutorial(name);
      process.exit(0);
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

/**
 * Generate narration
 */
program
  .command('narrate <name>')
  .description('Generate narration audio for a tutorial')
  .action(async (name: string) => {
    try {
      await narrateTutorial(name);
      process.exit(0);
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

/**
 * Capture screenshots
 */
program
  .command('screenshots <name>')
  .description('Generate images and capture screenshots for a tutorial')
  .action(async (name: string) => {
    try {
      await captureScreenshots(name);
      process.exit(0);
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

/**
 * Build video
 */
program
  .command('build <name>')
  .description('Assemble tutorial video from generated assets')
  .action(async (name: string) => {
    try {
      await buildTutorial(name);
      process.exit(0);
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

/**
 * Full workflow
 */
program
  .command('full <name>')
  .description('Run full tutorial generation workflow (narrate + screenshots + build)')
  .action(async (name: string) => {
    try {
      await fullWorkflow(name);
      process.exit(0);
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

/**
 * Clean assets
 */
program
  .command('clean <name>')
  .description('Remove generated assets (preserves script and config)')
  .action(async (name: string) => {
    try {
      await cleanTutorial(name);
      process.exit(0);
    } catch (error) {
      logger.error('Command failed', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
