/**
 * Tests for roughcut lint command
 * Validates standalone linting works via CLI
 */

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

describe("roughcut lint", () => {
  it("should pass for valid minimal presentation", () => {
    const output = execSync(
      "node dist/cli/index.js lint examples/hello-world/presentation.md",
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    expect(output).toContain("No issues found");
  });

  it("should fail for invalid markdown and exit non-zero", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-lint-test-"),
    );

    try {
      // Write markdown with a linting error (invalid directive)
      await fs.writeFile(
        path.join(tmpDir, "bad.md"),
        '---\ntitle: "Test"\ntheme: black\n---\n\n# Slide\n\n@invalid-directive: foo\n',
      );

      let threw = false;
      try {
        execSync(
          `node ${path.resolve("dist/cli/index.js")} lint "${path.join(tmpDir, "bad.md")}"`,
          {
            encoding: "utf-8",
            timeout: 10000,
          },
        );
      } catch (error: any) {
        threw = true;
        // Should exit with non-zero code
        expect(error.status).not.toBe(0);
      }

      expect(threw).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("should pass for kitchen-sink example", () => {
    const output = execSync(
      "node dist/cli/index.js lint examples/kitchen-sink/presentation.md",
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // Should not throw (exit 0)
    expect(output).toBeDefined();
  });

  it("should auto-detect presentation.md in current directory", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-lint-auto-"),
    );

    try {
      // Write a valid presentation.md
      await fs.writeFile(
        path.join(tmpDir, "presentation.md"),
        '---\ntitle: "Test"\ntheme: black\n---\n\n# Slide\n\nContent here.\n',
      );

      // Run lint without specifying a file
      const output = execSync(
        `node ${path.resolve("dist/cli/index.js")} lint`,
        {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        },
      );

      expect(output).toContain("No issues found");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("should error when no path and no presentation.md in cwd", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-lint-empty-"),
    );

    try {
      let threw = false;
      try {
        execSync(`node ${path.resolve("dist/cli/index.js")} lint 2>&1`, {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        });
      } catch (error: any) {
        threw = true;
        expect(error.status).not.toBe(0);
        expect(error.stdout || error.stderr || "").toContain(
          "No input file specified",
        );
      }

      expect(threw).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
