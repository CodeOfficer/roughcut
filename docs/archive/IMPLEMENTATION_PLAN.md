# Reveal.js + Playwright + ElevenLabs Integration - Implementation Plan

## Project Overview
Transform the tutorial factory from video-only output to a reveal.js-based presentation system where:
- Markdown scripts define slides, audio, and playwright automation
- ElevenLabs provides audio narration synchronized to slides
- Playwright orchestrates presentation navigation and browser automation
- Output: Both interactive HTML presentation + recorded MP4 video

## Architecture Strategy
**Audio-Driven Sync**: Audio segments control slide timing (simplest, most reliable)
**Format**: Annotated Reveal.js Markdown (Option 1 - native compatibility)

---

## PHASE 1: Foundation & Setup

### Step 1: Install Dependencies
**Goal**: Add reveal.js and supporting packages

**Tasks**:
- Install `reveal.js` package
- Install `@types/reveal.js` for TypeScript support
- Install `@playwright/test` (upgrade if needed)
- Add any missing markdown parsing libraries

**Commands**:
```bash
npm install reveal.js
npm install -D @types/reveal.js
npm install -D @playwright/test
```

**Test**: Verify imports work in TypeScript
```typescript
import Reveal from 'reveal.js';
// No errors
```

**Commit**: `feat: add reveal.js and playwright test dependencies`

---

### Step 2: Create Reveal.js TypeScript Types
**Goal**: Define interfaces for our extended reveal.js system

**File**: `/src/core/revealjs-types.ts`

**Interfaces**:
```typescript
export interface RevealSlide {
  id: string;                          // slide-001
  content: string;                     // Markdown content
  audio: AudioBlock | null;
  playwright: PlaywrightBlock | null;
  notes: string | null;
  metadata: SlideMetadata;
}

export interface AudioBlock {
  text: string;                        // Narration text
  duration: number | null;             // Expected duration (seconds)
  actualDuration?: number;             // From ElevenLabs
  audioPath?: string;                  // Generated MP3 path
  pauses: PauseMarker[];              // [PAUSE 2s] markers
}

export interface PauseMarker {
  position: number;                    // Character offset in text
  durationSeconds: number;
}

export interface PlaywrightBlock {
  instructions: PlaywrightInstruction[];
}

export interface PlaywrightInstruction {
  type: 'action' | 'wait' | 'screenshot';
  content: string;
  params?: Record<string, any>;
}

export interface SlideMetadata {
  duration: number | null;             // data-duration
  transition?: string;                 // data-transition
  background?: string;                 // data-background
  fragments?: FragmentDefinition[];
  autoAnimate?: boolean;
}

export interface FragmentDefinition {
  index: number;
  effect: string;                      // fade, grow, highlight-red, etc.
  element: string;                     // Content to wrap
}

export interface RevealPresentation {
  title: string;
  theme: string;                       // dracula, white, black, etc.
  voice: string;                       // ElevenLabs voice ID
  resolution: string;                  // 1920x1080
  slides: RevealSlide[];
  totalDuration?: number;
}

export interface RevealConfig {
  autoSlide: number;
  hash: boolean;
  history: boolean;
  fragments: boolean;
  fragmentInURL: boolean;
  transition: string;
  plugins: string[];
}
```

**Test**: Compile TypeScript without errors

**Commit**: `feat: add reveal.js TypeScript type definitions`

---

### Step 3: Create Reveal.js Markdown Parser
**Goal**: Parse annotated markdown into RevealPresentation structure

**File**: `/src/core/revealjs-parser.ts`

**Class**: `RevealMarkdownParser`

**Methods**:
```typescript
class RevealMarkdownParser {
  parse(markdownPath: string): RevealPresentation

  private parseFrontMatter(content: string): FrontMatter
  private splitIntoSlides(content: string): string[]
  private parseSlide(slideMarkdown: string, index: number): RevealSlide
  private extractAudioBlock(content: string): AudioBlock | null
  private extractPlaywrightBlock(content: string): PlaywrightBlock | null
  private extractNotes(content: string): string | null
  private parseSlideMetadata(content: string): SlideMetadata
  private extractPauseMarkers(audioText: string): PauseMarker[]
  private cleanContentForReveal(content: string): string
}
```

**Implementation Details**:
- Use regex to split on `---` (reveal.js delimiter)
- Extract `[AUDIO]...[/AUDIO]` blocks
- Extract `[PLAYWRIGHT]...[/PLAYWRIGHT]` blocks
- Extract `Note:` sections
- Parse `<!-- .slide: ... -->` comments for metadata
- Preserve reveal.js native syntax (fragments, code highlighting)

**Test**: Unit tests
```typescript
// Test 1: Parse simple slide
const input = `
# Welcome
[AUDIO]
Hello world
[/AUDIO]
`;
const result = parser.parse(input);
expect(result.slides).toHaveLength(1);
expect(result.slides[0].audio.text).toBe('Hello world');

// Test 2: Parse with pauses
const input = `
[AUDIO]
First point. [PAUSE 2s] Second point.
[/AUDIO]
`;
const result = parser.parseSlide(input, 0);
expect(result.audio.pauses).toHaveLength(1);
expect(result.audio.pauses[0].durationSeconds).toBe(2);

// Test 3: Parse playwright block
const input = `
[PLAYWRIGHT]
Action: Click button
Wait: 2s
[/PLAYWRIGHT]
`;
const result = parser.parseSlide(input, 0);
expect(result.playwright.instructions).toHaveLength(2);
```

**Commit**: `feat: implement reveal.js markdown parser`

---

## PHASE 2: Audio Generation Integration

### Step 4: Extend Audio Generator for Reveal.js
**Goal**: Generate audio per slide from RevealPresentation

**File**: `/src/narration/revealjs-speech.ts`

**Class**: `RevealSpeechGenerator`

**Methods**:
```typescript
class RevealSpeechGenerator {
  constructor(private elevenlabsClient: ElevenLabsClient)

  async generateAllSlideAudio(
    presentation: RevealPresentation,
    outputDir: string
  ): Promise<Map<string, AudioResult>>

  async generateSlideAudio(
    slide: RevealSlide,
    outputPath: string
  ): Promise<AudioResult>

  private prepareTextForTTS(audioBlock: AudioBlock): string
}

interface AudioResult {
  slideId: string;
  filePath: string;
  durationSeconds: number;
  sizeBytes: number;
}
```

**Implementation**:
- For each slide with `[AUDIO]` block
- Remove `[PAUSE]` markers from text (they're timing markers, not spoken)
- Send clean text to ElevenLabs
- Save to `/tutorials/{name}/audio/slide-001.mp3`
- Extract actual duration with FFmpeg
- Update slide's `actualDuration`

**Test**: Manual + automated
```typescript
// Manual: Create test slide with audio, verify MP3 generated
// Automated unit test:
test('generates audio for slides with audio blocks', async () => {
  const presentation = {
    slides: [
      { id: 'slide-001', audio: { text: 'Hello world', duration: 5 } }
    ]
  };
  const results = await generator.generateAllSlideAudio(presentation, './test-output');
  expect(results.size).toBe(1);
  expect(results.get('slide-001').durationSeconds).toBeGreaterThan(0);
});
```

**Commit**: `feat: add reveal.js slide audio generation`

---

### Step 5: Create Audio Timeline Builder
**Goal**: Build timeline mapping slides to audio segments

**File**: `/src/video/revealjs-timeline.ts`

**Class**: `RevealTimelineBuilder`

**Methods**:
```typescript
class RevealTimelineBuilder {
  build(
    presentation: RevealPresentation,
    audioResults: Map<string, AudioResult>
  ): RevealTimeline
}

interface RevealTimeline {
  slides: SlideTimelineEntry[];
  totalDuration: number;
}

interface SlideTimelineEntry {
  slideId: string;
  slideIndex: number;
  audioPath: string | null;
  duration: number;                    // Actual audio duration
  startTime: number;                   // Cumulative start
  endTime: number;                     // Cumulative end
  hasPlaywright: boolean;
  metadata: SlideMetadata;
}
```

**Implementation**:
- Iterate through slides in order
- Match audio results by slideId
- Calculate cumulative start/end times
- Handle slides without audio (use metadata duration or default)

**Test**: Unit test
```typescript
test('builds timeline with cumulative times', () => {
  const presentation = { slides: [
    { id: 'slide-001', audio: { actualDuration: 5 } },
    { id: 'slide-002', audio: { actualDuration: 8 } },
    { id: 'slide-003', audio: null, metadata: { duration: 3 } }
  ]};
  const timeline = builder.build(presentation, audioResults);
  expect(timeline.slides[0].startTime).toBe(0);
  expect(timeline.slides[0].endTime).toBe(5);
  expect(timeline.slides[1].startTime).toBe(5);
  expect(timeline.slides[1].endTime).toBe(13);
  expect(timeline.slides[2].startTime).toBe(13);
  expect(timeline.slides[2].endTime).toBe(16);
  expect(timeline.totalDuration).toBe(16);
});
```

**Commit**: `feat: add reveal.js audio timeline builder`

---

## PHASE 3: Reveal.js HTML Generation

### Step 6: Create HTML Template Generator
**Goal**: Generate standalone reveal.js HTML file from presentation

**File**: `/src/presentation/revealjs-generator.ts`

**Class**: `RevealHTMLGenerator`

**Methods**:
```typescript
class RevealHTMLGenerator {
  generate(
    presentation: RevealPresentation,
    outputPath: string
  ): Promise<string>

  private generateHTML(presentation: RevealPresentation): string
  private generateSlideHTML(slide: RevealSlide): string
  private generateRevealConfig(presentation: RevealPresentation): RevealConfig
  private copyRevealAssets(outputDir: string): Promise<void>
}
```

**HTML Structure**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{presentation.title}}</title>
  <link rel="stylesheet" href="reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="reveal.js/dist/theme/{{theme}}.css">
  <link rel="stylesheet" href="reveal.js/plugin/highlight/monokai.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Generated slides here -->
      <section data-markdown data-slide-id="slide-001" data-audio-duration="5">
        <textarea data-template>
# Slide Title

Slide content with **markdown**

Note:
Speaker notes here
        </textarea>
      </section>
      <!-- More slides... -->
    </div>
  </div>

  <script src="reveal.js/dist/reveal.js"></script>
  <script src="reveal.js/plugin/markdown/markdown.js"></script>
  <script src="reveal.js/plugin/highlight/highlight.js"></script>
  <script src="reveal.js/plugin/notes/notes.js"></script>

  <script>
    Reveal.initialize({
      hash: true,
      fragments: true,
      transition: 'slide',
      plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
    });
  </script>
</body>
</html>
```

**Implementation**:
- Generate HTML template with placeholders
- For each slide, create `<section data-markdown>` with content
- Add slide metadata as data attributes
- Copy reveal.js assets to output directory
- Write final HTML file

**Test**: Manual
1. Generate HTML for test presentation
2. Open in browser
3. Verify slides render correctly
4. Verify navigation works
5. Verify fragments appear
6. Verify speaker notes (press S)

**Commit**: `feat: add reveal.js HTML generator`

---

### Step 7: Add Reveal.js Asset Management
**Goal**: Bundle reveal.js assets with output

**File**: `/src/presentation/revealjs-assets.ts`

**Class**: `RevealAssetsManager`

**Methods**:
```typescript
class RevealAssetsManager {
  async copyAssetsToOutput(outputDir: string): Promise<void>
  async bundlePresentation(htmlPath: string, outputDir: string): Promise<string>
}
```

**Implementation**:
- Copy `node_modules/reveal.js/dist` to output
- Copy `node_modules/reveal.js/plugin` to output
- Create self-contained presentation folder
- Optional: Create ZIP archive for distribution

**Test**: Verify assets copied and presentation works offline

**Commit**: `feat: add reveal.js asset bundling`

---

## PHASE 4: Playwright Orchestration

### Step 8: Create Playwright Presentation Controller
**Goal**: Control reveal.js presentation with Playwright

**File**: `/src/presentation/playwright-controller.ts`

**Class**: `PlaywrightPresentationController`

**Methods**:
```typescript
class PlaywrightPresentationController {
  constructor(private page: Page)

  async initialize(presentationURL: string): Promise<void>
  async waitForReady(): Promise<void>
  async getCurrentSlide(): Promise<SlideInfo>
  async navigateToSlide(index: number): Promise<void>
  async navigateNext(): Promise<void>
  async navigatePrevious(): Promise<void>
  async getTotalSlides(): Promise<number>
  async getProgress(): Promise<number>

  // Event system
  async onSlideChanged(callback: (info: SlideInfo) => void): Promise<void>
  async onFragmentShown(callback: (fragment: FragmentInfo) => void): Promise<void>

  // Playwright automation
  async executePlaywrightInstructions(
    instructions: PlaywrightInstruction[]
  ): Promise<void>
}

interface SlideInfo {
  indexH: number;
  indexV: number;
  indexF: number;
  slideId: string;
  progress: number;
}
```

**Implementation**:
```typescript
// Example: Navigate to slide
async navigateToSlide(index: number) {
  await this.page.evaluate((idx) => {
    window.Reveal.slide(idx, 0, 0);
  }, index);
}

// Example: Wait for slide change
async onSlideChanged(callback) {
  await this.page.evaluate(() => {
    window.slideChangeQueue = [];
    window.Reveal.on('slidechanged', (event) => {
      window.slideChangeQueue.push({
        indexH: event.indexh,
        indexV: event.indexv,
        indexF: event.indexv,
        slideId: event.currentSlide?.getAttribute('data-slide-id')
      });
    });
  });

  // Poll for changes
  setInterval(async () => {
    const changes = await this.page.evaluate(() => {
      const queue = window.slideChangeQueue;
      window.slideChangeQueue = [];
      return queue;
    });
    changes.forEach(callback);
  }, 100);
}

// Example: Execute playwright instructions
async executePlaywrightInstructions(instructions) {
  for (const instruction of instructions) {
    switch (instruction.type) {
      case 'action':
        await this.executeAction(instruction);
        break;
      case 'wait':
        await this.executeWait(instruction);
        break;
      case 'screenshot':
        await this.executeScreenshot(instruction);
        break;
    }
  }
}
```

**Test**: Automated Playwright test
```typescript
test('playwright controller navigates slides', async ({ page }) => {
  const controller = new PlaywrightPresentationController(page);
  await controller.initialize('http://localhost:8000/presentation.html');
  await controller.waitForReady();

  const total = await controller.getTotalSlides();
  expect(total).toBeGreaterThan(0);

  await controller.navigateNext();
  const current = await controller.getCurrentSlide();
  expect(current.indexH).toBe(1);
});
```

**Commit**: `feat: add playwright presentation controller`

---

### Step 9: Create Playwright Instruction Executor
**Goal**: Execute [PLAYWRIGHT] block instructions

**File**: `/src/presentation/playwright-executor.ts`

**Class**: `PlaywrightInstructionExecutor`

**Methods**:
```typescript
class PlaywrightInstructionExecutor {
  constructor(private page: Page)

  async execute(instruction: PlaywrightInstruction): Promise<void>

  private async executeAction(instruction: PlaywrightInstruction): Promise<void>
  private async executeWait(instruction: PlaywrightInstruction): Promise<void>
  private async executeScreenshot(instruction: PlaywrightInstruction): Promise<void>
}
```

**Supported Actions**:
```
Action: Click <selector>
Action: Type "<text>"
Action: Press <key>
Action: Open tab "<url>"
Action: Close tab
Action: Hover <selector>
Action: Scroll to <selector>
Wait: <duration>s
Wait: <selector> visible
Wait: fragment-<index> shown
Screenshot: <name>
```

**Implementation**:
- Parse instruction text
- Map to Playwright API calls
- Handle errors gracefully
- Log actions for debugging

**Test**: Automated
```typescript
test('executes playwright actions', async ({ page }) => {
  const executor = new PlaywrightInstructionExecutor(page);
  await page.goto('https://example.com');

  await executor.execute({
    type: 'action',
    content: 'Click button[type="submit"]'
  });

  // Verify action occurred
});
```

**Commit**: `feat: add playwright instruction executor`

---

## PHASE 5: Audio-Video Synchronization

### Step 10: Create Audio Sync Orchestrator
**Goal**: Synchronize audio playback with slide navigation

**File**: `/src/presentation/audio-sync-orchestrator.ts`

**Class**: `AudioSyncOrchestrator`

**Methods**:
```typescript
class AudioSyncOrchestrator {
  constructor(
    private controller: PlaywrightPresentationController,
    private audioPlayer: AudioPlayer
  )

  async runPresentation(
    timeline: RevealTimeline,
    audioDir: string
  ): Promise<void>

  private async playSlide(
    entry: SlideTimelineEntry,
    audioPath: string
  ): Promise<void>

  private async handlePlaywrightInstructions(
    instructions: PlaywrightInstruction[]
  ): Promise<void>
}
```

**Orchestration Flow**:
```typescript
async runPresentation(timeline, audioDir) {
  // Navigate to first slide
  await this.controller.navigateToSlide(0);

  // For each slide in timeline
  for (let i = 0; i < timeline.slides.length; i++) {
    const entry = timeline.slides[i];

    // Navigate to slide
    await this.controller.navigateToSlide(i);
    await this.controller.waitForTransitionEnd();

    // Start audio if exists
    if (entry.audioPath) {
      const audioPromise = this.audioPlayer.play(entry.audioPath);

      // Execute playwright instructions in parallel
      if (entry.hasPlaywright) {
        const playwrightPromise = this.handlePlaywrightInstructions(
          entry.playwrightInstructions
        );
        await Promise.all([audioPromise, playwrightPromise]);
      } else {
        await audioPromise;
      }
    } else {
      // No audio, just wait for duration
      await this.page.waitForTimeout(entry.duration * 1000);
    }
  }
}
```

**Note**: Audio playback will use browser audio API or system audio player

**Test**: Integration test
```typescript
test('orchestrator syncs audio with slides', async ({ page }) => {
  const controller = new PlaywrightPresentationController(page);
  const player = new AudioPlayer();
  const orchestrator = new AudioSyncOrchestrator(controller, player);

  await controller.initialize('http://localhost:8000/test.html');

  const timeline = createTestTimeline(); // 3 slides, 5s each
  await orchestrator.runPresentation(timeline, './test-audio');

  // Verify all slides were visited
  const final = await controller.getCurrentSlide();
  expect(final.indexH).toBe(2);
});
```

**Commit**: `feat: add audio-slide sync orchestrator`

---

### Step 11: Create Audio Player (Browser-based)
**Goal**: Play audio synchronized with browser timing

**File**: `/src/presentation/audio-player.ts`

**Class**: `BrowserAudioPlayer`

**Methods**:
```typescript
class BrowserAudioPlayer {
  constructor(private page: Page)

  async play(audioPath: string): Promise<void>
  async pause(): Promise<void>
  async stop(): Promise<void>
  async getDuration(audioPath: string): Promise<number>
  async getCurrentTime(): Promise<number>
}
```

**Implementation** (Inject audio into browser):
```typescript
async play(audioPath: string) {
  // Read audio file
  const audioBuffer = await fs.readFile(audioPath);
  const audioBase64 = audioBuffer.toString('base64');
  const audioDataURL = `data:audio/mp3;base64,${audioBase64}`;

  // Play in browser context
  await this.page.evaluate(async (dataURL) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(dataURL);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });
  }, audioDataURL);
}
```

**Alternative**: Use system audio player with precise timing

**Test**: Manual verification - audio plays correctly

**Commit**: `feat: add browser audio player`

---

## PHASE 6: Video Recording

### Step 12: Create Playwright Video Recorder
**Goal**: Record browser tab during presentation playback

**File**: `/src/video/playwright-recorder.ts`

**Class**: `PlaywrightVideoRecorder`

**Methods**:
```typescript
class PlaywrightVideoRecorder {
  async startRecording(page: Page, outputPath: string): Promise<void>
  async stopRecording(): Promise<string>
}
```

**Implementation** (Use Playwright's built-in video recording):
```typescript
// Start recording
const browser = await chromium.launch({
  headless: true // or false for debugging
});

const context = await browser.newContext({
  recordVideo: {
    dir: outputDir,
    size: { width: 1920, height: 1080 }
  }
});

const page = await context.newPage();

// Run presentation...

// Stop recording
await page.close();
await context.close();

// Video saved to outputDir
```

**Alternative**: Use FFmpeg screen capture if more control needed

**Test**: Manual - verify video file created and playable

**Commit**: `feat: add playwright video recording`

---

### Step 13: Create Final Video Assembler
**Goal**: Combine recorded video with high-quality audio

**File**: `/src/video/revealjs-video-assembler.ts`

**Class**: `RevealVideoAssembler`

**Methods**:
```typescript
class RevealVideoAssembler {
  async assemble(
    recordedVideoPath: string,
    audioFiles: string[],
    timeline: RevealTimeline,
    outputPath: string
  ): Promise<string>
}
```

**Implementation** (FFmpeg):
```bash
# Replace browser audio with high-quality ElevenLabs audio
ffmpeg \
  -i recorded_video.webm \
  -i audio/slide-001.mp3 \
  -i audio/slide-002.mp3 \
  -filter_complex "[1:a][2:a]concat=n=2:v=0:a=1[aout]" \
  -map 0:v \
  -map "[aout]" \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 192k \
  -r 30 -s 1920x1080 \
  final_output.mp4
```

**Test**: Verify final video has:
- High-quality visuals
- Synchronized high-quality audio
- Correct duration
- Playable in standard video players

**Commit**: `feat: add final video assembler with audio replacement`

---

## PHASE 7: CLI Integration

### Step 14: Create Reveal.js Build Command
**Goal**: Add CLI command to build reveal.js presentations

**File**: `/src/cli/commands/revealjs-build.ts`

**Command**: `npm run tutorial:revealjs <tutorial-name>`

**Workflow**:
```typescript
async function revealjsBuild(tutorialName: string) {
  console.log(`Building reveal.js presentation: ${tutorialName}`);

  // 1. Parse markdown
  const markdownPath = path.join(OUTPUT_DIR, tutorialName, 'script.md');
  const parser = new RevealMarkdownParser();
  const presentation = parser.parse(markdownPath);

  // 2. Generate audio for all slides
  const audioDir = path.join(OUTPUT_DIR, tutorialName, 'audio');
  const speechGenerator = new RevealSpeechGenerator(elevenlabsClient);
  const audioResults = await speechGenerator.generateAllSlideAudio(
    presentation,
    audioDir
  );

  // 3. Build timeline
  const timelineBuilder = new RevealTimelineBuilder();
  const timeline = timelineBuilder.build(presentation, audioResults);

  // 4. Generate HTML
  const htmlDir = path.join(OUTPUT_DIR, tutorialName, 'presentation');
  const htmlGenerator = new RevealHTMLGenerator();
  await htmlGenerator.generate(presentation, htmlDir);

  // 5. Start local server
  const server = await startLocalServer(htmlDir);
  const presentationURL = `http://localhost:${server.port}/index.html`;

  // 6. Launch Playwright
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: path.join(OUTPUT_DIR, tutorialName, 'output'),
      size: { width: 1920, height: 1080 }
    }
  });
  const page = await context.newPage();

  // 7. Run orchestrated presentation
  const controller = new PlaywrightPresentationController(page);
  await controller.initialize(presentationURL);

  const audioPlayer = new BrowserAudioPlayer(page);
  const orchestrator = new AudioSyncOrchestrator(controller, audioPlayer);

  await orchestrator.runPresentation(timeline, audioDir);

  // 8. Stop recording
  await page.close();
  await context.close();
  await browser.close();
  await server.close();

  // 9. Assemble final video
  const recordedVideo = path.join(OUTPUT_DIR, tutorialName, 'output', 'video.webm');
  const finalVideo = path.join(OUTPUT_DIR, tutorialName, 'output', 'tutorial.mp4');

  const assembler = new RevealVideoAssembler();
  await assembler.assemble(
    recordedVideo,
    Array.from(audioResults.values()).map(r => r.filePath),
    timeline,
    finalVideo
  );

  console.log(`✅ Presentation built successfully!`);
  console.log(`   HTML: ${htmlDir}/index.html`);
  console.log(`   Video: ${finalVideo}`);
}
```

**Test**: End-to-end manual test
1. Create test tutorial markdown
2. Run command
3. Verify HTML output
4. Verify MP4 output
5. Verify synchronization

**Commit**: `feat: add reveal.js build CLI command`

---

### Step 15: Update Tutorial Template
**Goal**: Create template for reveal.js tutorials

**File**: `/tutorials/.template-revealjs/script.md`

**Content**:
```markdown
---
title: "Tutorial Title"
theme: dracula
voice: adam
resolution: 1920x1080
---

# Welcome Slide
<!-- .slide: data-duration="5" -->

Your content here...

[AUDIO]
Narration text here
[/AUDIO]

Note:
Speaker notes here

---

# Second Slide
<!-- .slide: data-duration="8" data-transition="zoom" -->

More content...

[AUDIO]
More narration
[/AUDIO]
```

**Command**: `npm run tutorial:create-revealjs <name>`

**Test**: Create tutorial from template, verify structure

**Commit**: `feat: add reveal.js tutorial template`

---

## PHASE 8: Testing & Polish

### Step 16: Add Comprehensive Automated Tests
**Goal**: Ensure reliability with test coverage

**Test Files**:
- `/tests/unit/revealjs-parser.test.ts`
- `/tests/unit/revealjs-speech.test.ts`
- `/tests/unit/revealjs-timeline.test.ts`
- `/tests/integration/playwright-controller.test.ts`
- `/tests/e2e/revealjs-build.test.ts`

**Coverage Goals**:
- Unit tests: 80%+ coverage for parsers and builders
- Integration tests: Playwright controller, audio sync
- E2E test: Full build process from markdown to video

**Commands**:
```bash
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

**Test**: Run all tests, verify passing

**Commit**: `test: add comprehensive test suite for reveal.js integration`

---

### Step 17: Add Documentation
**Goal**: Document new reveal.js workflow

**Files**:
- `/docs/REVEALJS_GUIDE.md` - Complete guide for creators
- `/docs/MARKDOWN_SYNTAX.md` - Markdown format reference
- `/docs/PLAYWRIGHT_ACTIONS.md` - Available playwright instructions
- `/README.md` - Update with reveal.js features

**Content**:
- Quick start guide
- Markdown syntax examples
- Audio block usage
- Playwright automation examples
- Troubleshooting

**Test**: Follow guide to create tutorial, verify clarity

**Commit**: `docs: add reveal.js integration documentation`

---

### Step 18: Add Error Handling & Logging
**Goal**: Graceful failures with helpful error messages

**Enhancements**:
- Validate markdown syntax before building
- Check for missing audio blocks
- Validate playwright instruction syntax
- Provide clear error messages with line numbers
- Add progress indicators during build
- Log timing information for debugging

**Test**: Test failure scenarios
- Invalid markdown syntax
- Missing audio file
- Invalid playwright action
- Browser timeout

**Commit**: `feat: add error handling and logging for reveal.js`

---

### Step 19: Performance Optimization
**Goal**: Fast builds and smooth playback

**Optimizations**:
- Parallel audio generation (multiple ElevenLabs requests)
- Asset caching (don't regenerate unchanged slides)
- Lazy-load reveal.js assets
- Optimize video encoding settings
- Add progress caching (resume interrupted builds)

**Test**: Benchmark build times
- Measure audio generation time
- Measure video recording time
- Measure final assembly time

**Commit**: `perf: optimize reveal.js build performance`

---

### Step 20: Example Tutorials & Polish
**Goal**: Ship with working examples

**Create Example Tutorials**:
1. `tutorials/example-basic/` - Simple 3-slide presentation
2. `tutorials/example-code/` - Code highlighting demo
3. `tutorials/example-automation/` - Playwright automation showcase
4. `tutorials/example-fragments/` - Fragment effects demo

**Test**: Build all examples successfully

**Polish**:
- Add spinner animations
- Improve log formatting
- Add color-coded output
- Add ASCII art for completion
- Add build time statistics

**Commit**: `feat: add example reveal.js tutorials and polish CLI`

---

## PHASE 9: Future Enhancements (Post-MVP)

### Not Implemented Initially (But Architecture Supports):
1. **Fragment-level audio sync** - Pause audio between fragments
2. **Real-time preview mode** - Watch presentation as it builds
3. **Interactive editing** - Edit slides and rebuild incrementally
4. **Advanced playwright** - Multi-tab orchestration, complex workflows
5. **AI slide generation** - Generate slides from audio script
6. **Custom themes** - Theme builder tool
7. **Live captions** - Real-time subtitle generation
8. **Multi-language** - Generate presentations in multiple languages
9. **Analytics** - Track slide timing and engagement
10. **Cloud export** - Upload to presentation hosting services

---

## Success Criteria

### MVP Complete When:
- ✅ Can parse annotated reveal.js markdown
- ✅ Generates audio for each slide via ElevenLabs
- ✅ Builds standalone HTML presentation
- ✅ Playwright orchestrates presentation playback
- ✅ Records video with synchronized audio
- ✅ Outputs both HTML + MP4
- ✅ Has automated test coverage
- ✅ Has documentation for creators
- ✅ Works with example tutorials

### Quality Gates:
- All tests passing
- No TypeScript errors
- Build completes without crashes
- Audio-video sync within 100ms tolerance
- HTML presentation works in Chrome, Firefox, Safari
- MP4 video plays in standard players
- Documentation is clear and accurate

---

## Estimated Timeline

| Phase | Steps | Estimated Time | Test Time |
|-------|-------|----------------|-----------|
| Phase 1: Foundation | 1-3 | 4 hours | 1 hour |
| Phase 2: Audio | 4-5 | 3 hours | 1 hour |
| Phase 3: HTML | 6-7 | 4 hours | 1 hour |
| Phase 4: Playwright | 8-9 | 5 hours | 2 hours |
| Phase 5: Sync | 10-11 | 4 hours | 2 hours |
| Phase 6: Video | 12-13 | 3 hours | 1 hour |
| Phase 7: CLI | 14-15 | 3 hours | 2 hours |
| Phase 8: Testing | 16-20 | 6 hours | 3 hours |
| **TOTAL** | **20 steps** | **32 hours** | **13 hours** |

**Total Estimated Time**: ~45 hours (1-2 weeks with testing)

---

## Risk Mitigation

### Potential Issues:
1. **Audio-video drift** - Mitigation: Use browser timing, not system timing
2. **Playwright timeout** - Mitigation: Configurable timeouts, retry logic
3. **Video encoding failures** - Mitigation: Fallback to different codecs
4. **Large audio files** - Mitigation: Streaming, compression
5. **Browser compatibility** - Mitigation: Test on multiple browsers

### Backup Plans:
- If browser audio fails → Use system audio player with sync markers
- If video recording fails → Use FFmpeg screen capture
- If playwright fails → Generate static images per slide (fallback to old method)

---

## Next Steps

Ready to begin implementation?

**Suggested Starting Point**: Phase 1, Step 1
**Estimated First Checkpoint**: Step 3 (Parser) - ~5 hours

Would you like to proceed with Step 1?
