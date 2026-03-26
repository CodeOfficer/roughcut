/**
 * Tests for Playwright reveal.js controller
 * Tests browser automation, navigation, state, and events
 */

import { PlaywrightRevealController } from "../playwright-controller.js";
import { RevealHTMLGenerator } from "../revealjs-generator.js";
import type { RevealPresentation } from "../../core/types.js";
import { DEFAULT_SLIDE_METADATA } from "../../core/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

describe("PlaywrightRevealController", () => {
  let controller: PlaywrightRevealController;
  let tempDir: string;
  let testHtmlPath: string;

  beforeEach(async () => {
    controller = new PlaywrightRevealController();

    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "playwright-test-"));

    // Generate test HTML
    testHtmlPath = await generateTestPresentation(tempDir);
  });

  afterEach(async () => {
    // Close browser
    if (controller) {
      await controller.close();
    }

    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  // ==========================================================================
  // INITIALIZATION TESTS
  // ==========================================================================

  describe("Initialization", () => {
    it("should launch browser and load presentation", async () => {
      await controller.launch(testHtmlPath, { headless: true });

      expect(controller.isInitialized()).toBe(true);
    });

    it("should throw error if accessing methods before launch", async () => {
      await expect(controller.next()).rejects.toThrow(
        "Controller not initialized",
      );
    });

    it("should support non-headless mode", async () => {
      await controller.launch(testHtmlPath, { headless: true });

      expect(controller.isInitialized()).toBe(true);
    });
  });

  // ==========================================================================
  // NAVIGATION TESTS
  // ==========================================================================

  describe("Navigation", () => {
    beforeEach(async () => {
      await controller.launch(testHtmlPath, { headless: true });
    });

    it("should navigate to next slide", async () => {
      const initialIndices = await controller.getIndices();
      expect(initialIndices.h).toBe(0);

      await controller.next();

      const newIndices = await controller.getIndices();
      expect(newIndices.h).toBe(1);
    });

    it("should navigate to previous slide", async () => {
      // Go to slide 2
      await controller.slide(1);

      const beforeIndices = await controller.getIndices();
      expect(beforeIndices.h).toBe(1);

      // Go back
      await controller.prev();

      const afterIndices = await controller.getIndices();
      expect(afterIndices.h).toBe(0);
    });

    it("should navigate to specific slide", async () => {
      await controller.slide(2);

      const indices = await controller.getIndices();
      expect(indices.h).toBe(2);
      expect(indices.v).toBe(0);
    });

    it("should navigate to specific horizontal and vertical slide", async () => {
      // Assuming presentation has vertical slides
      await controller.slide(1, 0);

      const indices = await controller.getIndices();
      expect(indices.h).toBe(1);
      expect(indices.v).toBe(0);
    });
  });

  // ==========================================================================
  // STATE TESTS
  // ==========================================================================

  describe("State", () => {
    beforeEach(async () => {
      await controller.launch(testHtmlPath, { headless: true });
    });

    it("should get current indices", async () => {
      const indices = await controller.getIndices();

      expect(indices).toHaveProperty("h");
      expect(indices).toHaveProperty("v");
      expect(typeof indices.h).toBe("number");
      expect(typeof indices.v).toBe("number");
    });

    it("should get total slides", async () => {
      const total = await controller.getTotalSlides();

      expect(typeof total).toBe("number");
      expect(total).toBeGreaterThan(0);
    });

    it("should get current slide", async () => {
      const slide = await controller.getCurrentSlide();

      expect(slide).toHaveProperty("id");
      expect(slide.id).toBeTruthy();
    });

    it("should check if paused", async () => {
      const paused = await controller.isPaused();

      expect(typeof paused).toBe("boolean");
    });

    it("should check if in overview mode", async () => {
      const overview = await controller.isOverview();

      expect(typeof overview).toBe("boolean");
      expect(overview).toBe(false); // Should not be in overview initially
    });
  });

  // ==========================================================================
  // EVENT TESTS
  // ==========================================================================

  describe("Events", () => {
    beforeEach(async () => {
      await controller.launch(testHtmlPath, { headless: true });
    });

    it("should listen to slide changed events", async () => {
      const events: Array<{
        indexh: number;
        indexv: number;
        currentSlide?: { id?: string };
      }> = [];

      await controller.onSlideChanged(async (event) => {
        events.push(event);
      });

      // Navigate to trigger event
      await controller.next();

      // Wait for event to fire
      await controller.wait(100);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty("indexh");
      expect(events[0]).toHaveProperty("indexv");
    });

    it("should provide current slide in event", async () => {
      let currentSlideId: string | null = null;

      await controller.onSlideChanged(async (event) => {
        currentSlideId = event.currentSlide?.id;
      });

      await controller.next();
      await controller.wait(100);

      expect(currentSlideId).toBeTruthy();
    });
  });

  // ==========================================================================
  // UTILITY TESTS
  // ==========================================================================

  describe("Utilities", () => {
    beforeEach(async () => {
      await controller.launch(testHtmlPath, { headless: true });
    });

    it("should take screenshot", async () => {
      const screenshotPath = path.join(tempDir, "screenshot.png");

      await controller.screenshot(screenshotPath);

      const exists = await fs
        .access(screenshotPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Check file has content
      const stats = await fs.stat(screenshotPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it("should wait for specified duration", async () => {
      const start = Date.now();

      await controller.wait(100);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });

    it("should evaluate JavaScript in page context", async () => {
      const result = await controller.evaluate(() => {
        return (
          window as unknown as { Reveal: { isReady: () => boolean } }
        ).Reveal.isReady();
      });

      expect(result).toBe(true);
    });

    it("should provide page instance", () => {
      const page = controller.getPage();

      expect(page).toBeDefined();
      expect(page).toHaveProperty("goto");
      expect(page).toHaveProperty("evaluate");
    });
  });

  // ==========================================================================
  // CLEANUP TESTS
  // ==========================================================================

  describe("Cleanup", () => {
    it("should close browser and cleanup", async () => {
      await controller.launch(testHtmlPath, { headless: true });

      expect(controller.isInitialized()).toBe(true);

      await controller.close();

      expect(controller.isInitialized()).toBe(false);
    });

    it("should handle multiple close calls gracefully", async () => {
      await controller.launch(testHtmlPath, { headless: true });

      await controller.close();
      await controller.close(); // Should not throw

      expect(controller.isInitialized()).toBe(false);
    });
  });

  // ==========================================================================
  // VIDEO RECORDING TESTS
  // ==========================================================================

  describe("Video Recording", () => {
    it("should support video recording option", async () => {
      const videoDir = path.join(tempDir, "videos");
      await fs.mkdir(videoDir, { recursive: true });

      await controller.launch(testHtmlPath, {
        headless: true,
        recordVideo: videoDir,
      });

      // Navigate a bit
      await controller.next();
      await controller.wait(500);

      // Close to finalize video
      await controller.close();

      // Check if video was created
      const files = await fs.readdir(videoDir);
      expect(files.length).toBeGreaterThan(0);

      // Check video file has content
      const videoFile = files.find((f) => f.endsWith(".webm"));
      expect(videoFile).toBeDefined();

      if (videoFile) {
        const videoPath = path.join(videoDir, videoFile);
        const stats = await fs.stat(videoPath);
        expect(stats.size).toBeGreaterThan(0);
      }
    });
  });
});

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Generate test presentation HTML
 */
async function generateTestPresentation(outputDir: string): Promise<string> {
  const presentation: RevealPresentation = {
    title: "Playwright Test Presentation",
    theme: "black",
    voice: "adam",
    resolution: "1920x1080",
    slides: [
      {
        id: "slide-001",
        index: 0,
        content: "# Slide 1\n\nFirst slide content",
        audio: null,
        playwright: null,
        notes: null,
        metadata: { ...DEFAULT_SLIDE_METADATA },
      },
      {
        id: "slide-002",
        index: 1,
        content: "# Slide 2\n\nSecond slide content",
        audio: null,
        playwright: null,
        notes: null,
        metadata: { ...DEFAULT_SLIDE_METADATA },
      },
      {
        id: "slide-003",
        index: 2,
        content: "# Slide 3\n\nThird slide content",
        audio: null,
        playwright: null,
        notes: null,
        metadata: { ...DEFAULT_SLIDE_METADATA },
      },
    ],
  };

  const generator = new RevealHTMLGenerator();
  const outputPath = path.join(outputDir, "test-presentation.html");

  await generator.generate(presentation, outputPath, {
    bundleAssets: true,
  });

  return outputPath;
}
