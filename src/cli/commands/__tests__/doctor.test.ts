/**
 * Tests for roughcut doctor command
 * Tests the individual check functions that doctor uses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import * as path from "path";
import { config } from "../../../config/config-manager.js";

describe("roughcut doctor", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    config.reset();
  });

  afterEach(() => {
    config.reset();
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  it("should run without crashing", () => {
    // Doctor should complete (exit 0 or 1) without throwing
    try {
      const output = execSync("node dist/cli/index.js doctor", {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 15000,
      });
      // Should contain Node.js check
      expect(output).toContain("Node.js");
    } catch (error: any) {
      // Doctor may exit with code 1 if prerequisites missing,
      // but should still produce output
      expect(error.stdout || error.stderr).toBeTruthy();
    }
  });

  it("should detect Node.js version", () => {
    let output: string;
    try {
      output = execSync("node dist/cli/index.js doctor", {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 15000,
      });
    } catch (error: any) {
      output = error.stdout || "";
    }

    // Should show Node version (we're running on Node 20+)
    expect(output).toMatch(/Node\.js.*v\d+/);
    expect(output).toContain("[OK]");
  });

  it("should check for ffmpeg", () => {
    let output: string;
    try {
      output = execSync("node dist/cli/index.js doctor", {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 15000,
      });
    } catch (error: any) {
      output = error.stdout || "";
    }

    // Should mention ffmpeg (either OK or FAIL)
    expect(output).toContain("ffmpeg");
  });

  it("should check for API keys", () => {
    let output: string;
    try {
      output = execSync("node dist/cli/index.js doctor", {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 15000,
      });
    } catch (error: any) {
      output = error.stdout || "";
    }

    // Should mention both API keys
    expect(output).toContain("ELEVENLABS_API_KEY");
    expect(output).toContain("GEMINI_API_KEY");
  });

  it("should show WARN for missing API keys (not FAIL)", () => {
    let output: string;
    try {
      output = execSync("node dist/cli/index.js doctor", {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 15000,
        env: {
          ...process.env,
          ELEVENLABS_API_KEY: "",
          GEMINI_API_KEY: "",
        },
      });
    } catch (error: any) {
      output = error.stdout || "";
    }

    // API keys should be WARN, not FAIL (they're optional)
    expect(output).toContain("[WARN]");
  });
});
