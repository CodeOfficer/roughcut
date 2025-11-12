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
6. **Multi-line Audio & TTS Caching** - Readable format with intelligent caching (2025-11-11)

**What's Working:**
- ✅ Build: `npm run build` (zero errors)
- ✅ Tests: 231 passing (45 parser tests including multi-line audio)
- ✅ Pipeline: Parse → Images → Audio (cached) → HTML → Timeline → Record → Assemble
- ✅ Outputs: Interactive HTML + MP4 video (both, always)
- ✅ AI Features: Image generation, TTS narration (with caching), browser automation
- ✅ Demo: `npm run demo` (fast), `npm run demo:full` (with AI), `npm run demo:html` (HTML only)
- ✅ Audio: Multi-line format with SHA256 fingerprinting for incremental TTS

**Next Session - Start Here:**
1. ✅ **DONE: ElevenLabs Timestamps Endpoint** - Now getting free character-level timing!
   - Switched to `/text-to-speech/:voice_id/with-timestamps`
   - Receives alignment data: characters, start_times, end_times
   - Duration calculated from API (no MP3 analysis needed)
   - Same cost as regular endpoint (character-based pricing)
   - Test tutorial: `tutorials/test/` (2 slides, ~70s build vs 9min for demo)
   - Scripts: `npm run test:build`, `test:build:full`, `test:build:html`

2. ✅ **DONE: Fix Audio Manifest Persistence** - TTS cache now working!
   - Fixed path construction bug (was writing to audio/audio/manifest.json)
   - Manifest now persists correctly with full alignment data
   - Cache hit/miss tracking shows "2 cached, 0 generated" on rebuilds
   - Saves API costs on incremental builds!

3. ✅ **DONE: Implement Verbose Logging System** - Debug logs now available!
   - Creates `{outputDir}/debug.txt` with timestamped logs
   - Tracks all operations with start/end times and metadata
   - Includes: parsing, image gen, TTS, HTML, timeline, recording, assembly
   - Operations summary shows time breakdown (e.g., "audio: 1.61s (99%)")
   - Tail-able for real-time monitoring: `tail -f output/debug.txt`
   - Perfect for identifying performance bottlenecks!

4. **TODO: Implement Build Summary**
   - Create `{outputDir}/build-summary.txt`
   - Show total build time & breakdown by stage
   - Per-slide timing: which slides took longest (audio/images)
   - Cache hit/miss ratio
   - Historical comparison (if available)

5. **TODO: Add Markdown Format Linting**
   - Validate front matter (required fields: title, theme)
   - Check directive syntax (`@audio:`, `@image-prompt:`, `@voice:`)
   - Warn about common mistakes
   - Helpful error messages with line numbers

6. Consider adding `@background-video:` support (similar to `@image-prompt:`)
7. Add more examples to `tutorials/examples/`
8. Explore additional RevealJS features (vertical slides, fragments, speaker view)

---

## 🧪 Testing Strategy

**NPM Scripts Available:**

**Generic Scripts** (use with any tutorial):
```bash
# Fast build (skip images & audio) - saves API costs!
TUTORIAL=demo npm run build:fast
TUTORIAL=mcp-server npm run build:fast

# Full build (uses TTS + Gemini credits!)
TUTORIAL=my-presentation npm run build:full

# HTML only (no video recording)
TUTORIAL=example npm run build:html
```

**Demo Shortcuts** (hardcoded to demo tutorial):
```bash
npm run demo       # Fast: skip images & audio
npm run demo:full  # Full: with all AI features
npm run demo:html  # HTML only, no video
```

**Low-level CLI** (for advanced use):
```bash
npm run tutorial:build -- -i <file> -o <output> --skip-images --skip-audio
```

**Pattern:**
- All tutorials: `tutorials/<name>/presentation.md`
- Outputs: `tutorials/<name>/output/`
- Helper: `scripts/build-tutorial.sh <name> <mode>`

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