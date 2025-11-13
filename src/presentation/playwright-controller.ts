/**
 * Playwright controller for reveal.js presentations
 *
 * Provides browser automation for:
 * - Launching browser and loading presentation
 * - Controlling reveal.js navigation (next, prev, slide)
 * - Listening to reveal.js events
 * - Taking screenshots
 * - Recording video
 */

import { chromium } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Reveal.js slide indices (horizontal and vertical)
 */
export interface RevealIndices {
  h: number; // Horizontal index
  v: number; // Vertical index
  f?: number; // Fragment index (optional)
}

/**
 * Reveal.js slide change event data
 */
export interface SlideChangedEvent {
  indexh: number;
  indexv: number;
  previousSlide?: HTMLElement;
  currentSlide: HTMLElement;
}

/**
 * Reveal.js fragment event data
 */
export interface FragmentEvent {
  fragment: HTMLElement;
  index: number;
}

/**
 * Event handler types
 */
export type SlideChangedHandler = (event: SlideChangedEvent) => void | Promise<void>;
export type FragmentShownHandler = (event: FragmentEvent) => void | Promise<void>;
export type FragmentHiddenHandler = (event: FragmentEvent) => void | Promise<void>;
export type ReadyHandler = () => void | Promise<void>;

/**
 * Controller options
 */
export interface ControllerOptions {
  /** Browser to use (default: chromium) */
  browserType?: 'chromium' | 'firefox' | 'webkit';

  /** Headless mode (default: true) */
  headless?: boolean;

  /** Video recording directory (optional) */
  recordVideo?: string;

  /** Video size (default: 1920x1080) */
  videoSize?: { width: number; height: number };

  /** Viewport size (default: 1920x1080) */
  viewportSize?: { width: number; height: number };

  /** Device scale factor (default: 1) */
  deviceScaleFactor?: number;
}

// ============================================================================
// PLAYWRIGHT CONTROLLER CLASS
// ============================================================================

export class PlaywrightRevealController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isReady = false;

  /**
   * Launch browser and load presentation
   */
  async launch(htmlPath: string, options: ControllerOptions = {}): Promise<void> {
    const {
      browserType: _browserType = 'chromium',
      headless = true,
      recordVideo,
      videoSize = { width: 1920, height: 1080 },
      viewportSize = { width: 1920, height: 1080 },
      deviceScaleFactor = 1,
    } = options;

    // Launch browser with autoplay enabled
    this.browser = await chromium.launch({
      headless,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });

    // Create context with video recording if specified
    const contextOptions: any = {
      viewport: viewportSize,
      deviceScaleFactor,
    };

    if (recordVideo) {
      contextOptions.recordVideo = {
        dir: recordVideo,
        size: videoSize,
      };
    }

    this.context = await this.browser.newContext(contextOptions);

    // Create page
    this.page = await this.context.newPage();

    // Capture console messages for debugging
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`   🔴 Browser console error: ${text}`);
      } else if (type === 'warning') {
        console.log(`   ⚠️  Browser console warning: ${text}`);
      } else if (type === 'log') {
        // Show logs from audio controller (they start with timestamps like [0.52s])
        if (text.includes('[') && text.includes('s]')) {
          console.log(`   ${text}`);
        }
      }
    });

    // Capture page errors
    this.page.on('pageerror', (error) => {
      console.log(`   💥 Browser page error: ${error.message}`);
    });

    // Load HTML file (support both file paths and HTTP URLs)
    let url = htmlPath.startsWith('http://') || htmlPath.startsWith('https://')
      ? htmlPath
      : `file://${path.resolve(htmlPath)}`;

    // Add autoplay parameter to enable audio automatically (required for video recording)
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}autoplay=true`;

    console.log(`   Loading URL: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });

    // Wait for reveal.js to initialize
    await this.waitForReveal();

    this.isReady = true;
  }

  /**
   * Wait for reveal.js to be ready
   */
  private async waitForReveal(): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    // Add diagnostic logging
    console.log('⏳ Waiting for Reveal.js to initialize...');

    // Check what's in the page before waiting
    const initialCheck = await this.page.evaluate(() => {
      const win = window as any;
      return {
        hasReveal: typeof win.Reveal !== 'undefined',
        revealKeys: typeof win.Reveal !== 'undefined' ? Object.keys(win.Reveal).slice(0, 10) : [],
        hasIsReady: typeof win.Reveal !== 'undefined' && typeof win.Reveal.isReady === 'function',
        isReadyValue: typeof win.Reveal !== 'undefined' && typeof win.Reveal.isReady === 'function' ? win.Reveal.isReady() : undefined,
      };
    });

    console.log('   Initial state:', JSON.stringify(initialCheck, null, 2));

    try {
      // Wait for Reveal object to be available
      await this.page.waitForFunction(
        () => typeof (window as any).Reveal !== 'undefined' && (window as any).Reveal.isReady(),
        { timeout: 60000 }  // Increase timeout to 60s for debugging
      );
      console.log('✅ Reveal.js ready');
    } catch (error) {
      // Get final state on failure
      const finalCheck = await this.page.evaluate(() => {
        const win = window as any;
        return {
          hasReveal: typeof win.Reveal !== 'undefined',
          revealKeys: typeof win.Reveal !== 'undefined' ? Object.keys(win.Reveal).slice(0, 10) : [],
          hasIsReady: typeof win.Reveal !== 'undefined' && typeof win.Reveal.isReady === 'function',
          isReadyValue: typeof win.Reveal !== 'undefined' && typeof win.Reveal.isReady === 'function' ? win.Reveal.isReady() : undefined,
        };
      });
      console.log('❌ Timeout waiting for Reveal.js');
      console.log('   Final state:', JSON.stringify(finalCheck, null, 2));

      // Also check for console errors
      throw error;
    }
  }

  /**
   * Check if controller is ready
   */
  isInitialized(): boolean {
    return this.isReady && this.page !== null;
  }

  // ============================================================================
  // NAVIGATION METHODS
  // ============================================================================

  /**
   * Navigate to next slide
   */
  async next(): Promise<void> {
    this.ensureReady();
    await this.page!.evaluate(() => (window as any).Reveal.next());
  }

  /**
   * Navigate to previous slide
   */
  async prev(): Promise<void> {
    this.ensureReady();
    await this.page!.evaluate(() => (window as any).Reveal.prev());
  }

  /**
   * Navigate to specific slide
   */
  async slide(h: number, v: number = 0, f?: number): Promise<void> {
    this.ensureReady();
    await this.page!.evaluate(
      ({ h, v, f }) => (window as any).Reveal.slide(h, v, f),
      { h, v, f }
    );
  }

  /**
   * Navigate to next fragment
   */
  async nextFragment(): Promise<boolean> {
    this.ensureReady();
    return await this.page!.evaluate(() => (window as any).Reveal.nextFragment());
  }

  /**
   * Navigate to previous fragment
   */
  async prevFragment(): Promise<boolean> {
    this.ensureReady();
    return await this.page!.evaluate(() => (window as any).Reveal.prevFragment());
  }

  // ============================================================================
  // STATE METHODS
  // ============================================================================

  /**
   * Get current slide indices
   */
  async getIndices(): Promise<RevealIndices> {
    this.ensureReady();
    return await this.page!.evaluate(() => (window as any).Reveal.getIndices());
  }

  /**
   * Get total number of slides
   */
  async getTotalSlides(): Promise<number> {
    this.ensureReady();
    return await this.page!.evaluate(() => {
      const reveal = (window as any).Reveal;
      const slides = reveal.getSlides();
      return slides.length;
    });
  }

  /**
   * Get current slide element
   */
  async getCurrentSlide(): Promise<any> {
    this.ensureReady();
    return await this.page!.evaluate(() => {
      const slide = (window as any).Reveal.getCurrentSlide();
      return {
        id: slide.id,
        dataset: slide.dataset,
      };
    });
  }

  /**
   * Check if presentation is paused
   */
  async isPaused(): Promise<boolean> {
    this.ensureReady();
    return await this.page!.evaluate(() => (window as any).Reveal.isPaused());
  }

  /**
   * Check if presentation is in overview mode
   */
  async isOverview(): Promise<boolean> {
    this.ensureReady();
    return await this.page!.evaluate(() => (window as any).Reveal.isOverview());
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  /**
   * Listen for slide changed events
   */
  async onSlideChanged(handler: SlideChangedHandler): Promise<void> {
    this.ensureReady();

    await this.page!.exposeFunction('handleSlideChanged', async (event: any) => {
      await handler({
        indexh: event.indexh,
        indexv: event.indexv,
        currentSlide: event.currentSlide,
        previousSlide: event.previousSlide,
      });
    });

    await this.page!.evaluate(() => {
      (window as any).Reveal.on('slidechanged', (event: any) => {
        (window as any).handleSlideChanged({
          indexh: event.indexh,
          indexv: event.indexv,
          currentSlide: { id: event.currentSlide?.id },
          previousSlide: event.previousSlide ? { id: event.previousSlide.id } : undefined,
        });
      });
    });
  }

  /**
   * Listen for fragment shown events
   */
  async onFragmentShown(handler: FragmentShownHandler): Promise<void> {
    this.ensureReady();

    await this.page!.exposeFunction('handleFragmentShown', async (event: any) => {
      await handler({
        fragment: event.fragment,
        index: event.index,
      });
    });

    await this.page!.evaluate(() => {
      (window as any).Reveal.on('fragmentshown', (event: any) => {
        (window as any).handleFragmentShown({
          fragment: { id: event.fragment?.id },
          index: event.index,
        });
      });
    });
  }

  /**
   * Listen for fragment hidden events
   */
  async onFragmentHidden(handler: FragmentHiddenHandler): Promise<void> {
    this.ensureReady();

    await this.page!.exposeFunction('handleFragmentHidden', async (event: any) => {
      await handler({
        fragment: event.fragment,
        index: event.index,
      });
    });

    await this.page!.evaluate(() => {
      (window as any).Reveal.on('fragmenthidden', (event: any) => {
        (window as any).handleFragmentHidden({
          fragment: { id: event.fragment?.id },
          index: event.index,
        });
      });
    });
  }

  /**
   * Listen for ready event
   */
  async onReady(handler: ReadyHandler): Promise<void> {
    this.ensureReady();

    await this.page!.exposeFunction('handleReady', async () => {
      await handler();
    });

    await this.page!.evaluate(() => {
      (window as any).Reveal.on('ready', () => {
        (window as any).handleReady();
      });
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Take screenshot
   */
  async screenshot(path: string): Promise<void> {
    this.ensureReady();
    await this.page!.screenshot({ path, fullPage: false });
  }

  /**
   * Wait for specified duration
   */
  async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Evaluate JavaScript in page context
   */
  async evaluate<T>(fn: () => T): Promise<T> {
    this.ensureReady();
    return await this.page!.evaluate(fn);
  }

  /**
   * Get page instance (for advanced usage)
   */
  getPage(): Page {
    this.ensureReady();
    return this.page!;
  }

  /**
   * Get video path (if recording)
   */
  async getVideoPath(): Promise<string | null> {
    if (!this.page) {
      return null;
    }

    const video = this.page.video();
    if (!video) {
      return null;
    }

    return await video.path();
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.isReady = false;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Ensure controller is ready
   */
  private ensureReady(): void {
    if (!this.isReady || !this.page) {
      throw new Error('Controller not initialized. Call launch() first.');
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new Playwright controller instance
 */
export function createPlaywrightController(): PlaywrightRevealController {
  return new PlaywrightRevealController();
}
