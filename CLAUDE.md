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

9. ✅ **DONE: Dev:Auto Mode - Full Working Implementation!** (2025-11-12)
   - ✅ Fixed browser conflict: auto mode now uses orchestrator's browser only
   - ✅ Manual mode launches separate browser with DevTools
   - ✅ HTTP server passes URL to orchestrator with `?autoplay=true` parameter
   - ✅ Playwright controller supports HTTP URLs in addition to file:// paths
   - ✅ Audio controller detects autoplay parameter and enables audio automatically
   - ✅ HTTP server strips query parameters for correct routing
   - ✅ Playwright launches with `--autoplay-policy=no-user-gesture-required` flag
   - ✅ Browser console logging (log, warning, error) for diagnostics
   - ✅ Audio playback works in auto mode (confirmed user testing)
   - ✅ Slides advance automatically with audio narration on each slide
   - **Result**: Dev:auto mode is fully functional for debugging and testing!

10. ✅ **DONE: Fragment Auto-Advancement** (2025-11-12)
   - Added `FragmentTiming` interface to track fragment reveal timestamps
   - Timeline builder calculates fragment timing (explicit `@fragment +2s` or even spacing)
   - Orchestrator schedules fragment reveals during audio playback
   - Fixed dev command audio manifest loading for new cache format
   - Timing accuracy: within 30ms of scheduled time
   - Test results: All 5 fragments on slide 6 revealed successfully
   - Files: `src/core/types.ts`, `src/video/timeline.ts`, `src/presentation/audio-sync-orchestrator.ts`, `src/cli/commands/dev.ts`
   - **Result**: Fragments now reveal automatically during presentations!

11. ✅ **DONE: Audio/Video Sync Fix - Timestamp-Based Approach** (2025-11-12)
   - **Problem**: Audio played BEFORE slide headings were visible in final MP4, timing drift accumulated over presentation
   - **Root Causes**:
     1. Orchestrator had variable real-world timing (browser overhead, fragments, rendering)
     2. Combined audio used fixed theoretical timing (350ms nav delays)
     3. Small differences compounded across slides → audio ahead of video by slide 8
     4. Playwright doesn't capture browser audio (known limitation)
   - **Solution Implemented**:
     * **Orchestrator tracks ACTUAL timestamps**: Records exact time when audio starts for each slide
     * **Export recording timeline**: Saves timestamps to `recording-timeline.json`
     * **Timestamp-based audio assembly**: Builds combined audio using exact recorded timing
     * **No more timing drift**: Audio matches video perfectly throughout presentation
   - **Technical Implementation**:
     * Orchestrator: Records `audioStartTime` for each slide in `recordedTimestamps` array
     * Build command: Exports timestamps to `output/recording-timeline.json`
     * Assembler: Reads timestamps and calculates exact silence padding per slide
     * FFmpeg: Concatenates audio with variable gaps matching recorded timing
   - **Example Timing (simple-demo)**:
     ```
     Slide 1: 1.070s silence (initial delay)
     Slide 2: 0.708s gap
     Slide 3: 1.121s gap
     Slide 4: 1.106s gap
     Slide 5: 1.119s gap
     Slide 6: 2.111s gap  ← includes fragment reveals!
     Slide 7: 1.134s gap
     Slide 8: 1.113s gap
     ```
   - **Why Variable Gaps Work**:
     * Captures ALL real-world timing: browser rendering, fragments, network delays
     * Slide 6 has 2.1s gap (vs ~1.1s others) because it has 5 fragments
     * Each slide's audio starts at EXACT recorded time → perfect sync
   - **Verification**:
     * recording-timeline.json: 8 slides, timestamps 1.07s to 53.18s
     * Video: h264, 56.95s | Audio: aac (exact match)
     * Manual review: Perfect sync throughout entire presentation ✅
   - **Files Modified**:
     * `src/presentation/audio-sync-orchestrator.ts`: Added timestamp tracking
     * `src/cli/commands/build.ts`: Export recording-timeline.json
     * `src/video/assembler.ts`: Timestamp-based audio concatenation
   - **Result**: TRUE slides-drive-audio with zero timing drift!

**Next Session - Start Here (Updated 2025-11-15):**

🎯 **ACTIVE: RevealJS Best Practices Migration** - Phase 1 of 4

**Current Plan**: `docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md`

### Phase 1: Foundational Fixes (Week 1) - **IN PROGRESS**

**High Priority Tasks**:
1. **Fix Fragment Indices** - Change from 1-based to 0-based (RevealJS convention)
   - File: `src/presentation/revealjs-generator.ts`
   - Impact: Alignment with RevealJS standards
   - Risk: Low (fragments still reveal in same order)

2. **Expose Core Config Options** - Add frontmatter config support
   - Files: `src/core/types.ts`, `src/parser/frontmatter-parser.ts`
   - Options: controls, progress, slideNumber, center, overview
   - Impact: User customization capability

3. **Theme-Responsive Font Sizing** - Replace hardcoded font sizes
   - File: `src/presentation/revealjs-generator.ts`
   - Use CSS variables from themes
   - Impact: Better theme integration

4. **DOM Structure Validation** - Ensure exact RevealJS requirements
   - Review generated HTML against `revealjs-docs/docs/06-markup.md`
   - Fix any remaining structure issues

5. **Keyboard Shortcuts Documentation**
   - Create `docs/KEYBOARD_SHORTCUTS.md`
   - Document all available shortcuts
   - Improve accessibility

**Success Criteria**:
- ✅ All 283 tests passing
- ✅ Existing presentations unchanged (regression testing)
- ✅ Fragment indices 0-based
- ✅ Core config options working

**Future Phases** (deferred):
- Phase 2: Configuration Enhancement (Week 2)
- Phase 3: Advanced Features - vertical slides, video backgrounds, speaker view (Week 3)
- Phase 4: Polish & Export (Week 4)

---

**Backlog Items** (lower priority):
1. **TODO: Fix Google/Gemini Image Generation** - Make @image-prompt work with Gemini
2. **TODO: Export Timeline JSON** - Add timeline.json to output for debugging
3. **TODO: Regenerate simple-demo audio** - Fix robotic sound quality

---

## 🧪 Testing Strategy

**NPM Scripts Available:**

**Dev Server** (interactive testing):
```bash
# Manual mode (defaults to full-demo, override with TUTORIAL env var)
npm run dev
npm run dev:auto  # Auto-advance with visible browser

# With specific tutorial
TUTORIAL=simple-demo npm run dev
TUTORIAL=my-presentation npm run dev:auto
```

**Build Scripts** (use with any tutorial via TUTORIAL env var):
```bash
# Fast build (skip images & audio) - saves API costs!
TUTORIAL=simple-demo npm run tutorial:fast
TUTORIAL=my-presentation npm run tutorial:fast

# Full build (uses TTS + Gemini credits!)
TUTORIAL=full-demo npm run tutorial:full

# HTML only (no video recording)
TUTORIAL=simple-demo npm run tutorial:html
```

**Development Tools**:
```bash
# Code Quality
npm run build          # TypeScript compilation (must pass!)
npm test               # Run all tests (283 passing)
npm run test:watch     # Auto-rerun tests on file changes (TDD mode)
npm run test:coverage  # Generate coverage report
npm run lint           # ESLint checks
npm run format         # Auto-format with Prettier
npm run type-check     # Type check without compilation

# Voice Management
npm run voices         # List available ElevenLabs voices
```

**Pattern:**
- All tutorials: `tutorials/<name>/presentation.md`
- Outputs: `tutorials/<name>/output/`
- Helper: `scripts/build-tutorial.sh <mode>` (requires TUTORIAL env var)

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
npm run build                        # TypeScript compilation (must pass!)
npm test                             # Run all tests (283 tests)
TUTORIAL=<name> npm run tutorial:fast  # Fast build (most common)
TUTORIAL=<name> npm run tutorial:full  # Full build with AI
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
- please make sure you are always cleaning up processses you spin up