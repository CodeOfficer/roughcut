# Claude Code Project Context

## Project Overview
**GenAI Tutorial Factory** - Generate interactive RevealJS presentations and videos from markdown.

**Current Branch**: `feat/revealjs-presentation`
**Status**: ✅ Core system complete - Single unified RevealJS architecture
**Version**: 2.0.0

---

## 📍 Where Everything Lives

| What | Where | Purpose |
|------|-------|---------|
| **Source code** | `src/` | All TypeScript modules |
| **Tests** | `src/**/__tests__/` | Unit & integration tests |
| **Tutorials** | `tutorials/` | Tutorial directories with presentations |
| **Documentation** | `docs/` | All reference docs |
| **Architecture** | `docs/architecture/` | Design decisions & plans |
| **User guides** | `docs/MIGRATION.md` | How-to guides |
| **Historical** | `docs/archive/` | Outdated/reference material |

---

## 🎯 Key Documentation

**Start here when context is lost:**
1. `docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md` - **Current plan: RevealJS alignment (4 phases)**
2. `docs/architecture/revealjs/DECISIONS.md` - All strategic decisions
3. `README.md` - User-facing setup & usage

**Quick reference:**
- RevealJS docs: `revealjs-docs/` - Comprehensive offline reference (34 files)
- Markdown format: `docs/architecture/revealjs/format-option-3-minimalist.md`
- RevealJS API: `docs/architecture/revealjs/revealjs-research.md`
- Migration guide: `docs/MIGRATION.md` (v1 → v2)
- Historical: `docs/architecture/revealjs/IMPLEMENTATION_PLAN.md` - Original 20-step plan (completed)

---

## ⚙️ System Architecture

**Single unified pipeline:**
```
markdown → Parse → Images → Audio → HTML → Timeline → Record → Assemble
                     ↓        ↓       ↓                            ↓
                 (images)  (audio) (presentation)               (video)
```

**Always produces TWO outputs:**
1. `tutorials/<name>/.build/presentation/index.html` - Interactive RevealJS presentation
2. `tutorials/<name>/.build/tutorial.mp4` - Video with narration

**Key modules:**
- `src/core/` - Parser, types, logger
- `src/narration/` - ElevenLabs TTS
- `src/images/` - Gemini AI image generation (`@image-prompt:`)
- `src/presentation/` - RevealJS generation, Playwright control
- `src/video/` - Timeline, recording, FFmpeg assembly

---

## 🔄 Workflow Rules

**ALWAYS follow these patterns:**

### 1. Tutorial Management
- ✅ Create tutorials as directories: `tutorials/<name>/presentation.md`
- ✅ User assets go alongside: `tutorials/<name>/*.png`, `tutorials/<name>/*.mp4`, etc.
- ✅ Build outputs go in: `tutorials/<name>/.build/` (hidden subdirectory)
- ✅ Test tutorials use prefix: `test-<feature>/`
- ✅ Assets are automatically copied from tutorial dir to `.build/presentation/assets/`
- ❌ Never put tutorial files in root
- ❌ Never use flat `.md` files (deprecated as of v2.1)

### 2. Documentation Updates
- ✅ Record decisions in: `docs/architecture/revealjs/DECISIONS.md`
- ✅ Update this file (CLAUDE.md) after major changes
- ✅ Keep README.md user-focused (setup/usage only)
- ❌ Never duplicate information across docs

### 3. Testing
- ✅ Use `--skip-audio` flag to avoid burning TTS credits
- ✅ Only make ONE real API call at the end for final verification
- ✅ Reuse existing audio from demo when testing

### 4. Code Organization
- ✅ Tests go in: `src/**/__tests__/` (co-located with modules)
- ✅ Use strict TypeScript (`npm run build` must pass)
- ✅ Run tests before commits: `npm test`

---

## 🚀 Current Status (Updated: 2025-11-16)

**✅ COMPLETE - Major Milestones:**
1. **Codebase Reorganization** - Cleaned root, created docs/ structure, single source of truth
2. **AI Image Generation** - `@image-prompt:` directive fully integrated (Gemini AI)
3. **Demo Presentation** - Comprehensive example showing ALL features
4. **NPM Scripts** - Clean interface (removed run-demo.mjs)
5. **Documentation** - All planning docs updated in `docs/architecture/revealjs/DECISIONS.md`
6. **Multi-line Audio & TTS Caching** - Readable format with intelligent caching (2025-11-11)
7. **Markdown Linting System** - Comprehensive validation before build (2025-11-11)
8. **Directory-Based Tutorials with Asset Support** - User-provided assets alongside presentation.md (2025-11-16)

**What's Working:**
- ✅ Build: `npm run build` (zero errors)
- ✅ Tests: 325 passing (52 linting tests, 41 config tests, 45 parser tests, + integration tests)
- ✅ Pipeline: **Lint** → Parse → Images → Audio (cached) → HTML → Timeline → Record → Assemble
- ✅ Outputs: Interactive HTML + MP4 video (both, always)
- ✅ AI Features: Image generation, TTS narration (with caching), browser automation
- ✅ Tutorials: `minimal/` (5 slides), `comprehensive/` (29 slides), 4 test tutorials
- ✅ Audio: Multi-line format with SHA256 fingerprinting for incremental TTS
- ✅ Linting: Strict validation with helpful error messages (fail-fast before expensive operations)
- ✅ Assets: User-provided images/videos automatically copied to build output

**Current Development Status:**

### Phase 3: Advanced Features 🚧 **IN PROGRESS** (50% complete - 3/6 tasks)

**✅ Completed:**
1. Vertical Slides (`@vertical-slide:` directive) - 2D navigation
2. Video Backgrounds (`@background-video:` directive) - Video playback on slides
3. Custom CSS Injection - Per-presentation styling

**🚧 Remaining:**
1. Math Plugin (`@math:` directive) - LaTeX equation rendering
2. Speaker View Mode - Two-window presentation with notes
3. Auto-Animate Showcase - Demo tutorial for auto-animate feature

**Test Status:** All 325 tests passing ✅

**Full Plan:** See `docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md` for complete roadmap

---

## 📋 Quick Reference

### NPM Scripts

**Development Mode** (fast iteration, no AI costs):
```bash
# Manual control - navigate with keyboard
TUTORIAL=minimal npm run dev

# Auto-advance - watch automation
TUTORIAL=comprehensive npm run dev:auto
```

**Production Builds** (final outputs):
```bash
# HTML only (no video, no AI)
TUTORIAL=minimal npm run tutorial:html

# Fast build (skip AI, include video)
TUTORIAL=comprehensive npm run tutorial:fast

# Full build (TTS + images + video) - costs API credits!
TUTORIAL=comprehensive npm run tutorial:full
```

**When to use what:**
- `dev` / `dev:auto` → Writing and testing (most common)
- `tutorial:html` → Preview without video
- `tutorial:fast` → Test video recording
- `tutorial:full` → Final production output

---

## 🧪 Testing Strategy

**Test Suite:** 325 tests passing (52 linting, 41 config, 45 parser, + integration tests)

**Development Tools:**
```bash
# Code Quality
npm run build          # TypeScript compilation (must pass!)
npm test               # Run all tests
npm run test:watch     # Auto-rerun tests on file changes (TDD mode)
npm run lint           # ESLint checks
npm run format         # Auto-format with Prettier

# Voice Management
npm run voices         # List available ElevenLabs voices
```

---

## 📦 Dependencies

- **ElevenLabs**: TTS narration (required)
- **Gemini**: AI image generation (optional, if using `@image-prompt:`)
- **Playwright**: Browser automation (required)
- **FFmpeg**: Video assembly (required)
- **RevealJS**: Presentation framework (bundled)

---

## 🗂️ File Structure

```
genai-tutorial-factory/
├── src/                         # Source code
├── tutorials/                   # All tutorials
│   ├── .template/              # Template for new presentations
│   ├── minimal/                # Bare essentials tutorial (5 slides, HTML-only)
│   │   ├── presentation.md
│   │   └── .build/             # Build outputs (auto-generated, gitignored)
│   ├── comprehensive/          # Complete feature showcase (29 slides)
│   │   ├── presentation.md
│   │   └── .build/
│   ├── test-config/            # Config validation test
│   ├── test-vertical/          # Vertical slides test
│   ├── test-phase1/            # Phase 1 features test
│   └── test-theme/             # Theme responsiveness test
├── docs/                        # All documentation
│   ├── architecture/           # Design docs
│   ├── archive/                # Historical docs
│   └── MIGRATION.md            # v1 → v2 guide
├── README.md                   # User setup & usage
└── CLAUDE.md                   # This file (Claude context)
```

---

## 🔧 Build & Test

```bash
npm run build                          # TypeScript compilation (must pass!)
npm test                               # Run all tests (325 tests)
TUTORIAL=<name> npm run tutorial:fast  # Fast build (most common)
TUTORIAL=<name> npm run tutorial:full  # Full build with AI
TUTORIAL=<name> npm run tutorial:html  # HTML only (no video)
```

---

## 📝 Decision Log

All strategic decisions are recorded in:
`docs/architecture/revealjs/DECISIONS.md`

**Latest decisions:**
- Decision 7 (2025-11-11): AI image generation with `@image-prompt:` directive
- Decision 6 (2025-11-11): Deprecated original system, RevealJS only
- Markdown format: Option 3 (Minimalist with `@directive:` syntax)
- Audio sync: Audio drives slides (with pause-after-audio feature)
- Outputs: Both HTML + MP4 (always)

---

## 💡 Notes for Future Sessions

- AI image generation fully integrated (`@image-prompt:` works end-to-end)
- `comprehensive.md` is the canonical example (29 slides, shows ALL features)
- `minimal.md` is for quick start (5 slides, bare essentials, HTML-only)
- Test tutorials prefixed with `test-` (test-config, test-vertical, test-phase1, test-theme)
- Test suite is comprehensive (325 tests across 13 test files)
- Build is strict (all TypeScript errors must be resolved)
- Documentation is now single-source-of-truth (no duplication)
- NPM scripts are the interface (no standalone scripts)
- Tutorial structure is flat .md files with hidden output directories (tutorials/.<name>/)
- Build scripts auto-detect flat .md vs directory-based tutorials
- make sure you ask and commit your changes at milestone task completion in our plan
- please commit all changes when you tell me a task is done
- please make sure you are always cleaning up processes you spin up