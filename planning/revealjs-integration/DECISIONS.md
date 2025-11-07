# Project Decisions & Requirements - Reveal.js Integration

**Date Started**: 2025-11-06
**Branch**: `feat/revealjs-presentation`

---

## Strategic Vision

Transform tutorial factory from video-only output to reveal.js-based presentation system:
- Markdown scripts define slides, audio, and playwright automation
- ElevenLabs provides audio narration synchronized to slides
- Playwright orchestrates presentation navigation and browser automation
- **Outputs**: Interactive HTML presentation + recorded MP4 video (both)

---

## Key Architectural Decisions

### 1. Audio Synchronization Strategy
**Decision**: Audio Drives Slides (Option A)

**Rationale**: Simplest and most reliable approach

**Flow**:
```
1. Navigate to slide
2. Play audio for that slide
3. Wait for audio to complete
4. Pause for X seconds (configurable per slide - allows viewers to read content)
5. Advance to next slide
6. Repeat
```

**Why NOT slides-drive-audio**: Adds latency, manual navigation breaks sync
**Why NOT independent**: Risk of drift over time

---

### 2. Markdown Format
**Decision**: Format Option 3 - "Minimalist Inline"

**Rationale**: Fastest to write, most readable, optimized for creator speed

**Key Syntax**:
```markdown
# Slide Title
@duration: 8s
@pause-after: 2s
@background: #1e1e1e
@transition: zoom

Content here...

- Item 1 @fragment
- Item 2 @fragment +2s

@audio: Narration text here [2s] with inline pauses [3s] between points.

@playwright:
- Action: Click button
- Wait 2s
- Type: "text" + Enter
```

**Features**:
- `@directive:` syntax for metadata
- Inline timing: `[2s]` for audio pauses
- Relative fragment timing: `@fragment +2s`
- Compact playwright: List notation with `-`
- No closing tags (not `[AUDIO]...[/AUDIO]`)
- Units included: `8s` not `8`

**See**: `/planning/revealjs-integration/format-option-3-minimalist.md`

---

### 3. Pause After Audio Feature
**Decision**: Required feature - configurable pause per slide

**Syntax**: `@pause-after: 2s`

**Purpose**: Give viewers time to fully read/absorb slide content after audio narration ends

**Implementation**: After audio finishes, wait X seconds before advancing to next slide

**Default**: TBD (maybe 1-2 seconds if not specified)

---

### 4. Terminology Standards
**Decision**: Always use reveal.js primitives and domain language

**Correct Terms**:
- **Slides** (not segments, sections, or pages)
- **Horizontal Slides** (main sequence, `---` delimiter)
- **Vertical Slides** (nested, optional content, `^^` delimiter)
- **Fragments** (step-by-step reveals within a slide)
- **Transitions** (slide change animations: fade, slide, zoom, convex, concave)
- **Themes** (presentation styling: black, white, dracula, etc.)
- **Speaker Notes** (presenter-only content)
- **Auto-Animate** (smooth element transitions between slides)
- **Backgrounds** (slide-specific background colors/images)

**Do NOT invent new terminology** - defer to reveal.js documentation

---

### 5. Playwright Integration
**Decision**: Playwright renders reveal.js in browser and controls navigation

**Capabilities**:
- Render reveal.js HTML presentation in headless browser
- Control slide navigation programmatically (`Reveal.next()`, `Reveal.slide(h,v)`)
- Listen to reveal.js events (`slidechanged`, `fragmentshown`, etc.)
- Execute automation instructions from `@playwright:` blocks
- Record browser tab as video
- Interact with elements INSIDE slides (clicks, typing, etc.)

**Control Flow**: Playwright calls `window.Reveal` API methods via `page.evaluate()`

---

### 6. Testing Strategy
**Decision**: Manual testing first, then automated tests before proceeding to next step

**Approach**:
1. Implement a step
2. Test manually to verify it works
3. Write automated tests (unit + integration)
4. Commit when tests pass
5. Move to next step

**Coverage Goals**:
- Unit tests: 80%+ for parsers and builders
- Integration tests: Playwright controller, audio sync
- E2E test: Full build from markdown → video

**Testing Philosophy**: Project MUST be dependable and work VERY smoothly

---

### 7. Output Formats
**Decision**: Both HTML and MP4 (not one or the other)

**Outputs**:
1. **Interactive HTML Presentation**
   - Standalone reveal.js HTML file
   - Bundled with reveal.js assets (works offline)
   - Can be viewed in browser
   - Supports manual navigation, speaker notes (press S)
   - Path: `/tutorials/{name}/presentation/index.html`

2. **Recorded MP4 Video**
   - Playwright records browser tab during orchestrated playback
   - High-quality audio from ElevenLabs (not browser-recorded audio)
   - Final assembly: video frames + audio replacement via FFmpeg
   - Path: `/tutorials/{name}/output/tutorial.mp4`

---

### 8. Reveal.js Feature Support
**Decision**: Support full reveal.js functionality from day 1

**Must Support**:
- Horizontal slides (`---`)
- Vertical slides (`^^`)
- Fragments with effects (fade, grow, highlight, etc.)
- Code highlighting with line-by-line reveal `[1|2|3]`
- Speaker notes
- Transitions (per-slide and global)
- Backgrounds (colors, images)
- Themes
- Auto-animate (element transitions)

**Architecture Requirement**: Design must NOT require major overhaul to add reveal.js features later

**Implementation**: Pass through reveal.js syntax to native parser where possible

---

## Project Structure Decisions

### Planning Folder
**Location**: `/planning/revealjs-integration/`

**Contents**:
- `DECISIONS.md` (this file)
- `IMPLEMENTATION_PLAN.md` (20-step detailed plan)
- `revealjs-research.md` (reveal.js API research)
- `format-option-1-annotated-revealjs.md`
- `format-option-2-yaml-blocks.md`
- `format-option-3-minimalist.md` (CHOSEN)

**Purpose**: Cache important information for reference when context clears

---

### New TypeScript Modules (To Be Created)

#### Core
- `/src/core/revealjs-types.ts` - TypeScript interfaces
- `/src/core/revealjs-parser.ts` - Markdown parser (Option 3 syntax)

#### Presentation
- `/src/presentation/revealjs-generator.ts` - HTML generation
- `/src/presentation/revealjs-assets.ts` - Asset bundling
- `/src/presentation/playwright-controller.ts` - Reveal.js control
- `/src/presentation/playwright-executor.ts` - Instruction execution
- `/src/presentation/audio-sync-orchestrator.ts` - Audio-slide sync
- `/src/presentation/audio-player.ts` - Browser audio playback

#### Narration
- `/src/narration/revealjs-speech.ts` - Audio generation for slides

#### Video
- `/src/video/revealjs-timeline.ts` - Timeline builder
- `/src/video/playwright-recorder.ts` - Video recording
- `/src/video/revealjs-video-assembler.ts` - Final assembly

#### CLI
- `/src/cli/commands/revealjs-build.ts` - Build command

---

## Dependencies to Install

```bash
npm install reveal.js
npm install -D @types/reveal.js
npm install -D @playwright/test
```

**Note**: Playwright may already be installed; upgrade if needed

---

## ElevenLabs Integration

**Current Status**: Already implemented and working
- Audio generation per segment: `/src/narration/elevenlabs.ts`
- Duration extraction via FFmpeg: `/src/utils/timing.ts`

**Adaptation Needed**: Generate audio per slide (not per segment)
- New module: `/src/narration/revealjs-speech.ts`
- Reuse existing `ElevenLabsClient` class
- Clean audio text: Remove `[Xs]` pause markers before sending to API

---

## Reveal.js Configuration

**Default Config** (to be used):
```javascript
Reveal.initialize({
  autoSlide: 0,                 // Disabled - Playwright controls timing
  hash: true,                   // URL bookmarking
  history: true,                // Browser history
  fragments: true,              // Enable step-by-step
  fragmentInURL: true,          // Track fragments in URL
  autoPlayMedia: false,         // Manual media control (Playwright controls)
  transition: 'slide',          // Default transition
  transitionSpeed: 'default',
  plugins: [
    RevealMarkdown,             // Markdown parsing
    RevealHighlight,            // Code syntax highlighting
    RevealNotes                 // Speaker notes
  ]
});
```

---

## Parsing Strategy for Option 3 Format

### Step 1: Extract Global Directives
Parse lines starting with `@` before first `---` delimiter

### Step 2: Split on Slide Delimiter
Split on `\n---\n` for horizontal slides

### Step 3: For Each Slide
1. Extract slide-level directives (`@duration`, `@pause-after`, etc.)
2. Find and extract `@audio:` directive (rest of line is audio text)
3. Find and extract `@playwright:` block (multi-line list)
4. Parse inline `[Xs]` pause markers in audio text
5. Parse `@fragment` markers in content (with optional `+Xs` timing)
6. Clean remaining content (remove all `@` directives)
7. Pass cleaned markdown to reveal.js

### Step 4: Generate HTML
Create `<section data-markdown>` with metadata as data attributes

---

## Audio Timeline Structure

**Concept**: Map slides to audio segments with cumulative timing

```typescript
interface SlideTimelineEntry {
  slideIndex: number;           // 0, 1, 2, ...
  slideId: string;              // slide-001, slide-002
  audioPath: string | null;     // /audio/slide-001.mp3
  audioDuration: number;        // Actual duration from ElevenLabs
  pauseAfter: number;           // Pause after audio (seconds)
  totalSlideDuration: number;   // audioDuration + pauseAfter
  startTime: number;            // Cumulative start
  endTime: number;              // Cumulative end
  hasPlaywright: boolean;
  playwrightInstructions: PlaywrightInstruction[];
}
```

**Usage**: Orchestrator iterates through timeline entries sequentially

---

## Video Recording Strategy

### Recording
Use Playwright's built-in video recording:
```javascript
const context = await browser.newContext({
  recordVideo: {
    dir: outputDir,
    size: { width: 1920, height: 1080 }
  }
});
```

### Audio Replacement
Browser audio is low quality → Replace with ElevenLabs audio via FFmpeg:
```bash
ffmpeg -i recorded.webm -i audio1.mp3 -i audio2.mp3 \
  -filter_complex "concat audio tracks" \
  -map 0:v -map [audio] \
  -c:v libx264 -c:a aac \
  output.mp4
```

---

## CLI Commands (To Be Created)

### Create Tutorial
```bash
npm run tutorial:create-revealjs <name>
```
Creates tutorial folder with Option 3 format template

### Build Presentation
```bash
npm run tutorial:revealjs <name>
```
Runs full pipeline: parse → audio → HTML → orchestrate → record → assemble

### Step-by-Step (Future)
```bash
npm run tutorial:revealjs:audio <name>      # Audio only
npm run tutorial:revealjs:html <name>       # HTML only
npm run tutorial:revealjs:video <name>      # Video only
```

---

## Testing Requirements

### Unit Tests
- Parser: Test markdown parsing with all directives
- Timeline builder: Test cumulative timing calculations
- Audio generator: Test ElevenLabs integration per slide
- HTML generator: Test reveal.js HTML output

### Integration Tests
- Playwright controller: Test slide navigation and events
- Audio sync orchestrator: Test orchestration flow
- Instruction executor: Test playwright actions

### E2E Tests
- Full build: markdown → HTML + MP4
- Verify outputs exist and are valid
- Verify audio-video synchronization

### Manual Tests
- Watch generated video: Verify sync quality
- Open HTML: Verify manual navigation works
- Check speaker notes: Press S in browser
- Test fragments: Verify step-by-step reveals

---

## Success Criteria

### MVP Complete When:
- ✅ Can parse Option 3 markdown format
- ✅ Generates audio per slide via ElevenLabs
- ✅ Builds standalone HTML presentation
- ✅ Playwright orchestrates presentation playback
- ✅ Records video with synchronized audio
- ✅ Outputs both HTML + MP4
- ✅ Pause-after-audio feature works
- ✅ Has automated test coverage
- ✅ Has documentation for creators
- ✅ Works with example tutorials

### Quality Gates:
- All tests passing
- No TypeScript errors
- Build completes without crashes
- Audio-video sync within 100ms tolerance
- HTML works in Chrome, Firefox, Safari
- MP4 plays in standard video players
- Documentation is clear

---

## Future Enhancements (Post-MVP)

Not implementing initially, but architecture supports:
1. Fragment-level audio sync (pause between fragments)
2. Real-time preview mode
3. Interactive editing with incremental rebuild
4. Advanced playwright: Multi-tab orchestration
5. AI slide generation from audio
6. Custom theme builder
7. Live captions/subtitles
8. Multi-language support
9. Analytics and timing reports
10. Cloud export to hosting services

---

## Estimated Timeline

**Total**: ~45 hours (32 implementation + 13 testing)

**Phases**:
- Phase 1-3: Foundation (12 hours)
- Phase 4-5: Playwright & sync (11 hours)
- Phase 6: Video recording (4 hours)
- Phase 7: CLI integration (5 hours)
- Phase 8: Testing & polish (13 hours)

**See**: `/planning/revealjs-integration/IMPLEMENTATION_PLAN.md` for 20-step breakdown

---

## Current Status

**Branch**: `feat/revealjs-presentation` (created)
**Phase**: Planning complete, ready to begin implementation
**Next Step**: Step 1 - Install dependencies

---

## References

- Reveal.js docs: https://revealjs.com/
- Reveal.js markdown: https://revealjs.com/markdown/
- Project plan: `/planning/revealjs-integration/IMPLEMENTATION_PLAN.md`
- Format spec: `/planning/revealjs-integration/format-option-3-minimalist.md`
- Research: `/planning/revealjs-integration/revealjs-research.md`

---

## Notes for Future Context

**When resuming this project**:
1. Read this DECISIONS.md file first
2. Review IMPLEMENTATION_PLAN.md for step-by-step guide
3. Check format-option-3-minimalist.md for syntax details
4. Use reveal.js terminology (slides, fragments, transitions, etc.)
5. Remember: Pause-after-audio is critical feature
6. Remember: Both HTML + MP4 outputs required
7. Remember: Audio drives slides (not vice versa)
8. Remember: Test before committing each step

**Current working directory**: `/Users/rjones/auditboard/genai-tutorial-factory`
**Planning folder**: `/planning/revealjs-integration/`
