/**
 * Tests for reveal.js asset bundler
 * Verifies asset copying, directory structure, and path generation
 */

import {
  RevealAssetBundler,
  getDefaultRevealJsPath,
  isValidTheme,
  isValidHighlightTheme,
} from "../revealjs-assets.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

describe("RevealAssetBundler", () => {
  let bundler: RevealAssetBundler;
  let tempDir: string;

  beforeEach(async () => {
    bundler = new RevealAssetBundler();
    // Create temporary directory for test outputs
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "revealjs-assets-test-"));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  // ==========================================================================
  // BUNDLING TESTS
  // ==========================================================================

  describe("Asset Bundling", () => {
    it("should bundle assets and return correct paths", async () => {
      const outputDir = path.join(tempDir, "output");

      const result = await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "dracula",
      });

      // Check returned paths
      expect(result.revealCss).toBe("reveal/dist/reveal.css");
      expect(result.revealJs).toBe("reveal/dist/reveal.js");
      expect(result.themeCss).toBe("reveal/dist/theme/dracula.css");
      expect(result.markdownPlugin).toBe("reveal/plugin/markdown/markdown.js");
      expect(result.highlightPlugin).toBe(
        "reveal/plugin/highlight/highlight.js",
      );
      expect(result.highlightCss).toBe("reveal/plugin/highlight/monokai.css");
      expect(result.notesPlugin).toBe("reveal/plugin/notes/notes.js");
    });

    it("should create correct directory structure", async () => {
      const outputDir = path.join(tempDir, "output");

      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "black",
      });

      // Check directories exist
      const dirs = [
        path.join(outputDir, "reveal", "dist"),
        path.join(outputDir, "reveal", "dist", "theme"),
        path.join(outputDir, "reveal", "plugin", "markdown"),
        path.join(outputDir, "reveal", "plugin", "highlight"),
        path.join(outputDir, "reveal", "plugin", "notes"),
      ];

      for (const dir of dirs) {
        const exists = await fs
          .access(dir)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it("should copy core reveal.js files", async () => {
      const outputDir = path.join(tempDir, "output");

      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "black",
      });

      // Check core files exist
      const coreFiles = [
        path.join(outputDir, "reveal", "dist", "reveal.css"),
        path.join(outputDir, "reveal", "dist", "reveal.js"),
        path.join(outputDir, "reveal", "dist", "reset.css"),
      ];

      for (const file of coreFiles) {
        const exists = await fs
          .access(file)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);

        // Check file has content
        const stats = await fs.stat(file);
        expect(stats.size).toBeGreaterThan(0);
      }
    });

    it("should copy theme CSS file", async () => {
      const outputDir = path.join(tempDir, "output");

      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "dracula",
      });

      const themeFile = path.join(
        outputDir,
        "reveal",
        "dist",
        "theme",
        "dracula.css",
      );
      const exists = await fs
        .access(themeFile)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Check file has content
      const stats = await fs.stat(themeFile);
      expect(stats.size).toBeGreaterThan(0);
    });

    it("should copy plugin files", async () => {
      const outputDir = path.join(tempDir, "output");

      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "black",
      });

      // Check plugin files exist
      const pluginFiles = [
        path.join(outputDir, "reveal", "plugin", "markdown", "markdown.js"),
        path.join(outputDir, "reveal", "plugin", "highlight", "highlight.js"),
        path.join(outputDir, "reveal", "plugin", "highlight", "monokai.css"),
        path.join(outputDir, "reveal", "plugin", "notes", "notes.js"),
      ];

      for (const file of pluginFiles) {
        const exists = await fs
          .access(file)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);

        // Check file has content
        const stats = await fs.stat(file);
        expect(stats.size).toBeGreaterThan(0);
      }
    });

    it("should support custom highlight theme", async () => {
      const outputDir = path.join(tempDir, "output");

      const result = await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "black",
        highlightTheme: "zenburn",
      });

      expect(result.highlightCss).toBe("reveal/plugin/highlight/zenburn.css");

      const highlightFile = path.join(
        outputDir,
        "reveal",
        "plugin",
        "highlight",
        "zenburn.css",
      );
      const exists = await fs
        .access(highlightFile)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });
  });

  // ==========================================================================
  // THEME TESTS
  // ==========================================================================

  describe("Multiple Themes", () => {
    it("should bundle different themes correctly", async () => {
      const themes = ["black", "white", "dracula", "solarized"];

      for (const theme of themes) {
        const outputDir = path.join(tempDir, `output-${theme}`);

        await bundler.bundle({
          revealJsSourcePath: "./node_modules/reveal.js",
          outputDir,
          theme,
        });

        const themeFile = path.join(
          outputDir,
          "reveal",
          "dist",
          "theme",
          `${theme}.css`,
        );
        const exists = await fs
          .access(themeFile)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe("Error Handling", () => {
    it("should throw error if source path does not exist", async () => {
      const outputDir = path.join(tempDir, "output");

      await expect(
        bundler.bundle({
          revealJsSourcePath: "./nonexistent/path",
          outputDir,
          theme: "black",
        }),
      ).rejects.toThrow();
    });

    it("should throw error if theme does not exist", async () => {
      const outputDir = path.join(tempDir, "output");

      await expect(
        bundler.bundle({
          revealJsSourcePath: "./node_modules/reveal.js",
          outputDir,
          theme: "nonexistent-theme",
        }),
      ).rejects.toThrow();
    });
  });

  // ==========================================================================
  // FILE INTEGRITY TESTS
  // ==========================================================================

  describe("File Integrity", () => {
    it("should copy files with correct content", async () => {
      const outputDir = path.join(tempDir, "output");

      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "black",
      });

      // Read source and destination files
      const srcFile = path.resolve("./node_modules/reveal.js/dist/reveal.js");
      const destFile = path.join(outputDir, "reveal", "dist", "reveal.js");

      const srcContent = await fs.readFile(srcFile, "utf-8");
      const destContent = await fs.readFile(destFile, "utf-8");

      // Content should match
      expect(destContent).toBe(srcContent);
    });

    it("should preserve file sizes", async () => {
      const outputDir = path.join(tempDir, "output");

      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "dracula",
      });

      // Check file sizes match
      const files = [
        "reveal/dist/reveal.js",
        "reveal/dist/reveal.css",
        "reveal/plugin/markdown/markdown.js",
      ];

      for (const file of files) {
        const srcPath = path.resolve(
          "./node_modules/reveal.js",
          file.replace("reveal/", ""),
        );
        const destPath = path.join(outputDir, file);

        const srcStats = await fs.stat(srcPath);
        const destStats = await fs.stat(destPath);

        expect(destStats.size).toBe(srcStats.size);
      }
    });
  });

  // ==========================================================================
  // OVERWRITE TESTS
  // ==========================================================================

  describe("Overwriting", () => {
    it("should overwrite existing files when bundling again", async () => {
      const outputDir = path.join(tempDir, "output");

      // Bundle once
      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "black",
      });

      const themeFile = path.join(
        outputDir,
        "reveal",
        "dist",
        "theme",
        "black.css",
      );
      await fs.stat(themeFile);

      // Bundle again with different theme
      await bundler.bundle({
        revealJsSourcePath: "./node_modules/reveal.js",
        outputDir,
        theme: "dracula",
      });

      // New theme file should exist
      const newThemeFile = path.join(
        outputDir,
        "reveal",
        "dist",
        "theme",
        "dracula.css",
      );
      const exists = await fs
        .access(newThemeFile)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });
  });
});

// ==========================================================================
// UTILITY FUNCTION TESTS
// ==========================================================================

describe("Utility Functions", () => {
  describe("getDefaultRevealJsPath", () => {
    it("should return an absolute path to reveal.js", () => {
      const revealPath = getDefaultRevealJsPath();
      expect(revealPath).toContain("node_modules");
      expect(revealPath).toContain("reveal.js");
      // Should be absolute (resolved via import.meta.url)
      expect(revealPath.startsWith("/")).toBe(true);
    });
  });

  describe("isValidTheme", () => {
    it("should validate known themes", () => {
      const validThemes = ["black", "white", "dracula", "solarized", "moon"];

      for (const theme of validThemes) {
        expect(isValidTheme(theme)).toBe(true);
      }
    });

    it("should reject invalid themes", () => {
      const invalidThemes = ["invalid", "notatheme", "custom"];

      for (const theme of invalidThemes) {
        expect(isValidTheme(theme)).toBe(false);
      }
    });
  });

  describe("isValidHighlightTheme", () => {
    it("should validate known highlight themes", () => {
      const validThemes = ["monokai", "zenburn"];

      for (const theme of validThemes) {
        expect(isValidHighlightTheme(theme)).toBe(true);
      }
    });

    it("should reject invalid highlight themes", () => {
      const invalidThemes = ["invalid", "custom", "dark"];

      for (const theme of invalidThemes) {
        expect(isValidHighlightTheme(theme)).toBe(false);
      }
    });
  });
});
