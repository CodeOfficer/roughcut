/**
 * Tests for roughcut create command
 * Validates presentation creation inside a workspace
 */

import { describe, it, expect, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

describe("roughcut create", () => {
  const tempDirs: string[] = [];

  async function makeTempDir(): Promise<string> {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), "roughcut-create-test-"),
    );
    tempDirs.push(dir);
    return dir;
  }

  async function makeWorkspace(baseDir: string): Promise<string> {
    await fs.mkdir(path.join(baseDir, ".roughcut"), { recursive: true });
    return baseDir;
  }

  afterEach(async () => {
    for (const dir of tempDirs) {
      await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
    tempDirs.length = 0;
  });

  it("should create presentation.md in a new subdirectory", async () => {
    const tmpDir = await makeTempDir();
    await makeWorkspace(tmpDir);

    execSync(`node ${path.resolve("dist/cli/index.js")} create hello-world`, {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 10000,
    });

    // Check directory was created
    const talkDir = path.join(tmpDir, "hello-world");
    const stat = await fs.stat(talkDir);
    expect(stat.isDirectory()).toBe(true);

    // Check presentation.md exists with correct title
    const content = await fs.readFile(
      path.join(talkDir, "presentation.md"),
      "utf-8",
    );
    expect(content).toContain('title: "Hello World"');
    expect(content).toContain("# Hello World");
    expect(content).toContain("---");
  });

  it("should fail if not inside a workspace", async () => {
    const tmpDir = await makeTempDir();
    // No .roughcut/ directory — not a workspace

    let error: Error | undefined;
    try {
      execSync(`node ${path.resolve("dist/cli/index.js")} create my-talk`, {
        cwd: tmpDir,
        encoding: "utf-8",
        timeout: 10000,
      });
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeDefined();
    expect(error!.message).toContain("Not inside a roughcut workspace");
  });

  it("should fail if directory already exists", async () => {
    const tmpDir = await makeTempDir();
    await makeWorkspace(tmpDir);

    // Create the directory first
    await fs.mkdir(path.join(tmpDir, "existing-talk"), { recursive: true });

    let error: Error | undefined;
    try {
      execSync(
        `node ${path.resolve("dist/cli/index.js")} create existing-talk`,
        {
          cwd: tmpDir,
          encoding: "utf-8",
          timeout: 10000,
        },
      );
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeDefined();
    expect(error!.message).toContain("already exists");
  });

  it("should convert hyphenated name to title case", async () => {
    const tmpDir = await makeTempDir();
    await makeWorkspace(tmpDir);

    execSync(`node ${path.resolve("dist/cli/index.js")} create my-cool-talk`, {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 10000,
    });

    const content = await fs.readFile(
      path.join(tmpDir, "my-cool-talk", "presentation.md"),
      "utf-8",
    );
    expect(content).toContain('title: "My Cool Talk"');
    expect(content).toContain("# My Cool Talk");
  });
});
