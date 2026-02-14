import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config/config-manager.js';
import { logger } from '../core/logger.js';

const execAsync = promisify(exec);

/**
 * Get the duration of an audio file in seconds using FFmpeg
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const ffmpegPath = config.get().ffmpegPath;
    const command = `"${ffmpegPath}" -i "${filePath}" 2>&1 | grep "Duration"`;

    const { stdout } = await execAsync(command);

    // Parse duration from FFmpeg output: Duration: 00:00:05.12
    const match = stdout.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d{2})/);

    if (!match || !match[1] || !match[2] || !match[3]) {
      throw new Error('Could not parse duration from FFmpeg output');
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3]);

    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    logger.error(`Failed to get audio duration for ${filePath}`, error);
    throw error;
  }
}

/**
 * Format seconds as HH:MM:SS.MS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(2);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;
}

/**
 * Parse duration string to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)s?$/);
  if (!match || !match[1]) {
    throw new Error(`Invalid duration format: ${duration}. Expected format: "10s" or "10"`);
  }
  return parseInt(match[1], 10);
}
