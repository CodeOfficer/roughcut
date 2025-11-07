/**
 * Tests for Playwright instruction executor
 * Tests action execution, waits, screenshots, and error handling
 */

import { PlaywrightInstructionExecutor } from '../playwright-executor.js';
import type { PlaywrightInstruction } from '../../core/revealjs-types.js';
import type { ExecutionContext } from '../playwright-executor.js';
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('PlaywrightInstructionExecutor', () => {
  let executor: PlaywrightInstructionExecutor;
  let browser: Browser;
  let page: Page;
  let tempDir: string;
  let testHtmlPath: string;

  beforeEach(async () => {
    executor = new PlaywrightInstructionExecutor();

    // Create temp directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'executor-test-'));

    // Generate test HTML
    testHtmlPath = await generateTestHTML(tempDir);

    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();

    // Load test page
    await page.goto(`file://${testHtmlPath}`);
  });

  afterEach(async () => {
    if (browser) {
      await browser.close();
    }

    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }
  });

  // ==========================================================================
  // CLICK ACTION TESTS
  // ==========================================================================

  describe('Click Actions', () => {
    it('should execute click action with ID selector', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Click #test-button',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      // Verify click happened
      const clicked = await page.locator('#test-button').getAttribute('data-clicked');
      expect(clicked).toBe('true');
    });

    it('should execute click action with class selector', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Click .submit-btn',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
    });

    it('should execute click action with text selector', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Click Submit',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // TYPE ACTION TESTS
  // ==========================================================================

  describe('Type Actions', () => {
    it('should execute type action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Type: "hello world"',
      };

      // Focus input first
      await page.focus('#text-input');

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      // Verify text was typed
      const value = await page.inputValue('#text-input');
      expect(value).toBe('hello world');
    });

    it('should execute type action with key press', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Type: "test" + Enter',
      };

      await page.focus('#text-input');

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      const value = await page.inputValue('#text-input');
      expect(value).toBe('test');
    });
  });

  // ==========================================================================
  // FILL ACTION TESTS
  // ==========================================================================

  describe('Fill Actions', () => {
    it('should execute fill action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Fill #text-input with "filled text"',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      const value = await page.inputValue('#text-input');
      expect(value).toBe('filled text');
    });

    it('should execute fill action with email', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Fill #email-input with "test@example.com"',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      const value = await page.inputValue('#email-input');
      expect(value).toBe('test@example.com');
    });
  });

  // ==========================================================================
  // CHECK/UNCHECK ACTION TESTS
  // ==========================================================================

  describe('Check/Uncheck Actions', () => {
    it('should execute check action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Check #checkbox',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      const checked = await page.isChecked('#checkbox');
      expect(checked).toBe(true);
    });

    it('should execute uncheck action', async () => {
      // Check it first
      await page.check('#checkbox');

      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Uncheck #checkbox',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      const checked = await page.isChecked('#checkbox');
      expect(checked).toBe(false);
    });
  });

  // ==========================================================================
  // HOVER ACTION TESTS
  // ==========================================================================

  describe('Hover Actions', () => {
    it('should execute hover action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Hover #hover-target',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // FOCUS ACTION TESTS
  // ==========================================================================

  describe('Focus Actions', () => {
    it('should execute focus action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Focus #text-input',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      // Verify focus
      const isFocused = await page.evaluate(() => {
        return document.activeElement?.id === 'text-input';
      });
      expect(isFocused).toBe(true);
    });
  });

  // ==========================================================================
  // PRESS KEY ACTION TESTS
  // ==========================================================================

  describe('Press Key Actions', () => {
    it('should execute press key action', async () => {
      await page.focus('#text-input');

      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Press Enter',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
    });

    it('should execute press escape', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Press Escape',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // SELECT ACTION TESTS
  // ==========================================================================

  describe('Select Actions', () => {
    it('should execute select action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Select "Option 2" in #dropdown',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);

      const value = await page.inputValue('#dropdown');
      expect(value).toBe('option2');
    });
  });

  // ==========================================================================
  // SCROLL ACTION TESTS
  // ==========================================================================

  describe('Scroll Actions', () => {
    it('should execute scroll action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Scroll to #bottom-element',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // WAIT INSTRUCTION TESTS
  // ==========================================================================

  describe('Wait Instructions', () => {
    it('should execute wait with seconds', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'wait',
        content: '1s',
      };

      const start = Date.now();
      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);
      const elapsed = Date.now() - start;

      expect(result.success).toBe(true);
      expect(elapsed).toBeGreaterThanOrEqual(1000);
    });

    it('should execute wait with milliseconds', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'wait',
        content: '100ms',
      };

      const start = Date.now();
      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);
      const elapsed = Date.now() - start;

      expect(result.success).toBe(true);
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });

    it('should execute wait with decimal seconds', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'wait',
        content: '0.5s',
      };

      const start = Date.now();
      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);
      const elapsed = Date.now() - start;

      expect(result.success).toBe(true);
      expect(elapsed).toBeGreaterThanOrEqual(490); // Allow 10ms tolerance
    });
  });

  // ==========================================================================
  // SCREENSHOT INSTRUCTION TESTS
  // ==========================================================================

  describe('Screenshot Instructions', () => {
    it('should execute screenshot instruction', async () => {
      const screenshotDir = path.join(tempDir, 'screenshots');
      await fs.mkdir(screenshotDir, { recursive: true });

      const instruction: PlaywrightInstruction = {
        type: 'screenshot',
        content: 'test-screenshot',
      };

      const context: ExecutionContext = {
        page,
        screenshotDir,
        slideId: 'slide-001',
      };

      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
      expect(result.screenshotPath).toBeDefined();

      // Verify screenshot file exists
      const exists = await fs.access(result.screenshotPath!).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Verify file has content
      const stats = await fs.stat(result.screenshotPath!);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should sanitize screenshot names', async () => {
      const screenshotDir = path.join(tempDir, 'screenshots');
      await fs.mkdir(screenshotDir, { recursive: true });

      const instruction: PlaywrightInstruction = {
        type: 'screenshot',
        content: 'Test Screenshot #1!',
      };

      const context: ExecutionContext = {
        page,
        screenshotDir,
        slideId: 'slide-002',
      };

      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(true);
      expect(result.screenshotPath).toContain('test-screenshot--1-');
    });
  });

  // ==========================================================================
  // EXECUTE ALL TESTS
  // ==========================================================================

  describe('Execute All', () => {
    it('should execute multiple instructions sequentially', async () => {
      const instructions: PlaywrightInstruction[] = [
        { type: 'action', content: 'Fill #text-input with "test"' },
        { type: 'wait', content: '100ms' },
        { type: 'action', content: 'Click #test-button' },
      ];

      const context: ExecutionContext = { page };
      const results = await executor.executeAll(instructions, context);

      expect(results.length).toBe(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
    });

    it('should stop on first failure', async () => {
      const instructions: PlaywrightInstruction[] = [
        { type: 'action', content: 'Click #test-button' },
        { type: 'action', content: 'Click #nonexistent' }, // Will fail
        { type: 'action', content: 'Click #another-button' }, // Should not execute
      ];

      const context: ExecutionContext = { page, timeout: 1000 };
      const results = await executor.executeAll(instructions, context);

      expect(results.length).toBe(2); // Should stop after failure
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    it('should return error for invalid action', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'InvalidAction something',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for nonexistent element', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'action',
        content: 'Click #nonexistent-element',
      };

      const context: ExecutionContext = { page, timeout: 1000 };
      const result = await executor.execute(instruction, context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include duration in result', async () => {
      const instruction: PlaywrightInstruction = {
        type: 'wait',
        content: '100ms',
      };

      const context: ExecutionContext = { page };
      const result = await executor.execute(instruction, context);

      expect(result.duration).toBeGreaterThanOrEqual(100);
    });
  });
});

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Generate test HTML with interactive elements
 */
async function generateTestHTML(dir: string): Promise<string> {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Executor Test Page</title>
  <style>
    body { padding: 20px; font-family: sans-serif; }
    #bottom-element { margin-top: 2000px; }
  </style>
</head>
<body>
  <h1>Test Page</h1>

  <button id="test-button" class="submit-btn" onclick="this.dataset.clicked='true'">
    Submit
  </button>

  <input type="text" id="text-input" placeholder="Enter text">
  <input type="email" id="email-input" placeholder="Enter email">

  <input type="checkbox" id="checkbox">
  <label for="checkbox">Agree</label>

  <select id="dropdown">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
  </select>

  <div id="hover-target">Hover me</div>

  <div id="bottom-element">Bottom</div>
</body>
</html>`;

  const filepath = path.join(dir, 'test.html');
  await fs.writeFile(filepath, html, 'utf-8');

  return filepath;
}
