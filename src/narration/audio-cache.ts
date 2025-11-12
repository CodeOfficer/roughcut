/**
 * Audio cache system for incremental TTS generation
 *
 * Uses SHA256 fingerprinting to detect changed audio lines and only
 * regenerate TTS for modified content. This saves API costs and speeds
 * up iteration during development.
 *
 * Cache manifest format:
 * {
 *   "slide-1": [
 *     { "hash": "sha256...", "text": "...", "file": "slide-1-line-1.mp3", "duration": 3.2 }
 *   ]
 * }
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import type { AudioLine } from '../core/types.js';

/**
 * Cache manifest entry for a single audio line
 */
export interface CachedAudioLine {
  /** SHA256 hash of the text content */
  hash: string;

  /** Original text for debugging/reference */
  text: string;

  /** Relative path to audio file (from output/audio/) */
  file: string;

  /** Duration in seconds */
  duration: number;
}

/**
 * Complete cache manifest structure
 * Maps slide ID to array of cached audio lines
 */
export interface AudioCacheManifest {
  [slideId: string]: CachedAudioLine[];
}

/**
 * Generate SHA256 hash for audio text
 */
export function hashAudioText(text: string): string {
  return createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * Load audio cache manifest from disk
 */
export async function loadCacheManifest(
  outputDir: string,
): Promise<AudioCacheManifest> {
  const manifestPath = join(outputDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    return {};
  }

  try {
    const content = await readFile(manifestPath, 'utf-8');
    return JSON.parse(content) as AudioCacheManifest;
  } catch (error) {
    console.warn('Failed to load audio cache manifest:', error);
    return {};
  }
}

/**
 * Save audio cache manifest to disk
 */
export async function saveCacheManifest(
  outputDir: string,
  manifest: AudioCacheManifest,
): Promise<void> {
  const manifestPath = join(outputDir, 'manifest.json');

  // Ensure directory exists
  await mkdir(dirname(manifestPath), { recursive: true });

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Find cached audio for a given text hash
 */
export function findCachedAudio(
  manifest: AudioCacheManifest,
  slideId: string,
  hash: string,
): CachedAudioLine | null {
  const slideCache = manifest[slideId];
  if (!slideCache) {
    return null;
  }

  return slideCache.find(entry => entry.hash === hash) || null;
}

/**
 * Update cache manifest with new audio entry
 */
export function updateCacheEntry(
  manifest: AudioCacheManifest,
  slideId: string,
  entry: CachedAudioLine,
): void {
  if (!manifest[slideId]) {
    manifest[slideId] = [];
  }

  // Remove any existing entry with same hash
  manifest[slideId] = manifest[slideId].filter(e => e.hash !== entry.hash);

  // Add new entry
  manifest[slideId].push(entry);
}

/**
 * Compute hashes for all audio lines
 */
export function hashAudioLines(lines: AudioLine[]): AudioLine[] {
  return lines.map(line => ({
    ...line,
    hash: hashAudioText(line.text),
  }));
}

/**
 * Check if audio line needs regeneration
 * Returns true if:
 * - No hash exists for this text
 * - Hash exists but audio file is missing
 */
export function needsRegeneration(
  manifest: AudioCacheManifest,
  slideId: string,
  hash: string,
  outputDir: string,
): boolean {
  const cached = findCachedAudio(manifest, slideId, hash);

  if (!cached) {
    return true; // Not in cache
  }

  // Check if file exists
  const audioPath = join(outputDir, cached.file);
  if (!existsSync(audioPath)) {
    return true; // Cache entry exists but file is missing
  }

  return false; // Can reuse cached audio
}
