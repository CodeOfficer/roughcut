/**
 * Tests for roughcut init command
 * Validates project scaffolding creates correct files and handles edge cases
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

describe('roughcut init', () => {
  const tempDirs: string[] = [];

  async function makeTempDir(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'roughcut-init-test-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(async () => {
    for (const dir of tempDirs) {
      await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
    tempDirs.length = 0;
  });

  it('should create presentation.md, .roughcutrc.yml, and .gitignore', async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, 'my-talk');

    // Run init via the compiled CLI
    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve('.'),
      encoding: 'utf-8',
      timeout: 10000,
    });

    // Check files exist
    const files = await fs.readdir(projectDir);
    expect(files).toContain('presentation.md');
    expect(files).toContain('.roughcutrc.yml');
    expect(files).toContain('.gitignore');
  });

  it('should create valid markdown in presentation.md', async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, 'test-deck');

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve('.'),
      encoding: 'utf-8',
      timeout: 10000,
    });

    const content = await fs.readFile(
      path.join(projectDir, 'presentation.md'),
      'utf-8'
    );

    // Should have YAML frontmatter
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('title:');
    expect(content).toContain('theme:');

    // Should have slide separators
    expect(content).toContain('\n---\n');
  });

  it('should create .gitignore that ignores .build/', async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, 'deck');

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve('.'),
      encoding: 'utf-8',
      timeout: 10000,
    });

    const content = await fs.readFile(
      path.join(projectDir, '.gitignore'),
      'utf-8'
    );
    expect(content).toContain('.build/');
  });

  it('should not overwrite existing files', async () => {
    const tmpDir = await makeTempDir();
    const projectDir = path.join(tmpDir, 'existing');
    await fs.mkdir(projectDir, { recursive: true });

    // Create an existing presentation.md
    await fs.writeFile(
      path.join(projectDir, 'presentation.md'),
      'my custom content'
    );

    execSync(`node dist/cli/index.js init "${projectDir}"`, {
      cwd: path.resolve('.'),
      encoding: 'utf-8',
      timeout: 10000,
    });

    // Original file should be preserved
    const content = await fs.readFile(
      path.join(projectDir, 'presentation.md'),
      'utf-8'
    );
    expect(content).toBe('my custom content');

    // But other files should still be created
    const gitignore = await fs.readFile(
      path.join(projectDir, '.gitignore'),
      'utf-8'
    );
    expect(gitignore).toContain('.build/');
  });

  it('should work with current directory (.)', async () => {
    const tmpDir = await makeTempDir();

    execSync(`node ${path.resolve('dist/cli/index.js')} init .`, {
      cwd: tmpDir,
      encoding: 'utf-8',
      timeout: 10000,
    });

    const files = await fs.readdir(tmpDir);
    expect(files).toContain('presentation.md');
  });
});
