# GenAI Tutorial Factory - Project Plan

## Overview
A TypeScript-based automation system for generating tutorial videos from markdown scripts. The system handles narration generation (ElevenLabs), static image generation (Gemini), screenshot capture (Playwright), and video assembly (FFmpeg).

## Directory Structure

```
genai-tutorial-factory/
├── .env.example              # Environment variable template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── README.md                # Setup and usage documentation
├── PROJECT_PLAN.md          # This file
│
├── src/                     # Shared tooling and core modules
│   ├── config/
│   │   ├── env.ts          # Type-safe environment variable access
│   │   └── validation.ts   # Environment validation logic
│   │
│   ├── cli/
│   │   ├── index.ts        # CLI entry point
│   │   ├── create.ts       # Tutorial creation workflow
│   │   └── commands/       # Individual CLI commands
│   │
│   ├── core/
│   │   ├── parser.ts       # Markdown script parser
│   │   ├── types.ts        # Shared TypeScript types
│   │   └── logger.ts       # Logging utility
│   │
│   ├── narration/
│   │   ├── elevenlabs.ts   # ElevenLabs API integration
│   │   ├── speech.ts       # Speech generation orchestration
│   │   └── types.ts        # Narration-specific types
│   │
│   ├── images/
│   │   ├── gemini.ts       # Gemini API integration for image generation
│   │   ├── generator.ts    # Image generation orchestration
│   │   └── types.ts        # Image-specific types
│   │
│   ├── screenshots/
│   │   ├── capture.ts      # Playwright screenshot capture
│   │   ├── manager.ts      # Screenshot organization
│   │   └── types.ts        # Screenshot-specific types
│   │
│   ├── video/
│   │   ├── assembler.ts    # FFmpeg video assembly
│   │   ├── timeline.ts     # Audio/visual timeline coordination
│   │   └── types.ts        # Video-specific types
│   │
│   └── utils/
│       ├── fs.ts           # File system utilities
│       ├── paths.ts        # Path resolution helpers
│       └── timing.ts       # Timing and duration utilities
│
├── tutorials/               # Tutorial projects
│   ├── {topic-name}/       # Individual tutorial folder
│   │   ├── config.json     # Tutorial-specific configuration
│   │   ├── script.md       # Tutorial script with narration
│   │   ├── screenshots/    # Captured screenshots
│   │   │   ├── 001.png
│   │   │   ├── 002.png
│   │   │   └── ...
│   │   ├── audio/          # Generated narration files
│   │   │   ├── segment-001.mp3
│   │   │   ├── segment-002.mp3
│   │   │   └── ...
│   │   └── output/         # Final video output
│   │       └── tutorial.mp4
│   │
│   └── .template/          # Template for new tutorials
│       ├── config.json
│       └── script.md
│
└── tmp/                    # Temporary processing files
    └── .gitkeep
```

## Core TypeScript Modules

### 1. Configuration Module (`src/config/`)

**Purpose:** Type-safe environment variable management with validation.

**Key Files:**
- `env.ts` - Exports validated, typed configuration object
- `validation.ts` - Zod schemas for environment validation

**Features:**
- Runtime validation on startup
- Clear error messages for missing/invalid vars
- Support for .env and .env.local
- Type inference for TypeScript

### 2. CLI Module (`src/cli/`)

**Purpose:** Command-line interface for tutorial workflow management.

**Commands:**
- `tutorial:create {topic}` - Initialize new tutorial project
- `tutorial:narrate {topic}` - Generate audio from script
- `tutorial:screenshots {topic}` - Capture screenshots
- `tutorial:build {topic}` - Assemble final video
- `tutorial:clean {topic}` - Remove generated assets

**Features:**
- Interactive prompts for configuration
- Progress indicators for long operations
- Error handling with helpful messages

### 3. Parser Module (`src/core/parser.ts`)

**Purpose:** Parse markdown tutorial scripts into structured data.

**Input Format:**
```markdown
# Tutorial Title

## Segment 1: Introduction
> Duration: 5s
> Screenshot: manual/auto/none

[NARRATION]
Welcome to this tutorial on setting up an MCP server.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: VS Code with empty project
Action: None (static)
[/SCREENSHOT_INSTRUCTIONS]

## Segment 2: Installation
> Duration: 10s
> Screenshot: auto

[NARRATION]
First, let's install the required dependencies.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: Terminal with npm install command
Action: Type "npm install @modelcontextprotocol/sdk"
[/SCREENSHOT_INSTRUCTIONS]
```

**Output Structure:**
```typescript
interface TutorialScript {
  title: string;
  segments: TutorialSegment[];
}

interface TutorialSegment {
  id: string;
  title: string;
  duration: number;
  narration: string;
  screenshot: {
    mode: 'manual' | 'auto' | 'none';
    instructions?: string;
    filepath?: string;
  };
}
```

### 4. Narration Module (`src/narration/`)

**Purpose:** Generate audio narration using ElevenLabs API.

**Key Components:**
- API client with retry logic
- Text-to-speech conversion
- Audio file management
- Duration calculation

**Features:**
- Segment-by-segment generation
- Voice consistency across segments
- Error handling and retries
- Audio file caching

### 5. Images Module (`src/images/`)

**Purpose:** Generate static images using Google Gemini API.

**Key Components:**
- Gemini API client with image generation
- Prompt engineering for consistent visuals
- Image download and storage
- Resolution and format handling

**Features:**
- Generate title slides, conclusion screens, and concept illustrations
- Text-to-image conversion from prompts
- Consistent styling across images
- Automatic retry on generation failures
- Image validation and quality checks

**Use Cases:**
- Tutorial intro/outro slides
- Concept diagrams
- Icon-based illustrations
- Text overlays with backgrounds
- Any static visual that doesn't require screen capture

### 6. Screenshots Module (`src/screenshots/`)

**Purpose:** Capture and manage tutorial screenshots and images.

**Modes:**
- **Static:** Generate image using Gemini API (title slides, diagrams, illustrations)
- **Auto:** Playwright automation captures screens (terminal, code editor, browser)
- **None:** No visual for segment (audio only)

**Features:**
- Playwright browser automation for dynamic content
- Gemini integration for static visuals
- Screenshot timing coordination
- Image optimization
- Filename convention enforcement
- Unified management of both generated and captured images

### 7. Video Module (`src/video/`)

**Purpose:** Assemble final tutorial video from assets.

**Process:**
1. Parse timeline from tutorial segments
2. Match audio files with screenshots
3. Generate FFmpeg command
4. Execute video assembly
5. Validate output

**Features:**
- Audio/visual synchronization
- Transition effects between segments
- Resolution and quality settings
- Progress tracking during assembly

## Tutorial Asset Lifecycle

### Phase 1: Initialization
```bash
npm run tutorial:create mcp-server-setup
```

**Actions:**
1. Create `/tutorials/mcp-server-setup/` directory
2. Copy template files (config.json, script.md)
3. Initialize git tracking for tutorial assets
4. Open script.md in editor

### Phase 2: Script Development
- User edits `script.md` with tutorial content
- Defines narration text per segment
- Specifies screenshot instructions
- Sets timing and duration

### Phase 3: Narration Generation
```bash
npm run tutorial:narrate mcp-server-setup
```

**Actions:**
1. Parse script.md
2. Extract narration segments
3. Call ElevenLabs API for each segment
4. Save audio files to `/audio/` directory
5. Calculate actual duration for each segment
6. Update config.json with audio metadata

### Phase 4: Image & Screenshot Generation

```bash
npm run tutorial:screenshots mcp-server-setup
```

**Actions:**
1. Parse visual instructions from script
2. For **static** mode segments:
   - Extract Gemini prompts
   - Call Gemini API to generate images
   - Download and save images
3. For **auto** mode segments:
   - Launch Playwright browser
   - Execute automation steps
   - Capture and save screenshots
4. For **none** mode segments:
   - Skip (audio-only)
5. Update config.json with image/screenshot metadata

**Result:** All visual assets ready in `/screenshots/` directory

### Phase 5: Video Assembly
```bash
npm run tutorial:build mcp-server-setup
```

**Actions:**
1. Validate all assets are present
2. Generate video timeline
3. Create FFmpeg command with filters
4. Execute video assembly
5. Save final video to `/output/`
6. Display success message with file location

### Phase 6: Review & Iteration
- User reviews generated video
- Edits script if changes needed
- Regenerates affected assets
- Rebuilds video

## Example Workflow: MCP Server Setup Tutorial

### Step 1: Create Tutorial
```bash
npm run tutorial:create mcp-server-setup
```

Creates:
```
tutorials/mcp-server-setup/
├── config.json
└── script.md
```

### Step 2: Write Script

**config.json:**
```json
{
  "title": "Setting Up an MCP Server",
  "description": "Learn how to create and configure a Model Context Protocol server",
  "voice": "adam",
  "videoSettings": {
    "resolution": "1920x1080",
    "fps": 30,
    "transition": "fade"
  }
}
```

**script.md:**
```markdown
# Setting Up an MCP Server

## Introduction
> Duration: 5s
> Screenshot: manual

[NARRATION]
In this tutorial, you'll learn how to set up a Model Context Protocol server from scratch.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
File: screenshots/001-intro.png (pre-provided)
[/SCREENSHOT_INSTRUCTIONS]

## Install Dependencies
> Duration: 12s
> Screenshot: auto

[NARRATION]
First, let's install the MCP SDK. Open your terminal and run the installation command.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: VS Code with integrated terminal
Action: Type "npm install @modelcontextprotocol/sdk"
Wait: 2s
[/SCREENSHOT_INSTRUCTIONS]
```

### Step 3: Generate Narration
```bash
npm run tutorial:narrate mcp-server-setup
```

Output:
```
✓ Parsed 2 segments from script
✓ Generated audio for segment 1 (4.8s actual)
✓ Generated audio for segment 2 (11.3s actual)
✓ Saved audio files to tutorials/mcp-server-setup/audio/
✓ Updated config.json with audio metadata
```

### Step 4: Capture Screenshots
```bash
npm run tutorial:screenshots mcp-server-setup
```

Output:
```
✓ Found manual screenshot: 001-intro.png
✓ Launching browser for auto capture...
✓ Captured screenshot: 002-install.png
✓ Saved screenshots to tutorials/mcp-server-setup/screenshots/
✓ Updated config.json with screenshot metadata
```

### Step 5: Build Video
```bash
npm run tutorial:build mcp-server-setup
```

Output:
```
✓ Validated 2 audio files
✓ Validated 2 screenshot files
✓ Generated video timeline
✓ Assembling video with FFmpeg...
  [====================] 100%
✓ Video saved: tutorials/mcp-server-setup/output/tutorial.mp4
  Duration: 16.1s
  Size: 4.2 MB
```

## Environment Variable Setup and Validation

### Type-Safe Configuration

**src/config/env.ts:**
```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

// Define schema with validation rules
const envSchema = z.object({
  // API Keys
  ELEVENLABS_API_KEY: z.string().min(1, 'ElevenLabs API key is required'),
  ANTHROPIC_API_KEY: z.string().optional(),

  // ElevenLabs Configuration
  ELEVENLABS_VOICE_ID: z.string().default('adam'),
  ELEVENLABS_MODEL: z.string().default('eleven_monolingual_v1'),
  ELEVENLABS_STABILITY: z.coerce.number().min(0).max(1).default(0.75),
  ELEVENLABS_SIMILARITY_BOOST: z.coerce.number().min(0).max(1).default(0.75),

  // Output Configuration
  OUTPUT_DIR: z.string().default('./tutorials'),
  TEMP_DIR: z.string().default('./tmp'),

  // Tool Paths
  FFMPEG_PATH: z.string().default('/usr/local/bin/ffmpeg'),
  PLAYWRIGHT_BROWSERS_PATH: z.string().default('./browsers'),

  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Validate and parse
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment configuration error:\n');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Check your .env file and ensure all required variables are set.');
      console.error('   See .env.example for reference.\n');
    }
    process.exit(1);
  }
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
```

### Validation on Startup

Every CLI command and module imports `env` from `src/config/env.ts`, ensuring:
- Variables are validated before any operations
- Type safety throughout the codebase
- Clear error messages on misconfiguration
- Default values where appropriate

## Technology Stack

### Core Dependencies
- **TypeScript** - Type safety and developer experience
- **tsx** - TypeScript execution for CLI
- **zod** - Runtime type validation
- **dotenv** - Environment variable management

### API Integrations
- **ElevenLabs API** - Text-to-speech narration
- **Google Gemini API** - AI image generation for static visuals
- **@11ty/eleventy-fetch** - HTTP client with caching

### Automation & Media
- **playwright** - Browser automation for screenshots
- **fluent-ffmpeg** - FFmpeg wrapper for video assembly
- **sharp** - Image processing and optimization

### CLI & Developer Experience
- **commander** - CLI framework
- **ora** - Progress spinners
- **chalk** - Terminal styling
- **inquirer** - Interactive prompts

## Key Design Principles

1. **Automation First:** Minimize manual steps in tutorial creation
2. **Type Safety:** Strict TypeScript across all modules
3. **Configuration as Code:** Everything configurable via env or JSON
4. **Idempotency:** Safe to re-run any step without side effects
5. **Modularity:** Each system component is independent and testable
6. **Developer Experience:** Clear error messages and progress indicators
7. **Asset Organization:** Structured storage for all generated content

## Future Enhancements

- Web UI for tutorial management
- Template library for common tutorial types
- Multi-language narration support
- Subtitle generation from narration
- Cloud storage integration for assets
- Batch processing for multiple tutorials
- Analytics on tutorial engagement
