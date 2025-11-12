---
title: "RevealJS Tutorial Factory - Full Feature Demo"
theme: dracula
voice: nPczCjzI2devNBz1zQrb
resolution: 1920x1080
---

# RevealJS Tutorial Factory

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

@audio: Welcome to the RevealJS Tutorial Factory.
@audio: This comprehensive demo showcases all available features.
@audio: Let's explore what you can build.

**A powerful system for creating**
**interactive video presentations**

---

# Core Features

@audio: The Tutorial Factory combines multiple technologies.
@audio: Markdown for content [1s] AI for narration [1s] and browser automation for recording.

- 📝 **Markdown-based** - Write in simple, readable format
- 🎙️ **AI Narration** - Automatic text-to-speech with ElevenLabs
- 🎬 **Video Recording** - Browser automation with Playwright
- 🎨 **AI Images** - Generate visuals with Gemini AI

---

# Supported Directives

@transition: fade
@duration: 10s

@audio: The system supports ten different directives.
@audio: Each directive controls a specific aspect of your presentation.

**Frontmatter:**
- `title`, `theme`, `voice`, `resolution`

**Slide-level:**
- `@duration`, `@pause-after`, `@transition`
- `@background`, `@image-prompt`, `@notes`
- `@audio`, `@playwright`

**Inline:**
- `@fragment`

---

# Audio Narration

@audio: Audio narration is the heart of the system.
@audio: Use the @audio directive to add narration to any slide.
@audio: Split across multiple lines for better readability and caching.

**Features:**

- Multi-line format (recommended)
- Intelligent TTS caching
- Character-level timestamps
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

@audio: Customize slide backgrounds with colors, gradients, or images.

This slide uses a dark hex color: `#1a1a2e`

**Supported formats:**
- Hex colors: `#1e1e1e`
- RGB/RGBA: `rgb(30, 30, 30)`
- Named colors: `black`, `white`, etc.
- Gradients: `linear-gradient(...)`
- Image URLs: `https://...`

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

# Build Modes

@transition: fade
@duration: 8s

@audio: The system supports three build modes for different workflows.

**Fast Mode:**
```bash
TUTORIAL=my-presentation npm run build:fast
```
Skips images and audio - instant rebuilds!

**Full Mode:**
```bash
TUTORIAL=my-presentation npm run build:full
```
Generates everything - production-ready output.

---

# Intelligent Caching

@audio: The system uses SHA-256 fingerprinting for TTS caching.
@audio: Only changed audio lines are regenerated.
@audio: This saves API costs and speeds up iteration.

**Cache features:**

- Per-line audio fingerprinting
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

---

# Markdown Linting

@transition: zoom
@background: #2a2a4e

@audio: The system validates your markdown before building.
@audio: This catches errors early and provides helpful suggestions.

**Linting validates:**

- Required frontmatter fields
- Directive syntax and values
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
- Suggestions for common typos
- Migration guide reference

---

# Testing Strategy

@audio: A comprehensive test suite ensures reliability.

**Test coverage:**

- 231 total tests across the codebase
- 52 linting validation tests
- Parser tests for all directive types
- Audio caching and generation tests
- Integration tests for full pipeline

---

# Performance Tips

@audio: Here are some tips for faster development.

**Optimization strategies:**

- Use `build:fast` during development @fragment
- Only run full builds for final export @fragment
- Multi-line audio format improves caching @fragment
- Skip images if not needed with `--skip-images` @fragment

---

# Architecture Highlights

@transition: convex
@background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)

@audio: The system uses a clean, modular architecture.

**Pipeline stages:**

1. Linting - Validate markdown format
2. Parsing - Extract slides and directives
3. Images - Generate AI visuals (optional)
4. Audio - Generate TTS narration (cached)
5. HTML - Create interactive RevealJS presentation
6. Timeline - Calculate slide timings
7. Recording - Capture video with Playwright
8. Assembly - Combine video and audio with FFmpeg

---

# Future Possibilities

@audio: Many exciting features are planned for future releases.

**Potential additions:**

- Vertical slides
- Speaker notes view
- Background videos
- Auto-animate transitions
- LaTeX math support
- Code syntax highlighting
- Custom CSS themes

---

# Getting Started

@transition: fade
@audio: Ready to create your own presentation?

**Quick start:**

1. Copy the template: `tutorials/.template/`
2. Edit `presentation.md` with your content
3. Run `TUTORIAL=my-name npm run build:fast`
4. Test and iterate quickly
5. Run full build for final video

Check `docs/LINTING_SPEC.md` for complete reference!

---

# Thank You!

@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@transition: zoom

@audio: Thank you for exploring the RevealJS Tutorial Factory.
@audio: We can't wait to see what you create.
@audio: Happy presenting!

**Built with:**
🎯 TypeScript • 🎨 RevealJS • 🎙️ ElevenLabs • 🤖 Gemini AI

*Now go build something amazing!*
