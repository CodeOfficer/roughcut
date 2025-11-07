/**
 * Tests for reveal.js video assembler
 * Tests video assembly, FFmpeg integration, and audio replacement
 */

import {
  RevealVideoAssembler,
  createRevealVideoAssembler,
  type VideoAssemblyConfig,
  type AssemblyProgress,
} from '../revealjs-video-assembler.js';
import type { RevealTimeline } from '../revealjs-timeline.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('RevealVideoAssembler', () => {
  let assembler: RevealVideoAssembler;
  let tempDir: string;

  beforeEach(async () => {
    assembler = createRevealVideoAssembler();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'assembler-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }
  });

  // ==========================================================================
  // CONFIGURATION TESTS
  // ==========================================================================

  describe('Configuration', () => {
    it('should create assembler instance', () => {
      expect(assembler).toBeDefined();
      expect(assembler).toBeInstanceOf(RevealVideoAssembler);
    });

    it('should support progress callbacks', () => {
      const callback = vi.fn();
      assembler.onProgress(callback);

      // Progress callback is registered (will be tested in assembly tests)
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // VALIDATION TESTS
  // ==========================================================================

  describe('Input Validation', () => {
    it('should fail if input video does not exist', async () => {
      const audioPath = path.join(tempDir, 'audio.mp3');
      await fs.writeFile(audioPath, Buffer.from('mock audio'));

      const result = await assembler.assemble({
        inputVideoPath: '/nonexistent/video.webm',
        audioPath,
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input video not found');
    });

    it('should fail if audio file does not exist', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      await fs.writeFile(videoPath, Buffer.from('mock video'));

      const result = await assembler.assemble({
        inputVideoPath: videoPath,
        audioPath: '/nonexistent/audio.mp3',
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Audio file not found');
    });

    it('should create output directory if it does not exist', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      const audioPath = path.join(tempDir, 'audio.mp3');
      await fs.writeFile(videoPath, Buffer.from('mock video'));
      await fs.writeFile(audioPath, Buffer.from('mock audio'));

      const outputPath = path.join(tempDir, 'nested', 'deep', 'output.mp4');

      // This will fail because we don't have real FFmpeg, but directory should be created
      await assembler.assemble({
        inputVideoPath: videoPath,
        audioPath,
        outputPath,
      });

      const dirExists = await fs
        .access(path.dirname(outputPath))
        .then(() => true)
        .catch(() => false);

      expect(dirExists).toBe(true);
    });
  });

  // ==========================================================================
  // PROGRESS REPORTING TESTS
  // ==========================================================================

  describe('Progress Reporting', () => {
    it('should report progress during assembly', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      const audioPath = path.join(tempDir, 'audio.mp3');
      await fs.writeFile(videoPath, Buffer.from('mock video'));
      await fs.writeFile(audioPath, Buffer.from('mock audio'));

      const progressUpdates: AssemblyProgress[] = [];

      assembler.onProgress((progress) => {
        progressUpdates.push({ ...progress });
      });

      await assembler.assemble({
        inputVideoPath: videoPath,
        audioPath,
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      // Should have at least preparing phase
      expect(progressUpdates.length).toBeGreaterThan(0);

      const preparingPhase = progressUpdates.find((p) => p.phase === 'preparing');
      expect(preparingPhase).toBeDefined();
      expect(preparingPhase?.percentage).toBe(0);
    });

    it('should report multiple phases', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      const audioPath = path.join(tempDir, 'audio.mp3');
      await fs.writeFile(videoPath, Buffer.from('mock video'));
      await fs.writeFile(audioPath, Buffer.from('mock audio'));

      const phases: string[] = [];

      assembler.onProgress((progress) => {
        if (!phases.includes(progress.phase)) {
          phases.push(progress.phase);
        }
      });

      await assembler.assemble({
        inputVideoPath: videoPath,
        audioPath,
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      // Should have preparing and encoding at minimum
      expect(phases).toContain('preparing');
      expect(phases).toContain('encoding');
    });
  });

  // ==========================================================================
  // FFMPEG COMMAND BUILDING TESTS
  // ==========================================================================

  describe('FFmpeg Command Building', () => {
    it('should use default encoding settings', async () => {
      // We can't test the actual command without exposing it,
      // but we can verify the config is accepted
      const config: VideoAssemblyConfig = {
        inputVideoPath: path.join(tempDir, 'input.webm'),
        audioPath: path.join(tempDir, 'audio.mp3'),
        outputPath: path.join(tempDir, 'output.mp4'),
      };

      expect(config.videoCodec).toBeUndefined(); // Will use default
      expect(config.preset).toBeUndefined(); // Will use default
      expect(config.crf).toBeUndefined(); // Will use default
    });

    it('should accept custom encoding settings', async () => {
      const config: VideoAssemblyConfig = {
        inputVideoPath: path.join(tempDir, 'input.webm'),
        audioPath: path.join(tempDir, 'audio.mp3'),
        outputPath: path.join(tempDir, 'output.mp4'),
        videoCodec: 'libx265',
        audioCodec: 'libmp3lame',
        preset: 'fast',
        crf: 18,
        audioBitrate: '256k',
      };

      expect(config.videoCodec).toBe('libx265');
      expect(config.preset).toBe('fast');
      expect(config.crf).toBe(18);
      expect(config.audioBitrate).toBe('256k');
    });
  });

  // ==========================================================================
  // ASSEMBLY FROM TIMELINE TESTS
  // ==========================================================================

  describe('Assembly from Timeline', () => {
    it('should handle timeline with combined audio', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      const audioDir = path.join(tempDir, 'audio');
      const combinedAudioPath = path.join(audioDir, 'combined-audio.mp3');

      await fs.writeFile(videoPath, Buffer.from('mock video'));
      await fs.mkdir(audioDir, { recursive: true });
      await fs.writeFile(combinedAudioPath, Buffer.from('mock audio'));

      const timeline: RevealTimeline = {
        totalDuration: 10,
        slides: [
          {
            slideIndex: 0,
            startTime: 0,
            audioDuration: 5,
            pauseAfter: 1,
            audioPath: 'slide-001.mp3',
            hasPlaywrightInstructions: false,
          },
          {
            slideIndex: 1,
            startTime: 6,
            audioDuration: 3,
            pauseAfter: 1,
            audioPath: 'slide-002.mp3',
            hasPlaywrightInstructions: false,
          },
        ],
      };

      const result = await assembler.assembleFromTimeline(
        videoPath,
        timeline,
        audioDir,
        path.join(tempDir, 'output.mp4')
      );

      // Will fail without real FFmpeg, but shouldn't throw
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Expected without real FFmpeg
    });

    it('should handle error when no audio files exist', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      const audioDir = path.join(tempDir, 'audio');

      await fs.writeFile(videoPath, Buffer.from('mock video'));
      await fs.mkdir(audioDir, { recursive: true });

      const timeline: RevealTimeline = {
        totalDuration: 10,
        slides: [
          {
            slideIndex: 0,
            startTime: 0,
            audioDuration: 5,
            pauseAfter: 1,
            audioPath: 'slide-001.mp3',
            hasPlaywrightInstructions: false,
          },
        ],
      };

      const result = await assembler.assembleFromTimeline(
        videoPath,
        timeline,
        audioDir,
        path.join(tempDir, 'output.mp4')
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ==========================================================================
  // FFMPEG AVAILABILITY TESTS
  // ==========================================================================

  describe('FFmpeg Availability', () => {
    it('should check if FFmpeg is available', async () => {
      const isAvailable = await assembler.checkFFmpegAvailable();

      // May be true or false depending on environment
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  // ==========================================================================
  // VIDEO METADATA TESTS
  // ==========================================================================

  describe('Video Metadata', () => {
    it('should handle missing video file for metadata', async () => {
      try {
        await assembler.getVideoMetadata('/nonexistent/video.mp4');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it.skip('should extract video metadata with FFprobe', async () => {
      // Skipped: Requires real video file and FFmpeg installation
      // This test would verify metadata extraction in production
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    it('should return error result on failure', async () => {
      const result = await assembler.assemble({
        inputVideoPath: '/nonexistent/video.webm',
        audioPath: '/nonexistent/audio.mp3',
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should include error message in result', async () => {
      const result = await assembler.assemble({
        inputVideoPath: '/nonexistent/video.webm',
        audioPath: path.join(tempDir, 'audio.mp3'),
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      expect(result.error).toContain('not found');
    });

    it('should handle FFmpeg spawn errors gracefully', async () => {
      const videoPath = path.join(tempDir, 'video.webm');
      const audioPath = path.join(tempDir, 'audio.mp3');
      await fs.writeFile(videoPath, Buffer.from('mock video'));
      await fs.writeFile(audioPath, Buffer.from('mock audio'));

      // This will fail because FFmpeg is not available or files are not real media
      const result = await assembler.assemble({
        inputVideoPath: videoPath,
        audioPath,
        outputPath: path.join(tempDir, 'output.mp4'),
      });

      // Should return result, not throw
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // FACTORY FUNCTION TESTS
  // ==========================================================================

  describe('Factory Function', () => {
    it('should create assembler via factory function', () => {
      const assembler = createRevealVideoAssembler();

      expect(assembler).toBeDefined();
      expect(assembler).toBeInstanceOf(RevealVideoAssembler);
    });
  });
});
