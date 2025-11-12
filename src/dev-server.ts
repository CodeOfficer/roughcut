/**
 * Development server for interactive presentation testing
 * Opens browser with Playwright for manual or automated testing
 */

import { chromium, type Browser, type Page } from 'playwright';
import { AudioSyncOrchestrator } from './presentation/audio-sync-orchestrator.js';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

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
  private httpServer: http.Server | null = null;
  private serverPort: number = 0;

  /**
   * Start HTTP server to serve presentation files
   */
  private async startHttpServer(htmlPath: string): Promise<string> {
    const presentationDir = path.dirname(htmlPath); // This is output/presentation/
    const outputDir = path.dirname(presentationDir); // This is output/

    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer(async (req, res) => {
        try {
          // Map URL to file path
          let filePath: string;

          // Root or /index.html -> serve the main HTML
          if (req.url === '/' || req.url === '/index.html') {
            filePath = htmlPath;
          }
          // /reveal/* -> serve from presentation/reveal/
          else if (req.url?.startsWith('/reveal/')) {
            filePath = path.join(presentationDir, req.url);
          }
          // /audio/* -> serve from output/audio/
          else if (req.url?.startsWith('/audio/')) {
            filePath = path.join(outputDir, req.url);
          }
          // /images/* -> serve from output/images/
          else if (req.url?.startsWith('/images/')) {
            filePath = path.join(outputDir, req.url);
          }
          // Everything else -> try presentation dir first, then output dir
          else {
            filePath = path.join(presentationDir, req.url || '/');
            if (!existsSync(filePath)) {
              filePath = path.join(outputDir, req.url || '/');
            }
          }

          // Default to index.html for directories
          if (filePath.endsWith('/')) {
            filePath = path.join(filePath, 'index.html');
          }

          // Check if file exists
          if (!existsSync(filePath)) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }

          // Read and serve file
          const content = await fs.readFile(filePath);
          const ext = path.extname(filePath);

          // Set content type
          const contentTypes: Record<string, string> = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
          };

          const contentType = contentTypes[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } catch (error) {
          console.error('Server error:', error);
          res.writeHead(500);
          res.end('Internal server error');
        }
      });

      // Listen on random available port
      this.httpServer.listen(0, () => {
        const address = this.httpServer?.address();
        if (address && typeof address !== 'string') {
          this.serverPort = address.port;
          resolve(`http://localhost:${this.serverPort}`);
        } else {
          reject(new Error('Failed to start HTTP server'));
        }
      });
    });
  }

  /**
   * Start dev server and open presentation in browser
   */
  async start(options: DevServerOptions): Promise<void> {
    const { htmlPath, autoAdvance = false, timeline, audioBaseDir, slowMo = 100 } = options;

    console.log('🚀 Starting dev server...');
    console.log(`   Mode: ${autoAdvance ? 'Auto-advance' : 'Manual'}`);
    console.log(`   HTML: ${htmlPath}`);

    // Start HTTP server
    const serverUrl = await this.startHttpServer(htmlPath);
    console.log(`   Server: ${serverUrl}`);

    // Launch browser in non-headless mode
    this.browser = await chromium.launch({
      headless: false,
      slowMo,
      args: ['--auto-open-devtools-for-tabs'], // Open DevTools by default
    });

    this.page = await this.browser.newPage();

    // Load presentation from HTTP server
    await this.page.goto(serverUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('✅ Presentation loaded');
    console.log(`   URL: ${serverUrl}`);
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

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer?.close(() => {
          console.log(`📡 HTTP server stopped (port ${this.serverPort})`);
          resolve();
        });
      });
      this.httpServer = null;
    }
  }
}

/**
 * Factory function to create dev server
 */
export function createDevServer(): DevServer {
  return new DevServer();
}
