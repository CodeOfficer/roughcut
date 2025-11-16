# Features & Directives Reference

Complete reference for all 20 supported directives in the GenAI Tutorial Factory.

## Table of Contents

- [Frontmatter Directives](#frontmatter-directives)
- [Slide-Level Directives](#slide-level-directives)
- [Inline Directives](#inline-directives)
- [Common Patterns](#common-patterns)
- [Advanced Features](#advanced-features)

---

## Frontmatter Directives

Frontmatter appears at the top of your markdown file and configures the entire presentation.

### title (required)

**Purpose:** Set the presentation title

```yaml
---
title: "My Amazing Presentation"
---
```

**Notes:**
- Required field
- Shown in browser tab
- Used in metadata

### theme (required)

**Purpose:** Choose RevealJS theme

```yaml
---
theme: dracula
---
```

**Available themes:**
- `black` - Dark background
- `white` - Light background
- `league` - Gray background
- `beige` - Warm beige
- `sky` - Blue gradient
- `night` - Dark purple/blue
- `serif` - Serif fonts
- `simple` - Minimal white
- `solarized` - Solarized colors
- `moon` - Blue-gray
- `dracula` - Dracula theme (popular!)

**Default:** `black`

### voice

**Purpose:** Set ElevenLabs voice for narration

```yaml
---
voice: adam
---
```

**Finding voices:**
```bash
npm run voices
```

**Common voices:**
- `adam` - Deep male voice
- `Antoni` - Well-rounded male
- `Arnold` - Crisp male voice
- `Bella` - Soft female voice
- `Elli` - Emotional female voice

**Default:** Uses `ELEVENLABS_VOICE_ID` from `.envrc`

### resolution

**Purpose:** Set video output resolution

```yaml
---
resolution: 1920x1080
---
```

**Common resolutions:**
- `1920x1080` - Full HD (default)
- `1280x720` - HD
- `3840x2160` - 4K
- `2560x1440` - 2K

**Default:** `1920x1080`

### preset

**Purpose:** Apply configuration presets for common scenarios

```yaml
---
preset: manual-presentation
---
```

**Available presets:**
- `video-recording` - Optimized for video production (default)
- `manual-presentation` - Interactive presentations with controls
- `auto-demo` - Automated demos with smooth navigation
- `speaker-mode` - Presentations with speaker notes

**Details:** See [CONFIGURATION.md](./architecture/revealjs/CONFIGURATION.md)

### config

**Purpose:** Fine-tune RevealJS configuration (60+ options)

```yaml
---
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  center: false
  transition: fade
  transitionSpeed: default
---
```

**Common options:**
- `controls` - Show navigation arrows
- `progress` - Show progress bar
- `slideNumber` - Slide numbers format
- `center` - Vertically center slides
- `transition` - Default transition effect
- `transitionSpeed` - Transition speed
- `viewDistance` - Preload nearby slides

**Full list:** See [CONFIGURATION.md](./architecture/revealjs/CONFIGURATION.md)

### customCSS

**Purpose:** Link external CSS file

```yaml
---
customCSS: styles/custom.css
---
```

**Use when:**
- Extensive custom styling needed
- Reusing styles across presentations
- Separating concerns

### customStyles

**Purpose:** Inline CSS styles

```yaml
---
customStyles: |
  .reveal h1 {
    color: #00ff00;
    font-size: 3em;
  }
  .reveal p {
    font-size: 1.5em;
  }
---
```

**Use when:**
- Quick styling tweaks
- Presentation-specific styles
- No external file needed

---

## Slide-Level Directives

These directives apply to individual slides.

### @audio:

**Purpose:** Add AI-generated narration to slides

**Single-line format:**
```markdown
@audio: Welcome to my presentation. [1s] Let's get started.
```

**Multi-line format** (recommended):
```markdown
@audio: Welcome to my presentation.
@audio: This is the second sentence.
@audio: And here's the third.
```

**Pause markers:**
- `[1s]` - 1 second pause
- `[2.5s]` - 2.5 second pause
- Multi-line automatically adds 1s between lines

**Benefits of multi-line:**
- ✅ Better readability
- ✅ Cleaner git diffs
- ✅ Granular TTS caching
- ✅ One sentence per line

**Example:**
```markdown
# Introduction

@audio: Welcome everyone.
@audio: Today we'll learn about web development.
@audio: Let's start with the basics.

This is the slide content...
```

### @duration:

**Purpose:** Set expected slide duration

```markdown
@duration: 5s
```

**Format:** Number followed by `s` (seconds)

**Use when:**
- You want explicit timing control
- Timeline calculations needed
- Video pacing matters

**Note:** With audio, duration is calculated from TTS length

### @pause-after:

**Purpose:** Add pause before advancing to next slide

```markdown
@pause-after: 2s
```

**Format:** Number followed by `s` (seconds)

**Use when:**
- Giving viewers time to read
- Emphasizing important slides
- Creating dramatic pauses

**Example:**
```markdown
# Important Announcement

@audio: Pay close attention to this slide.
@pause-after: 3s

**Critical information here**
```

### @transition:

**Purpose:** Set transition effect for slide

```markdown
@transition: fade
```

**Available transitions:**
- `none` - No transition
- `fade` - Cross fade (smooth)
- `slide` - Slide horizontally
- `convex` - 3D convex perspective
- `concave` - 3D concave perspective
- `zoom` - Scale up

**Default:** Set by theme or `config.transition`

**Example:**
```markdown
# Dramatic Entrance

@transition: zoom

Content zooms in!
```

### @background:

**Purpose:** Set slide background

**Solid colors:**
```markdown
@background: #1a1a2e
@background: rgb(30, 30, 46)
@background: black
```

**Gradients:**
```markdown
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@background: radial-gradient(circle, #1e3c72, #2a5298)
```

**Images:**
```markdown
@background: https://example.com/image.jpg
```

**Use when:**
- Emphasizing sections
- Creating visual interest
- Branding slides

### @image-prompt:

**Purpose:** Generate AI images with Gemini

```markdown
@image-prompt: A futuristic cityscape with neon lights and flying cars
```

**Requirements:**
- Gemini API key configured
- Clear, descriptive prompts

**Example:**
```markdown
# Future of Transportation

@image-prompt: A futuristic holographic car dashboard with augmented reality displays, cyberpunk aesthetic

Self-driving vehicles will revolutionize travel...
```

**Costs:** Gemini image generation API credits

### @notes:

**Purpose:** Speaker notes (not visible in presentation)

```markdown
@notes: Remember to mention the quarterly results here
```

**Use when:**
- Adding presenter reminders
- Including additional context
- Planning speaking points

**Viewing notes:**
- Press `S` during presentation
- Opens speaker view in new window

### @playwright:

**Purpose:** Browser automation instructions (advanced)

```markdown
@playwright:
- Click: #submit-button
- Wait: 2s
- Type: "Hello World"
- Screenshot: result.png
```

**Use when:**
- Demonstrating web interactions
- Recording live demos
- Complex automation needed

**Note:** Advanced feature - see template for examples

### @vertical-slide:

**Purpose:** Create vertical slide groups for 2D navigation

```markdown
# Main Topic

Content...

@vertical-slide:
## Sub-topic A

Details...

@vertical-slide:
## Sub-topic B

More details...

---

# Next Main Topic
```

**Navigation:**
- `→` / `←` - Horizontal (main topics)
- `↓` / `↑` - Vertical (sub-topics)

**Use when:**
- Organizing hierarchical content
- Creating topic deep-dives
- Grouping related slides

### @background-video:

**Purpose:** Video background for slides

```markdown
@background-video: videos/loop.mp4
@background-video-loop: true
@background-video-muted: true
```

**Options:**
- `@background-video:` - Video file path
- `@background-video-loop:` - Loop playback (true/false)
- `@background-video-muted:` - Mute audio (true/false)

**Use when:**
- Dynamic backgrounds
- Ambient visuals
- Video-based content

**File formats:** MP4, WebM

---

## Inline Directives

These directives are used inline within slide content.

### @fragment

**Purpose:** Progressive reveal of content

**Basic usage:**
```markdown
- First point @fragment
- Second point @fragment
- Third point @fragment
```

**With timing:**
```markdown
- Immediate @fragment
- After 1s @fragment +1s
- After 2s more @fragment +2s
- After 3s more @fragment +3s
```

**Rules:**
- ✅ Must be on list items (bullets or dashes)
- ❌ Cannot be on numbered lists
- ❌ Cannot be on regular paragraphs

**Example:**
```markdown
# Key Takeaways

@audio: Let's review the main points.

Important concepts:

- Understanding the basics @fragment
- Applying the principles @fragment +1s
- Mastering the technique @fragment +2s
```

---

## Common Patterns

### Slide with Audio and Fragments

```markdown
# Progressive Reveal

@audio: Let me show you these one by one.
@audio: First, we have the foundation.
@audio: Second, the implementation.
@audio: And finally, the results.

- Foundation @fragment
- Implementation @fragment +1s
- Results @fragment +2s
```

### Themed Section Divider

```markdown
# Section: Advanced Topics

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@pause-after: 1s

@audio: Now let's dive into advanced topics.
```

### Multi-Paragraph Audio

```markdown
# Complex Explanation

@audio: This topic requires careful explanation.
@audio: Let's break it down step by step.
@audio: First, consider the basic principles.
@audio: Then, we'll explore the applications.

Content matches the audio narrative...
```

### Vertical Slide Group

```markdown
# Chapter 1: Introduction

@audio: Welcome to Chapter 1.

Overview content...

@vertical-slide:
## 1.1: Background

@audio: Let's explore the background.

Background details...

@vertical-slide:
## 1.2: Context

@audio: Now for the context.

Context information...

---

# Chapter 2: Implementation

@audio: Moving on to Chapter 2.

Next topic...
```

---

## Advanced Features

### Config Presets with Custom Overrides

```yaml
---
preset: manual-presentation
config:
  slideNumber: 'c/t'  # Override preset value
  viewDistance: 5     # Add custom option
---
```

### Combined Styling

```yaml
---
customCSS: styles/base.css
customStyles: |
  .reveal .special {
    color: #ff00ff;
  }
---
```

Both external and inline styles are applied!

### Dynamic Backgrounds

```markdown
# Slide 1

@background: #1a1a2e

Dark background...

---

# Slide 2

@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

Gradient background...

---

# Slide 3

@background: https://example.com/image.jpg

Image background...
```

### Timed Fragments with Audio

```markdown
@audio: Watch as these appear in perfect sync.
@audio: First item appears immediately.
@audio: Second item after one second.
@audio: Third item after two more seconds.

- Item 1 @fragment
- Item 2 @fragment +1s
- Item 3 @fragment +2s
```

Fragments sync with audio narration!

---

## Feature Compatibility

| Feature | Dev Mode | HTML Build | Full Build |
|---------|----------|------------|------------|
| Markdown | ✅ | ✅ | ✅ |
| Transitions | ✅ | ✅ | ✅ |
| Backgrounds | ✅ | ✅ | ✅ |
| Fragments | ✅ | ✅ | ✅ |
| Audio | ⚠️ (silent) | ⚠️ (silent) | ✅ (TTS) |
| Images | ⚠️ (cached) | ⚠️ (cached) | ✅ (AI) |
| Video | ❌ (no recording) | ❌ (no recording) | ✅ (recorded) |
| Speaker Notes | ✅ | ✅ | ✅ |
| Vertical Slides | ✅ | ✅ | ✅ |
| Custom CSS | ✅ | ✅ | ✅ |

---

## Quick Reference

### Essential Directives

```markdown
---
title: "My Presentation"
theme: dracula
---

# Slide 1

@audio: Welcome to my presentation.
@transition: fade

Content here...

---

# Slide 2

@audio: Let's reveal these points.

- First @fragment
- Second @fragment
- Third @fragment
```

### All Frontmatter Options

```yaml
---
title: "Complete Example"
theme: dracula
voice: adam
resolution: 1920x1080
preset: manual-presentation
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
customCSS: styles/custom.css
customStyles: |
  .reveal h1 { color: #ff0000; }
---
```

### All Slide Directives

```markdown
# Complete Slide

@duration: 10s
@pause-after: 2s
@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@image-prompt: A beautiful landscape
@notes: Remember to emphasize this point
@audio: This slide demonstrates all directives.
@vertical-slide:
@background-video: video.mp4
@background-video-loop: true
@background-video-muted: true

Content with @fragment markers
```

---

## Next Steps

- **Try [WORKFLOW.md](./WORKFLOW.md)** - Complete workflow guide
- **Read [LINTING_SPEC.md](./LINTING_SPEC.md)** - Validation rules
- **Check [CONFIGURATION.md](./architecture/revealjs/CONFIGURATION.md)** - Full config reference
- **Browse examples:**
  - `tutorials/minimal.md` - Basic usage
  - `tutorials/comprehensive.md` - All features

**Questions?** File an issue or check the [README.md](../README.md)
