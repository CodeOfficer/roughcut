# roughcut

Generate narrated RevealJS presentations and videos from markdown.

Write slides in a simple markdown format with 21 specialized directives. roughcut turns them into interactive HTML presentations and MP4 videos with AI voiceover — no video editor needed.

## Quick Start

```bash
npm install -g roughcut

roughcut init my-talk
cd my-talk
roughcut build -i presentation.md          # HTML only (free, fast)
roughcut dev -i presentation.md            # Preview in browser
roughcut build -i presentation.md --full   # Full build with audio + video
```

## Prerequisites

- **Node.js >= 20** — [nodejs.org](https://nodejs.org)
- **ffmpeg** — for video assembly (`brew install ffmpeg` / `apt install ffmpeg`)
- **ElevenLabs API key** — for audio narration (optional, only needed with `--audio` or `--full`)
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

roughcut uses layered config (highest priority first):

1. **CLI flags** — `--voice brian`, `--log-level debug`
2. **Environment variables** — `ELEVENLABS_API_KEY`, `LOG_LEVEL`
3. **Project config** — `.roughcutrc.yml` in your project directory
4. **User config** — `~/.config/roughcut/config.yml`
5. **Built-in defaults**

Example `.roughcutrc.yml`:

```yaml
elevenlabs_api_key: "your-key-here"
elevenlabs_voice_id: "brian"
log_level: info
```

## Commands

| Command | Description |
|---------|-------------|
| `roughcut build -i <file>` | Build presentation (HTML by default) |
| `roughcut dev -i <file>` | Preview in browser with hot reload |
| `roughcut init [dir]` | Scaffold a new presentation project |
| `roughcut lint <file>` | Validate markdown format |
| `roughcut doctor` | Check system prerequisites |
| `roughcut voices` | List available ElevenLabs voices |

### Build flags

| Flag | Description |
|------|-------------|
| `-i, --input <path>` | Input markdown file (required) |
| `-o, --output <path>` | Output directory (default: `.build/` next to input) |
| `--no-video` | Skip video generation |
| `--skip-audio` | Skip audio generation |
| `--skip-images` | Skip image generation |
| `--voice <id>` | ElevenLabs voice ID |
| `--bundle` | Bundle reveal.js assets for offline use |

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
- [`examples/narrated-deck/`](examples/narrated-deck/) — roughcut explains itself, with narration and fragments
- [`examples/kitchen-sink/`](examples/kitchen-sink/) — every directive and feature demonstrated

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and PR guidelines.

## License

[MIT](LICENSE)
