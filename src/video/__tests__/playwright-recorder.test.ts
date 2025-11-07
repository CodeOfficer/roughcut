/**
 * Tests for Playwright video recorder
 * Tests video configuration, file management, and metadata extraction
 */

import {
  PlaywrightVideoRecorder,
  parseResolution,
  VIDEO_RESOLUTIONS,
} from '../playwright-recorder.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('PlaywrightVideoRecorder', () => {
  let recorder: PlaywrightVideoRecorder;
  let tempDir: string;

  beforeEach(async () => {
    recorder = new PlaywrightVideoRecorder();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'recorder-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }
  });

  // ==========================================================================
  // CONTEXT OPTIONS GENERATION
  // ==========================================================================

  describe('Context Options Generation', () => {
    it('should generate context options with default resolution', () => {
      const config = {
        outputDir: './videos',
      };

      const options = recorder.generateContextOptions(config);

      expect(options.recordVideo.dir).toBe('./videos');
      expect(options.recordVideo.size.width).toBe(1920);
      expect(options.recordVideo.size.height).toBe(1080);
      expect(options.viewport.width).toBe(1920);
      expect(options.viewport.height).toBe(1080);
    });

    it('should generate context options with custom resolution', () => {
      const config = {
        outputDir: './videos',
        width: 1280,
        height: 720,
      };

      const options = recorder.generateContextOptions(config);

      expect(options.recordVideo.size.width).toBe(1280);
      expect(options.recordVideo.size.height).toBe(720);
      expect(options.viewport.width).toBe(1280);
      expect(options.viewport.height).toBe(720);
    });

    it('should match viewport to video size', () => {
      const config = {
        outputDir: './videos',
        width: 2560,
        height: 1440,
      };

      const options = recorder.generateContextOptions(config);

      expect(options.viewport.width).toBe(options.recordVideo.size.width);
      expect(options.viewport.height).toBe(options.recordVideo.size.height);
    });
  });

  // ==========================================================================
  // VIDEO PROCESSING
  // ==========================================================================

  describe('Video Processing', () => {
    it('should process recorded video and extract metadata', async () => {
      // Create mock video file
      const videoPath = path.join(tempDir, 'test-video.webm');
      await fs.writeFile(videoPath, Buffer.from('mock video data'));

      const result = await recorder.processRecordedVideo(videoPath);

      expect(result.videoPath).toBe(videoPath);
      expect(result.sizeBytes).toBeGreaterThan(0);
      expect(result.format).toBe('webm');
      expect(result.resolution.width).toBe(1920);
      expect(result.resolution.height).toBe(1080);
    });

    it('should rename video file when target filename provided', async () => {
      const originalPath = path.join(tempDir, 'original.webm');
      await fs.writeFile(originalPath, Buffer.from('video data'));

      const result = await recorder.processRecordedVideo(originalPath, 'renamed-video');

      expect(result.videoPath).toBe(path.join(tempDir, 'renamed-video.webm'));

      // Verify original file was renamed
      const originalExists = await fs.access(originalPath).then(() => true).catch(() => false);
      const newExists = await fs.access(result.videoPath).then(() => true).catch(() => false);

      expect(originalExists).toBe(false);
      expect(newExists).toBe(true);
    });

    it('should throw error if video file does not exist', async () => {
      await expect(
        recorder.processRecordedVideo('/nonexistent/video.webm')
      ).rejects.toThrow('Recorded video not found');
    });

    it('should detect mp4 format', async () => {
      const videoPath = path.join(tempDir, 'test.mp4');
      await fs.writeFile(videoPath, Buffer.from('mock data'));

      const result = await recorder.processRecordedVideo(videoPath);

      expect(result.format).toBe('mp4');
    });

    it('should include file size in result', async () => {
      const videoPath = path.join(tempDir, 'test.webm');
      const data = Buffer.alloc(1024 * 100); // 100KB
      await fs.writeFile(videoPath, data);

      const result = await recorder.processRecordedVideo(videoPath);

      expect(result.sizeBytes).toBe(1024 * 100);
    });
  });

  // ==========================================================================
  // FILE WAITING
  // ==========================================================================

  describe('File Waiting', () => {
    it('should wait for video file to appear', async () => {
      const videoDir = tempDir;

      // Create video file after a delay
      setTimeout(async () => {
        await fs.writeFile(path.join(videoDir, 'test.webm'), Buffer.from('video'));
      }, 500);

      const videoPath = await recorder.waitForVideoFile(videoDir, 2000);

      expect(videoPath).toContain('test.webm');
    });

    it('should throw error if video file does not appear', async () => {
      await expect(
        recorder.waitForVideoFile(tempDir, 1000)
      ).rejects.toThrow('Video file not found');
    });

    it('should find mp4 files', async () => {
      setTimeout(async () => {
        await fs.writeFile(path.join(tempDir, 'test.mp4'), Buffer.from('video'));
      }, 300);

      const videoPath = await recorder.waitForVideoFile(tempDir, 2000);

      expect(videoPath).toContain('test.mp4');
    });

    it('should wait for file to have content', async () => {
      const videoPath = path.join(tempDir, 'test.webm');

      // Create empty file first, then add content
      setTimeout(async () => {
        await fs.writeFile(videoPath, Buffer.from(''));
        setTimeout(async () => {
          await fs.writeFile(videoPath, Buffer.from('video data'));
        }, 300);
      }, 200);

      const result = await recorder.waitForVideoFile(tempDir, 3000);

      expect(result).toBe(videoPath);
    });
  });

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  describe('Utility Functions', () => {
    it('should ensure output directory exists', async () => {
      const outputDir = path.join(tempDir, 'nested', 'output', 'dir');

      await recorder.ensureOutputDir(outputDir);

      const exists = await fs.access(outputDir).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should cleanup video files in directory', async () => {
      // Create video files
      await fs.writeFile(path.join(tempDir, 'video1.webm'), Buffer.from('data'));
      await fs.writeFile(path.join(tempDir, 'video2.mp4'), Buffer.from('data'));
      await fs.writeFile(path.join(tempDir, 'other.txt'), Buffer.from('data'));

      await recorder.cleanupVideoFiles(tempDir);

      const files = await fs.readdir(tempDir);

      // Video files should be gone
      expect(files).not.toContain('video1.webm');
      expect(files).not.toContain('video2.mp4');

      // Other files should remain
      expect(files).toContain('other.txt');
    });

    it('should generate default filename with timestamp', () => {
      const filename = recorder.generateDefaultFilename();

      expect(filename).toContain('presentation-');
      expect(filename).toMatch(/presentation-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
    });

    it('should generate filename from presentation title', () => {
      const filename = recorder.generateDefaultFilename('My Awesome Presentation');

      expect(filename).toContain('my-awesome-presentation');
      expect(filename).toMatch(/my-awesome-presentation-\d{4}/);
    });

    it('should sanitize presentation title in filename', () => {
      const filename = recorder.generateDefaultFilename('Test!@#$%Presentation&*()123');

      expect(filename).toContain('test-presentation-123');
      expect(filename).not.toMatch(/[!@#$%&*()]/);
    });
  });
});

// ==========================================================================
// HELPER FUNCTION TESTS
// ==========================================================================

describe('Helper Functions', () => {
  describe('parseResolution', () => {
    it('should parse preset resolutions', () => {
      expect(parseResolution('720p')).toEqual({ width: 1280, height: 720 });
      expect(parseResolution('1080p')).toEqual({ width: 1920, height: 1080 });
      expect(parseResolution('1440p')).toEqual({ width: 2560, height: 1440 });
      expect(parseResolution('4K')).toEqual({ width: 3840, height: 2160 });
    });

    it('should parse widthxheight format', () => {
      expect(parseResolution('1920x1080')).toEqual({ width: 1920, height: 1080 });
      expect(parseResolution('1280x720')).toEqual({ width: 1280, height: 720 });
      expect(parseResolution('3840x2160')).toEqual({ width: 3840, height: 2160 });
    });

    it('should default to 1080p for invalid format', () => {
      expect(parseResolution('invalid')).toEqual({ width: 1920, height: 1080 });
      expect(parseResolution('123')).toEqual({ width: 1920, height: 1080 });
      expect(parseResolution('')).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('VIDEO_RESOLUTIONS', () => {
    it('should have standard resolutions defined', () => {
      expect(VIDEO_RESOLUTIONS['720p']).toBeDefined();
      expect(VIDEO_RESOLUTIONS['1080p']).toBeDefined();
      expect(VIDEO_RESOLUTIONS['1440p']).toBeDefined();
      expect(VIDEO_RESOLUTIONS['4K']).toBeDefined();
    });

    it('should have correct dimensions', () => {
      expect(VIDEO_RESOLUTIONS['1080p'].width).toBe(1920);
      expect(VIDEO_RESOLUTIONS['1080p'].height).toBe(1080);
    });
  });
});
