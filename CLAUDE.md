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

## 🚀 Current Status (Updated: 2025-11-12)

**✅ COMPLETE - Major Milestones:**
1. **Codebase Reorganization** - Cleaned root, created docs/ structure, single source of truth
2. **AI Image Generation** - `@image-prompt:` directive fully integrated (Gemini AI)
3. **Demo Presentation** - Comprehensive example showing ALL features
4. **NPM Scripts** - Clean interface (removed run-demo.mjs)
5. **Documentation** - All planning docs updated in `docs/architecture/revealjs/DECISIONS.md`
6. **Multi-line Audio & TTS Caching** - Readable format with intelligent caching (2025-11-11)
7. **Markdown Linting System** - Comprehensive validation before build (2025-11-11)

**What's Working:**
- ✅ Build: `npm run build` (zero errors)
- ✅ Tests: 283 passing (52 linting tests, 45 parser tests, + integration tests)
- ✅ Pipeline: **Lint** → Parse → Images → Audio (cached) → HTML → Timeline → Record → Assemble
- ✅ Outputs: Interactive HTML + MP4 video (both, always)
- ✅ AI Features: Image generation, TTS narration (with caching), browser automation
- ✅ Demos: `tutorials/simple-demo` (8 slides), `tutorials/full-demo` (21 slides)
- ✅ Audio: Multi-line format with SHA256 fingerprinting for incremental TTS
- ✅ Linting: Strict validation with helpful error messages (fail-fast before expensive operations)

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

4. ✅ **DONE: Implement Build Summary** - User-friendly reports!
   - Creates `{outputDir}/build-summary.txt` with readable overview
   - Stage breakdown with percentages, marks slowest stage
   - Audio cache statistics: "2 hits, 0 misses (100.0% hit rate) - Saved 2 TTS API calls"
   - Helpful tips based on build profile (e.g., "Use --no-video for faster iteration")
   - Complements debug.txt (verbose) with user-friendly summary
   - Example: "Video Recording: 67.32s (97.3%) ← SLOWEST"

5. ✅ **DONE: Markdown Format Linting** - Strict validation system!
   - Created directive registry (source of truth for all @commands)
   - Implemented linting engine with comprehensive validation
   - Added 52 test cases covering all validation rules
   - Integrated into build pipeline (fail-fast before expensive operations)
   - Validation includes:
     * Required frontmatter fields (title, theme)
     * All 10 directive types (syntax and values)
     * Pause marker format and placement
     * @fragment usage (must be on bullet lists, not numbered)
     * Empty slide detection
     * Unknown directive detection with typo suggestions (Levenshtein distance)
   - Error messages include: line numbers, current/expected values, examples, suggestions
   - Comprehensive documentation: `docs/LINTING_SPEC.md`
   - New presentations: `tutorials/simple-demo` (8 slides), `tutorials/full-demo` (21 slides)
   - Removed old presentations (demo, test) that didn't pass linting

6. ✅ **DONE: Dev Mode for Interactive Testing** - Debug without video recording! (2025-11-11)
   - **Fragment Rendering**: Fragments now properly injected into HTML with RevealJS directives
   - **Audio Management**: Auto-play audio on slide change, cancel on navigation, suppress AbortErrors
   - **Enhanced Logging**: Comprehensive timestamped logging system
     * Elapsed time from page load: `[0.52s]`, `[2.34s]`, etc.
     * User interactions: `👆 User clicked`, `⌨️ User pressed: ArrowRight`
     * Slide changes: `📍 Slide changed: #2 (slide-002)`
     * Fragment events: `✨ Fragment shown: index 0`, `💨 Fragment hidden: index 0`
     * Audio timing: `🔊 Audio playing (loaded in 0.22s)`
     * Audio enablement: `✅ Audio enabled - narration will play on slide changes`
   - **HTTP Server**: Built-in dev server for fast asset loading
     * Eliminates 10s file:// protocol delays
     * Serves from `http://localhost:<random-port>`
     * Routes: `/reveal/*`, `/audio/*`, `/images/*`
     * Proper MIME types for all assets
   - **Dev Server**: Two modes for testing presentations
     * Manual mode: Open browser, user controls with keyboard/mouse
     * Auto mode: Watch orchestrator automation (visible, no recording)
   - **NPM Commands:**
     ```bash
     npm run dev         # Manual mode (full-demo)
     npm run dev:auto    # Auto mode (watch automation)
     npm run dev:cli     # Old dev behavior (tsx)
     ```
   - **Benefits:** Debug timing issues, test fragments, verify audio sync without expensive recording
   - **Files:** `src/dev-server.ts`, `src/cli/commands/dev.ts`, `src/presentation/revealjs-generator.ts`

7. ✅ **DONE: Cache Invalidation for Voice Changes** (2025-11-12)
   - Extended audio cache hash to include all TTS parameters (voiceId, model, stability, similarityBoost)
   - Changing any voice parameter now invalidates cache and regenerates audio
   - Updated `CachedAudioLine` interface to store voice parameters
   - Full test suite passing (283 tests)

8. ✅ **DONE: Background Image URL Fix** (2025-11-12)
   - Fixed incorrect `url()` wrapper in `data-background-image` attribute
   - RevealJS expects plain path, not CSS `url()` function
   - Eliminated 404 errors for background images

9. ⚠️ **PARTIAL: Dev:Auto Mode Improvements** (2025-11-12)
   - ✅ Fixed browser conflict: auto mode now uses orchestrator's browser only
   - ✅ Manual mode launches separate browser with DevTools
   - ✅ HTTP server passes URL to orchestrator with `?autoplay=true` parameter
   - ✅ Playwright controller supports HTTP URLs in addition to file:// paths
   - ✅ Audio controller detects autoplay parameter and skips user interaction requirement
   - ⚠️ **ISSUE**: Playwright times out waiting for Reveal.js initialization (30s timeout)
   - HTTP server verified working (assets load via curl)
   - Needs investigation: browser console may show JS errors or loading issues

**Next Tasks:**
1. **TODO: Debug Playwright Timeout in Dev:Auto Mode** (PRIORITY!)
   - Playwright times out waiting for `Reveal.isReady()` to return true
   - HTTP server working, assets load correctly via curl
   - May need to:
     * Increase timeout beyond 10s (line 145 in playwright-controller.ts)
     * Add diagnostic logging to see what's failing in browser
     * Check browser console for JavaScript errors
     * Verify all script tags load successfully
   - Run `TUTORIAL=simple-demo npm run dev:auto` and inspect browser console

2. **TODO: Fix Fragment Auto-Advancement** - Fragments don't reveal during auto mode yet
   - Need to calculate fragment timing from ElevenLabs alignment data
   - Implement `controller.nextFragment()` calls at proper timestamps
   - Update timeline to include fragment timing metadata

3. **TODO: Export Timeline JSON** - Add timeline.json to output for debugging
   - Shows expected vs actual timing for each slide
   - Includes fragment timing once implemented
   - Helps diagnose sync issues

4. **TODO: Explore Auto-Generated Documentation**
   - Generate markdown format docs from directive registry
   - Create interactive reference for users
   - Consider CLI command: `npm run docs:generate`

5. Consider adding `@background-video:` support (similar to `@image-prompt:`)
6. Add more examples to `tutorials/examples/`
7. Explore additional RevealJS features (vertical slides, speaker notes view, auto-animate)

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