/**
 * Init command — scaffold a new roughcut workspace
 *
 * Creates:
 *   .roughcut/config.yml  — non-secret preferences (safe to commit)
 *   .env                  — API key placeholders (gitignored)
 *   .gitignore            — ignores .env and .build directories
 *   README.md             — quick-start guide
 *   AUTHORING.md          — how to write presentations
 */

import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { logger } from "../../core/logger.js";

// Expected fields for config auditing — when adding a new CLI feature that
// needs a config field, add it here AND to the corresponding template file.
const EXPECTED_ENV_FIELDS = [
  {
    key: "ELEVENLABS_API_KEY",
    purpose: "audio narration",
    url: "https://elevenlabs.io/app/settings/api-keys",
  },
  {
    key: "GEMINI_API_KEY",
    purpose: "AI image generation",
    url: "https://aistudio.google.com/app/apikey",
  },
];

const EXPECTED_CONFIG_FIELDS = [
  {
    key: "elevenlabs_voice_id",
    purpose: "ElevenLabs voice for narration",
    example: "adam",
  },
  { key: "log_level", purpose: "logging verbosity", example: "info" },
  {
    key: "gemini_model",
    purpose: "Gemini model for image generation",
    example: "gemini-2.0-flash-exp",
  },
];

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
  if (await fileExists(configPath)) {
    logger.warn("Skipping .roughcut/config.yml (already exists)");
    await auditConfigFile(configPath);
  } else {
    const configContent = useTemplates
      ? await fs.readFile(
          path.join(templatesDir, ".roughcut", "config.yml"),
          "utf-8",
        )
      : getDefaultWorkspaceConfig();
    await fs.writeFile(configPath, configContent);
    logger.success("Created .roughcut/config.yml");
  }

  // Write .env
  const envPath = path.join(targetDir, ".env");
  if (await fileExists(envPath)) {
    logger.warn("Skipping .env (already exists)");
    await auditEnvFile(envPath);
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

  // Write README.md — always refresh with latest template
  const readmePath = path.join(targetDir, "README.md");
  const readmeExisted = await fileExists(readmePath);
  let readmeContent = useTemplates
    ? await fs.readFile(path.join(templatesDir, "README.md"), "utf-8")
    : getDefaultReadme(dirName);
  readmeContent = readmeContent.replace(
    /\{\{PROJECT_NAME\}\}/g,
    formatTitle(dirName),
  );
  await fs.writeFile(readmePath, readmeContent);
  logger.success(readmeExisted ? "Updated README.md" : "Created README.md");

  // Write AUTHORING.md — always refresh with latest template
  const authoringPath = path.join(targetDir, "AUTHORING.md");
  const authoringExisted = await fileExists(authoringPath);
  const authoringContent = useTemplates
    ? await fs.readFile(path.join(templatesDir, "AUTHORING.md"), "utf-8")
    : getDefaultAuthoring();
  await fs.writeFile(authoringPath, authoringContent);
  logger.success(
    authoringExisted ? "Updated AUTHORING.md" : "Created AUTHORING.md",
  );

  logger.section("Workspace ready!");
  console.log("");
  if (dir !== ".") {
    console.log(`  cd ${dir}`);
  }
  console.log("  # Edit .env to add your API keys (optional)");
  console.log("  roughcut create my-talk              # Create a presentation");
  console.log("  cd my-talk");
  console.log(
    "  roughcut build                       # Build HTML (fast, free)",
  );
  console.log(
    "  roughcut build --full                # Full build with audio + video",
  );
  console.log("");
}

async function auditEnvFile(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, "utf-8");
  for (const field of EXPECTED_ENV_FIELDS) {
    if (!content.includes(field.key)) {
      logger.warn(`.env is missing ${field.key} (needed for ${field.purpose})`);
      console.log(`         Add to .env: ${field.key}=your-key-here`);
      console.log(`         Get a key at ${field.url}`);
    }
  }
}

async function auditConfigFile(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, "utf-8");
  for (const field of EXPECTED_CONFIG_FIELDS) {
    if (!content.includes(field.key)) {
      logger.warn(
        `.roughcut/config.yml is missing ${field.key} (${field.purpose})`,
      );
      console.log(
        `         Add to .roughcut/config.yml: # ${field.key}: ${field.example}`,
      );
    }
  }
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
   roughcut build                    # HTML only (fast, free)
   roughcut dev                      # Preview in browser
   roughcut build --full             # Full build with audio + video
   \`\`\`

## Useful Commands

\`\`\`bash
roughcut lint                       # Validate your markdown
roughcut doctor                     # Check prerequisites
roughcut voices                     # List available voices
\`\`\`

## Learn More

- [Authoring Guide](./AUTHORING.md) — how to write presentations (start here)
- [Feature Reference](https://github.com/codeofficer/roughcut/blob/main/docs/FEATURES.md) — all 21 directives
- [Writing Best Practices](https://github.com/codeofficer/roughcut/blob/main/docs/TUTORIAL-WRITING-GUIDE.md) — content guidelines
`;
}

function getDefaultAuthoring(): string {
  return `# Writing Presentations with roughcut

Your complete reference for roughcut's custom markdown format — all 21 directives, from first slide to advanced features.

---

## Quick Start

### Minimum Viable File

\`\`\`markdown
---
title: "Hello World"
theme: dracula
---

# Welcome

This is my first slide.

---

# Slide Two

- Point one
- Point two
- Point three
\`\`\`

### Build Commands

\`\`\`bash
roughcut build                    # Generate HTML (fast, free)
roughcut dev                      # Preview in browser
roughcut build --full             # Full build with audio + video (costs $$$)
roughcut lint                     # Validate markdown
\`\`\`

---

## Frontmatter Directives

Frontmatter appears at the top of your file between \`---\` fences and configures the entire presentation.

### \`title\` (required)

Presentation title — shown in browser tab and metadata.

\`\`\`yaml
title: "My Presentation"
\`\`\`

### \`theme\` (required)

RevealJS visual theme.

\`\`\`yaml
theme: dracula
\`\`\`

Available themes: \`black\` \`white\` \`league\` \`beige\` \`sky\` \`night\` \`serif\` \`simple\` \`solarized\` \`blood\` \`moon\` \`dracula\`

### \`voice\`

ElevenLabs voice ID for TTS narration. Run \`roughcut voices\` to see available voices.

\`\`\`yaml
voice: adam
\`\`\`

Falls back to \`ELEVENLABS_VOICE_ID\` in \`.env\` if not set.

### \`resolution\`

Video output resolution. Format: \`WIDTHxHEIGHT\` (digits only, minimum 640x480).

\`\`\`yaml
resolution: 1920x1080
\`\`\`

Common values: \`1920x1080\` (Full HD, default), \`1280x720\` (HD), \`2560x1440\` (2K), \`3840x2160\` (4K).

### \`preset\`

Configuration preset for common scenarios. Presets set sensible RevealJS defaults that you can override with \`config\`.

\`\`\`yaml
preset: manual-presentation
\`\`\`

Available presets: \`video-recording\` (default), \`manual-presentation\`, \`auto-demo\`, \`speaker-mode\`.

### \`config\`

Fine-tune RevealJS behavior directly (60+ options). Values here override preset defaults.

\`\`\`yaml
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  center: false
\`\`\`

### \`customCSS\`

Link an external CSS file for custom styling.

\`\`\`yaml
customCSS: styles/custom.css
\`\`\`

### \`customStyles\`

Inline CSS styles applied to the presentation.

\`\`\`yaml
customStyles: |
  .reveal h1 { color: #00ff00; }
  .reveal p { font-size: 1.5em; }
\`\`\`

---

## Narration

### \`@audio:\` — AI-generated voice narration

Adds ElevenLabs TTS narration to a slide. Requires \`ELEVENLABS_API_KEY\` in \`.env\` and a \`--full\` build.

**Multi-line format (recommended):**

\`\`\`markdown
@audio: Welcome to this presentation.
@audio: Today we'll cover three topics.
@audio: Let's start with the basics.
\`\`\`

Each \`@audio:\` line becomes a separate TTS request. Only changed lines regenerate when you rebuild. A 1-second pause is automatically inserted between lines.

### Pause Markers

Add explicit pauses inside \`@audio:\` blocks with \`[Xs]\` syntax:

\`\`\`markdown
@audio: Here's an important point. [2s] Let that sink in.
\`\`\`

Valid formats: \`[1s]\`, \`[2.5s]\`, \`[500ms]\`. Pauses must be inside \`@audio:\` blocks. Maximum pause: 30 seconds.

---

## Timing

### \`@duration:\` — slide display time

Sets how long a slide is shown. Format: number followed by \`s\` (seconds) or \`ms\` (milliseconds). Supports decimals: \`2.5s\`.

\`\`\`markdown
@duration: 5s
\`\`\`

### \`@pause-after:\` — breathing room after a slide

Adds a pause before advancing to the next slide. Same format as \`@duration:\`.

\`\`\`markdown
@pause-after: 3s
\`\`\`

---

## Visual

### \`@background:\` — slide backgrounds

\`\`\`markdown
@background: #1a1a2e                                              # hex color
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)   # gradient
@background: https://example.com/photo.jpg                        # image URL
\`\`\`

### \`@transition:\` — slide transitions

Options: \`none\`, \`fade\`, \`slide\`, \`convex\`, \`concave\`, \`zoom\`

\`\`\`markdown
@transition: fade
\`\`\`

### \`@image-prompt:\` — AI image generation

Requires \`GEMINI_API_KEY\` in \`.env\` and a \`--full\` build. Prompts must be at least 10 characters.

\`\`\`markdown
@image-prompt: A futuristic holographic dashboard with neon blue interface elements
\`\`\`

### \`@background-video:\` — video backgrounds

\`\`\`markdown
@background-video: videos/loop.mp4
@background-video-loop: true
@background-video-muted: true
\`\`\`

Supports MP4 and WebM formats.

---

## Progressive Reveal

### \`@fragment\` — reveal bullet items one at a time

\`\`\`markdown
- Design the wireframes @fragment
- Build the prototype @fragment +1s
- Test with users @fragment +2s
\`\`\`

**Important**: fragments only work on bullet lists (\`-\`, \`*\`, \`+\`). They do **not** work on numbered lists or paragraphs.

---

## Advanced

### \`@vertical-slide:\` — 2D navigation

\`\`\`markdown
# Chapter 1

Main overview...

@vertical-slide:
## 1.1 Background

Details...

---

# Chapter 2

Next topic...
\`\`\`

### \`@playwright:\` — browser automation

\`\`\`markdown
@playwright:
- Action: Click button#submit
- Wait 2s
- Screenshot: result
\`\`\`

Three instruction types: \`Action:\` (browser action), \`Wait\` (pause), \`Screenshot:\` (capture).

### \`@notes:\` — speaker notes

\`\`\`markdown
@notes: Remember to mention the quarterly results here
\`\`\`

Press \`S\` during a presentation to open the speaker notes window.

---

## Linting & Validation

\`\`\`bash
roughcut lint
\`\`\`

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| \`@fragment\` on numbered list | Use bullet list (\`-\`, \`*\`, \`+\`) instead |
| \`@duration: 5 seconds\` | Use \`5s\` or \`500ms\` format |
| Pause \`[2s]\` outside \`@audio:\` | Move pause markers inside \`@audio:\` blocks |
| Unknown directive \`@duraton:\` | Check spelling — the linter suggests corrections |
| Missing \`title:\` in frontmatter | Add required \`title:\` and \`theme:\` fields |

---

## Quick Reference

All 21 directives at a glance:

| Directive | Where | Purpose |
|-----------|-------|---------|
| \`title\` | frontmatter | Presentation title (required) |
| \`theme\` | frontmatter | Visual theme (required) |
| \`voice\` | frontmatter | ElevenLabs voice ID |
| \`resolution\` | frontmatter | Video output resolution |
| \`preset\` | frontmatter | Configuration preset |
| \`config\` | frontmatter | RevealJS config overrides |
| \`customCSS\` | frontmatter | External CSS file path |
| \`customStyles\` | frontmatter | Inline CSS styles |
| \`@audio:\` | slide | Narration text (TTS) |
| \`@duration:\` | slide | Slide display time |
| \`@pause-after:\` | slide | Pause before next slide |
| \`@transition:\` | slide | Slide transition effect |
| \`@background:\` | slide | Background color/gradient/image |
| \`@image-prompt:\` | slide | AI image generation prompt |
| \`@notes:\` | slide | Speaker notes |
| \`@playwright:\` | slide | Browser automation |
| \`@vertical-slide:\` | slide | Start vertical slide group |
| \`@background-video:\` | slide | Video background file |
| \`@background-video-loop:\` | slide | Loop video background |
| \`@background-video-muted:\` | slide | Mute video background |
| \`@fragment\` | inline | Progressive reveal on bullets |

---

## Further Reading

- [Feature Reference](https://github.com/codeofficer/roughcut/blob/main/docs/FEATURES.md) — detailed directive documentation
- [Writing Best Practices](https://github.com/codeofficer/roughcut/blob/main/docs/TUTORIAL-WRITING-GUIDE.md) — content and design guidelines
- [Linting Rules](https://github.com/codeofficer/roughcut/blob/main/docs/LINTING_SPEC.md) — complete validation specification
`;
}
