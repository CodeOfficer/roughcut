import { chromium, type Browser, type Page } from 'playwright';
import { logger } from '../core/logger.js';
import { ensureDir } from '../utils/fs.js';
import type { PlaywrightInstruction } from './types.js';

/**
 * Screenshot capture service using Playwright
 */
export class ScreenshotCapture {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Initialize browser and page
   */
  async initialize(viewport?: { width: number; height: number }): Promise<void> {
    const defaultViewport = viewport || { width: 1920, height: 1080 };

    logger.debug('Launching Playwright browser');

    this.browser = await chromium.launch({
      headless: true,
    });

    this.page = await this.browser.newPage({
      viewport: defaultViewport,
    });

    logger.debug('Browser initialized');
  }

  /**
   * Close browser and cleanup
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    logger.debug('Browser closed');
  }

  /**
   * Parse instructions from text
   */
  parseInstructions(instructionsText: string): PlaywrightInstruction[] {
    const lines = instructionsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const instructions: PlaywrightInstruction[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith('show:')) {
        instructions.push({
          type: 'show',
          content: line.substring(5).trim(),
        });
      } else if (line.toLowerCase().startsWith('action:')) {
        instructions.push({
          type: 'action',
          content: line.substring(7).trim(),
        });
      } else if (line.toLowerCase().startsWith('wait:')) {
        instructions.push({
          type: 'wait',
          content: line.substring(5).trim(),
        });
      }
    }

    return instructions;
  }

  /**
   * Execute instructions and capture screenshot
   *
   * Note: This is a simplified placeholder implementation.
   * In production, you would:
   * 1. Navigate to actual applications (VS Code, terminals, etc.)
   * 2. Perform real interactions
   * 3. Capture actual screenshots
   *
   * For now, we'll create a mock page with the instruction content
   */
  async captureWithInstructions(
    instructions: PlaywrightInstruction[],
    outputPath: string
  ): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    // For placeholder implementation, create a simple HTML page showing the instructions
    const html = this.createPlaceholderHTML(instructions);

    await this.page.setContent(html);
    await this.page.waitForTimeout(500); // Let page render

    // Ensure output directory exists
    const lastSlash = outputPath.lastIndexOf('/');
    if (lastSlash > 0) {
      await ensureDir(outputPath.substring(0, lastSlash));
    }

    // Capture screenshot
    await this.page.screenshot({
      path: outputPath,
      fullPage: false,
    });

    logger.debug(`Captured screenshot to ${outputPath}`);
  }

  /**
   * Extract code blocks from instruction text
   */
  private extractCodeBlocks(text: string): string[] {
    const codeBlockPattern = /```[\s\S]*?```/g;
    const matches = text.match(codeBlockPattern);
    return matches ? matches.map(m => m.replace(/```/g, '').trim()) : [];
  }

  /**
   * Check if instructions contain code to display
   */
  private hasCodeContent(instructions: PlaywrightInstruction[]): boolean {
    const actionText = instructions
      .filter(i => i.type === 'action')
      .map(i => i.content)
      .join('\n');
    return actionText.includes('```') || actionText.toLowerCase().includes('type the following');
  }

  /**
   * Create placeholder HTML for demonstration
   */
  private createPlaceholderHTML(instructions: PlaywrightInstruction[]): string {
    const showInstructions = instructions.filter(i => i.type === 'show');
    const actionInstructions = instructions.filter(i => i.type === 'action');

    const title = showInstructions.length > 0 && showInstructions[0] ? showInstructions[0].content : 'Screenshot';
    const actionText = actionInstructions.map(i => i.content).join('\n');

    // Check if this looks like a code editor scenario
    const isCodeEditor = title.toLowerCase().includes('vs code') ||
                         title.toLowerCase().includes('code editor') ||
                         this.hasCodeContent(actionInstructions);

    if (isCodeEditor) {
      return this.createCodeEditorHTML(title, actionText);
    }

    return this.createTerminalHTML(title, actionText);
  }

  /**
   * Create VS Code-style editor HTML
   */
  private createCodeEditorHTML(_title: string, actionText: string): string {
    const codeBlocks = this.extractCodeBlocks(actionText);
    const code: string = codeBlocks.length > 0 && codeBlocks[0] ? codeBlocks[0] : '// Code will appear here';

    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #252526;
      padding: 10px 20px;
      border-bottom: 1px solid #3c3c3c;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .file-tab {
      background: #2d2d30;
      padding: 8px 16px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      color: #ffffff;
      font-size: 13px;
    }
    .editor {
      flex: 1;
      padding: 20px;
      overflow: auto;
      background: #1e1e1e;
    }
    .code-line {
      line-height: 1.6;
      font-size: 14px;
    }
    .line-number {
      display: inline-block;
      width: 40px;
      color: #858585;
      text-align: right;
      margin-right: 20px;
      user-select: none;
    }
    .keyword { color: #569cd6; }
    .string { color: #ce9178; }
    .function { color: #dcdcaa; }
    .comment { color: #6a9955; }
    .placeholder-note {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.1);
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="file-tab">src/index.ts</div>
  </div>
  <div class="editor">
    ${code.split('\n').map((line, i) =>
      `<div class="code-line"><span class="line-number">${i + 1}</span>${this.escapeHtml(line)}</div>`
    ).join('')}
  </div>
  <div class="placeholder-note">
    Placeholder Screenshot - Playwright automation not fully implemented
  </div>
</body>
</html>`;
  }

  /**
   * Create terminal-style HTML
   */
  private createTerminalHTML(title: string, actionText: string): string {
    const commands = actionText.split('\n').filter(line =>
      line.toLowerCase().startsWith('type') ||
      line.includes('&&') ||
      line.includes('npm') ||
      line.includes('mkdir')
    );

    const displayCommands: string[] = commands.map(cmd => {
      // Extract actual command from "Type 'command'" format
      const match = cmd.match(/type\s+["'](.+)["']/i);
      return match && match[1] ? match[1] : cmd;
    });

    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #2d2d30;
      padding: 20px;
      border-bottom: 2px solid #007acc;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
    }
    .content {
      flex: 1;
      padding: 30px;
      overflow: auto;
    }
    .terminal {
      background: #1e1e1e;
      border: 1px solid #3c3c3c;
      border-radius: 8px;
      padding: 20px;
      font-size: 16px;
      line-height: 1.6;
    }
    .command {
      color: #4ec9b0;
      margin: 10px 0;
    }
    .prompt {
      color: #007acc;
      margin-right: 10px;
    }
    .placeholder-note {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.1);
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${this.escapeHtml(title)}</div>
  </div>
  <div class="content">
    <div class="terminal">
      ${displayCommands.map(cmd =>
        `<div class="command"><span class="prompt">$</span>${this.escapeHtml(cmd)}</div>`
      ).join('')}
    </div>
  </div>
  <div class="placeholder-note">
    Placeholder Screenshot - Playwright automation not fully implemented
  </div>
</body>
</html>`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m] || m);
  }
}
