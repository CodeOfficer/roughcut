/**
 * Doctor command — check system prerequisites
 */

import { Command } from 'commander';
import { execSync } from 'child_process';
import { config } from '../../config/config-manager.js';

export function createDoctorCommand(): Command {
  const cmd = new Command('doctor');

  cmd
    .description('Check system prerequisites and configuration')
    .action(async () => {
      await runDoctor();
    });

  return cmd;
}

interface CheckResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  detail: string;
  hint?: string;
}

async function runDoctor(): Promise<void> {
  const results: CheckResult[] = [];

  // Node.js version
  results.push(checkNode());

  // ffmpeg
  results.push(checkFfmpeg());

  // Playwright browsers
  results.push(await checkPlaywright());

  // API keys
  const cfg = config.get();
  results.push(checkApiKey('ELEVENLABS_API_KEY', cfg.elevenLabsApiKey, 'needed for audio narration'));
  results.push(checkApiKey('GEMINI_API_KEY', cfg.geminiApiKey, 'needed for AI image generation'));

  // Print results
  console.log('');
  let hasFailure = false;

  for (const r of results) {
    const icon = r.status === 'ok' ? '  [OK]  '
      : r.status === 'warn' ? '  [WARN]'
      : '  [FAIL]';

    const color = r.status === 'ok' ? '\x1b[32m'
      : r.status === 'warn' ? '\x1b[33m'
      : '\x1b[31m';

    console.log(`${color}${icon}\x1b[0m ${r.detail}`);

    if (r.hint) {
      console.log(`          ${r.hint}`);
    }

    if (r.status === 'fail') hasFailure = true;
  }

  console.log('');

  if (hasFailure) {
    console.log('Some checks failed. Fix the issues above before building.');
    process.exit(1);
  }
}

function checkNode(): CheckResult {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0] || '0', 10);

  if (major >= 20) {
    return { name: 'node', status: 'ok', detail: `Node.js ${version} (>= 20.0.0 required)` };
  }
  return {
    name: 'node',
    status: 'fail',
    detail: `Node.js ${version} (>= 20.0.0 required)`,
    hint: 'Install Node 20+: https://nodejs.org or `nvm install 20`',
  };
}

function checkFfmpeg(): CheckResult {
  try {
    const output = execSync('ffmpeg -version 2>&1', { encoding: 'utf-8', timeout: 5000 });
    const versionMatch = output.match(/ffmpeg version (\S+)/);
    const version = versionMatch?.[1] || 'unknown';
    const pathOutput = execSync('which ffmpeg 2>/dev/null || where ffmpeg 2>nul', {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim();

    return {
      name: 'ffmpeg',
      status: 'ok',
      detail: `ffmpeg ${version} (found at ${pathOutput})`,
    };
  } catch {
    return {
      name: 'ffmpeg',
      status: 'fail',
      detail: 'ffmpeg not found',
      hint: 'Install: brew install ffmpeg (macOS) | apt install ffmpeg (Linux) | choco install ffmpeg (Windows)',
    };
  }
}

async function checkPlaywright(): Promise<CheckResult> {
  try {
    // Try to import playwright and check if browsers are installed
    const { chromium } = await import('playwright');
    const executablePath = chromium.executablePath();

    // Check if the executable exists
    const { accessSync } = await import('fs');
    accessSync(executablePath);

    return {
      name: 'playwright',
      status: 'ok',
      detail: 'Playwright browsers installed',
    };
  } catch {
    return {
      name: 'playwright',
      status: 'warn',
      detail: 'Playwright browsers may not be installed',
      hint: 'Run: npx playwright install chromium',
    };
  }
}

function checkApiKey(name: string, value: string | undefined, purpose: string): CheckResult {
  if (value && value !== 'test-key') {
    return {
      name,
      status: 'ok',
      detail: `${name} is set`,
    };
  }
  return {
    name,
    status: 'warn',
    detail: `${name} not set (${purpose})`,
    hint: `Set in environment, .roughcutrc.yml, or ~/.config/roughcut/config.yml`,
  };
}
