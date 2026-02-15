# Claude Code Project Context

## Project Overview

**Roughcut** — Generate narrated RevealJS presentations and MP4 videos from markdown using a custom format with 21 specialized directives, ElevenLabs TTS narration, and Playwright-based video recording.

- **Version**: 3.0.0
- **Status**: Production-ready, open-source CLI tool

---

## Creating a Presentation

**Interactive (recommended):** Use the `/presentation-generator` skill — it guides you through topic research, design choices (theme, style, audience), outline preview, and section-by-section generation with structured prompts.

**Manual:** Create a directory with `presentation.md` following the custom markdown format, then build:
```bash
roughcut build                                      # HTML only (fast, no API costs)
roughcut dev                                        # Preview in browser
roughcut build --full                               # Full build with AI (costs $$$)
```

**Scaffolding:**
```bash
roughcut init my-project                            # Creates workspace
cd my-project
roughcut create my-talk                             # Creates presentation subfolder
```

---

## System Architecture

**Pipeline:**
```
markdown → Lint → Parse → Images → Audio → HTML → Timeline → Record → Assemble
```

**Two outputs:**
1. `.build/presentation/index.html` - Interactive RevealJS presentation
2. `.build/tutorial.mp4` - Video with narration

**Key modules:**
- `src/config/` - ConfigManager (7-layer config: CLI > shell env > workspace .env > .roughcutrc.yml > .roughcut/config.yml > user config > defaults)
- `src/core/` - Parser, types, linter, directive registry (21 directives)
- `src/narration/` - ElevenLabs TTS with fingerprint caching
- `src/images/` - Gemini AI image generation
- `src/presentation/` - RevealJS HTML generation, Playwright control
- `src/video/` - Timeline building, recording, FFmpeg assembly
- `src/cli/` - CLI commands (build, dev, init, create, lint, doctor, voices)

**Skills:** `.claude/skills/presentation-generator/` - Interactive presentation generation skill

---

## Documentation

- `README.md` - Install and usage guide
- `docs/FEATURES.md` - All 21 directives reference
- `docs/LINTING_SPEC.md` - Markdown validation rules
- `docs/TUTORIAL-WRITING-GUIDE.md` - How to write presentations
- `docs/architecture/revealjs/CONFIGURATION.md` - RevealJS config options (60+)
- `docs/architecture/revealjs/DECISIONS.md` - Architecture decisions
- `CONTRIBUTING.md` - Development setup and PR process
- `CHANGELOG.md` - Version history

---

## Development Conventions

### Project Structure
- Examples: `examples/hello-world/`, `examples/narrated-deck/`, `examples/kitchen-sink/`
- Templates: `templates/init/` (shipped in npm package)
- Build outputs: `.build/` next to input file (gitignored)

### Code Organization
- Tests: `src/**/__tests__/` (co-located with modules)
- Strict TypeScript: `npm run build` must pass
- Test before commit: `npm test` (399 tests)
- Format before commit: `npm run format`

### Configuration
- API keys are lazy-validated (only required when audio/image pipeline runs)
- ConfigManager at `src/config/config-manager.ts` — never import `env.ts` (deleted)
- Workspace model: `roughcut init` creates `.roughcut/`, `.env`, `.gitignore`, `README.md`
- Workspace config: `.roughcut/config.yml` (preferences, safe to commit)
- Workspace secrets: `.env` (API keys, gitignored)
- Legacy project config: `.roughcutrc.yml` (still supported for backward compat)
- User config: `~/.config/roughcut/config.yml`

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Include clear description and testing notes

---

## CLI Commands

```bash
# User-facing commands
roughcut build                   # Build presentation (HTML by default)
roughcut dev                     # Preview in browser
roughcut init [dir]              # Create workspace (.roughcut/, .env, .gitignore)
roughcut create <name>           # Create presentation subfolder in workspace
roughcut lint                    # Validate markdown
roughcut doctor                  # Check prerequisites
roughcut voices                  # List ElevenLabs voices

# Development
npm run build                    # TypeScript compilation
npm test                         # Run all tests
npm run type-check               # Strict type checking
npm run format                   # Prettier formatting
npm run lint                     # ESLint
```

---

## File Locations

- Source: `src/`
- Examples: `examples/`
- Templates: `templates/`
- Docs: `docs/`
- Tests: `src/**/__tests__/`
- Build output: `.build/` (next to input file)
- Skills: `.claude/skills/`
- CI/CD: `.github/workflows/`
