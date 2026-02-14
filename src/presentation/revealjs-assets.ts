/**
 * Asset bundler for reveal.js presentations
 *
 * Copies reveal.js assets to presentation output directory for offline/standalone use:
 * - Core reveal.js CSS and JavaScript
 * - Theme files
 * - Plugin files (markdown, highlight, notes)
 * - Font files
 */

import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Asset bundling result with relative paths for HTML generation
 */
export interface BundledAssets {
  /** Relative path to reveal.css */
  revealCss: string;

  /** Relative path to reveal.js */
  revealJs: string;

  /** Relative path to theme CSS */
  themeCss: string;

  /** Relative path to markdown plugin */
  markdownPlugin: string;

  /** Relative path to highlight plugin */
  highlightPlugin: string;

  /** Relative path to highlight CSS theme */
  highlightCss: string;

  /** Relative path to notes plugin */
  notesPlugin: string;
}

/**
 * Asset bundling options
 */
export interface BundleAssetsOptions {
  /** Path to reveal.js in node_modules (e.g., './node_modules/reveal.js') */
  revealJsSourcePath: string;

  /** Output directory where assets will be copied */
  outputDir: string;

  /** Theme name (e.g., 'dracula', 'black', 'white') */
  theme: string;

  /** Highlight theme (default: 'monokai') */
  highlightTheme?: string;
}

// ============================================================================
// ASSET BUNDLER CLASS
// ============================================================================

export class RevealAssetBundler {
  /**
   * Bundle reveal.js assets into presentation output directory
   */
  async bundle(options: BundleAssetsOptions): Promise<BundledAssets> {
    const {
      revealJsSourcePath,
      outputDir,
      theme,
      highlightTheme = "monokai",
    } = options;

    // Resolve absolute paths
    const sourcePath = path.resolve(revealJsSourcePath);
    const destPath = path.resolve(outputDir);

    // Create output directory structure
    await this.createDirectoryStructure(destPath);

    // Copy core reveal.js files
    await this.copyRevealCore(sourcePath, destPath);

    // Copy theme files
    await this.copyTheme(sourcePath, destPath, theme);

    // Copy plugins
    await this.copyPlugins(sourcePath, destPath, highlightTheme);

    // Return relative paths for HTML generation
    return {
      revealCss: "reveal/dist/reveal.css",
      revealJs: "reveal/dist/reveal.js",
      themeCss: `reveal/dist/theme/${theme}.css`,
      markdownPlugin: "reveal/plugin/markdown/markdown.js",
      highlightPlugin: "reveal/plugin/highlight/highlight.js",
      highlightCss: `reveal/plugin/highlight/${highlightTheme}.css`,
      notesPlugin: "reveal/plugin/notes/notes.js",
    };
  }

  // ============================================================================
  // DIRECTORY STRUCTURE
  // ============================================================================

  /**
   * Create directory structure for reveal.js assets
   */
  private async createDirectoryStructure(outputDir: string): Promise<void> {
    const dirs = [
      path.join(outputDir, "reveal", "dist"),
      path.join(outputDir, "reveal", "dist", "theme"),
      path.join(outputDir, "reveal", "dist", "theme", "fonts"),
      path.join(outputDir, "reveal", "plugin", "markdown"),
      path.join(outputDir, "reveal", "plugin", "highlight"),
      path.join(outputDir, "reveal", "plugin", "notes"),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  // ============================================================================
  // CORE FILES
  // ============================================================================

  /**
   * Copy core reveal.js files (CSS and JS)
   */
  private async copyRevealCore(
    sourcePath: string,
    destPath: string,
  ): Promise<void> {
    const files = [
      { src: "dist/reveal.css", dest: "reveal/dist/reveal.css" },
      { src: "dist/reveal.js", dest: "reveal/dist/reveal.js" },
      { src: "dist/reset.css", dest: "reveal/dist/reset.css" },
    ];

    for (const file of files) {
      const srcFile = path.join(sourcePath, file.src);
      const destFile = path.join(destPath, file.dest);
      await this.copyFile(srcFile, destFile);
    }
  }

  // ============================================================================
  // THEME FILES
  // ============================================================================

  /**
   * Copy theme CSS and fonts
   */
  private async copyTheme(
    sourcePath: string,
    destPath: string,
    theme: string,
  ): Promise<void> {
    // Copy theme CSS
    const themeCssSrc = path.join(sourcePath, "dist", "theme", `${theme}.css`);
    const themeCssDest = path.join(
      destPath,
      "reveal",
      "dist",
      "theme",
      `${theme}.css`,
    );
    await this.copyFile(themeCssSrc, themeCssDest);

    // Copy theme fonts (if they exist)
    await this.copyThemeFonts(sourcePath, destPath);
  }

  /**
   * Copy theme font files
   */
  private async copyThemeFonts(
    sourcePath: string,
    destPath: string,
  ): Promise<void> {
    const fontDirs = ["source-sans-pro", "league-gothic"];

    for (const fontDir of fontDirs) {
      const srcFontDir = path.join(
        sourcePath,
        "dist",
        "theme",
        "fonts",
        fontDir,
      );
      const destFontDir = path.join(
        destPath,
        "reveal",
        "dist",
        "theme",
        "fonts",
        fontDir,
      );

      try {
        // Check if font directory exists
        await fs.access(srcFontDir);

        // Create destination directory
        await fs.mkdir(destFontDir, { recursive: true });

        // Copy all files in font directory
        await this.copyDirectory(srcFontDir, destFontDir);
      } catch (error) {
        // Font directory doesn't exist, skip
        continue;
      }
    }
  }

  // ============================================================================
  // PLUGINS
  // ============================================================================

  /**
   * Copy plugin files
   */
  private async copyPlugins(
    sourcePath: string,
    destPath: string,
    highlightTheme: string,
  ): Promise<void> {
    // Markdown plugin
    await this.copyFile(
      path.join(sourcePath, "plugin", "markdown", "markdown.js"),
      path.join(destPath, "reveal", "plugin", "markdown", "markdown.js"),
    );

    // Highlight plugin
    await this.copyFile(
      path.join(sourcePath, "plugin", "highlight", "highlight.js"),
      path.join(destPath, "reveal", "plugin", "highlight", "highlight.js"),
    );

    // Highlight CSS theme
    await this.copyFile(
      path.join(sourcePath, "plugin", "highlight", `${highlightTheme}.css`),
      path.join(
        destPath,
        "reveal",
        "plugin",
        "highlight",
        `${highlightTheme}.css`,
      ),
    );

    // Notes plugin
    await this.copyFile(
      path.join(sourcePath, "plugin", "notes", "notes.js"),
      path.join(destPath, "reveal", "plugin", "notes", "notes.js"),
    );

    // Notes speaker view HTML (optional but useful)
    try {
      await this.copyFile(
        path.join(sourcePath, "plugin", "notes", "speaker-view.html"),
        path.join(destPath, "reveal", "plugin", "notes", "speaker-view.html"),
      );
    } catch (error) {
      // Speaker view doesn't exist, skip
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * Copy a single file
   */
  private async copyFile(src: string, dest: string): Promise<void> {
    try {
      await fs.copyFile(src, dest);
    } catch (error) {
      throw new Error(`Failed to copy file from ${src} to ${dest}: ${error}`);
    }
  }

  /**
   * Copy entire directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new asset bundler instance
 */
export function createRevealAssetBundler(): RevealAssetBundler {
  return new RevealAssetBundler();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get default reveal.js source path
 */
export function getDefaultRevealJsPath(): string {
  // Resolve relative to this package's installation, not CWD.
  // This ensures reveal.js is found when roughcut is installed globally.
  const __filename = fileURLToPath(import.meta.url);
  const packageRoot = path.join(path.dirname(__filename), "../..");
  return path.join(packageRoot, "node_modules", "reveal.js");
}

/**
 * Validate theme name
 */
export function isValidTheme(theme: string): boolean {
  const validThemes = [
    "black",
    "white",
    "league",
    "beige",
    "sky",
    "night",
    "serif",
    "simple",
    "solarized",
    "dracula",
    "moon",
    "blood",
    "black-contrast",
    "white-contrast",
  ];

  return validThemes.includes(theme);
}

/**
 * Validate highlight theme name
 */
export function isValidHighlightTheme(theme: string): boolean {
  const validThemes = ["monokai", "zenburn"];

  return validThemes.includes(theme);
}
