/**
 * Tests for roughcut build CLI command
 * Validates CLI flags, auto-detect, and default behavior
 */

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const CLI = path.resolve("dist/cli/index.js");

const VALID_MD = `---
title: "Test"
theme: black
---

# Slide 1

@duration: 3s

Content here.

---

# Slide 2

@duration: 3s

More content.
`;

describe("roughcut build CLI", () => {
  it("should auto-detect presentation.md in current directory", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-auto-"),
    );

    try {
      await fs.writeFile(path.join(tmpDir, "presentation.md"), VALID_MD);

      // Run build without -i flag (default is HTML-only)
      const output = execSync(`node ${CLI} build 2>&1`, {
        cwd: tmpDir,
        encoding: "utf-8",
        timeout: 30000,
      });

      expect(output).toContain("Build completed successfully");

      // HTML should be generated
      const htmlExists = await fs
        .access(path.join(tmpDir, ".build", "presentation", "index.html"))
        .then(() => true)
        .catch(() => false);
      expect(htmlExists).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }, 30000);

  it("should error when no input and no presentation.md in cwd", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-empty-"),
    );

    try {
      let threw = false;
      try {
        execSync(`node ${CLI} build 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        });
      } catch (error: any) {
        threw = true;
        expect(error.status).not.toBe(0);
      }

      expect(threw).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("should build HTML-only by default (no --full)", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-default-"),
    );

    try {
      await fs.writeFile(path.join(tmpDir, "presentation.md"), VALID_MD);

      const output = execSync(`node ${CLI} build 2>&1`, {
        cwd: tmpDir,
        encoding: "utf-8",
        timeout: 30000,
      });

      expect(output).toContain("Build completed successfully");
      expect(output).toContain("HTML:");

      // Video should NOT be generated
      expect(output).not.toContain("Video:");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }, 30000);

  it("should accept --full flag without error", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-full-"),
    );

    try {
      await fs.writeFile(path.join(tmpDir, "presentation.md"), VALID_MD);

      // --full will attempt audio generation which may fail without API key,
      // but the flag itself should be parsed correctly (not "unknown option")
      let output: string;
      try {
        output = execSync(`node ${CLI} build --full 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 30000,
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || "";
      }

      // Should not contain "unknown option"
      expect(output).not.toContain("unknown option");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }, 30000);

  it("should accept --skip-images flag with --full", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-skip-"),
    );

    try {
      await fs.writeFile(path.join(tmpDir, "presentation.md"), VALID_MD);

      let output: string;
      try {
        output = execSync(`node ${CLI} build --full --skip-images 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 30000,
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || "";
      }

      // Should not contain "unknown option"
      expect(output).not.toContain("unknown option");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }, 30000);

  it("should accept --log-level flag", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-log-"),
    );

    try {
      await fs.writeFile(path.join(tmpDir, "presentation.md"), VALID_MD);

      const output = execSync(`node ${CLI} build --log-level debug 2>&1`, {
        cwd: tmpDir,
        encoding: "utf-8",
        timeout: 30000,
      });

      expect(output).toContain("Build completed successfully");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }, 30000);

  it("should still accept explicit -i flag", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-build-explicit-"),
    );

    try {
      await fs.writeFile(path.join(tmpDir, "deck.md"), VALID_MD);

      const output = execSync(
        `node ${CLI} build -i "${path.join(tmpDir, "deck.md")}" 2>&1`,
        {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 30000,
        },
      );

      expect(output).toContain("Build completed successfully");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }, 30000);
});
