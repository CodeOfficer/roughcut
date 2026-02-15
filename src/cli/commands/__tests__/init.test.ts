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

    // Check AUTHORING.md
    const authoringContent = await fs.readFile(
      path.join(projectDir, "AUTHORING.md"),
      "utf-8",
    );
    expect(authoringContent).toContain("Writing Presentations with roughcut");
    expect(authoringContent).toContain("@audio:");
    expect(authoringContent).toContain("Quick Reference");
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

  it("should update existing AUTHORING.md with latest template", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "existing");
    await fs.mkdir(projectDir, { recursive: true });

    // Create an existing AUTHORING.md with stale content
    await fs.writeFile(
      path.join(projectDir, "AUTHORING.md"),
      "My custom authoring guide",
    );

    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // AUTHORING.md should be refreshed with latest template
    const content = await fs.readFile(
      path.join(projectDir, "AUTHORING.md"),
      "utf-8",
    );
    expect(content).toContain("Writing Presentations with roughcut");
    expect(output).toContain("Updated AUTHORING.md");
  });

  it("should be idempotent — re-run fills in missing files", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "existing-ws");

    // First run creates everything
    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    // Delete README.md and AUTHORING.md to simulate missing files
    await fs.unlink(path.join(projectDir, "README.md"));
    await fs.unlink(path.join(projectDir, "AUTHORING.md"));

    // Second run should recreate missing files
    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // Should skip existing files and recreate missing ones
    expect(output).toContain("Skipping");
    expect(output).toContain("Created README.md");
    expect(output).toContain("Created AUTHORING.md");

    // Recreated files should exist
    const readmeExists = await fs
      .access(path.join(projectDir, "README.md"))
      .then(() => true)
      .catch(() => false);
    const authoringExists = await fs
      .access(path.join(projectDir, "AUTHORING.md"))
      .then(() => true)
      .catch(() => false);
    expect(readmeExists).toBe(true);
    expect(authoringExists).toBe(true);
  });

  it("should be idempotent — re-run skips sacred files and updates scaffold docs", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "complete-ws");

    // First run
    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    // Second run — everything exists
    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // Sacred files should be skipped
    expect(output).toContain("Skipping .roughcut/config.yml");
    expect(output).toContain("Skipping .env");
    expect(output).toContain("Skipping .gitignore");
    // Scaffold docs should be refreshed
    expect(output).toContain("Updated README.md");
    expect(output).toContain("Updated AUTHORING.md");
    // Should still show success
    expect(output).toContain("Workspace ready");
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
    expect(files).toContain("AUTHORING.md");
  });

  it("should warn about missing fields in existing .env", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "partial-env");
    await fs.mkdir(projectDir, { recursive: true });

    // Create .env with only one key
    await fs.writeFile(
      path.join(projectDir, ".env"),
      "ELEVENLABS_API_KEY=sk-test123",
    );

    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // Should warn about missing GEMINI_API_KEY
    expect(output).toContain("missing GEMINI_API_KEY");
    expect(output).toContain("AI image generation");
    // Should NOT warn about ELEVENLABS_API_KEY (it's present)
    expect(output).not.toContain("missing ELEVENLABS_API_KEY");
  });

  it("should not warn about fields present (even as comments) in .env", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "complete-env");

    // First run to create all files
    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    // Second run — the template .env has both keys as comments
    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // No field warnings since both keys appear in the template comments
    expect(output).not.toContain("missing ELEVENLABS_API_KEY");
    expect(output).not.toContain("missing GEMINI_API_KEY");
  });

  it("should warn about missing fields in existing .roughcut/config.yml", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "partial-config");
    await fs.mkdir(path.join(projectDir, ".roughcut"), { recursive: true });

    // Create config.yml with only log_level
    await fs.writeFile(
      path.join(projectDir, ".roughcut", "config.yml"),
      "log_level: info\n",
    );

    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // Should warn about missing fields
    expect(output).toContain("missing elevenlabs_voice_id");
    expect(output).toContain("missing gemini_model");
    // Should NOT warn about log_level (it's present)
    expect(output).not.toContain("missing log_level");
  });

  it("should always update README.md and AUTHORING.md on re-run", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "refresh-docs");

    // First run
    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    // Modify README.md to simulate stale content
    await fs.writeFile(
      path.join(projectDir, "README.md"),
      "Old content that should be replaced",
    );

    // Second run should overwrite with latest template
    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve("."),
      encoding: "utf-8",
      timeout: 10000,
    });

    const readmeContent = await fs.readFile(
      path.join(projectDir, "README.md"),
      "utf-8",
    );
    expect(readmeContent).toContain("roughcut");
    expect(readmeContent).not.toContain("Old content that should be replaced");

    const authoringContent = await fs.readFile(
      path.join(projectDir, "AUTHORING.md"),
      "utf-8",
    );
    expect(authoringContent).toContain("Writing Presentations with roughcut");
  });

  it("should include resolution advice in field warnings", async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, "advice-test");
    await fs.mkdir(path.join(projectDir, ".roughcut"), { recursive: true });

    // Create empty .env and config.yml
    await fs.writeFile(path.join(projectDir, ".env"), "# empty\n");
    await fs.writeFile(
      path.join(projectDir, ".roughcut", "config.yml"),
      "# empty\n",
    );

    const output = execSync(
      `node dist/cli/index.js init "${projectDir}" 2>&1`,
      {
        cwd: path.resolve("."),
        encoding: "utf-8",
        timeout: 10000,
      },
    );

    // .env advice should include URL and add instructions
    expect(output).toContain("Add to .env: ELEVENLABS_API_KEY=your-key-here");
    expect(output).toContain("elevenlabs.io/app/settings/api-keys");
    expect(output).toContain("Add to .env: GEMINI_API_KEY=your-key-here");
    expect(output).toContain("aistudio.google.com/app/apikey");
    // config.yml advice should include example values
    expect(output).toContain("# elevenlabs_voice_id: adam");
    expect(output).toContain("# gemini_model: gemini-2.0-flash-exp");
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
