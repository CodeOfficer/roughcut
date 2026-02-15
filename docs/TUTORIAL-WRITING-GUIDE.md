# Tutorial Writing Guide

## Overview

This guide provides best practices and guidelines for writing presentations using Roughcut. Follow these recommendations to create professional, compatible presentations that render correctly across all screen sizes.

## Table of Contents

1. [File Structure](#file-structure)
2. [Frontmatter Configuration](#frontmatter-configuration)
3. [Content Guidelines](#content-guidelines)
4. [Slide Directives](#slide-directives)
5. [Responsive Design Tips](#responsive-design-tips)
6. [Audio Narration](#audio-narration)
7. [Visual Elements](#visual-elements)
8. [Common Pitfalls](#common-pitfalls)
9. [Example Template](#example-template)

## File Structure

<details>
<summary>Directory layout and key points for organizing presentations</summary>

### Directory Layout
```
my-tutorial/
├── presentation.md     # Main tutorial content (required)
├── screenshot.png      # User-provided images (optional)
├── diagram.svg         # User-provided diagrams (optional)
├── demo-video.mp4      # User-provided videos (optional)
└── .build/            # Build outputs (auto-generated, gitignored)
```

### Key Points
- ✅ Create one directory per tutorial
- ✅ Name your main file `presentation.md`
- ✅ Place all assets (images, videos) alongside presentation.md
- ✅ Assets are automatically copied to `.build/presentation/assets/` during build
- ❌ Don't create nested subdirectories for assets
- ❌ Don't put files in the `.build/` directory manually

</details>

## Frontmatter Configuration

<details>
<summary>YAML frontmatter options: title, theme, voice, resolution, sizing</summary>

Every presentation must start with YAML frontmatter containing metadata:

```yaml
---
title: "Your Presentation Title"
description: "Brief description of the content"
theme: dracula                    # Theme: black, white, league, beige, sky, night, serif, simple, solarized, dracula
voice: J0AK45UHW1Wo9rJ0p4y8       # ElevenLabs voice ID (optional)
resolution: 1920x1080              # Video recording resolution
width: 1200                        # Presentation width in pixels (optional, default: 1200)
height: 900                        # Presentation height in pixels (optional, default: 900)
margin: 0.1                        # Margin factor (optional, default: 0.1 = 10%)
minScale: 0.2                      # Minimum zoom-out scale (optional, default: 0.2)
maxScale: 1.5                      # Maximum zoom-in scale (optional, default: 1.5)
---
```

### Frontmatter Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | **Required** | Presentation title |
| `description` | string | "" | Brief description |
| `theme` | string | "black" | RevealJS theme name |
| `voice` | string | "adam" | ElevenLabs voice ID |
| `resolution` | string | "1920x1080" | Video output resolution |
| `width` | number | 1200 | Presentation width (pixels) |
| `height` | number | 900 | Presentation height (pixels) |
| `margin` | number | 0.1 | Margin around content (0.1 = 10%) |
| `minScale` | number | 0.2 | Minimum auto-scale factor |
| `maxScale` | number | 1.5 | Maximum auto-scale factor |

### Responsive Sizing Explained

The system uses **automatic scaling** to fit your slides on any screen size:

- **width × height**: The "logical" size of your slide canvas
- **margin**: Empty space around content (0.1 = 10% margins on all sides)
- **minScale**: How small content can shrink (0.2 = down to 20% of original size)
- **maxScale**: How large content can grow (1.5 = up to 150% of original size)

**For most tutorials:** The defaults (1200×900, 10% margin) work well. Only adjust if you have specific needs.

</details>

## Content Guidelines

<details>
<summary>Slide separators, heading hierarchy, text limits, content fitting</summary>

### Slide Separators

Use `---` (three hyphens) to separate slides:

```markdown
# First Slide

Content here

---

# Second Slide

More content
```

### Heading Hierarchy

- Use **one H1** (`#`) per slide as the title
- Use **H2-H4** (`##`, `###`, `####`) for subsections
- Avoid H5-H6 (too small, poor readability)

```markdown
# Main Title

## Section Heading

### Subsection

Regular paragraph text
```

### Text Length

**Keep text concise!** Slides are not documents.

| Element | Recommended Max | Absolute Max |
|---------|----------------|--------------|
| Slide title | 8 words | 12 words |
| Bullet point | 10 words | 15 words |
| Bullets per slide | 5 items | 7 items |
| Body paragraph | 2-3 sentences | 4 sentences |

**Example of good slide:**
```markdown
# Key Principles

- Keep text short and focused
- One idea per slide
- Use visuals when possible
- Break complex topics into multiple slides
```

**Example of bad slide:**
```markdown
# Everything You Need to Know About Our Complex Multi-Step Process

This slide contains way too much text. When you try to explain everything on one slide, you overwhelm your audience and they can't focus on what's important. Instead, you should break this into multiple slides, each covering one specific aspect of the topic in detail with supporting visuals and clear examples that illustrate the concept without requiring paragraphs of explanation.

- First bullet point that goes on for way too long explaining multiple concepts
- Second bullet that also contains too much information about various topics
- Third bullet discussing unrelated things
- Fourth bullet with even more details
- Fifth, sixth, seventh bullets...
```

### Content Fitting Strategy

If your content doesn't fit on one slide:

1. **Split into multiple slides** (preferred)
2. **Use fragments** to reveal content progressively
3. **Reduce font size** with custom CSS (last resort)
4. **Adjust sizing** in frontmatter (`width`, `margin`)

</details>

## Slide Directives

<details>
<summary>Core, visual, layout, fragment, and notes directives</summary>

Directives are special `@directive:` commands that control slide behavior.

### Core Directives

#### `@duration:`
How long to display the slide (if no audio).

```markdown
# Welcome

@duration: 5s

This slide will show for 5 seconds.
```

#### `@pause-after:`
Pause time after slide content/audio completes.

```markdown
# Key Point

@pause-after: 2s

Important message here.
```

#### `@audio:`
Narration text (converted to speech with ElevenLabs).

```markdown
# Introduction

@audio: Welcome to this tutorial. Today we'll learn about building presentations.
```

**Multi-line audio format:**
```markdown
@audio:
  Welcome to this tutorial.
  [1s]
  Today we'll learn about building presentations.
  [pause 2s]
  Let's get started!
```

### Visual Directives

#### `@background:`
Set slide background (color, gradient, or image URL).

```markdown
# Colorful Slide

@background: #ff0000
```

```markdown
# Gradient Background

@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

```markdown
# Image Background

@background: ./my-image.png
```

#### `@background-video:`
Video background (Phase 3 feature).

```markdown
# Video Demo

@background-video: ./demo.mp4
@background-video-loop: true
@background-video-muted: true
```

#### `@image-prompt:`
Generate AI image with Gemini (optional).

```markdown
# AI-Generated Background

@image-prompt: A futuristic cityscape at sunset with flying cars and neon lights. Cyberpunk aesthetic.
```

### Layout Directives

#### `@transition:`
Transition effect between slides.

```markdown
@transition: fade
```

Options: `none`, `fade`, `slide`, `convex`, `concave`, `zoom`

#### `@vertical-slide:`
Create vertical slide navigation.

```markdown
# Main Topic

Overview of the topic

@vertical-slide:

## Detail 1

First detail

@vertical-slide:

## Detail 2

Second detail
```

### Fragment Directives

Fragments reveal content progressively (one item at a time).

```markdown
# Progressive Reveal

- First point @fragment
- Second point @fragment
- Third point @fragment
```

### Notes

Speaker notes (visible in presenter mode, not in main presentation).

```markdown
# Public Content

@notes: Remember to emphasize this point. Mention the example from last week.
```

</details>

## Responsive Design Tips

<details>
<summary>Dimensions, margins, scaling, and content strategies</summary>

### 1. Choose Appropriate Dimensions

**Default (1200×900)**: Best for most content
- Wide enough for code examples
- Tall enough for bullet lists
- Works across screen sizes

**Wider (1400×1000)**: For dense content
- More horizontal space for tables
- Better for side-by-side comparisons
- Use if comprehensive tutorial has overflow

**Narrower (960×700)**: For minimal content
- Forces conciseness
- Better for mobile viewing
- Use for image-heavy slides

### 2. Use Margins Wisely

```yaml
margin: 0.1   # Standard (10% margins)
margin: 0.15  # More breathing room (15% margins)
margin: 0.05  # Tight layout (5% margins)
```

**Higher margins:**
- ✅ Cleaner appearance
- ✅ Less crowding
- ❌ Less space for content

**Lower margins:**
- ✅ More content space
- ❌ Feels cramped
- ❌ Content closer to edges

### 3. Test Scaling Bounds

```yaml
minScale: 0.2   # Allow aggressive zoom-out (default)
minScale: 0.3   # Less zoom-out (content stays larger)

maxScale: 1.5   # Allow moderate zoom-in (default)
maxScale: 2.0   # More zoom-in (content can grow larger)
```

**When to adjust:**
- **Increase minScale** if text becomes unreadable when shrunk
- **Decrease minScale** if content overflows on small screens
- **Adjust maxScale** for large displays (conference rooms, TVs)

### 4. Content Strategies

**For Text-Heavy Slides:**
- Use smaller headings (H2 instead of H1)
- Increase `width` to 1400px
- Split into multiple slides
- Use fragments to reveal progressively

**For Image-Heavy Slides:**
- Images auto-scale to 95% of slide
- Use `@background:` for full-screen images
- Combine images with minimal text

**For Code Examples:**
- Use wider presentations (1400px+)
- Keep code snippets short (<15 lines)
- Use syntax highlighting (automatic)
- Consider splitting long examples

</details>

## Audio Narration

<details>
<summary>Basic audio, multi-line format, voice selection, caching</summary>

### Basic Audio

```markdown
@audio: This is the narration text that will be spoken.
```

### Multi-Line Audio with Pauses

```markdown
@audio:
  Welcome to the tutorial.
  [1s]
  Today we'll cover three key topics.
  [pause 2s]
  Let's begin with the first one.
```

**Pause syntax:**
- `[1s]` or `[pause 1s]`: 1-second pause
- `[500ms]` or `[pause 500ms]`: 500-millisecond pause

### Voice Selection

List available voices:
```bash
roughcut voices
```

Set voice globally (in frontmatter):
```yaml
voice: J0AK45UHW1Wo9rJ0p4y8
```

### Audio Caching

- Audio files are **cached by content hash**
- Changing audio text regenerates speech
- Changing voice regenerates speech
- Reusing identical text reuses cached audio (saves TTS costs!)

</details>

## Visual Elements

<details>
<summary>Images, videos, and AI-generated visuals</summary>

### Images

Place images alongside `presentation.md`:
```
my-tutorial/
├── presentation.md
├── screenshot.png
└── diagram.svg
```

Reference them:
```markdown
# My Slide

@background: ./screenshot.png
```

Or use inline:
```markdown
![Diagram](./diagram.svg)
```

### Videos

Same process as images:
```markdown
# Demo

@background-video: ./demo.mp4
@background-video-loop: true
@background-video-muted: true
```

### AI-Generated Images

```markdown
@image-prompt: A professional office environment with a team collaborating around a whiteboard. Modern, bright lighting, diverse team.
```

**Tips:**
- Be specific about style and mood
- Mention key visual elements
- Specify composition (close-up, wide shot, etc.)
- Use descriptive adjectives

</details>

## Common Pitfalls

<details>
<summary>Content overflow, unreadable text, inconsistent audio, missing assets, slow builds</summary>

### ❌ Content Overflow

**Problem:** Text spills off the slide

**Causes:**
- Too much text on one slide
- Long code examples
- Large tables
- Narrow slide dimensions

**Solutions:**
1. Split into multiple slides
2. Increase `width` in frontmatter
3. Reduce text/code length
4. Use fragments for progressive reveal

### ❌ Unreadable Text

**Problem:** Text is too small to read

**Causes:**
- Too much content forcing scaling down
- Small font in code examples
- Low `minScale` setting

**Solutions:**
1. Reduce content per slide
2. Increase `minScale` to 0.3 or higher
3. Split complex slides

### ❌ Inconsistent Audio

**Problem:** Audio doesn't match slide content

**Causes:**
- Forgot to update audio after editing slide
- Audio cached from old version

**Solutions:**
1. Update `@audio:` directive when changing content
2. Build with `roughcut build --full` to regenerate all audio

### ❌ Missing Assets

**Problem:** Images/videos don't appear

**Causes:**
- Assets not in tutorial directory
- Wrong file path in directive
- Assets in subdirectories

**Solutions:**
1. Place assets in same directory as `presentation.md`
2. Use relative paths: `./filename.ext`
3. Avoid subdirectories (assets aren't copied recursively)

### ❌ Slow Builds

**Problem:** Build takes too long

**Causes:**
- Regenerating all audio (TTS API calls)
- Generating many AI images
- Recording long videos

**Solutions:**
1. Use `roughcut build` for quick HTML-only builds
2. Use `roughcut build --full` only for final builds
3. Audio is cached - subsequent builds are faster

</details>

## Example Template

<details>
<summary>Complete Docker tutorial example demonstrating best practices</summary>

Here's a complete example demonstrating best practices:

```markdown
---
title: "Getting Started with Docker"
description: "Learn Docker basics in 10 minutes"
theme: dracula
voice: J0AK45UHW1Wo9rJ0p4y8
resolution: 1920x1080
---

# Getting Started with Docker

@duration: 5s
@pause-after: 2s
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@audio: Welcome to this Docker tutorial. In the next 10 minutes, you'll learn everything you need to get started with containers.

---

# What is Docker?

@duration: 8s
@pause-after: 2s

- Containerization platform @fragment
- Packages apps with dependencies @fragment
- Runs consistently everywhere @fragment

@audio:
  Docker is a containerization platform.
  [1s]
  It packages your application with all its dependencies.
  [pause 1s]
  This ensures your app runs the same way everywhere.

@notes: Emphasize the consistency benefit - no more "works on my machine" problems.

---

# Docker Architecture

@background: ./docker-architecture.png
@duration: 10s
@audio: Docker uses a client-server architecture. The Docker client talks to the Docker daemon, which builds, runs, and manages your containers.

---

# Your First Container

@duration: 12s
@pause-after: 3s

```bash
# Pull an image
docker pull nginx

# Run a container
docker run -p 80:80 nginx
```

@audio:
  Let's run your first container.
  [1s]
  First, we pull the nginx image from Docker Hub.
  [pause 2s]
  Then we run it, mapping port 80 to your local machine.

---

# Key Takeaways

- Docker simplifies deployment @fragment
- Containers are lightweight and fast @fragment
- Start with official images @fragment
- Practice with simple examples @fragment

@duration: 10s
@pause-after: 2s
@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@audio: You now understand Docker basics. Start with official images and practice with simple examples to build your skills.

@image-prompt: A celebratory completion screen with "Docker Mastered!" text and container icons. Modern, tech-focused design with blue and green accents.
```

</details>

## Build Commands Reference

<details>
<summary>roughcut build, roughcut build --full, roughcut dev, roughcut dev --auto</summary>

```bash
# HTML only (fast, no API keys needed)
roughcut build

# Full build (TTS + AI images + video) - costs API credits!
roughcut build --full

# Development mode (preview in browser)
roughcut dev

# Auto-advance mode (like video recording but visible)
roughcut dev --auto
```

</details>

## Additional Resources

- [README.md](../README.md) - Setup and installation
- [CLAUDE.md](../CLAUDE.md) - System architecture and workflow
- [RevealJS Documentation](https://revealjs.com/) - RevealJS features
- [examples/](../examples/) - Example presentations

## Summary Checklist

Before building your tutorial, verify:

- ✅ File is `<name>/presentation.md`
- ✅ Frontmatter includes `title` and `description`
- ✅ Each slide has a clear, concise title
- ✅ Text is minimal (5 bullets max, 10 words each)
- ✅ Audio narration matches slide content
- ✅ Assets are in same directory as presentation.md
- ✅ Asset paths use relative format (`./filename.ext`)
- ✅ Content fits viewport (test with `roughcut dev`)
- ✅ Tested HTML output before generating video

**Questions?** Check the [README](../README.md) or examine the `comprehensive` tutorial for examples of all features.
