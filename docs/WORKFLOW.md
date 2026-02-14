# Development Workflow Guide

Complete guide to creating presentations with roughcut.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Production Builds](#production-builds)
- [Tutorial Authoring](#tutorial-authoring)
- [Understanding Build Outputs](#understanding-build-outputs)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Choosing a Starting Point

**Start with `minimal.md`** if you want:
- Bare essentials example
- Quick reference for markdown syntax
- HTML-only output (no audio/video)

**Start with `comprehensive.md`** if you want:
- Complete feature showcase
- All 20 directives demonstrated
- Full production example with audio/video

### Creating Your First Tutorial

```bash
# 1. Copy the template
cp tutorials/.template/script.md tutorials/my-tutorial.md

# 2. Edit your content
vim tutorials/my-tutorial.md

# 3. Test in dev mode (instant feedback)
TUTORIAL=my-tutorial npm run dev

# 4. Generate final output when ready
TUTORIAL=my-tutorial npm run tutorial:full
```

---

## Development Workflow

### Understanding Dev Mode

Dev mode provides **instant feedback** without generating files or costing API credits.

#### Manual Mode

```bash
TUTORIAL=my-tutorial npm run dev
```

**What happens:**
1. Reads your markdown file
2. Generates HTML presentation
3. Launches browser with dev server
4. You control navigation with keyboard/mouse

**Best for:**
- Writing content
- Checking slide layout
- Testing markdown formatting
- Quick iterations

**Controls:**
- `→` / `Space` - Next slide
- `←` - Previous slide
- `Esc` - Overview mode
- `F` - Fullscreen
- `S` - Speaker notes

#### Auto Mode

```bash
TUTORIAL=my-tutorial npm run dev:auto
```

**What happens:**
1. Reads your markdown file
2. Generates HTML presentation
3. Launches browser with automation
4. Watch slides advance automatically

**Best for:**
- Testing timing and transitions
- Debugging fragment reveals
- Verifying audio sync points
- Final preview before building

### Dev Workflow Pattern

**Typical development session:**

```bash
# 1. Start dev mode
TUTORIAL=my-tutorial npm run dev

# 2. Edit markdown (in another terminal/editor)
vim tutorials/my-tutorial.md

# 3. Refresh browser to see changes
# (Cmd+R or F5)

# 4. Repeat until satisfied

# 5. Test auto-advance
TUTORIAL=my-tutorial npm run dev:auto

# 6. Build when ready
TUTORIAL=my-tutorial npm run tutorial:html
```

**Pro tip:** Keep dev mode running and just refresh the browser after making changes!

---

## Production Builds

### Build Modes

Three build modes optimize for different scenarios:

#### HTML Only (Fastest)

```bash
TUTORIAL=my-tutorial npm run tutorial:html
```

**Generates:**
- Interactive HTML presentation
- No video recording
- No audio generation
- No AI image generation

**Use when:**
- ✅ Quick preview needed
- ✅ Only need interactive HTML
- ✅ Deploying presentation to web
- ✅ Testing before full build

**Time:** Seconds

#### Fast Build (Skip AI)

```bash
TUTORIAL=my-tutorial npm run tutorial:fast
```

**Generates:**
- Interactive HTML presentation
- Video recording (with browser automation)
- Uses existing audio/images (no AI calls)

**Use when:**
- ✅ Testing video recording
- ✅ Already have audio/images cached
- ✅ Iterating on timing
- ✅ Avoiding API costs

**Time:** 1-2 minutes (depending on slides)

#### Full Build (Production)

```bash
TUTORIAL=my-tutorial npm run tutorial:full
```

**Generates:**
- Interactive HTML presentation
- AI-generated audio (ElevenLabs TTS)
- AI-generated images (Gemini)
- Video recording with synchronized audio

**Use when:**
- ✅ Final production output
- ✅ First build (no cache)
- ✅ Audio/content changed
- ✅ Ready to spend API credits

**Time:** 2-10 minutes (depending on audio/images)
**Cost:** TTS + image generation API credits

### Build Output Location

All builds output to `tutorials/.<name>/`:

```
tutorials/
└── .my-tutorial/           # Hidden directory
    ├── presentation/
    │   ├── index.html     # Interactive presentation
    │   └── reveal/        # RevealJS assets
    ├── audio/
    │   ├── slide-001.mp3  # Generated TTS
    │   ├── slide-002.mp3
    │   └── manifest.json  # Cache metadata
    ├── images/
    │   └── slide-001.png  # AI-generated images
    ├── video/
    │   └── *.webm         # Recorded frames
    ├── tutorial.mp4       # Final video
    ├── debug.txt          # Detailed logs
    └── build-summary.txt  # User-friendly summary
```

---

## Tutorial Authoring

### Markdown Structure

```markdown
---
title: "My Tutorial Title"
theme: dracula
voice: adam
resolution: 1920x1080
---

# First Slide

@audio: Welcome to my tutorial.
@duration: 5s

Content goes here...

---

# Second Slide

@transition: fade
@audio: This slide fades in.

More content...
```

### Available Directives

See [FEATURES.md](./FEATURES.md) for complete directive reference.

**Most common:**
- `@audio:` - Narration text
- `@duration:` - Slide duration
- `@pause-after:` - Pause before advancing
- `@transition:` - Transition effect
- `@fragment` - Progressive reveal

### Authoring Tips

**1. Write audio first:**
```markdown
# Slide Title

@audio: Start by writing what you want to say.
@audio: This helps structure your content naturally.

Then add bullet points that match your narration:
- Point one (matches first audio line)
- Point two (matches second audio line)
```

**2. Use fragments for pacing:**
```markdown
@audio: Let's reveal these one by one.

- First point @fragment
- Second point @fragment +1s
- Third point @fragment +2s
```

**3. Test timing in dev:auto:**
```bash
# Watch your presentation with automation
TUTORIAL=my-tutorial npm run dev:auto
```

**4. Use caching for iteration:**
```bash
# First build (generates TTS)
TUTORIAL=my-tutorial npm run tutorial:full

# Edit content but keep audio
TUTORIAL=my-tutorial npm run tutorial:fast

# Audio cache = faster iterations!
```

---

## Understanding Build Outputs

### debug.txt

Detailed technical logs:

```
[13:28:20.123] [parsing] Reading minimal.md... (0%)
[13:28:20.234] [parsing] Validating markdown format... (5%)
[13:28:20.345] [parsing] Parsed 5 slides (10%)
[13:28:20.456] [html_generation] Generating HTML... (45%)
...
```

**Use for:**
- Debugging build failures
- Understanding timing issues
- Investigating performance bottlenecks

**Tail in real-time:**
```bash
tail -f tutorials/.my-tutorial/debug.txt
```

### build-summary.txt

User-friendly overview:

```
Build Time: 69.17s
Stage Breakdown:
  Audio: 1.51s (2.2%) - 0 cached, 2 generated
  Video Recording: 67.32s (97.3%) ← SLOWEST
Audio Cache: 0 hits, 2 misses (0.0% hit rate)

💡 Tip: Use --skip-audio for faster iteration
```

**Use for:**
- Understanding build performance
- Optimizing workflow
- Tracking cache efficiency

### Audio Manifest

Tracks TTS cache:

```json
{
  "lines": [
    {
      "text": "Welcome to my tutorial.",
      "hash": "a1b2c3d4...",
      "duration": 2.5,
      "alignment": {...}
    }
  ]
}
```

**Benefits:**
- Incremental TTS generation
- Only regenerate changed lines
- Save API costs on rebuilds

---

## Best Practices

### 1. Use Dev Mode Extensively

```bash
# Dev mode is FREE and FAST
TUTORIAL=my-tutorial npm run dev

# Only build when ready
TUTORIAL=my-tutorial npm run tutorial:full
```

**Why:** Instant feedback without API costs.

### 2. Build HTML Before Full Build

```bash
# Preview without video (fast)
TUTORIAL=my-tutorial npm run tutorial:html

# Check everything looks good

# Then full build
TUTORIAL=my-tutorial npm run tutorial:full
```

**Why:** Catch issues before expensive video recording.

### 3. Leverage Audio Caching

```markdown
# Edit slides but keep audio unchanged
@audio: This audio line stays the same.

# Cache hit = no TTS regeneration!
```

**Why:** Save API costs and time on iterations.

### 4. Test Auto-Advance Early

```bash
# Test timing frequently
TUTORIAL=my-tutorial npm run dev:auto
```

**Why:** Catch timing issues before final build.

### 5. Use Linting

```bash
# Linting runs automatically on build
TUTORIAL=my-tutorial npm run tutorial:html
```

**Why:** Catch errors before expensive operations.

**Common linting errors:**
- Missing frontmatter fields
- Invalid directive syntax
- @fragment on non-list items
- Empty slides

See [LINTING_SPEC.md](./LINTING_SPEC.md) for complete reference.

---

## Troubleshooting

### Dev Mode Issues

**Browser doesn't open:**
```bash
# Check if dev server started
# Look for: "Listening on http://localhost:<port>"

# Manually open URL from logs
```

**Changes not reflecting:**
```bash
# Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

**Audio not playing in dev:auto:**
```bash
# This is expected in fast/html builds
# Audio only plays in full builds with TTS
```

### Build Issues

**TTS API errors:**
```bash
# Check API key in .envrc
echo $ELEVENLABS_API_KEY

# Check account credits at elevenlabs.io
```

**Linting errors:**
```
[ERROR] tutorials/my-tutorial.md:42
  @fragment can only be used on list items
```

**Solution:** Read error message carefully - includes:
- Line number
- Current vs expected value
- Example of correct usage

**Build hangs:**
```bash
# Check for infinite loops in @playwright blocks
# Check video recording isn't stuck

# Kill and restart:
pkill -f "node dist/cli"
```

### Performance Issues

**Builds taking too long:**
```bash
# Use HTML-only for quick previews
TUTORIAL=my-tutorial npm run tutorial:html

# Skip AI for iterations
TUTORIAL=my-tutorial npm run tutorial:fast

# Check build-summary.txt for slowest stage
cat tutorials/.my-tutorial/build-summary.txt
```

**Video recording slow:**
- Video recording is the slowest stage (expected)
- Use `--no-video` flag for HTML-only builds
- Reduce slide count for testing

**TTS generation slow:**
- First build always generates all TTS
- Subsequent builds use cache
- Check cache hit rate in build-summary.txt

---

## Advanced Patterns

### Multi-line Audio Format

**Recommended** for readability and caching:

```markdown
@audio: Let's start with the foundation.
@audio: Modern web applications are built on three pillars.
@audio: First, HTML provides the structure.
@audio: Second, CSS handles the styling.
@audio: Third, JavaScript adds interactivity.
```

**Benefits:**
- One sentence per line
- Better git diffs
- Automatic 1s pauses
- Granular caching

### Fragment Timing Control

```markdown
@audio: Watch these reveal in sequence.

- First (immediate) @fragment
- Second (after 1s) @fragment +1s
- Third (after 2s more) @fragment +2s
- Fourth (after 3s more) @fragment +3s
```

### Vertical Slide Groups

```markdown
# Main Topic

@audio: This is the overview.

@vertical-slide:
## Detail A

@audio: First detail slide.

@vertical-slide:
## Detail B

@audio: Second detail slide.

---

# Next Topic

@audio: Back to horizontal navigation.
```

**Navigation:** ↓/↑ for vertical, ←/→ for horizontal

### Custom Styling

```yaml
---
title: My Presentation
customStyles: |
  .reveal h1 { color: #00ff00; }
  .reveal p { font-size: 1.5em; }
---
```

**Or external file:**
```yaml
---
title: My Presentation
customCSS: styles/custom.css
---
```

---

## Next Steps

1. **Read [FEATURES.md](./FEATURES.md)** - Complete directive reference
2. **Check [LINTING_SPEC.md](./LINTING_SPEC.md)** - Validation rules
3. **Browse [CONFIGURATION.md](./architecture/revealjs/CONFIGURATION.md)** - Config options
4. **Review examples:**
   - `tutorials/minimal.md` - Bare essentials
   - `tutorials/comprehensive.md` - All features

**Questions?** Check the main [README.md](../README.md) or file an issue.
