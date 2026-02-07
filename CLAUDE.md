# Claude Code Project Context

## Project Overview

**GenAI Tutorial Factory** - Generate interactive RevealJS presentations and videos from markdown using a custom format with 21 specialized directives, ElevenLabs TTS narration, and Playwright-based video recording.

- **Version**: 2.0.0
- **Status**: Production-ready (Phases 1-3 complete). Phase 4 (Polish & Export) available for future work.

---

## Creating a Presentation

**Interactive (recommended):** Use the `/presentation-generator` skill — it guides you through topic research, design choices (theme, style, audience), outline preview, and section-by-section generation with structured prompts.

**Manual:** Create `tutorials/<name>/presentation.md` following the custom markdown format, then build:
```bash
TUTORIAL=<name> npm run tutorial:html    # HTML only (fast, no API costs)
TUTORIAL=<name> npm run dev              # Preview in browser
```

---

## System Architecture

**Pipeline:**
```
markdown → Lint → Parse → Images → Audio → HTML → Timeline → Record → Assemble
```

**Two outputs:**
1. `tutorials/<name>/.build/presentation/index.html` - Interactive RevealJS presentation
2. `tutorials/<name>/.build/tutorial.mp4` - Video with narration

**Key modules:**
- `src/core/` - Parser, types, linter, directive registry (21 directives)
- `src/narration/` - ElevenLabs TTS with caching
- `src/images/` - Gemini AI image generation
- `src/presentation/` - RevealJS HTML generation, Playwright control
- `src/video/` - Timeline building, recording, FFmpeg assembly
- `src/validation/` - Config validation

**Skills:** `.claude/skills/presentation-generator/` - Interactive presentation generation skill

---

## Documentation

- `README.md` - Setup and usage guide
- `docs/FEATURES.md` - All 21 directives reference
- `docs/LINTING_SPEC.md` - Markdown validation rules
- `docs/TUTORIAL-WRITING-GUIDE.md` - How to write presentations
- `docs/WORKFLOW.md` - Development workflow and npm scripts
- `docs/architecture/revealjs/CONFIGURATION.md` - RevealJS config options (60+)
- `docs/architecture/revealjs/DECISIONS.md` - Architecture decisions and rationale

---

## Development Conventions

### Tutorial Management
- Tutorials are directories: `tutorials/<name>/presentation.md`
- User assets alongside: `tutorials/<name>/*.{png,mp4,css}`
- Build outputs: `tutorials/<name>/.build/` (gitignored)
- Test tutorials: `tutorials/test-<feature>/`

### Code Organization
- Tests: `src/**/__tests__/` (co-located with modules)
- Strict TypeScript: `npm run build` must pass
- Test before commit: `npm test` (325 tests)
- Format before commit: `npm run format`

### Asset Management
- Generate placeholders: `TUTORIAL=<name> npm run generate-assets`
- Linter validates file existence (warnings, not errors)
- Assets auto-copy to `.build/presentation/assets/`

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Include clear description and testing notes

---

## NPM Scripts

```bash
# Development (fast iteration, no AI costs)
TUTORIAL=<name> npm run dev              # Manual navigation
TUTORIAL=<name> npm run dev:auto         # Auto-advance

# Build modes
TUTORIAL=<name> npm run tutorial:html    # HTML only (fast)
TUTORIAL=<name> npm run tutorial:fast    # HTML + video (skip AI)
TUTORIAL=<name> npm run tutorial:full    # Full build with AI (costs $$$)

# Utilities
npm run build                            # TypeScript compilation
npm test                                 # Run all tests
npm run generate-assets                  # Create placeholder images/videos
npm run voices                           # List ElevenLabs voices
```

---

## File Locations

- Source: `src/`
- Tutorials: `tutorials/`
- Docs: `docs/`
- Tests: `src/**/__tests__/`
- Scripts: `scripts/`
- Build output: `tutorials/<name>/.build/`
- Skills: `.claude/skills/`
