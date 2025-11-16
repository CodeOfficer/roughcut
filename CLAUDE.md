# Claude Code Project Context

## Project Overview
**GenAI Tutorial Factory** - Generate interactive RevealJS presentations and videos from markdown.

- **Current Branch**: `feat/revealjs-presentation`
- **Version**: 2.0.0
- **Status**: Phase 3 of RevealJS migration in progress

---

## 📁 Documentation Structure

### Active Documents (READ THESE FIRST)
1. **`docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md`**
   → **ACTIVE PLAN** with current status, next tasks, and progress tracking

2. **`docs/architecture/revealjs/DECISIONS.md`**
   → All strategic decisions and rationale (immutable record)

3. **`README.md`**
   → User-facing setup and usage guide

### Reference Documents
- `docs/WORKFLOW.md` - Development workflow and npm scripts
- `docs/FEATURES.md` - Feature list and capabilities
- `docs/KEYBOARD_SHORTCUTS.md` - Presentation keyboard shortcuts
- `docs/LINTING_SPEC.md` - Markdown validation rules
- `docs/TUTORIAL-WRITING-GUIDE.md` - How to write presentations
- `docs/architecture/revealjs/CONFIGURATION.md` - RevealJS config options (60+)
- `revealjs-docs/` - Offline RevealJS documentation (34 files)

### Historical (Archive)
- `docs/archive/` - Completed plans and outdated documents

---

## ⚙️ System Architecture

**Single unified pipeline:**
```
markdown → Lint → Parse → Images → Audio → HTML → Timeline → Record → Assemble
             ↓      ↓        ↓        ↓       ↓                            ↓
          (validate) (AST) (images) (audio) (presentation)               (video)
```

**Always produces TWO outputs:**
1. `tutorials/<name>/.build/presentation/index.html` - Interactive RevealJS presentation
2. `tutorials/<name>/.build/tutorial.mp4` - Video with narration

**Key modules:**
- `src/core/` - Parser, types, logger, linter, directive registry
- `src/narration/` - ElevenLabs TTS with caching
- `src/images/` - Gemini AI image generation
- `src/presentation/` - RevealJS HTML generation, Playwright control
- `src/video/` - Timeline building, recording, FFmpeg assembly
- `src/validation/` - Config validation, linting engine

---

## 🔄 Development Conventions

### 1. Planning & Documentation
- **NEVER** put detailed plans or todos in CLAUDE.md
- **ALWAYS** update `MIGRATION-TO-BEST-PRACTICES.md` with status/progress
- **ALWAYS** record decisions in `DECISIONS.md` with date and rationale
- **NO DUPLICATION** - Each piece of info lives in ONE place only
- Move completed plans to `docs/archive/` when done

### 2. Tutorial Management
- Tutorials are directories: `tutorials/<name>/presentation.md`
- User assets alongside: `tutorials/<name>/*.{png,mp4,css}`
- Build outputs: `tutorials/<name>/.build/` (gitignored)
- Test tutorials: `tutorials/test-<feature>/`

### 3. Code Organization
- Tests: `src/**/__tests__/` (co-located with modules)
- Strict TypeScript: `npm run build` must pass
- Test before commit: `npm test` (325 tests)
- Format before commit: `npm run format`

### 4. Asset Management
- Generate placeholders: `TUTORIAL=<name> npm run generate-assets`
- Linter validates file existence (warnings, not errors)
- Assets auto-copy to `.build/presentation/assets/`

### 5. Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Include clear description and testing notes
- Always add Claude Code footer

---

## 🚀 Quick Reference

### NPM Scripts
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
npm test                                 # Run all tests (325)
npm run generate-assets                  # Create placeholder images/videos
npm run voices                           # List ElevenLabs voices
```

### File Locations
- Source: `src/`
- Tutorials: `tutorials/`
- Docs: `docs/`
- Tests: `src/**/__tests__/`
- Scripts: `scripts/`
- Build output: `tutorials/<name>/.build/`

### Current Work
Check `docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md` for:
- Phase status (currently Phase 3: 50% complete)
- Next tasks
- Completion criteria
- Technical details

---

## 💡 Key Principles

1. **Single Source of Truth** - No duplication across docs
2. **Reference, Don't Repeat** - Link to details, don't copy them
3. **Plans Live in Plan Files** - Not in CLAUDE.md
4. **Archive When Done** - Move completed plans to `docs/archive/`
5. **Update Status in Real-Time** - Keep MIGRATION doc current

---

**Need detailed context?** Read the active plan:
→ `docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md`
