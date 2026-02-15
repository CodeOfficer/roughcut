---
title: "Roughcut — Kitchen Sink"
theme: dracula
voice: J0AK45UHW1Wo9rJ0p4y8
resolution: 1920x1080
preset: video-recording
---

# Roughcut Kitchen Sink

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

@audio: Welcome to the Roughcut kitchen sink demo.
@audio: This showcase demonstrates every available feature and directive.
@audio: Let's explore everything you can build.

**Every directive. Every feature. One presentation.**

---

# Core Features

@audio: Roughcut combines multiple technologies.
@audio: Markdown for content [1s] AI for narration [1s] and browser automation for recording.

- 📝 **Markdown-based** - Write in simple, readable format
- 🎙️ **AI Narration** - Automatic text-to-speech with ElevenLabs
- 🎬 **Video Recording** - Browser automation with Playwright
- 🎨 **AI Images** - Generate visuals with Gemini AI

---

# Supported Directives

@transition: fade
@duration: 10s

@audio: Roughcut supports twenty-one different directives.
@audio: Each directive controls a specific aspect of your presentation.

**Frontmatter (8):**
- `title`, `theme`, `voice`, `resolution`
- `preset`, `config`, `customCSS`, `customStyles`

**Slide-level (11):**
- `@duration`, `@pause-after`, `@transition`
- `@background`, `@image-prompt`, `@notes`
- `@audio`, `@playwright`, `@vertical-slide`
- `@background-video`, `@background-video-loop`, `@background-video-muted`

**Inline (1):**
- `@fragment`

---

# Audio Narration

@audio: Audio narration is the heart of Roughcut.
@audio: Use the @audio directive to add narration to any slide.
@audio: Split across multiple lines for better readability and caching.

**Features:**

- Multi-line format (recommended)
- Intelligent TTS caching
- Character-level timestamps from ElevenLabs API
- Pause markers like 1s or 2.5s intervals

---

# Transitions & Effects

@transition: convex
@pause-after: 1.5s

@audio: Each slide can have its own transition effect.
@audio: Choose from fade [0.5s] slide [0.5s] zoom [0.5s] convex [0.5s] and concave.

**Available transitions:**

- `none` - No transition
- `fade` - Cross fade
- `slide` - Slide horizontally
- `zoom` - Scale up
- `convex` / `concave` - 3D perspective

---

# Backgrounds

@background: #1a1a2e
@transition: slide

@audio: Customize slide backgrounds with colors, gradients, images, or videos.

This slide uses a dark hex color: `#1a1a2e`

**Supported formats:**
- Hex colors: `#1e1e1e`
- RGB/RGBA: `rgb(30, 30, 30)`
- Named colors: `black`, `white`, etc.
- Gradients: `linear-gradient(...)`
- Image URLs: `https://...`
- Video files: see video backgrounds slide

---

# AI Image Generation

@image-prompt: A futuristic holographic interface displaying code and data visualizations, cyberpunk aesthetic with neon blues and purples
@transition: zoom

@audio: Generate images automatically using Gemini AI.
@audio: Just describe what you want with the @image-prompt directive.

The AI will create custom visuals for your slides!

---

# Progressive Disclosure

@audio: Use the @fragment directive to reveal content progressively.
@audio: Perfect for building suspense and controlling information flow.

**Development workflow:**

- Write markdown content @fragment
- Add audio narration @fragment
- Test with fast build mode @fragment
- Generate final video with all features @fragment

---

# Fragment Timing Control

@audio: Fragments can have custom timing offsets.
@audio: This syncs reveals with your narration.

**Advanced features:**

- Basic fragments @fragment
- Timed reveals @fragment +1s
- Build complex animations @fragment +2s
- Perfect synchronization @fragment +3s

---

# Configuration Presets

@transition: fade
@background: #2a2a4e

@audio: Use configuration presets for common scenarios.
@audio: Four presets are available to simplify your workflow.

**Available presets:**

- `video-recording` - Optimized for video production
- `manual-presentation` - Interactive presentations with controls
- `auto-demo` - Automated demos with smooth navigation
- `speaker-mode` - Presentations with speaker notes

Set with `preset: video-recording` in frontmatter.

---

# Advanced Configuration

@audio: Fine-tune your presentation with sixty plus RevealJS options.
@audio: Control navigation, transitions, display, and behavior.

**Example config options:**

```yaml
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  center: true
  transition: fade
  transitionSpeed: default
  viewDistance: 3
```

See documentation for complete list!

---

# Vertical Slides (Part 1)

@transition: slide

@audio: Create two-dimensional navigation with vertical slides.
@audio: Perfect for organizing related content in groups.

**This slide group demonstrates vertical navigation.**

Press ↓ to go down, → to go right.

@vertical-slide:
## Vertical Slide 2

@audio: This is the second slide in the vertical group.

Navigate with arrow keys:
- ↓ Next vertical slide
- ↑ Previous vertical slide
- → Next horizontal section

@vertical-slide:
## Vertical Slide 3

@audio: This is the last slide in the vertical group.
@audio: Press the right arrow to continue to the next section.

**End of vertical group.**

Press → to continue horizontally.

---

# Image Backgrounds

@background: ./background-image.png

@audio: Use custom images as slide backgrounds for visual impact.
@audio: Place image files alongside your presentation file.

**To use image backgrounds:**

- Place image in tutorial directory
- Reference with `./filename.png`
- Image auto-scales to fit screen

*This slide uses `background-image.png` as a demonstration.*

---

# Video Backgrounds

@background-video: ./background-video.mp4
@background-video-loop: true
@background-video-muted: true

@audio: Add video backgrounds to create dynamic, engaging slides.
@audio: Control looping and audio with dedicated directives.

**Video background directives:**

- `@background-video: ./background-video.mp4` - Video file path (relative to presentation.md)
- `@background-video-loop: true/false` - Loop playback
- `@background-video-muted: true/false` - Mute audio

*Note: Place video files alongside presentation.md and reference with `./filename.mp4`*

---

# Custom Styling

@background: #0f0f23

@audio: Apply custom CSS to personalize your presentations.
@audio: Use external stylesheets or inline styles.

**Two approaches:**

1. **External CSS:**
   ```yaml
   customCSS: styles/custom.css
   ```

2. **Inline styles:**
   ```yaml
   customStyles: |
     .reveal h1 { color: #00ff00; }
     .reveal p { font-size: 1.5em; }
   ```

Full control over presentation appearance!

---

# Build Modes

@transition: fade
@duration: 8s

@audio: Roughcut supports multiple build modes for different workflows.

**HTML Only (default):**
```bash
roughcut build
```
No API keys needed — instant output!

**Full Build:**
```bash
roughcut build --full
```
Generates everything — audio narration + production-ready video.

---

# Intelligent Caching

@audio: Roughcut uses SHA-256 fingerprinting for TTS caching.
@audio: Only changed audio lines are regenerated.
@audio: This saves API costs and speeds up iteration.

**Cache features:**

- Per-line audio fingerprinting
- Voice parameter tracking (voiceId, model, stability)
- Character-level timestamp storage
- Alignment data preservation
- Hit/miss ratio reporting

---

# Build Summary

@background: #0f0f23

@audio: Every build generates a detailed summary report.

```
Build Time: 69.17s
Stage Breakdown:
  Audio: 1.51s (2.2%) - 0 cached, 2 generated
  Video Recording: 67.32s (97.3%)
Audio Cache: 0 hits, 2 misses (0.0% hit rate)
```

**Tracks:**
- Stage timings and percentages
- Cache statistics
- Helpful optimization tips

---

# Verbose Logging

@audio: Debug builds with comprehensive logging.

**The system creates two log files:**

1. **debug.txt** - Technical details, timestamps, operations
2. **build-summary.txt** - User-friendly report with tips

Both are written to your output directory.

Tail logs in real-time: `tail -f output/debug.txt`

---

# Markdown Linting

@transition: zoom
@background: #2a2a4e

@audio: Roughcut validates your markdown before building.
@audio: This catches errors early and provides helpful suggestions.

**Linting validates:**

- Required frontmatter fields
- All 21 directive types (syntax and values)
- Pause marker format
- Fragment usage (must be on bullet lists!)
- Unknown directives with typo suggestions

---

# Error Messages

@audio: When linting fails, you get detailed, actionable error messages.

**Each error includes:**

- File path and line number
- Current (incorrect) value
- Expected format with examples
- Suggestions for common typos using Levenshtein distance
- Migration guide reference

Fail-fast approach saves time and API costs!

---

# Testing Strategy

@audio: A comprehensive test suite ensures reliability.

**Test coverage:**

- 325 total tests across the codebase
- 52 linting validation tests
- 41 configuration validation tests
- Parser tests for all directive types
- Audio caching and generation tests
- Integration tests for full pipeline

All tests passing on every commit!

---

# Performance Tips

@audio: Here are some tips for faster development.

**Optimization strategies:**

- Use `roughcut build` during development @fragment
- Use `roughcut dev` to preview in browser @fragment
- Only run `--full` builds for final export @fragment
- Multi-line audio format improves caching @fragment
- Skip images if not needed with `--skip-images` @fragment

---

# Dev Mode

@transition: convex

@audio: Test presentations interactively with dev mode.
@audio: Two modes available for different workflows.

**Manual mode:**
```bash
roughcut dev
```
Open browser, control with keyboard/mouse.

**Auto-advance mode:**
```bash
roughcut dev --auto
```
Plays through slides like a video recording.

Perfect for debugging timing and fragment issues!

---

# Architecture Highlights

@transition: convex
@background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)

@audio: Roughcut uses a clean, modular architecture.

**Pipeline stages:**

1. Linting - Validate markdown format
2. Parsing - Extract slides and directives
3. Images - Generate AI visuals (optional)
4. Audio - Generate TTS narration (cached)
5. HTML - Create interactive RevealJS presentation
6. Timeline - Calculate slide and fragment timings
7. Recording - Capture video with Playwright
8. Assembly - Combine video and audio with timestamp-based sync

---

# Audio/Video Sync

@audio: Perfect audio-video synchronization with timestamp-based assembly.
@audio: No timing drift, even with fragments and variable delays.

**How it works:**

- Orchestrator records ACTUAL timestamps when audio starts
- Exports `recording-timeline.json` with exact timing
- Assembler uses real timestamps for silence padding
- Result: Perfect sync throughout entire presentation

Slides drive audio, not the other way around!

---

# Future Roadmap

@audio: Exciting features are planned for upcoming releases.

**Coming soon:**

- Speaker notes view (Phase 3)
- Auto-animate transitions (Phase 3)
- LaTeX math support (Phase 3)
- Code syntax highlighting themes
- Embedded iframes and web content
- PDF export mode

Contributions welcome on GitHub!

---

# Getting Started

@transition: fade
@audio: Ready to create your own presentation?

**Quick start:**

1. Run `roughcut init my-talk`
2. Edit `presentation.md` with your content
3. Run `roughcut build`
4. Preview with `roughcut dev`
5. Full build with `roughcut build --full`

Check `docs/LINTING_SPEC.md` for complete reference!

---

# Thank You!

@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@transition: zoom

@audio: Thank you for exploring the Roughcut kitchen sink.
@audio: We can't wait to see what you create.
@audio: Happy presenting!

**Built with:**
🎯 TypeScript • 🎨 RevealJS • 🎙️ ElevenLabs • 🤖 Gemini AI

*Now go build something amazing!*
