/**
 * Init command — scaffold a new presentation project
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../core/logger.js';

export function createInitCommand(): Command {
  const cmd = new Command('init');

  cmd
    .description('Scaffold a new presentation project')
    .argument('[dir]', 'Directory name (default: current directory)', '.')
    .action(async (dir: string) => {
      try {
        await runInit(dir);
      } catch (error) {
        logger.error('Init failed', error);
        process.exit(1);
      }
    });

  return cmd;
}

async function runInit(dir: string): Promise<void> {
  const targetDir = path.resolve(dir);
  const dirName = path.basename(targetDir);

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Resolve templates directory relative to this package
  const __filename = fileURLToPath(import.meta.url);
  const packageRoot = path.join(path.dirname(__filename), '../../..');
  const templatesDir = path.join(packageRoot, 'templates', 'init');

  // Check if templates exist (installed package), otherwise use inline defaults
  let useTemplates = false;
  try {
    await fs.access(templatesDir);
    useTemplates = true;
  } catch {
    // Templates not found — use inline defaults
  }

  // Write presentation.md
  const presentationPath = path.join(targetDir, 'presentation.md');
  if (await fileExists(presentationPath)) {
    logger.warn(`Skipping ${presentationPath} (already exists)`);
  } else {
    const content = useTemplates
      ? await fs.readFile(path.join(templatesDir, 'presentation.md'), 'utf-8')
      : getDefaultPresentation(dirName);
    await fs.writeFile(presentationPath, content);
    logger.success(`Created presentation.md`);
  }

  // Write .roughcutrc.yml
  const configPath = path.join(targetDir, '.roughcutrc.yml');
  if (await fileExists(configPath)) {
    logger.warn(`Skipping ${configPath} (already exists)`);
  } else {
    const content = useTemplates
      ? await fs.readFile(path.join(templatesDir, '.roughcutrc.yml'), 'utf-8')
      : getDefaultConfig();
    await fs.writeFile(configPath, content);
    logger.success(`Created .roughcutrc.yml`);
  }

  // Write .gitignore
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (await fileExists(gitignorePath)) {
    logger.warn(`Skipping ${gitignorePath} (already exists)`);
  } else {
    const content = useTemplates
      ? await fs.readFile(path.join(templatesDir, '.gitignore'), 'utf-8')
      : '.build/\n';
    await fs.writeFile(gitignorePath, content);
    logger.success(`Created .gitignore`);
  }

  logger.section('Project ready!');
  console.log('');
  console.log(`  cd ${dir === '.' ? '.' : dir}`);
  console.log(`  roughcut build -i presentation.md        # Build HTML`);
  console.log(`  roughcut dev -i presentation.md           # Preview in browser`);
  console.log(`  roughcut build -i presentation.md --full  # Full build with audio + video`);
  console.log('');
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getDefaultPresentation(name: string): string {
  const title = name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return `---
title: "${title}"
theme: dracula
---

# ${title}

@transition: zoom

Welcome to your new presentation.

Edit this file to add your content.

---

# Getting Started

Use three dashes \`---\` to separate slides.

- **Bold text** for emphasis
- *Italic text* for nuance
- \`Code snippets\` for technical content

---

# Progressive Reveal

Bullet points can appear one at a time:

- First point @fragment
- Second point @fragment
- Third point @fragment

---

# Audio Narration

@audio: Add narration with the audio directive.
@audio: Each line becomes a sentence in the voiceover.

To generate audio, run:
\`roughcut build -i presentation.md --audio\`

---

# That's It!

**Your presentation is ready.**

Run \`roughcut build -i presentation.md\` to build.
`;
}

function getDefaultConfig(): string {
  return `# roughcut project configuration
# See: https://github.com/codeofficer/roughcut

# Uncomment and set your API keys for audio/image generation:
# elevenlabs_api_key: "your-key-here"
# elevenlabs_voice_id: "adam"
# gemini_api_key: "your-key-here"

# Log level: debug, info, warn, error
# log_level: info
`;
}
