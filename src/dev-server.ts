/**
 * Development server for interactive presentation testing
 * Opens browser with Playwright for manual or automated testing
 */

import { chromium, type Browser, type Page } from "playwright";
import { AudioSyncOrchestrator } from "./presentation/audio-sync-orchestrator.js";
import { FAVICON_SVG } from "./presentation/revealjs-generator.js";
import * as path from "path";
import * as http from "http";
import * as fs from "fs/promises";
import { existsSync } from "fs";

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

  /** Debug overlay data (narration text, fragment counts) */
  debugOverlayData?: Map<string, { narration: string; fragmentCount: number }>;
}

export class DevServer {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private httpServer: http.Server | null = null;
  private serverPort: number = 0;
  private debugOverlayData: Map<
    string,
    { narration: string; fragmentCount: number }
  > | null = null;

  /**
   * Start HTTP server to serve presentation files
   */
  private async startHttpServer(htmlPath: string): Promise<string> {
    const presentationDir = path.dirname(htmlPath); // This is output/presentation/
    const outputDir = path.dirname(presentationDir); // This is output/

    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer(async (req, res) => {
        try {
          // Strip query parameters from URL
          const urlPath = req.url?.split("?")[0] || "/";

          // Serve inline favicon
          if (urlPath === "/favicon.ico") {
            res.writeHead(200, { "Content-Type": "image/svg+xml" });
            res.end(FAVICON_SVG);
            return;
          }

          // Silently ignore known browser/DevTools probing requests
          if (urlPath.startsWith("/.well-known/") || urlPath.endsWith(".map")) {
            res.writeHead(204);
            res.end();
            return;
          }

          // Map URL to file path
          let filePath: string;
          let isMainHtml = false;

          // Root or /index.html -> serve the main HTML
          if (urlPath === "/" || urlPath === "/index.html") {
            filePath = htmlPath;
            isMainHtml = true;
          }
          // /reveal/* -> serve from presentation/reveal/
          else if (urlPath.startsWith("/reveal/")) {
            filePath = path.join(presentationDir, urlPath);
          }
          // /audio/* -> serve from output/audio/
          else if (urlPath.startsWith("/audio/")) {
            filePath = path.join(outputDir, urlPath);
          }
          // /images/* -> serve from output/images/
          else if (urlPath.startsWith("/images/")) {
            filePath = path.join(outputDir, urlPath);
          }
          // Everything else -> try presentation dir first, then output dir
          else {
            filePath = path.join(presentationDir, urlPath);
            if (!existsSync(filePath)) {
              filePath = path.join(outputDir, urlPath);
            }
          }

          // Default to index.html for directories
          if (filePath.endsWith("/")) {
            filePath = path.join(filePath, "index.html");
          }

          // Check if file exists
          if (!existsSync(filePath)) {
            console.log(`   ❌ 404 Not Found: ${urlPath} (tried: ${filePath})`);
            res.writeHead(404);
            res.end("Not found");
            return;
          }

          // Read and serve file
          let content = await fs.readFile(filePath);
          const ext = path.extname(filePath);

          // If this is the main HTML and we have debug overlay data, inject the overlay script
          if (isMainHtml && this.debugOverlayData) {
            let htmlContent = content.toString("utf-8");
            const overlayScript = this.generateDebugOverlayScript(
              this.debugOverlayData,
            );
            // Inject before closing </body> tag
            htmlContent = htmlContent.replace(
              "</body>",
              `${overlayScript}</body>`,
            );
            content = Buffer.from(htmlContent, "utf-8");
          }

          // Set content type
          const contentTypes: Record<string, string> = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
          };

          const contentType = contentTypes[ext] || "application/octet-stream";
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content);
        } catch (error) {
          console.error("Server error:", error);
          res.writeHead(500);
          res.end("Internal server error");
        }
      });

      // Listen on random available port
      this.httpServer.listen(0, () => {
        const address = this.httpServer?.address();
        if (address && typeof address !== "string") {
          this.serverPort = address.port;
          resolve(`http://localhost:${this.serverPort}`);
        } else {
          reject(new Error("Failed to start HTTP server"));
        }
      });
    });
  }

  /**
   * Start dev server and open presentation in browser
   */
  async start(options: DevServerOptions): Promise<void> {
    const {
      htmlPath,
      autoAdvance = false,
      timeline,
      audioBaseDir,
      slowMo = 100,
      debugOverlayData,
    } = options;

    // Store debug overlay data for injection
    this.debugOverlayData = debugOverlayData || null;

    console.log("🚀 Starting dev server...");
    console.log(`   Mode: ${autoAdvance ? "Auto-advance" : "Manual"}`);
    console.log(`   HTML: ${htmlPath}`);
    if (this.debugOverlayData) {
      console.log(`   Debug overlay: Enabled (press 'D' to toggle)`);
    }

    // Start HTTP server
    const serverUrl = await this.startHttpServer(htmlPath);
    console.log(`   Server: ${serverUrl}`);

    if (autoAdvance) {
      // In auto mode, let orchestrator handle the browser
      console.log("✅ HTTP server ready");
      console.log("");
      if (!timeline || !audioBaseDir) {
        throw new Error(
          "Timeline and audioBaseDir required for auto-advance mode",
        );
      }

      console.log("🎬 Running auto-advance mode...");
      console.log("   Slides will advance automatically based on timeline");
      console.log("   Press Ctrl+C to stop");
      console.log("");

      // Run orchestrator without video recording
      const orchestrator = new AudioSyncOrchestrator();

      orchestrator.onProgress((progress) => {
        const emoji =
          {
            navigating: "➡️",
            playing_audio: "🔊",
            pausing: "⏸️",
            complete: "✅",
            executing: "⚙️",
          }[progress.phase] || "⚙️";

        console.log(
          `${emoji} ${progress.phase} (${progress.percentage.toFixed(0)}%)`,
        );
      });

      const result = await orchestrator.run({
        htmlPath: `${serverUrl}?autoplay=true`, // Use HTTP URL with autoplay parameter
        timeline,
        audioBaseDir,
        // recordVideo is omitted - no video recording in dev mode
        headless: false, // Use visible browser
      });

      if (result.success) {
        console.log("");
        console.log("✅ Auto-advance complete!");
        console.log("   Browser will remain open for inspection");
        console.log("   Press Ctrl+C to close");
        console.log("");
      } else {
        console.error("❌ Auto-advance failed:", result.error);
      }

      // Keep HTTP server running - orchestrator's browser will stay open
      await this.waitForever();
    } else {
      // In manual mode, launch our own browser
      this.browser = await chromium.launch({
        headless: false,
        slowMo,
        args: ["--auto-open-devtools-for-tabs"], // Open DevTools by default
      });

      this.page = await this.browser.newPage();

      // Load presentation from HTTP server
      await this.page.goto(serverUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      console.log("✅ Presentation loaded");
      console.log(`   URL: ${serverUrl}`);
      console.log("");
      console.log("🎮 Manual mode active");
      console.log("   Use arrow keys or click to navigate slides");
      console.log("   Audio will play automatically on slide change");
      console.log("   Press Ctrl+C to close");
      console.log("");

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
        console.log("");
        console.log("👋 Closing dev server...");
        await this.stop();
        process.exit(0);
      };
      process.on("SIGINT", sigintHandler);

      // Handle browser close
      if (this.browser) {
        this.browser.on("disconnected", () => {
          console.log("");
          console.log("👋 Browser closed");
          process.exit(0);
        });
      }

      // Keep process alive
      const keepAlive = setInterval(() => {
        // Just keep the process running
      }, 1000);

      // Cleanup interval when promise resolves
      process.on("exit", () => {
        clearInterval(keepAlive);
      });
    });
  }

  /**
   * Generate debug overlay script to inject into HTML
   */
  private generateDebugOverlayScript(
    overlayData: Map<string, { narration: string; fragmentCount: number }>,
  ): string {
    // Convert Map to plain object for JSON serialization
    const dataObject: Record<
      string,
      { narration: string; fragmentCount: number }
    > = {};
    overlayData.forEach((value, key) => {
      dataObject[key] = value;
    });

    return `
  <!-- Debug Overlay (injected by dev server) -->
  <style>
    #debug-overlay {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 500px;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s ease;
    }

    #debug-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    #debug-overlay h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #4CAF50;
      border-bottom: 1px solid #4CAF50;
      padding-bottom: 5px;
    }

    #debug-overlay .section {
      margin-bottom: 12px;
    }

    #debug-overlay .label {
      color: #888;
      font-weight: bold;
      margin-right: 5px;
    }

    #debug-overlay .value {
      color: #fff;
    }

    #debug-overlay .narration {
      color: #FFD700;
      line-height: 1.4;
      margin-top: 5px;
      font-style: italic;
    }

    #debug-overlay .progress-bar {
      width: 100%;
      height: 6px;
      background: #333;
      border-radius: 3px;
      margin-top: 5px;
      overflow: hidden;
    }

    #debug-overlay .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      transition: width 0.3s ease;
    }
  </style>

  <div id="debug-overlay">
    <h3>🐛 Debug Overlay</h3>
    <div class="section">
      <span class="label">Slide:</span>
      <span class="value" id="debug-slide">-</span>
    </div>
    <div class="section">
      <span class="label">Fragments:</span>
      <span class="value" id="debug-fragments">-</span>
    </div>
    <div class="section">
      <span class="label">Audio:</span>
      <span class="value" id="debug-audio">-</span>
    </div>
    <div class="section">
      <span class="label">Narration:</span>
      <div class="narration" id="debug-narration">-</div>
    </div>
    <div class="section">
      <span class="label">Progress:</span>
      <span class="value" id="debug-progress">-</span>
      <div class="progress-bar">
        <div class="progress-fill" id="debug-progress-bar" style="width: 0%"></div>
      </div>
    </div>
  </div>

  <script>
    // Debug overlay controller
    (function() {
      // Store presentation data
      window.PRESENTATION_DATA = ${JSON.stringify(dataObject, null, 2)};

      const overlay = document.getElementById('debug-overlay');
      const slideEl = document.getElementById('debug-slide');
      const fragmentsEl = document.getElementById('debug-fragments');
      const audioEl = document.getElementById('debug-audio');
      const narrationEl = document.getElementById('debug-narration');
      const progressEl = document.getElementById('debug-progress');
      const progressBarEl = document.getElementById('debug-progress-bar');

      let fragmentsShown = 0;
      let totalSlides = 0;

      // Update overlay with current slide info
      function updateOverlay(slide) {
        const slideId = slide.id;
        const slideIndex = Reveal.getIndices().h;
        totalSlides = Reveal.getTotalSlides();

        // Update slide info
        slideEl.textContent = \`#\${slideIndex + 1} (\${slideId})\`;

        // Get slide data from window.PRESENTATION_DATA
        const slideData = window.PRESENTATION_DATA[slideId];

        if (slideData) {
          // Update fragments
          const fragmentCount = slideData.fragmentCount || 0;
          if (fragmentCount > 0) {
            fragmentsEl.textContent = \`\${fragmentsShown}/\${fragmentCount} revealed\`;
          } else {
            fragmentsEl.textContent = 'None';
          }

          // Update narration
          if (slideData.narration) {
            narrationEl.textContent = slideData.narration;
          } else {
            narrationEl.textContent = 'No narration text';
          }
        } else {
          fragmentsEl.textContent = 'Unknown';
          narrationEl.textContent = 'No data available';
        }

        // Update audio status (from audio controller if available)
        const audioController = window.revealAudioController;
        const currentAudio = audioController?.getCurrentAudio();
        if (currentAudio && !currentAudio.paused) {
          const remaining = currentAudio.duration - currentAudio.currentTime;
          audioEl.textContent = \`🔊 Playing (\${remaining.toFixed(1)}s remaining)\`;
        } else {
          audioEl.textContent = '⏸️  Not playing';
        }

        // Update progress
        const progressPercent = ((slideIndex + 1) / totalSlides) * 100;
        progressEl.textContent = \`\${slideIndex + 1}/\${totalSlides} (\${progressPercent.toFixed(0)}%)\`;
        progressBarEl.style.width = \`\${progressPercent}%\`;
      }

      // Listen for slide changes
      Reveal.on('slidechanged', event => {
        fragmentsShown = 0; // Reset fragment counter
        updateOverlay(event.currentSlide);
      });

      // Listen for fragment changes
      Reveal.on('fragmentshown', event => {
        fragmentsShown++;
        updateOverlay(Reveal.getCurrentSlide());
      });

      Reveal.on('fragmenthidden', event => {
        fragmentsShown--;
        updateOverlay(Reveal.getCurrentSlide());
      });

      // Initial update when ready
      Reveal.on('ready', event => {
        updateOverlay(event.currentSlide);

        // Register D as a custom hotkey so it appears in the ? help overlay
        Reveal.addKeyBinding(
          { keyCode: 68, key: 'D', description: 'Toggle debug overlay' },
          function() { overlay.classList.toggle('hidden'); }
        );
      });

      console.log('🐛 Debug overlay loaded - Press "D" to toggle');
    })();
  </script>
`;
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
