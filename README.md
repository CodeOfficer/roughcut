# GenAI Tutorial Factory

An automated TypeScript-based system for generating tutorial videos from markdown scripts. Combines AI-powered narration (ElevenLabs), browser automation (Playwright), and video assembly (FFmpeg) into a streamlined workflow.

## Features

- **Markdown-Based Scripts**: Write tutorial content in simple markdown format
- **AI Narration**: Generate natural-sounding voiceovers with ElevenLabs
- **Automated Screenshots**: Capture screens using Playwright browser automation
- **Video Assembly**: Combine audio and images into polished tutorial videos
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

### 3. Create Your First Tutorial

```bash
# Create a new tutorial project
npm run tutorial:create my-first-tutorial
```

This creates a new directory structure:
```
tutorials/my-first-tutorial/
├── config.json    # Tutorial configuration
├── script.md      # Your tutorial script (edit this!)
├── audio/         # Generated narration (auto-created)
├── screenshots/   # Captured images (auto-created)
└── output/        # Final video (auto-created)
```

### 4. Write Your Tutorial Script

Edit `tutorials/my-first-tutorial/script.md`:

```markdown
# My First Tutorial

## Introduction
> Duration: 5s
> Screenshot: manual

[NARRATION]
Welcome to my first tutorial! Today we'll learn something amazing.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
File: screenshots/001-intro.png
Description: Title screen with tutorial topic
[/SCREENSHOT_INSTRUCTIONS]

---

## Step 1: Setup
> Duration: 10s
> Screenshot: auto

[NARRATION]
Let's start by opening the terminal and running our setup command.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: VS Code with integrated terminal
Action: Type "npm install"
Wait: 2s
[/SCREENSHOT_INSTRUCTIONS]
```

### 5. Generate Assets

```bash
# Generate narration from script
npm run tutorial:narrate my-first-tutorial

# Capture screenshots (for auto mode)
npm run tutorial:screenshots my-first-tutorial

# Or for manual mode, add your images to screenshots/ directory first
```

### 6. Build the Video

```bash
# Assemble the final video
npm run tutorial:build my-first-tutorial
```

Your finished video will be at:
```
tutorials/my-first-tutorial/output/tutorial.mp4
```

## CLI Commands

### Full Workflow (All Steps)
```bash
npm run tutorial:full {tutorial-name}
```
Runs narrate → screenshots → build in sequence.

### Individual Steps

```bash
# Create new tutorial project
npm run tutorial:create {tutorial-name}

# Generate narration audio
npm run tutorial:narrate {tutorial-name}

# Capture screenshots
npm run tutorial:screenshots {tutorial-name}

# Assemble final video
npm run tutorial:build {tutorial-name}

# Clean generated assets (keeps script and config)
npm run tutorial:clean {tutorial-name}
```

## Tutorial Script Format

### Segment Structure

Each tutorial segment has:

1. **Header**: Title with ##
2. **Metadata**: Duration and screenshot mode
3. **Narration Block**: Text to be spoken
4. **Screenshot Instructions**: How to capture/identify the image

### Metadata Options

```markdown
> Duration: 10s          # Expected segment length
> Screenshot: manual     # Options: manual | auto | none
```

### Screenshot Modes

**Manual**: You provide pre-captured images
```markdown
[SCREENSHOT_INSTRUCTIONS]
File: screenshots/001-intro.png
Description: What the image shows
[/SCREENSHOT_INSTRUCTIONS]
```

**Auto**: Playwright captures automatically
```markdown
[SCREENSHOT_INSTRUCTIONS]
Show: VS Code window
Action: Type "console.log('Hello')"
Wait: 2s
[/SCREENSHOT_INSTRUCTIONS]
```

**None**: Audio only, no image
```markdown
> Screenshot: none
```

## Configuration

### Tutorial Config (`config.json`)

```json
{
  "title": "Your Tutorial Title",
  "description": "What your tutorial teaches",
  "voice": "adam",
  "videoSettings": {
    "resolution": "1920x1080",
    "fps": 30,
    "transition": "fade",
    "transitionDuration": 0.5
  }
}
```

### Environment Variables

See `.envrc.example` for all options. Key variables:

```bash
# Required
ELEVENLABS_API_KEY=your_key

# Voice settings
ELEVENLABS_VOICE_ID=adam
ELEVENLABS_STABILITY=0.75
ELEVENLABS_SIMILARITY_BOOST=0.75

# Paths
OUTPUT_DIR=./tutorials
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

## Project Structure

```
genai-tutorial-factory/
├── src/                    # Core TypeScript modules
│   ├── cli/               # CLI commands
│   ├── config/            # Environment configuration
│   ├── core/              # Shared types and utilities
│   ├── narration/         # ElevenLabs integration
│   ├── screenshots/       # Playwright automation
│   ├── video/             # FFmpeg assembly
│   └── utils/             # Helper functions
├── tutorials/             # Tutorial projects
│   └── {name}/           # Individual tutorial
└── tmp/                  # Temporary files
```

See `PROJECT_PLAN.md` for detailed architecture documentation.

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

The system follows a modular architecture:

1. **Parser** - Converts markdown scripts to structured data
2. **Narration** - Generates audio via ElevenLabs API
3. **Screenshots** - Captures images via Playwright
4. **Video** - Assembles final video via FFmpeg
5. **CLI** - Orchestrates the workflow

Each module is independent and can be used programmatically.

## Contributing

Contributions welcome! The codebase uses:
- Strict TypeScript settings
- Zod for runtime validation
- ESM modules
- Type-safe environment configuration

## License

MIT

## Resources

- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Project Plan](./PROJECT_PLAN.md) - Detailed architecture

## Next Steps

1. ✅ Set up your environment (`.envrc` file)
2. ✅ Create your first tutorial
3. ✅ Write a script with 2-3 segments
4. ✅ Generate narration and screenshots
5. ✅ Build your first video
6. 🎉 Share your tutorial!

For detailed implementation guides, see `PROJECT_PLAN.md`.
