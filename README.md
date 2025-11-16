# GenAI Tutorial Factory

An automated TypeScript-based system for generating interactive RevealJS presentations and tutorial videos from markdown scripts. Combines AI-powered narration (ElevenLabs), browser automation (Playwright), and video assembly (FFmpeg) into a streamlined workflow.

## Features

- **Markdown-Based Scripts**: Write tutorial content in simple markdown format with RevealJS syntax
- **AI Narration**: Generate natural-sounding voiceovers with ElevenLabs
- **Interactive HTML**: Creates standalone RevealJS presentations with navigation and speaker notes
- **Video Output**: Records synchronized video with high-quality audio narration
- **Dual Outputs**: Every build produces BOTH interactive HTML AND MP4 video
- **Type-Safe Configuration**: Strict TypeScript with runtime validation
- **CLI Workflow**: Simple commands to manage the entire tutorial lifecycle

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.0.0 or higher
- **FFmpeg** installed on your system
- **ElevenLabs API Key** (get one at [elevenlabs.io](https://elevenlabs.io))

### Installing FFmpeg

**macOS (Homebrew):**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

## Quick Start

### 1. Installation

```bash
# Clone or navigate to the project
cd genai-tutorial-factory

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Configuration

```bash
# Copy the example environment file
cp .envrc.example .envrc

# Edit .envrc and add your API keys
nano .envrc  # or use your preferred editor
```

Required configuration in `.envrc`:
```bash
ELEVENLABS_API_KEY=your_api_key_here
```

See `.envrc.example` for all available configuration options.

**Discover Available Voices:**

To see all available voices in your ElevenLabs account:
```bash
npm run voices
```

This will display a formatted list of voices grouped by category (Premade, Professional, Generated, Cloned) with their IDs and descriptions. Copy the voice ID you want to use into your `.envrc` file or presentation frontmatter.

### 3. Write Your Tutorial Script

Create a markdown file (e.g., `my-tutorial.md`) using RevealJS format:

```markdown
---
title: My First Tutorial
description: Learn something amazing
---

# Introduction
@audio: Welcome to my first tutorial! Today we'll learn something amazing.
@duration: 5s
@pause-after: 2s

---

# Step 1: Setup
@audio: Let's start by opening the terminal and running our setup command.
@duration: 8s
@pause-after: 2s

- Install dependencies
- Configure settings
- Verify installation

@playwright:
- Action: Open terminal
- Type: "npm install"
- Wait 2s
```

See `tutorials/comprehensive.md` for a complete example with all supported features, or `tutorials/minimal.md` for a bare-bones starter.

### 4. Build Your Tutorial

```bash
# Generic build scripts (recommended)
# Fast build (skip AI - saves costs!)
TUTORIAL=my-tutorial npm run tutorial:fast

# Full build (with TTS + images)
TUTORIAL=my-tutorial npm run tutorial:full

# HTML only (no video)
TUTORIAL=my-tutorial npm run tutorial:html

# Low-level CLI (advanced)
npm run tutorial:build -- -i tutorials/my-tutorial.md -o tutorials/.my-tutorial
```

**Note**: Save your tutorial as `tutorials/<name>.md` (flat file format)

### 5. View Your Outputs

Every build produces TWO outputs:

1. **Interactive HTML**: `output/presentation/index.html`
   - Open in browser for manual navigation
   - Press 'S' for speaker notes
   - Navigate with arrow keys or space

2. **Video File**: `output/tutorial.mp4`
   - Recorded video with synchronized narration
   - Ready to upload to video platforms

## Development Workflow

Understanding when to use each command is key to an efficient workflow:

### **Development Mode** (Use Most Often)

Fast iteration with **no API costs**:

```bash
# Manual control - navigate with keyboard
TUTORIAL=minimal npm run dev

# Auto-advance - watch automation
TUTORIAL=comprehensive npm run dev:auto
```

**When to use:**
- ✅ Writing a new tutorial
- ✅ Testing timing and transitions
- ✅ Debugging fragment reveals
- ✅ Checking if slides look right
- ✅ Iterating quickly (FREE - no AI costs!)

**What it does:**
- Reads your markdown
- Generates HTML on the fly
- Opens browser with dev server
- **Manual**: You control navigation
- **Auto**: Watch the automation run

### **Production Builds** (Final Output)

Generate deliverable assets:

```bash
# HTML only (no video, no AI) - fastest preview
TUTORIAL=minimal npm run tutorial:html

# Fast build (skip AI, include video recording)
TUTORIAL=comprehensive npm run tutorial:fast

# Full build (TTS + images + video) - costs API credits!
TUTORIAL=comprehensive npm run tutorial:full
```

**When to use:**
- ✅ Done iterating, need final output
- ✅ Need the MP4 video file
- ✅ Deploying HTML somewhere
- ✅ Ready to spend TTS/image credits

### Recommended Workflow

```bash
# 1. Start with dev mode while writing
TUTORIAL=my-tutorial npm run dev
# ... edit markdown, refresh browser, repeat ...

# 2. Test auto-advance when ready
TUTORIAL=my-tutorial npm run dev:auto
# ... verify timing and fragments ...

# 3. Generate HTML preview (no AI costs)
TUTORIAL=my-tutorial npm run tutorial:html
# ... verify everything looks good ...

# 4. FINAL: Generate full production build
TUTORIAL=my-tutorial npm run tutorial:full
# ... now you have video + audio! ...
```

### Build Outputs

All builds create outputs in `tutorials/.<name>/`:

- **presentation/index.html** - Interactive RevealJS presentation
- **tutorial.mp4** - Video with synchronized audio (unless `--no-video`)
- **debug.txt** - Detailed build logs with timestamps
- **build-summary.txt** - User-friendly summary with optimization tips
- **audio/** - Generated TTS files (cached for reuse)

## CLI Commands

### Quick Start Scripts

**Generic Scripts** (use with any tutorial):
```bash
# Fast build (skip images & audio) - saves API costs!
TUTORIAL=<name> npm run tutorial:fast

# Full build (uses TTS + Gemini credits!)
TUTORIAL=<name> npm run tutorial:full

# HTML only (no video recording)
TUTORIAL=<name> npm run tutorial:html
```

**Examples**:
```bash
TUTORIAL=minimal npm run tutorial:html       # Quick start
TUTORIAL=comprehensive npm run tutorial:full  # Full showcase
TUTORIAL=test-vertical npm run tutorial:fast  # Test build
```

### Low-Level CLI

For advanced usage with full control:
```bash
npm run tutorial:build -- -i <input-file> -o <output-dir> [options]

# Options:
--skip-audio       # Reuse existing audio files
--skip-images      # Reuse existing images
--no-video         # Generate HTML only, skip video recording
```

**Outputs**:
- Interactive HTML: `tutorials/.<name>/presentation/index.html`
- Video file: `tutorials/.<name>/tutorial.mp4` (unless --no-video)

## Tutorial Script Format

### Basic Structure

```markdown
---
title: Tutorial Title
description: Brief description
---

# Slide Title
@audio: Your narration text here
@duration: 5s
@pause-after: 2s

Content for the slide...

---

# Next Slide
@audio: More narration
@duration: 8s

- Bullet point
- Another point @fragment
```

### Available Directives

**Front Matter** (at top of file):
```markdown
---
title: Tutorial Title
description: Brief description
theme: black
transition: slide
---
```

**Slide Directives**:
- `@audio:` - Narration text (sent to ElevenLabs) - supports multi-line format
- `@duration:` - Expected slide duration
- `@pause-after:` - Pause after audio before advancing
- `@background:` - Background color or gradient
- `@transition:` - Slide transition effect
- `@playwright:` - Browser automation instructions
- `@image-prompt:` - AI image generation prompt (Gemini)

**Content Annotations**:
- `@fragment` - Step-by-step reveal
- `[2s]` - Inline pause in audio narration

### Audio Format (Multi-line - Recommended)

The **multi-line format** is more readable and Git-friendly:

```markdown
@audio: Let's start with the foundation.
@audio: Modern web applications are built on three essential pillars.
@audio: First, HTML provides the structure.
@audio: Second, CSS handles the styling.
@audio: And third, JavaScript adds interactivity.
```

**Benefits:**
- ✅ One sentence per line (easier to read and edit)
- ✅ Better git diffs (changes tracked per sentence)
- ✅ Automatic 1s pauses between lines
- ✅ Intelligent caching (only regenerate TTS for changed lines)
- ✅ Still supports inline `[2s]` pause markers

**Single-line format** (still supported):
```markdown
@audio: All text in one line [1s] with manual pauses.
```

### Example with Playwright

```markdown
# Interactive Demo
@audio: Let's see this feature in action
@duration: 10s
@pause-after: 2s

@playwright:
- Action: Click button
- Wait 2s
- Type: "Hello World"
- Press: Enter
```

See `tutorials/comprehensive.md` for complete examples.

## Configuration

### Tutorial Configuration

Configuration is specified in the markdown front matter:

```markdown
---
title: Your Tutorial Title
description: What your tutorial teaches
theme: black
transition: slide
---
```

Available themes: black, white, league, beige, sky, night, serif, simple, solarized, moon

### Environment Variables

See `.envrc.example` for all options. Key variables:

```bash
# Required
ELEVENLABS_API_KEY=your_key

# Optional voice settings
ELEVENLABS_VOICE_ID=adam          # Default voice (optional)
ELEVENLABS_STABILITY=0.75
ELEVENLABS_SIMILARITY_BOOST=0.75

# Paths
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

## Project Structure

```
genai-tutorial-factory/
├── src/                    # Core TypeScript modules
│   ├── cli/               # CLI commands
│   ├── config/            # Environment configuration
│   ├── core/              # Parser and types
│   ├── presentation/      # RevealJS generation and control
│   ├── narration/         # ElevenLabs integration
│   ├── video/             # Video recording and assembly
│   └── utils/             # Helper functions
├── output/                # Generated files
│   ├── presentation/      # Interactive HTML
│   ├── audio/            # Generated narration
│   ├── video/            # Recorded video frames
│   └── tutorial.mp4      # Final video
└── docs/                 # Documentation
```

## Documentation

- **Architecture & Decisions**: `docs/architecture/revealjs/`
- **Migration Guide**: `docs/MIGRATION.md` (v1 → v2 format)
- **Project Context**: `CLAUDE.md` (for Claude Code sessions)

## Troubleshooting

### Environment Variable Errors

If you see:
```
❌ Environment Configuration Error
ELEVENLABS_API_KEY: ElevenLabs API key is required
```

Solution:
1. Ensure `.envrc` file exists: `cp .envrc.example .envrc`
2. Add your API key to `.envrc`
3. Verify no extra spaces around the `=` sign

### FFmpeg Not Found

If FFmpeg isn't found:
1. Install FFmpeg (see Prerequisites)
2. Find FFmpeg path: `which ffmpeg`
3. Update `FFMPEG_PATH` in `.envrc`

### Playwright Browsers Not Installed

```bash
npx playwright install
```

### ElevenLabs API Errors

- Verify your API key is correct
- Check your ElevenLabs account has credits
- Ensure voice ID exists (default: `adam`)

## Development

```bash
# Build TypeScript
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## Architecture

The system follows a unified pipeline architecture:

1. **Parser** - Converts markdown to RevealJS slide definitions
2. **Narration** - Generates audio per slide via ElevenLabs API
3. **Presentation** - Builds interactive RevealJS HTML with bundled assets
4. **Timeline** - Creates synchronized timing map for slides and audio
5. **Recording** - Uses Playwright to record browser during automated playback
6. **Assembly** - Combines video frames with high-quality audio via FFmpeg
7. **CLI** - Orchestrates the complete workflow

**Key Innovation**: Single markdown source produces BOTH interactive HTML and video output.

## Contributing

Contributions welcome! The codebase uses:
- Strict TypeScript settings
- Zod for runtime validation
- ESM modules
- Type-safe environment configuration

## License

MIT

## Migration from Original System

If you have tutorials in the original format (pre-v2.0.0), see `MIGRATION.md` for a complete guide on converting to the new RevealJS format.

## Resources

- [RevealJS Documentation](https://revealjs.com/)
- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Architecture Documentation](./docs/architecture/revealjs/) - Design decisions and planning

## Next Steps

1. Set up your environment (`.envrc` file)
2. Study the examples: `tutorials/minimal.md` (basics) or `tutorials/comprehensive.md` (all features)
3. Create your tutorial: `tutorials/my-tutorial.md`
4. Build it: `TUTORIAL=my-tutorial npm run tutorial:fast` (or `:full` for AI features)
5. View HTML at `tutorials/.my-tutorial/presentation/index.html`
6. Watch video at `tutorials/.my-tutorial/tutorial.mp4`
7. Share your tutorial!
