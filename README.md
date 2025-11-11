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

See `demo-presentation.md` for a complete example with all supported features.

### 4. Build Your Tutorial

```bash
# Build presentation and video
npm run tutorial:build my-tutorial.md

# Options:
npm run tutorial:build my-tutorial.md --skip-audio    # Reuse existing audio
npm run tutorial:build my-tutorial.md --skip-video    # HTML only (no MP4)
```

### 5. View Your Outputs

Every build produces TWO outputs:

1. **Interactive HTML**: `output/presentation/index.html`
   - Open in browser for manual navigation
   - Press 'S' for speaker notes
   - Navigate with arrow keys or space

2. **Video File**: `output/tutorial.mp4`
   - Recorded video with synchronized narration
   - Ready to upload to video platforms

## CLI Commands

### Build Tutorial
```bash
npm run tutorial:build <markdown-file>

# Options:
npm run tutorial:build demo.md --skip-audio    # Reuse existing audio files
npm run tutorial:build demo.md --skip-video    # Generate HTML only, skip video recording
```

**Outputs**:
- Interactive HTML: `output/presentation/index.html`
- Video file: `output/tutorial.mp4` (unless --skip-video)

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
- `@audio:` - Narration text (sent to ElevenLabs)
- `@duration:` - Expected slide duration
- `@pause-after:` - Pause after audio before advancing
- `@background:` - Background color or gradient
- `@transition:` - Slide transition effect
- `@playwright:` - Browser automation instructions

**Content Annotations**:
- `@fragment` - Step-by-step reveal
- `[2s]` - Inline pause in audio narration

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

See `demo-presentation.md` for complete examples.

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
- [Planning Documentation](./planning/revealjs-integration/) - Architecture decisions

## Next Steps

1. Set up your environment (`.envrc` file)
2. Write a markdown tutorial (see `demo-presentation.md`)
3. Run `npm run tutorial:build your-file.md`
4. View HTML at `output/presentation/index.html`
5. Watch video at `output/tutorial.mp4`
6. Share your tutorial!
