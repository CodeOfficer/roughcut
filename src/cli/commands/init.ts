/**
 * Init command — scaffold a new roughcut workspace
 *
 * Creates:
 *   .roughcut/config.yml  — non-secret preferences (safe to commit)
 *   .env                  — API key placeholders (gitignored)
 *   .gitignore            — ignores .env and .build directories
 *   README.md             — quick-start guide
 */

import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { logger } from "../../core/logger.js";

export function createInitCommand(): Command {
  const cmd = new Command("init");

  cmd
    .description("Create a new roughcut workspace")
    .argument("[dir]", "Directory name (default: current directory)", ".")
    .action(async (dir: string) => {
      try {
        await runInit(dir);
      } catch (error) {
        logger.error("Init failed", error);
        process.exit(1);
      }
    });

  return cmd;
}

async function runInit(dir: string): Promise<void> {
  const targetDir = path.resolve(dir);
  const dirName = path.basename(targetDir);

  // Check if workspace already exists
  if (await fileExists(path.join(targetDir, ".roughcut"))) {
    logger.warn(`Workspace already exists at ${targetDir}`);
    logger.warn('Use "roughcut create <name>" to add a presentation.');
    return;
  }

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Resolve templates directory relative to this package
  const __filename = fileURLToPath(import.meta.url);
  const packageRoot = path.join(path.dirname(__filename), "../../..");
  const templatesDir = path.join(packageRoot, "templates", "init");

  // Check if templates exist (installed package), otherwise use inline defaults
  let useTemplates = false;
  try {
    await fs.access(templatesDir);
    useTemplates = true;
  } catch {
    // Templates not found — use inline defaults
  }

  // Create .roughcut/ directory
  await fs.mkdir(path.join(targetDir, ".roughcut"), { recursive: true });

  // Write .roughcut/config.yml
  const configPath = path.join(targetDir, ".roughcut", "config.yml");
  const configContent = useTemplates
    ? await fs.readFile(
        path.join(templatesDir, ".roughcut", "config.yml"),
        "utf-8",
      )
    : getDefaultWorkspaceConfig();
  await fs.writeFile(configPath, configContent);
  logger.success("Created .roughcut/config.yml");

  // Write .env
  const envPath = path.join(targetDir, ".env");
  if (await fileExists(envPath)) {
    logger.warn("Skipping .env (already exists)");
  } else {
    const envContent = useTemplates
      ? await fs.readFile(path.join(templatesDir, ".env"), "utf-8")
      : getDefaultEnv();
    await fs.writeFile(envPath, envContent);
    logger.success("Created .env");
  }

  // Write .gitignore
  const gitignorePath = path.join(targetDir, ".gitignore");
  if (await fileExists(gitignorePath)) {
    logger.warn("Skipping .gitignore (already exists)");
  } else {
    const gitignoreContent = useTemplates
      ? await fs.readFile(path.join(templatesDir, ".gitignore"), "utf-8")
      : ".env\n**/.build/\n";
    await fs.writeFile(gitignorePath, gitignoreContent);
    logger.success("Created .gitignore");
  }

  // Write README.md
  const readmePath = path.join(targetDir, "README.md");
  if (await fileExists(readmePath)) {
    logger.warn("Skipping README.md (already exists)");
  } else {
    let readmeContent = useTemplates
      ? await fs.readFile(path.join(templatesDir, "README.md"), "utf-8")
      : getDefaultReadme(dirName);
    readmeContent = readmeContent.replace(
      /\{\{PROJECT_NAME\}\}/g,
      formatTitle(dirName),
    );
    await fs.writeFile(readmePath, readmeContent);
    logger.success("Created README.md");
  }

  logger.section("Workspace ready!");
  console.log("");
  if (dir !== ".") {
    console.log(`  cd ${dir}`);
  }
  console.log("  # Edit .env to add your API keys (optional)");
  console.log("  roughcut create my-talk              # Create a presentation");
  console.log("  cd my-talk");
  console.log("  roughcut build -i presentation.md    # Build HTML");
  console.log("");
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatTitle(name: string): string {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDefaultWorkspaceConfig(): string {
  return `# roughcut workspace configuration
# Non-secret preferences — safe to commit to version control
# See: https://github.com/codeofficer/roughcut

# ElevenLabs voice for narration
# elevenlabs_voice_id: adam

# Log level: debug, info, warn, error
# log_level: info

# Gemini model for image generation
# gemini_model: gemini-2.0-flash-exp
`;
}

function getDefaultEnv(): string {
  return `# roughcut API keys — DO NOT commit this file
# Get your keys at the links below, then uncomment and paste them in.

# ElevenLabs (required for audio narration)
# https://elevenlabs.io/app/settings/api-keys
# ELEVENLABS_API_KEY=your-key-here

# Google Gemini (required for AI image generation)
# https://aistudio.google.com/app/apikey
# GEMINI_API_KEY=your-key-here
`;
}

function getDefaultReadme(name: string): string {
  const title = formatTitle(name);
  return `# ${title}

A [roughcut](https://github.com/codeofficer/roughcut) workspace.

## Getting Started

1. **Add your API keys** (optional — only needed for audio/image generation):

   \`\`\`bash
   # Edit .env and uncomment the keys you need
   \`\`\`

2. **Create a presentation:**

   \`\`\`bash
   roughcut create my-talk
   cd my-talk
   \`\`\`

3. **Build and preview:**

   \`\`\`bash
   roughcut build -i presentation.md          # HTML only (fast, free)
   roughcut dev -i presentation.md             # Preview in browser
   roughcut build -i presentation.md --full    # Full build with audio + video
   \`\`\`

## Useful Commands

\`\`\`bash
roughcut lint presentation.md    # Validate your markdown
roughcut doctor                  # Check prerequisites
roughcut voices                  # List available voices
\`\`\`

## Learn More

- [Writing Guide](https://github.com/codeofficer/roughcut/blob/main/docs/TUTORIAL-WRITING-GUIDE.md)
- [Feature Reference](https://github.com/codeofficer/roughcut/blob/main/docs/FEATURES.md)
`;
}
