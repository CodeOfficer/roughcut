/**
 * Screenshot capture types for Playwright integration
 */

/**
 * Configuration for capturing screenshots
 */
export interface ScreenshotCaptureOptions {
  instructions: string;
  outputPath: string;
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Result of screenshot capture
 */
export interface ScreenshotCaptureResult {
  filePath: string;
  sizeBytes: number;
  width: number;
  height: number;
}

/**
 * Parsed instruction step for Playwright automation
 */
export interface PlaywrightInstruction {
  type: 'show' | 'action' | 'wait';
  content: string;
}
