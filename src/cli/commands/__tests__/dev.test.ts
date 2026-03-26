/**
 * Tests for roughcut dev CLI command
 * Validates flag parsing and auto-detect (not server startup)
 */

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const CLI = path.resolve("dist/cli/index.js");

describe("roughcut dev CLI", () => {
  it("should error when no input and no presentation.md in cwd", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-dev-empty-"),
    );

    try {
      let threw = false;
      try {
        execSync(`node ${CLI} dev 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        });
      } catch (error: unknown) {
        threw = true;
        const execError = error as {
          status: number | null;
          stdout?: string;
          stderr?: string;
        };
        expect(execError.status).not.toBe(0);
        const output = execError.stdout || execError.stderr || "";
        expect(output).toContain("No input file specified");
      }

      expect(threw).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("should accept --auto flag without error", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-dev-auto-"),
    );

    try {
      // dev will fail because no HTML is built, but --auto should parse fine
      let output: string;
      try {
        output = execSync(`node ${CLI} dev --auto 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        });
      } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        output = execError.stdout || execError.stderr || "";
      }

      // Should not contain "unknown option"
      expect(output).not.toContain("unknown option");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("should accept --slow-mo flag without error", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-dev-slowmo-"),
    );

    try {
      let output: string;
      try {
        output = execSync(`node ${CLI} dev --slow-mo 200 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        });
      } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        output = execError.stdout || execError.stderr || "";
      }

      // Should not contain "unknown option"
      expect(output).not.toContain("unknown option");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("should show helpful error when HTML not built yet", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-dev-nohtml-"),
    );

    try {
      // Create a presentation.md so auto-detect works
      await fs.writeFile(
        path.join(tmpDir, "presentation.md"),
        '---\ntitle: "Test"\ntheme: black\n---\n\n# Hello\n\nContent.\n',
      );

      let output: string;
      try {
        output = execSync(`node ${CLI} dev 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        });
      } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        output = execError.stdout || execError.stderr || "";
      }

      // Should show the updated error message
      expect(output).toContain("roughcut build");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
