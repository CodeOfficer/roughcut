/**
 * Browser-based audio player for reveal.js presentations
 *
 * Plays audio files in the browser and reports playback events
 */

import type { Page } from '@playwright/test';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Audio playback state
 */
export interface AudioPlaybackState {
  /** Whether audio is currently playing */
  playing: boolean;

  /** Current playback time in seconds */
  currentTime: number;

  /** Total duration in seconds */
  duration: number;

  /** Whether audio has ended */
  ended: boolean;
}

/**
 * Audio player options
 */
export interface AudioPlayerOptions {
  /** Volume (0.0 to 1.0) */
  volume?: number;

  /** Playback rate (0.5 to 2.0) */
  playbackRate?: number;
}

// ============================================================================
// AUDIO PLAYER CLASS
// ============================================================================

export class BrowserAudioPlayer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Initialize audio player in browser context
   */
  async initialize(): Promise<void> {
    await this.page.evaluate(() => {
      // Create audio element if it doesn't exist
      if (!(window as any).__revealAudioPlayer) {
        const audio = new Audio();
        audio.id = 'reveal-audio-player';
        (window as any).__revealAudioPlayer = audio;
      }
    });
  }

  /**
   * Load audio file
   */
  async load(audioPath: string): Promise<void> {
    await this.page.evaluate((path) => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      audio.src = path;
      audio.load();
    }, audioPath);

    // Wait for audio to be loaded
    await this.waitForLoad();
  }

  /**
   * Play audio
   */
  async play(options: AudioPlayerOptions = {}): Promise<void> {
    const { volume = 1.0, playbackRate = 1.0 } = options;

    await this.page.evaluate(
      ({ volume, playbackRate }) => {
        const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
        audio.volume = volume;
        audio.playbackRate = playbackRate;
        audio.play();
      },
      { volume, playbackRate }
    );
  }

  /**
   * Pause audio
   */
  async pause(): Promise<void> {
    await this.page.evaluate(() => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      audio.pause();
    });
  }

  /**
   * Stop audio (pause and reset to beginning)
   */
  async stop(): Promise<void> {
    await this.page.evaluate(() => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Wait for audio to finish playing
   */
  async waitForEnd(timeout: number = 60000): Promise<void> {
    try {
      await this.page.waitForFunction(
        () => {
          const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
          return audio.ended || audio.paused || audio.error !== null;
        },
        { timeout }
      );
    } catch (error) {
      // Timeout or error - stop audio and continue
      await this.stop().catch(() => {});
      throw error;
    }
  }

  /**
   * Wait for audio metadata to load
   */
  private async waitForLoad(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
        return audio.readyState >= 2; // HAVE_CURRENT_DATA
      },
      { timeout: 10000 }
    );
  }

  /**
   * Get current playback state
   */
  async getState(): Promise<AudioPlaybackState> {
    return await this.page.evaluate(() => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      return {
        playing: !audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        ended: audio.ended,
      };
    });
  }

  /**
   * Get audio duration
   */
  async getDuration(): Promise<number> {
    return await this.page.evaluate(() => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      return audio.duration;
    });
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    await this.page.evaluate((vol) => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      audio.volume = Math.max(0, Math.min(1, vol));
    }, volume);
  }

  /**
   * Set playback rate (0.5 to 2.0)
   */
  async setPlaybackRate(rate: number): Promise<void> {
    await this.page.evaluate((r) => {
      const audio = (window as any).__revealAudioPlayer as HTMLAudioElement;
      audio.playbackRate = Math.max(0.5, Math.min(2, r));
    }, rate);
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new browser audio player instance
 */
export function createBrowserAudioPlayer(page: Page): BrowserAudioPlayer {
  return new BrowserAudioPlayer(page);
}
