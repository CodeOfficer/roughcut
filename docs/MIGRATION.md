# Migration Guide: Original Format to RevealJS Format

## Overview

Version 2.0.0 of GenAI Tutorial Factory transitioned from a video-only system to a RevealJS-based system that produces both interactive HTML presentations and videos. This guide helps you convert tutorials written in the original format to the new RevealJS format.

## Why Migrate?

**New Benefits:**
- Interactive HTML presentations with navigation
- Better slide organization and structure
- Modern RevealJS themes and transitions
- Dual outputs: HTML + video from single build
- More flexible timing control
- Built-in speaker notes support (press 'S' in browser)

**System Improvements:**
- 48% smaller codebase (~6,000 lines removed)
- Eliminated 680 lines of duplicate code
- Single unified architecture
- Easier to maintain and extend

---

## Key Differences

### Old Format (Deprecated v1.x)

```markdown
# Tutorial Title

## Introduction
> Duration: 5s
> Screenshot: manual

[NARRATION]
Welcome to my tutorial! Today we'll learn something amazing.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
File: screenshots/001-intro.png
Description: Title screen with tutorial topic
[/SCREENSHOT_INSTRUCTIONS]

---

## Step 1: Setup
> Duration: 10s
> Screenshot: auto

[NARRATION]
Let's start by opening the terminal and running our setup command.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: VS Code with integrated terminal
Action: Type "npm install"
Wait: 2s
[/SCREENSHOT_INSTRUCTIONS]
```

**Characteristics:**
- `[NARRATION]...[/NARRATION]` blocks
- `[SCREENSHOT_INSTRUCTIONS]...[/SCREENSHOT_INSTRUCTIONS]` blocks
- `> Duration:` and `> Screenshot:` metadata
- `---` separates segments
- Screenshots/images were primary visual content
- Single output: video file only

### New Format (Current v2.x)

```markdown
---
title: Tutorial Title
description: Brief description
theme: black
---

# Introduction
@audio: Welcome to my tutorial! Today we'll learn something amazing.
@duration: 5s
@pause-after: 2s

---

# Step 1: Setup
@audio: Let's start by opening the terminal and running our setup command.
@duration: 10s
@pause-after: 2s

@playwright:
- Action: Open terminal
- Type: "npm install"
- Wait 2s
```

**Characteristics:**
- YAML front matter for metadata
- `@audio:` directive for narration (no closing tag)
- `@playwright:` directive for browser automation
- `@duration:` and `@pause-after:` for timing
- `---` separates slides (RevealJS horizontal slides)
- Content rendered as slides in presentation
- Dual outputs: interactive HTML + video

---

## Step-by-Step Conversion

### Step 1: Add Front Matter

Add YAML front matter at the very top of your file:

```markdown
---
title: Your Tutorial Title
description: Brief description of what this teaches
theme: black
transition: slide
---
```

**Available themes:** black, white, league, beige, sky, night, serif, simple, solarized, moon

**Available transitions:** none, fade, slide, convex, concave, zoom

### Step 2: Convert Narration Blocks

**Old syntax:**
```markdown
[NARRATION]
This is the narration text for the segment.
[/NARRATION]
```

**New syntax:**
```markdown
@audio: This is the narration text for the slide.
```

**Key changes:**
- Remove opening `[NARRATION]` and closing `[/NARRATION]` tags
- Replace with single `@audio:` directive
- Rest of line (and continuation lines) is the audio text
- Place `@audio:` directive anywhere in the slide (typically at top or bottom)

### Step 3: Convert Metadata

**Old syntax:**
```markdown
> Duration: 10s
> Screenshot: manual
```

**New syntax:**
```markdown
@duration: 10s
@pause-after: 2s
```

**Key changes:**
- `> Duration:` becomes `@duration:`
- Add `@pause-after:` to give viewers time to read slide after audio
- Remove `> Screenshot:` (no longer needed - slides are the visual content)

### Step 4: Convert Segments to Slides

Each segment becomes a slide. The slide delimiter `---` remains the same.

**Old:**
```markdown
## Segment Title
> Duration: 5s
> Screenshot: manual

[NARRATION]
Narration here
[/NARRATION]
```

**New:**
```markdown
# Slide Title
@audio: Narration here
@duration: 5s
@pause-after: 2s
```

**Key changes:**
- `##` becomes `#` (slides use single # for titles)
- Narration becomes `@audio:` directive
- Add `@pause-after:` for viewer reading time

### Step 5: Convert Screenshot Instructions to Playwright

**Old syntax:**
```markdown
[SCREENSHOT_INSTRUCTIONS]
Show: VS Code window
Action: Type "npm install"
Wait: 2s
[/SCREENSHOT_INSTRUCTIONS]
```

**New syntax:**
```markdown
@playwright:
- Action: Open VS Code
- Type: "npm install"
- Wait 2s
```

**Key changes:**
- `[SCREENSHOT_INSTRUCTIONS]` becomes `@playwright:`
- Each instruction becomes a list item with `-`
- Simplify syntax: `Action:`, `Type:`, `Wait`, `Click:`, etc.
- No closing tag needed

**Note:** If the old format had `> Screenshot: manual` with a file reference, you'll need to embed that image in the slide content or use a background:

```markdown
# Slide Title
@background: url(path/to/image.png)

@audio: Your narration
```

### Step 6: Add Slide Content

In the old format, visual content was primarily screenshots. In the new format, slides can have rich markdown content.

**Add content to slides:**
```markdown
# Step 1: Setup
@audio: Let's install the dependencies for our project.
@duration: 8s
@pause-after: 2s

Run the following command:

\`\`\`bash
npm install
\`\`\`

This will:
- Install all required packages
- Create node_modules directory
- Generate package-lock.json
```

### Step 7: Update Slide Delimiters

The slide delimiter `---` remains the same, but ensure it has blank lines before and after:

```markdown
# First Slide
Content here

---

# Second Slide
Content here
```

---

## Complete Example Conversion

### Before (Old Format)

```markdown
# Git Basics Tutorial

## Introduction
> Duration: 5s
> Screenshot: manual

[NARRATION]
Welcome to this tutorial on Git basics.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
File: screenshots/001-title.png
Description: Title slide with Git logo
[/SCREENSHOT_INSTRUCTIONS]

---

## Installing Git
> Duration: 10s
> Screenshot: auto

[NARRATION]
Let's start by installing Git on your system. Open your terminal and run the installation command.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: Terminal window
Action: Type "brew install git"
Wait: 2s
[/SCREENSHOT_INSTRUCTIONS]

---

## Verify Installation
> Duration: 8s
> Screenshot: auto

[NARRATION]
To verify Git is installed, run git version in your terminal.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: Terminal window
Action: Type "git --version"
Wait: 1s
[/SCREENSHOT_INSTRUCTIONS]
```

### After (New Format)

```markdown
---
title: Git Basics Tutorial
description: Learn the fundamentals of Git version control
theme: black
transition: slide
---

# Git Basics
@audio: Welcome to this tutorial on Git basics.
@duration: 5s
@pause-after: 2s
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

Learn version control fundamentals

---

# Installing Git
@audio: Let's start by installing Git on your system. Open your terminal and run the installation command.
@duration: 10s
@pause-after: 2s

Installation on macOS:

\`\`\`bash
brew install git
\`\`\`

@playwright:
- Action: Open terminal
- Type: "brew install git"
- Wait 2s

---

# Verify Installation
@audio: To verify Git is installed, run git version in your terminal.
@duration: 8s
@pause-after: 2s

Check your installation:

\`\`\`bash
git --version
\`\`\`

Expected output: `git version 2.x.x`

@playwright:
- Type: "git --version"
- Press: Enter
- Wait 1s
```

---

## Migration Checklist

Use this checklist when converting each tutorial:

- [ ] Add YAML front matter with title, description, theme
- [ ] Convert all `[NARRATION]...[/NARRATION]` to `@audio:`
- [ ] Convert all `> Duration:` to `@duration:`
- [ ] Add `@pause-after:` directives (typically 1-3 seconds)
- [ ] Convert `[SCREENSHOT_INSTRUCTIONS]` to `@playwright:` blocks
- [ ] Change `##` headers to `#` headers for slide titles
- [ ] Add markdown content to slides (code blocks, lists, etc.)
- [ ] Remove `> Screenshot:` metadata lines
- [ ] Ensure `---` delimiters have blank lines around them
- [ ] Test build with `npm run tutorial:build your-file.md`
- [ ] Verify HTML output at `output/presentation/index.html`
- [ ] Verify video output at `output/tutorial.mp4`

---

## Common Patterns

### Pattern 1: Static Title Slide

**Old:**
```markdown
## Welcome
> Duration: 3s
> Screenshot: manual

[NARRATION]
Welcome to the tutorial.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
File: screenshots/title.png
[/SCREENSHOT_INSTRUCTIONS]
```

**New:**
```markdown
# Welcome
@audio: Welcome to the tutorial.
@duration: 3s
@pause-after: 1s
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

## Tutorial Title
### Subtitle here
```

### Pattern 2: Code Demo

**Old:**
```markdown
## Writing Code
> Duration: 15s
> Screenshot: auto

[NARRATION]
Let's write a function that adds two numbers.
[/NARRATION]

[SCREENSHOT_INSTRUCTIONS]
Show: VS Code editor
Action: Type function code
Wait: 5s
[/SCREENSHOT_INSTRUCTIONS]
```

**New:**
```markdown
# Writing Code
@audio: Let's write a function that adds two numbers.
@duration: 15s
@pause-after: 3s

\`\`\`javascript
function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // 5
\`\`\`

@playwright:
- Action: Open VS Code
- Type: "function add(a, b) { return a + b; }"
- Wait 5s
```

### Pattern 3: Step-by-Step Reveal

**Old:** (Not directly supported)

**New:**
```markdown
# Process Steps
@audio: Here are the three main steps of the process.
@duration: 12s
@pause-after: 2s

1. First step @fragment
2. Second step @fragment
3. Third step @fragment

Each step will appear one at a time.
```

### Pattern 4: Inline Audio Pauses

**Old:** (Not supported)

**New:**
```markdown
# Complex Narration
@audio: First point here [2s] then a pause [1s] then continue talking.
@duration: 10s
@pause-after: 2s
```

Use `[2s]` for inline pauses in narration.

---

## Updated CLI Commands

### Old Commands (No Longer Available)

```bash
npm run tutorial:create {name}       # Removed
npm run tutorial:narrate {name}      # Removed
npm run tutorial:screenshots {name}  # Removed
npm run tutorial:full {name}         # Removed
npm run tutorial:clean {name}        # Removed
```

### New Commands (v2.x)

```bash
# Build everything (HTML + video)
npm run tutorial:build your-file.md

# Build HTML only, reuse existing audio
npm run tutorial:build your-file.md --skip-audio

# Build HTML only, skip video recording
npm run tutorial:build your-file.md --skip-video
```

---

## Output Changes

### Old Output Structure

```
tutorials/{name}/
├── config.json
├── script.md
├── audio/
│   ├── 001-segment.mp3
│   ├── 002-segment.mp3
├── screenshots/
│   ├── 001-image.png
│   ├── 002-image.png
└── output/
    └── tutorial.mp4
```

### New Output Structure

```
output/
├── presentation/
│   └── index.html          # Interactive HTML
├── audio/
│   ├── slide-001.mp3
│   ├── slide-002.mp3
├── video/
│   └── recording.webm
└── tutorial.mp4            # Final video
```

**Key changes:**
- No more `config.json` (configuration in markdown front matter)
- Output in single `output/` directory
- Interactive HTML presentation at `output/presentation/index.html`
- Video still at `output/tutorial.mp4`

---

## Troubleshooting Migration

### Issue: Missing Audio

**Problem:** `@audio:` directive not generating audio

**Solution:**
- Ensure `@audio:` is at the start of a line
- Check ELEVENLABS_API_KEY is set in `.envrc`
- Verify no extra characters before `@audio:`

### Issue: Slides Not Separating

**Problem:** Multiple slides appearing as one

**Solution:**
- Ensure `---` delimiter has blank lines before and after
- Check no spaces after `---`

```markdown
Content of first slide

---

Content of second slide
```

### Issue: Playwright Instructions Not Running

**Problem:** `@playwright:` block not executing

**Solution:**
- Ensure proper list formatting with `-` prefix
- Check each instruction has valid syntax
- Verify no build flag `--skip-video` is used

### Issue: Front Matter Not Parsed

**Problem:** Front matter showing as content

**Solution:**
- Ensure `---` delimiters for front matter at very start of file
- No blank lines before first `---`
- Proper YAML syntax (no tabs, proper indentation)

```markdown
---
title: Tutorial Title
---

# First Slide
```

---

## Benefits of New System

1. **Richer Content**: Slides support full markdown including code blocks, lists, images, tables
2. **Interactive Viewing**: HTML presentations can be navigated manually, shared online
3. **Better Organization**: Slides provide clearer structure than sequential screenshots
4. **Modern Styling**: RevealJS themes provide professional appearance
5. **Speaker Notes**: Add notes visible only in presenter mode (press 'S')
6. **Fragment Animations**: Step-by-step reveals within slides using `@fragment`
7. **Custom Backgrounds**: Per-slide background colors, gradients, or images
8. **Transitions**: Smooth animations between slides
9. **Simpler Syntax**: `@directive:` format is cleaner than block tags
10. **Dual Outputs**: Get both interactive HTML and video from one build

---

## Getting Help

- **Format Examples**: See `tutorials/demo/presentation.md` for comprehensive examples
- **Architecture**: See `CLAUDE.md` for system overview
- **Decisions**: See `docs/architecture/revealjs/DECISIONS.md` for design rationale
- **Format Spec**: See `docs/architecture/revealjs/format-option-3-minimalist.md`
- **RevealJS Docs**: https://revealjs.com/ for advanced features

---

## Quick Reference

### Syntax Comparison Table

| Feature | Old Format | New Format |
|---------|-----------|-----------|
| Narration | `[NARRATION]...[/NARRATION]` | `@audio: text` |
| Duration | `> Duration: 5s` | `@duration: 5s` |
| Timing | N/A | `@pause-after: 2s` |
| Screenshot mode | `> Screenshot: auto` | N/A (use `@playwright:`) |
| Automation | `[SCREENSHOT_INSTRUCTIONS]` | `@playwright:` |
| Slide separator | `---` | `---` (same) |
| Metadata | N/A | Front matter `---\ntitle: T\n---` |
| Fragment reveal | N/A | `@fragment` |
| Background | N/A | `@background: color` |
| Transition | N/A | `@transition: fade` |

---

## Version History

- **v1.x**: Original system with video-only output
- **v2.0.0**: RevealJS-based system with HTML + video output (current)

---

*Last updated: 2025-11-11*
