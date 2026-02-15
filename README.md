# Roughcut

Generate narrated RevealJS presentations and videos from markdown.

Write slides in a simple markdown format with 21 specialized directives. Roughcut turns them into interactive HTML presentations and MP4 videos with AI voiceover — no video editor needed.

## Quick Start

```bash
npm install -g roughcut

roughcut init my-project          # Create workspace
cd my-project
# Edit .env to add your API keys (optional)
roughcut create my-talk           # Create a presentation
cd my-talk
roughcut build                    # HTML only (free, fast)
roughcut dev                      # Preview in browser
roughcut build --full             # Full build with audio + video
```

## Prerequisites

- **Node.js >= 20** — [nodejs.org](https://nodejs.org)
- **ffmpeg** — for video assembly (`brew install ffmpeg` / `apt install ffmpeg`)
- **ElevenLabs API key** — for audio narration (optional, only needed with `--full`)
- **Gemini API key** — for AI image generation (optional, only needed with `--full`)

Check your setup:

```bash
roughcut doctor
```

## Installation

```bash
# Global install (recommended)
npm install -g roughcut

# Or run without installing
npx roughcut build -i deck.md

# Or with Homebrew (macOS)
brew tap codeofficer/roughcut
brew install roughcut
```

## Configuration

Roughcut uses layered config (highest priority first):

1. **CLI flags** — `--full`, `--log-level debug`
2. **Shell environment variables** — `ELEVENLABS_API_KEY`, `LOG_LEVEL`
3. **Workspace `.env`** — API keys (gitignored, found by walking up to `.roughcut/`)
4. **Legacy `.roughcutrc.yml`** — backward compat project config
5. **Workspace `.roughcut/config.yml`** — non-secret preferences
6. **User config** — `~/.config/roughcut/config.yml`
7. **Built-in defaults**

Example `.env` (API keys — gitignored):

```bash
ELEVENLABS_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
```

Example `.roughcut/config.yml` (preferences — safe to commit):

```yaml
elevenlabs_voice_id: brian
log_level: info
```

## Commands

| Command | Description |
|---------|-------------|
| `roughcut build` | Build presentation (HTML by default) |
| `roughcut dev` | Preview in browser with hot reload |
| `roughcut init [dir]` | Create a new workspace |
| `roughcut create <name>` | Create a presentation in the workspace |
| `roughcut lint` | Validate markdown format |
| `roughcut doctor` | Check system prerequisites |
| `roughcut voices` | List available ElevenLabs voices |

### Build flags

| Flag | Description |
|------|-------------|
| `-i, --input <path>` | Input markdown file (auto-detects `presentation.md` in current dir) |
| `-o, --output <path>` | Output directory (default: `.build/` next to input) |
| `--full` | Full build: audio narration + video recording |
| `--skip-audio` | Skip audio generation |
| `--skip-images` | Skip image generation |

## Markdown Format

```markdown
---
title: "My Talk"
theme: dracula
voice: brian
---

# First Slide

@transition: fade
@duration: 8s

@audio: This is the narration for this slide.
@audio: Each line becomes a sentence.

- Point one @fragment
- Point two @fragment
- Point three @fragment

---

# Second Slide

@background: linear-gradient(135deg, #667eea, #764ba2)

Content with **formatting** and `code`.
```

See [docs/FEATURES.md](docs/FEATURES.md) for all 21 directives and [docs/TUTORIAL-WRITING-GUIDE.md](docs/TUTORIAL-WRITING-GUIDE.md) for authoring guidance.

## Examples

- [`examples/hello-world/`](examples/hello-world/) — simplest possible presentation
- [`examples/narrated-deck/`](examples/narrated-deck/) — Roughcut explains itself, with narration and fragments
- [`examples/kitchen-sink/`](examples/kitchen-sink/) — every directive and feature demonstrated

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and PR guidelines.

## License

[MIT](LICENSE)
