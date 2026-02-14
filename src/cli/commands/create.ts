/**
 * Create command — add a new presentation to a roughcut workspace
 *
 * Creates a subdirectory with a presentation.md template.
 * Must be run inside a workspace (directory with .roughcut/).
 */

import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "../../config/config-manager.js";
import { logger } from "../../core/logger.js";

export function createCreateCommand(): Command {
  const cmd = new Command("create");

  cmd
    .description("Create a new presentation in the current workspace")
    .argument("<name>", "Presentation directory name")
    .action(async (name: string) => {
      try {
        await runCreate(name);
      } catch (error) {
        logger.error("Create failed", error);
        process.exit(1);
      }
    });

  return cmd;
}

async function runCreate(name: string): Promise<void> {
  // Verify we're inside a workspace
  const wsRoot = config.getWorkspaceRoot();
  if (!wsRoot) {
    logger.error(
      "Not inside a roughcut workspace.\n" +
        'Run "roughcut init" first to create a workspace, then use "roughcut create" to add presentations.',
    );
    process.exit(1);
  }

  const targetDir = path.resolve(name);

  // Check if directory already exists
  if (await dirExists(targetDir)) {
    logger.error(`Directory "${name}" already exists.`);
    process.exit(1);
  }

  // Create directory
  await fs.mkdir(targetDir, { recursive: true });

  // Resolve templates directory relative to this package
  const __filename = fileURLToPath(import.meta.url);
  const packageRoot = path.join(path.dirname(__filename), "../../..");
  const templatesDir = path.join(packageRoot, "templates", "create");

  // Load presentation template
  let content: string;
  try {
    content = await fs.readFile(
      path.join(templatesDir, "presentation.md"),
      "utf-8",
    );
  } catch {
    content = getDefaultPresentation();
  }

  // Replace placeholders
  const title = name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  content = content.replace(/\{\{TITLE\}\}/g, title);

  // Write presentation.md
  await fs.writeFile(path.join(targetDir, "presentation.md"), content);
  logger.success(`Created ${name}/presentation.md`);

  console.log("");
  console.log(`  cd ${name}`);
  console.log("  roughcut build -i presentation.md          # Build HTML");
  console.log(
    "  roughcut dev -i presentation.md             # Preview in browser",
  );
  console.log(
    "  roughcut build -i presentation.md --full    # Full build with audio + video",
  );
  console.log("");
}

async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

function getDefaultPresentation(): string {
  return `---
title: "{{TITLE}}"
theme: dracula
---

# {{TITLE}}

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
