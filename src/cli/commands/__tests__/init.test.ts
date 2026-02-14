/**
 * Tests for roughcut init command
 * Validates workspace scaffolding creates correct files and handles edge cases
 */

import { describe, it, expect, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

describe("roughcut init", () => {
  const tempDirs: string[] = [];

  async function makeTempDir(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "roughcut-init-test-"));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(async () => {
    for (const dir of tempDirs) {
      await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
    tempDirs.length = 0;
  });

  it("should create workspace structure with .roughcut/, .env, .gitignore, README.md", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "my-project");

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    // Check workspace marker directory
    const roughcutDir = await fs.stat(path.join(projectDir, ".roughcut"));
    expect(roughcutDir.isDirectory()).toBe(true);

    // Check workspace config
    const configContent = await fs.readFile(
      path.join(projectDir, ".roughcut", "config.yml"),
      "utf-8",
    );
    expect(configContent).toContain("roughcut workspace configuration");
    expect(configContent).toContain("elevenlabs_voice_id");

    // Check .env
    const envContent = await fs.readFile(
      path.join(projectDir, ".env"),
      "utf-8",
    );
    expect(envContent).toContain("ELEVENLABS_API_KEY");
    expect(envContent).toContain("GEMINI_API_KEY");

    // Check .gitignore
    const gitignoreContent = await fs.readFile(
      path.join(projectDir, ".gitignore"),
      "utf-8",
    );
    expect(gitignoreContent).toContain(".env");
    expect(gitignoreContent).toContain(".build");

    // Check README.md
    const readmeContent = await fs.readFile(
      path.join(projectDir, "README.md"),
      "utf-8",
    );
    expect(readmeContent).toContain("roughcut");
    expect(readmeContent).toContain("My Project");
  });

  it("should NOT create presentation.md (use roughcut create instead)", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "my-project");

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    const files = await fs.readdir(projectDir);
    expect(files).not.toContain("presentation.md");
  });

  it("should not overwrite existing .env", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "existing");
    await fs.mkdir(projectDir, { recursive: true });

    // Create an existing .env
    await fs.writeFile(path.join(projectDir, ".env"), "MY_CUSTOM_KEY=secret");

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    // Original .env should be preserved
    const content = await fs.readFile(path.join(projectDir, ".env"), "utf-8");
    expect(content).toBe("MY_CUSTOM_KEY=secret");

    // But workspace config should still be created
    const configExists = await fs
      .access(path.join(projectDir, ".roughcut", "config.yml"))
      .then(() => true)
      .catch(() => false);
    expect(configExists).toBe(true);
  });

  it("should warn and exit early if workspace already exists", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "existing-ws");
    await fs.mkdir(path.join(projectDir, ".roughcut"), { recursive: true });

    // logger.warn writes to stderr — capture both stdout and stderr
    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    expect(output).toContain("already exists");
  });

  it("should work with current directory (.)", async () => {
    const tmpDir = await makeTempDir();

    execSync(`node ${path.resolve("dist/cli/index.js")} init .`, {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 10000,
    });

    const files = await fs.readdir(tmpDir);
    expect(files).toContain(".roughcut");
    expect(files).toContain(".env");
    expect(files).toContain(".gitignore");
  });

  it("should create .gitignore that ignores .env and .build/", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "deck");

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    const content = await fs.readFile(
      path.join(projectDir, ".gitignore"),
      "utf-8",
    );
    expect(content).toContain(".env");
    expect(content).toContain(".build");
  });
});
