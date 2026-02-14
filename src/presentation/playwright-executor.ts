/**
 * Playwright instruction executor
 *
 * Executes playwright automation instructions from @playwright: blocks:
 * - Action: Click, Type, Scroll, Hover, etc.
 * - Wait: Delays and timeouts
 * - Screenshot: Capture screenshots with names
 */

import type { Page } from "@playwright/test";
import type { PlaywrightInstruction } from "../core/types.js";
import * as path from "path";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Execution context for instructions
 */
export interface ExecutionContext {
  /** Playwright page instance */
  page: Page;

  /** Output directory for screenshots */
  screenshotDir?: string;

  /** Current slide ID (for naming) */
  slideId?: string;

  /** Timeout for actions (milliseconds) */
  timeout?: number;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  /** Whether execution was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Screenshot path if screenshot was taken */
  screenshotPath?: string;

  /** Duration of execution in milliseconds */
  duration: number;
}

// ============================================================================
// EXECUTOR CLASS
// ============================================================================

export class PlaywrightInstructionExecutor {
  private defaultTimeout = 5000; // 5 seconds

  /**
   * Execute a single instruction
   */
  async execute(
    instruction: PlaywrightInstruction,
    context: ExecutionContext,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      switch (instruction.type) {
        case "action":
          await this.executeAction(instruction.content, context);
          break;

        case "wait":
          await this.executeWait(instruction.content, context);
          break;

        case "screenshot":
          const screenshotPath = await this.executeScreenshot(
            instruction.content,
            context,
          );
          return {
            success: true,
            screenshotPath,
            duration: Date.now() - startTime,
          };

        default:
          throw new Error(`Unknown instruction type: ${instruction.type}`);
      }

      return {
        success: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute multiple instructions sequentially
   */
  async executeAll(
    instructions: PlaywrightInstruction[],
    context: ExecutionContext,
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const instruction of instructions) {
      const result = await this.execute(instruction, context);
      results.push(result);

      // Stop on first failure
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  // ============================================================================
  // ACTION EXECUTION
  // ============================================================================

  /**
   * Execute an action instruction
   *
   * Supported actions:
   * - Click [selector]
   * - Type: "text" + Enter
   * - Hover [selector]
   * - Scroll to [selector]
   * - Select [option] in [selector]
   * - Press [key]
   * - Fill [selector] with "text"
   */
  private async executeAction(
    action: string,
    context: ExecutionContext,
  ): Promise<void> {
    const { page, timeout = this.defaultTimeout } = context;

    // Click action: "Click button" or "Click #submit"
    const clickMatch = action.match(/^Click\s+(.+)$/i);
    if (clickMatch && clickMatch[1]) {
      const selector = this.parseSelector(clickMatch[1]);
      await page.click(selector, { timeout });
      return;
    }

    // Type action: "Type: \"hello world\" + Enter"
    const typeMatch = action.match(/^Type:\s*"([^"]+)"(?:\s*\+\s*(\w+))?$/i);
    if (typeMatch && typeMatch[1]) {
      const [, text, key] = typeMatch;
      await page.keyboard.type(text);

      if (key) {
        await page.keyboard.press(key);
      }
      return;
    }

    // Hover action: "Hover .menu-item"
    const hoverMatch = action.match(/^Hover\s+(.+)$/i);
    if (hoverMatch && hoverMatch[1]) {
      const selector = this.parseSelector(hoverMatch[1]);
      await page.hover(selector, { timeout });
      return;
    }

    // Scroll action: "Scroll to #footer"
    const scrollMatch = action.match(/^Scroll\s+to\s+(.+)$/i);
    if (scrollMatch && scrollMatch[1]) {
      const selector = this.parseSelector(scrollMatch[1]);
      await page.locator(selector).scrollIntoViewIfNeeded({ timeout });
      return;
    }

    // Fill action: "Fill #email with \"test@example.com\""
    const fillMatch = action.match(/^Fill\s+(.+?)\s+with\s+"([^"]+)"$/i);
    if (fillMatch && fillMatch[1] && fillMatch[2]) {
      const [, selectorText, value] = fillMatch;
      const selector = this.parseSelector(selectorText);
      await page.fill(selector, value, { timeout });
      return;
    }

    // Select action: "Select \"Option 1\" in #dropdown"
    const selectMatch = action.match(/^Select\s+"([^"]+)"\s+in\s+(.+)$/i);
    if (selectMatch && selectMatch[1] && selectMatch[2]) {
      const [, value, selectorText] = selectMatch;
      const selector = this.parseSelector(selectorText);
      await page.selectOption(selector, value, { timeout });
      return;
    }

    // Press key action: "Press Enter" or "Press Escape"
    const pressMatch = action.match(/^Press\s+(\w+)$/i);
    if (pressMatch && pressMatch[1]) {
      const key = pressMatch[1];
      await page.keyboard.press(key);
      return;
    }

    // Check/Uncheck action: "Check #agree" or "Uncheck #subscribe"
    const checkMatch = action.match(/^(Check|Uncheck)\s+(.+)$/i);
    if (checkMatch && checkMatch[1] && checkMatch[2]) {
      const [, actionType, selectorText] = checkMatch;
      const selector = this.parseSelector(selectorText);

      if (actionType.toLowerCase() === "check") {
        await page.check(selector, { timeout });
      } else {
        await page.uncheck(selector, { timeout });
      }
      return;
    }

    // Focus action: "Focus #username"
    const focusMatch = action.match(/^Focus\s+(.+)$/i);
    if (focusMatch && focusMatch[1]) {
      const selector = this.parseSelector(focusMatch[1]);
      await page.focus(selector, { timeout });
      return;
    }

    // Generic fallback: try to interpret as a click
    throw new Error(`Unknown action format: ${action}`);
  }

  // ============================================================================
  // WAIT EXECUTION
  // ============================================================================

  /**
   * Execute a wait instruction
   *
   * Formats:
   * - "2s" -> Wait 2 seconds
   * - "500ms" -> Wait 500 milliseconds
   * - "2" -> Wait 2 seconds (default unit)
   */
  private async executeWait(
    waitStr: string,
    _context: ExecutionContext,
  ): Promise<void> {
    const duration = this.parseDuration(waitStr);
    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  // ============================================================================
  // SCREENSHOT EXECUTION
  // ============================================================================

  /**
   * Execute a screenshot instruction
   *
   * Format: "screenshot-name" or "step-1"
   */
  private async executeScreenshot(
    name: string,
    context: ExecutionContext,
  ): Promise<string> {
    const { page, screenshotDir = ".", slideId = "unknown" } = context;

    // Generate filename
    const sanitizedName = name.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    const filename = `${slideId}-${sanitizedName}.png`;
    const filepath = path.join(screenshotDir, filename);

    // Take screenshot
    await page.screenshot({ path: filepath, fullPage: false });

    return filepath;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Parse selector from text
   * Handles: button, #id, .class, [data-test="value"]
   */
  private parseSelector(text: string): string {
    const trimmed = text.trim();

    // Already a CSS selector (starts with # . [ or contains spaces with combinators)
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith(".") ||
      trimmed.startsWith("[") ||
      /[\s>+~]/.test(trimmed)
    ) {
      return trimmed;
    }

    // Common HTML element names (lowercase only)
    const elementNames = [
      "button",
      "input",
      "select",
      "textarea",
      "div",
      "span",
      "a",
      "form",
      "table",
    ];
    if (
      elementNames.includes(trimmed.toLowerCase()) &&
      /^[a-z]+$/i.test(trimmed)
    ) {
      return trimmed.toLowerCase();
    }

    // Everything else is treated as text content
    return `text=${trimmed}`;
  }

  /**
   * Parse duration string to milliseconds
   *
   * Formats:
   * - "2s" -> 2000
   * - "500ms" -> 500
   * - "2" -> 2000 (default to seconds)
   */
  private parseDuration(durationStr: string): number {
    const match = durationStr.match(/^(\d+(?:\.\d+)?)(s|ms)?$/);

    if (!match || !match[1]) {
      throw new Error(`Invalid duration format: ${durationStr}`);
    }

    const [, value, unit] = match;
    const num = parseFloat(value);

    // Default to seconds if no unit
    if (!unit || unit === "s") {
      return num * 1000;
    }

    return num; // milliseconds
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new instruction executor instance
 */
export function createPlaywrightExecutor(): PlaywrightInstructionExecutor {
  return new PlaywrightInstructionExecutor();
}
