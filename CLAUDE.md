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
| **Tutorials** | `tutorials/` | Example presentations & outputs |
| **Documentation** | `docs/` | All reference docs |
| **Architecture** | `docs/architecture/` | Design decisions & plans |
| **User guides** | `docs/MIGRATION.md` | How-to guides |
| **Historical** | `docs/archive/` | Outdated/reference material |

---

## 🎯 Key Documentation

**Start here when context is lost:**
1. `docs/architecture/revealjs/DECISIONS.md` - All strategic decisions
2. `docs/architecture/revealjs/IMPLEMENTATION_PLAN.md` - 20-step plan
3. `README.md` - User-facing setup & usage

**Quick reference:**
- Markdown format: `docs/architecture/revealjs/format-option-3-minimalist.md`
- RevealJS API: `docs/architecture/revealjs/revealjs-research.md`
- Migration guide: `docs/MIGRATION.md` (v1 → v2)

---

## ⚙️ System Architecture

**Single unified pipeline:**
```
markdown → Parse → Images → Audio → HTML → Timeline → Record → Assemble
                     ↓        ↓       ↓                            ↓
                 (images)  (audio) (presentation)               (video)
```

**Always produces TWO outputs:**
1. `tutorials/<name>/output/presentation/index.html` - Interactive RevealJS
2. `tutorials/<name>/output/tutorial.mp4` - Video with narration

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
- ✅ Create tutorials in: `tutorials/<name>/`
- ✅ Outputs go in: `tutorials/<name>/output/`
- ❌ Never put tutorial files in root

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

## 🚀 Current Status (Updated: 2025-11-11)

**✅ COMPLETE - Major Milestones:**
1. **Codebase Reorganization** - Cleaned root, created docs/ structure, single source of truth
2. **AI Image Generation** - `@image-prompt:` directive fully integrated (Gemini AI)
3. **Demo Presentation** - Comprehensive example showing ALL features
4. **NPM Scripts** - Clean interface (removed run-demo.mjs)
5. **Documentation** - All planning docs updated in `docs/architecture/revealjs/DECISIONS.md`

**What's Working:**
- ✅ Build: `npm run build` (zero errors)
- ✅ Tests: 226 passing, 8 skipped (13 test files)
- ✅ Pipeline: Parse → Images → Audio → HTML → Timeline → Record → Assemble
- ✅ Outputs: Interactive HTML + MP4 video (both, always)
- ✅ AI Features: Image generation, TTS narration, browser automation
- ✅ Demo: `npm run demo` (fast), `npm run demo:full` (with AI), `npm run demo:html` (HTML only)

**Next Session - Start Here:**
1. **Refactor package.json scripts** - Make presentation name an argument
   - Current: `npm run demo`, `npm run demo:full`, `npm run demo:html` (hardcoded to demo)
   - Goal: `npm run build:fast <name>`, `npm run build:full <name>`, `npm run build:html <name>`
   - Example: `npm run build:fast demo` or `npm run build:fast mcp-server`
   - Keep `demo` scripts as shortcuts that pass "demo" as argument
   - Pattern: All presentations in `tutorials/<name>/presentation.md`
2. Consider adding `@background-video:` support (similar to `@image-prompt:`)
3. Add more examples to `tutorials/examples/`
4. Explore additional RevealJS features (vertical slides, fragments, speaker view)

---

## 🧪 Testing Strategy

**To avoid expensive API calls:**
```bash
# Fast demo (no images, no audio, uses existing files)
npm run demo

# HTML only (no video recording)
npm run demo:html

# Full build (uses TTS + Gemini credits!)
npm run demo:full

# Custom builds
npm run tutorial:build -i <file> -o <output> --skip-images --skip-audio
```

**NPM Scripts Available:**
- `npm run demo` - Fast testing (skip images & audio) - **TODO: Make generic**
- `npm run demo:full` - Full build with all AI features - **TODO: Make generic**
- `npm run demo:html` - HTML only, no video - **TODO: Make generic**
- `npm run tutorial:build` - Build any presentation (low-level, takes full CLI args)

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
├── src/                    # Source code
├── tutorials/              # All tutorials & outputs
│   ├── .template/         # Template for new presentations
│   ├── demo/              # Demo presentation (canonical example)
│   └── examples/          # Additional examples
├── docs/                   # All documentation
│   ├── architecture/      # Design docs
│   ├── archive/           # Historical docs
│   └── MIGRATION.md       # v1 → v2 guide
├── README.md              # User setup & usage
└── CLAUDE.md              # This file (Claude context)
```

---

## 🔧 Build & Test

```bash
npm run build       # TypeScript compilation (must pass!)
npm test            # Run all tests (225 tests)
npm run tutorial:build <file>  # Build presentation + video
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
- Demo presentation is the canonical example (shows ALL features)
- Test suite is comprehensive (13 test files, 226 tests)
- Build is strict (all TypeScript errors must be resolved)
- Documentation is now single-source-of-truth (no duplication)
- NPM scripts are the interface (no standalone scripts like run-demo.mjs)
- make sure you ask and commit your changes at milestone task completion  in our plan
- please commit all changes when you tell me a task is done