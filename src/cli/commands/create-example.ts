/**
 * Create-example command — scaffold an example presentation
 *
 * Creates a directory with a ready-to-build presentation.md from one of the
 * bundled examples. Does not require a workspace — works standalone.
 */

import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { logger } from "../../core/logger.js";

const AVAILABLE_EXAMPLES = ["hello-world", "narrated-deck", "kitchen-sink"];

export function createCreateExampleCommand(): Command {
  const cmd = new Command("create-example");

  cmd
    .description("Create an example presentation you can build immediately")
    .argument("<name>", `Example name (${AVAILABLE_EXAMPLES.join(", ")})`)
    .action(async (name: string) => {
      try {
        await runCreateExample(name);
      } catch (error) {
        logger.error("Create-example failed", error);
        process.exit(1);
      }
    });

  return cmd;
}

async function runCreateExample(name: string): Promise<void> {
  if (!AVAILABLE_EXAMPLES.includes(name)) {
    logger.error(
      `Unknown example "${name}".\n` +
        `Available examples: ${AVAILABLE_EXAMPLES.join(", ")}`,
    );
    process.exit(1);
  }

  const targetDir = path.resolve(name);

  // Check if directory already exists
  try {
    const stat = await fs.stat(targetDir);
    if (stat.isDirectory()) {
      logger.error(`Directory "${name}" already exists.`);
      process.exit(1);
    }
  } catch {
    // Directory doesn't exist — good
  }

  // Resolve templates directory relative to this package
  const __filename = fileURLToPath(import.meta.url);
  const packageRoot = path.join(path.dirname(__filename), "../../..");
  const templatesDir = path.join(packageRoot, "templates", "examples");

  // Load example template
  let content: string;
  try {
    content = await fs.readFile(path.join(templatesDir, `${name}.md`), "utf-8");
  } catch {
    content = getDefaultHelloWorld();
  }

  // Create directory and write presentation.md
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, "presentation.md"), content);
  logger.success(`Created ${name}/presentation.md`);

  console.log("");
  console.log(`  cd ${name}`);
  console.log("  roughcut build                    # Build HTML (fast, free)");
  console.log("  roughcut dev                      # Preview in browser");
  console.log(
    "  roughcut build --full             # Full build with audio + video",
  );
  console.log("");
}

function getDefaultHelloWorld(): string {
  return `---
title: "Hello World"
theme: black
---

# Hello World

This is the simplest possible presentation.

Just markdown and slide separators — nothing else required.

---

# Slide Two

Use \`---\` (three dashes) to separate slides.

Standard markdown works:

- **Bold text**
- *Italic text*
- \`Code snippets\`

---

# That's It!

**Three slides. Zero directives. Pure markdown.**

Build this with:

\`\`\`bash
roughcut build
\`\`\`
`;
}
