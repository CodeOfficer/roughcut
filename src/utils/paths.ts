import { join, resolve } from 'path';
import { env } from '../config/env.js';

/**
 * Get tutorial directory path
 */
export function getTutorialDir(tutorialName: string): string {
  return resolve(env.OUTPUT_DIR, tutorialName);
}

/**
 * Get paths for tutorial assets
 */
export function getTutorialPaths(tutorialName: string) {
  const tutorialDir = getTutorialDir(tutorialName);

  return {
    root: tutorialDir,
    script: join(tutorialDir, 'script.md'),
    config: join(tutorialDir, 'config.json'),
    audio: join(tutorialDir, 'audio'),
    screenshots: join(tutorialDir, 'screenshots'),
    output: join(tutorialDir, 'output'),
  };
}

/**
 * Get template directory path
 */
export function getTemplateDir(): string {
  return resolve(env.OUTPUT_DIR, '.template');
}
