/**
 * Development server for interactive presentation testing
 * Opens browser with Playwright for manual or automated testing
 */

import { chromium, type Browser, type Page } from 'playwright';
import { AudioSyncOrchestrator } from './presentation/audio-sync-orchestrator.js';
import * as path from 'path';

export interface DevServerOptions {
  /** Path to HTML presentation */
  htmlPath: string;

  /** Auto-advance slides (like recording but visible) or manual control */
  autoAdvance?: boolean;

  /** Timeline for auto-advance mode */
  timeline?: any;

  /** Audio base directory for auto-advance mode */
  audioBaseDir: string | null;

  /** Slow down automation speed (milliseconds per step) */
  slowMo?: number;
}

export class DevServer {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Start dev server and open presentation in browser
   */
  async start(options: DevServerOptions): Promise<void> {
    const { htmlPath, autoAdvance = false, timeline, audioBaseDir, slowMo = 100 } = options;

    // Launch browser in non-headless mode
    console.log('🚀 Starting dev server...');
    console.log(`   Mode: ${autoAdvance ? 'Auto-advance' : 'Manual'}`);
    console.log(`   HTML: ${htmlPath}`);

    this.browser = await chromium.launch({
      headless: false,
      slowMo,
      args: ['--auto-open-devtools-for-tabs'], // Open DevTools by default
    });

    this.page = await this.browser.newPage();

    // Load presentation
    const absolutePath = path.resolve(htmlPath);
    const fileUrl = `file://${absolutePath}`;
    await this.page.goto(fileUrl, {
      waitUntil: 'domcontentloaded', // Don't wait for all resources
      timeout: 60000, // 60 second timeout
    });

    console.log('✅ Presentation loaded');
    console.log(`   URL: ${fileUrl}`);
    console.log('');

    if (autoAdvance) {
      if (!timeline || !audioBaseDir) {
        throw new Error('Timeline and audioBaseDir required for auto-advance mode');
      }

      console.log('🎬 Running auto-advance mode...');
      console.log('   Slides will advance automatically based on timeline');
      console.log('   Press Ctrl+C to stop');
      console.log('');

      // Run orchestrator without video recording
      const orchestrator = new AudioSyncOrchestrator();

      orchestrator.onProgress((progress) => {
        const emoji = {
          navigating: '➡️',
          playing_audio: '🔊',
          pausing: '⏸️',
          complete: '✅',
          executing: '⚙️',
        }[progress.phase] || '⚙️';

        console.log(`${emoji} ${progress.phase} (${progress.percentage.toFixed(0)}%)`);
      });

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir,
        // recordVideo is omitted - no video recording in dev mode
        headless: false,        // Use visible browser
      });

      if (result.success) {
        console.log('');
        console.log('✅ Auto-advance complete!');
        console.log('   Browser will remain open for inspection');
        console.log('   Press Ctrl+C to close');
        console.log('');
      } else {
        console.error('❌ Auto-advance failed:', result.error);
      }

      // Keep browser open after completion
      await this.waitForever();
    } else {
      console.log('🎮 Manual mode active');
      console.log('   Use arrow keys or click to navigate slides');
      console.log('   Audio will play automatically on slide change');
      console.log('   Press Ctrl+C to close');
      console.log('');

      // Wait forever (until user closes browser or Ctrl+C)
      await this.waitForever();
    }
  }

  /**
   * Wait until browser is closed or process is interrupted
   */
  private async waitForever(): Promise<void> {
    return new Promise((_resolve) => {
      // Handle Ctrl+C
      const sigintHandler = async () => {
        console.log('');
        console.log('👋 Closing dev server...');
        await this.stop();
        process.exit(0);
      };
      process.on('SIGINT', sigintHandler);

      // Handle browser close
      if (this.browser) {
        this.browser.on('disconnected', () => {
          console.log('');
          console.log('👋 Browser closed');
          process.exit(0);
        });
      }

      // Keep process alive
      const keepAlive = setInterval(() => {
        // Just keep the process running
      }, 1000);

      // Cleanup interval when promise resolves
      process.on('exit', () => {
        clearInterval(keepAlive);
      });
    });
  }

  /**
   * Stop dev server and close browser
   */
  async stop(): Promise<void> {
    if (this.page) {
      await this.page.close().catch(() => {});
      this.page = null;
    }

    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}

/**
 * Factory function to create dev server
 */
export function createDevServer(): DevServer {
  return new DevServer();
}
