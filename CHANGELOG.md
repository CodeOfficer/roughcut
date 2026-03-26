# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-03-26

### Added
- `roughcut create-example <name>` — scaffold a bundled example presentation (`hello-world`, `narrated-deck`, `kitchen-sink`) without needing a workspace
- `templates/examples/` — example presentations now ship with the npm package

### Changed
- README rewritten for clarity — "Try an example" quick start, clearer command table

## [3.0.0] - 2026-02-14

### Changed
- **Renamed** from `genai-tutorial-factory` to `roughcut`
- **Global CLI** — install with `npm install -g roughcut`, run from anywhere
- **Lazy API validation** — API keys only required when audio/image pipeline runs; HTML-only builds need zero keys
- **ConfigManager** replaces `env.ts` — 7-layer config resolution (CLI > shell env > workspace .env > .roughcutrc.yml > .roughcut/config.yml > user config > defaults)
- **Default output** — `-o` flag is now optional; defaults to `.build/` next to input file
- **reveal.js path** — resolved via package installation, works correctly with global installs
- **ffmpeg path** — defaults to `ffmpeg` (PATH lookup) instead of hardcoded `/usr/local/bin/ffmpeg`
- **Removed** `dotenv` dependency — config now handled by ConfigManager
- **Directories** — `tutorials/` renamed to `examples/`

### Added
- `roughcut init [dir]` — scaffold a new presentation project
- `roughcut lint [path]` — validate markdown format standalone
- `roughcut doctor` — check system prerequisites (Node, ffmpeg, Playwright, API keys)
- `roughcut voices` — list available ElevenLabs voices
- `bin` field in package.json — enables `npx roughcut` and global install
- `templates/init/` — scaffolding templates shipped with the package
- `.roughcutrc.yml` — project-level config file support
- `~/.config/roughcut/config.yml` — user-level config support
- Comprehensive test suite for ConfigManager, init, lint, and doctor commands
- LICENSE (MIT), CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- CI/CD workflows for testing and npm publishing
- GitHub issue and PR templates

### Removed
- `src/config/env.ts` — replaced by ConfigManager (no more `process.exit(1)` on missing keys)
- `scripts/` directory — replaced by CLI commands
- `.envrc.example` — replaced by `.roughcutrc.yml` template
- Personal tutorial content (archived to `personal` branch)
- Root artifacts (DEMO-PRESENTATION.md, STAKEHOLDER-DEMO.md, etc.)

## [2.0.0] - 2025-12-01

### Added
- Complete RevealJS presentation pipeline
- 21 markdown directives for slides, audio, video, images
- ElevenLabs TTS with fingerprint-based caching
- Playwright browser automation for video recording
- FFmpeg video assembly
- Markdown linter with comprehensive validation
- Build summary generation
