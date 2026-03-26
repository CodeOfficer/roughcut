/**
 * Tests for audio sync orchestrator
 * Tests complete presentation orchestration flow
 */

import {
  AudioSyncOrchestrator,
  type OrchestrationProgress,
} from "../audio-sync-orchestrator.js";
import { RevealHTMLGenerator } from "../revealjs-generator.js";

import { createRevealTimelineBuilder } from "../../video/timeline.js";
import type { RevealPresentation, RevealTimeline } from "../../core/types.js";
import { DEFAULT_SLIDE_METADATA } from "../../core/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

describe("AudioSyncOrchestrator", () => {
  let orchestrator: AudioSyncOrchestrator;
  let tempDir: string;

  beforeEach(async () => {
    orchestrator = new AudioSyncOrchestrator();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "orchestrator-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }
  });

  // ==========================================================================
  // BASIC ORCHESTRATION TESTS
  // ==========================================================================

  describe("Basic Orchestration", () => {
    it("should orchestrate simple presentation without audio", async () => {
      const { htmlPath, timeline } = await generateTestPresentation(tempDir, {
        includeAudio: false,
      });

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: tempDir,
        headless: true,
      });

      expect(result.success).toBe(true);
      expect(result.slidesProcessed).toBe(2);
      expect(result.totalDuration).toBeGreaterThan(0);
    }, 30000);

    it.skip("should orchestrate presentation with audio", async () => {
      // Skipped: Audio playback in test environment is unreliable
      // The orchestration logic is tested without audio
      const { htmlPath, timeline, audioDir } = await generateTestPresentation(
        tempDir,
        {
          includeAudio: true,
        },
      );

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: audioDir,
        headless: true,
      });

      expect(result.success).toBe(true);
      expect(result.slidesProcessed).toBe(2);
    }, 30000);

    it("should process all slides in order", async () => {
      const { htmlPath, timeline } = await generateTestPresentation(tempDir, {
        slideCount: 3,
        includeAudio: false,
      });

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: tempDir,
        headless: true,
      });

      expect(result.success).toBe(true);
      expect(result.slidesProcessed).toBe(3);
    }, 30000);
  });

  // ==========================================================================
  // PROGRESS CALLBACK TESTS
  // ==========================================================================

  describe("Progress Callbacks", () => {
    it("should report progress during orchestration", async () => {
      const { htmlPath, timeline } = await generateTestPresentation(tempDir, {
        includeAudio: false,
      });

      const progressUpdates: OrchestrationProgress[] = [];

      orchestrator.onProgress(async (progress) => {
        progressUpdates.push({ ...progress });
      });

      await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: tempDir,
        headless: true,
      });

      // Should have received progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Should have navigating phase
      const navigatingPhases = progressUpdates.filter(
        (p) => p.phase === "navigating",
      );
      expect(navigatingPhases.length).toBeGreaterThan(0);

      // Should have complete phase
      const completePhase = progressUpdates.find((p) => p.phase === "complete");
      expect(completePhase).toBeDefined();
      expect(completePhase?.percentage).toBe(100);
    }, 30000);

    it("should report correct slide indices", async () => {
      const { htmlPath, timeline } = await generateTestPresentation(tempDir, {
        slideCount: 2,
        includeAudio: false,
      });

      const slideIndices: number[] = [];

      orchestrator.onProgress(async (progress) => {
        if (progress.phase === "navigating") {
          slideIndices.push(progress.slideIndex);
        }
      });

      await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: tempDir,
        headless: true,
      });

      // Should have processed slides 0 and 1
      expect(slideIndices).toContain(0);
      expect(slideIndices).toContain(1);
    }, 30000);
  });

  // ==========================================================================
  // VIDEO RECORDING TESTS
  // ==========================================================================

  describe("Video Recording", () => {
    it("should support video recording", async () => {
      const { htmlPath, timeline } = await generateTestPresentation(tempDir, {
        includeAudio: false,
      });

      const videoDir = path.join(tempDir, "videos");
      await fs.mkdir(videoDir, { recursive: true });

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: tempDir,
        recordVideo: videoDir,
        headless: true,
      });

      expect(result.success).toBe(true);
      expect(result.videoPath).toBeDefined();

      // Video file should exist
      if (result.videoPath) {
        const exists = await fs
          .access(result.videoPath)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    }, 30000);
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe("Error Handling", () => {
    it("should handle missing HTML file", async () => {
      const { timeline } = await generateTestPresentation(tempDir, {
        includeAudio: false,
      });

      const result = await orchestrator.run({
        htmlPath: "/nonexistent/file.html",
        timeline,
        audioBaseDir: tempDir,
        headless: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    }, 30000);

    it("should return error details on failure", async () => {
      const { timeline } = await generateTestPresentation(tempDir, {
        includeAudio: false,
      });

      const result = await orchestrator.run({
        htmlPath: "/invalid/path.html",
        timeline,
        audioBaseDir: tempDir,
        headless: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe("string");
    }, 30000);
  });

  // ==========================================================================
  // PLAYBACK OPTIONS TESTS
  // ==========================================================================

  describe("Playback Options", () => {
    it.skip("should support custom playback rate", async () => {
      // Skipped: Audio playback in test environment is unreliable
      const { htmlPath, timeline, audioDir } = await generateTestPresentation(
        tempDir,
        {
          includeAudio: true,
        },
      );

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: audioDir,
        playbackRate: 1.5,
        headless: true,
      });

      expect(result.success).toBe(true);
    }, 30000);

    it.skip("should support custom volume", async () => {
      // Skipped: Audio playback in test environment is unreliable
      const { htmlPath, timeline, audioDir } = await generateTestPresentation(
        tempDir,
        {
          includeAudio: true,
        },
      );

      const result = await orchestrator.run({
        htmlPath,
        timeline,
        audioBaseDir: audioDir,
        volume: 0.5,
        headless: true,
      });

      expect(result.success).toBe(true);
    }, 30000);
  });
});

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

interface GenerateOptions {
  slideCount?: number;
  includeAudio?: boolean;
}

/**
 * Generate complete test presentation with HTML, audio, and timeline
 */
async function generateTestPresentation(
  outputDir: string,
  options: GenerateOptions = {},
): Promise<{ htmlPath: string; timeline: RevealTimeline; audioDir: string }> {
  const { slideCount = 2, includeAudio = false } = options;

  // Create presentation
  const presentation: RevealPresentation = {
    title: "Orchestrator Test",
    theme: "black",
    voice: "adam",
    resolution: "1920x1080",
    slides: [],
  };

  // Add slides
  for (let i = 0; i < slideCount; i++) {
    presentation.slides.push({
      id: `slide-${String(i + 1).padStart(3, "0")}`,
      index: i,
      content: `# Slide ${i + 1}\n\nContent for slide ${i + 1}`,
      audio: includeAudio
        ? {
            rawText: `This is slide ${i + 1}`,
            cleanText: `This is slide ${i + 1}`,
            expectedDuration: null,
            pauses: [],
          }
        : null,
      playwright: null,
      notes: null,
      metadata: {
        ...DEFAULT_SLIDE_METADATA,
        pauseAfter: 0.5, // Short pause for testing
      },
    });
  }

  // Generate HTML
  const generator = new RevealHTMLGenerator();
  const htmlPath = path.join(outputDir, "presentation.html");
  await generator.generate(presentation, htmlPath, {
    bundleAssets: true,
  });

  // Generate audio if requested
  let audioDir = outputDir;
  if (includeAudio) {
    audioDir = path.join(outputDir, "audio");
    await fs.mkdir(audioDir, { recursive: true });

    // Generate mock audio files
    for (const slide of presentation.slides) {
      if (slide.audio) {
        const audioPath = path.join(audioDir, `${slide.id}.mp3`);
        // Create a minimal valid MP3 file (silent audio)
        await createMockAudioFile(audioPath);

        slide.audio.audioPath = audioPath;
        slide.audio.actualDuration = 0.5; // 500ms
      }
    }
  }

  // Build timeline
  const timelineBuilder = createRevealTimelineBuilder();

  // Create audio results map
  const audioResults = new Map();
  for (const slide of presentation.slides) {
    if (slide.audio && slide.audio.audioPath) {
      audioResults.set(slide.id, {
        slideId: slide.id,
        filePath: slide.audio.audioPath,
        durationSeconds: slide.audio.actualDuration || 0.5,
        sizeBytes: 1024,
      });
    }
  }

  const timeline = timelineBuilder.build(presentation, audioResults);

  return { htmlPath, timeline, audioDir };
}

/**
 * Create a minimal mock audio file for testing
 */
async function createMockAudioFile(filepath: string): Promise<void> {
  // Create a minimal valid MP3 file header (silent audio)
  // This is a very short silent MP3 that browsers can play
  const mp3Header = Buffer.from([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  await fs.writeFile(filepath, mp3Header);
}
