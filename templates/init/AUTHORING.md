# Writing Presentations with roughcut

Your complete reference for roughcut's custom markdown format — all 21 directives, from first slide to advanced features.

---

## Quick Start

### Minimum Viable File

```markdown
---
title: "Hello World"
theme: dracula
---

# Welcome

This is my first slide.

---

# Slide Two

- Point one
- Point two
- Point three
```

### Build Commands

```bash
roughcut build                    # Generate HTML (fast, free)
roughcut dev                      # Preview in browser
roughcut build --full             # Full build with audio + video (costs $$$)
roughcut lint                     # Validate markdown
```

---

## Frontmatter Directives

Frontmatter appears at the top of your file between `---` fences and configures the entire presentation.

### `title` (required)

Presentation title — shown in browser tab and metadata.

```yaml
title: "My Presentation"
```

### `theme` (required)

RevealJS visual theme.

```yaml
theme: dracula
```

Available themes: `black` `white` `league` `beige` `sky` `night` `serif` `simple` `solarized` `blood` `moon` `dracula`

### `voice`

ElevenLabs voice ID for TTS narration. Run `roughcut voices` to see available voices.

```yaml
voice: adam
```

Falls back to `ELEVENLABS_VOICE_ID` in `.env` if not set.

### `resolution`

Video output resolution. Format: `WIDTHxHEIGHT` (digits only, minimum 640x480).

```yaml
resolution: 1920x1080
```

Common values: `1920x1080` (Full HD, default), `1280x720` (HD), `2560x1440` (2K), `3840x2160` (4K).

### `preset`

Configuration preset for common scenarios. Presets set sensible RevealJS defaults that you can override with `config`.

```yaml
preset: manual-presentation
```

| Preset | Description |
|--------|-------------|
| `video-recording` | Optimized for video production (default) — no controls, auto-advance |
| `manual-presentation` | Interactive presentations with navigation controls and progress bar |
| `auto-demo` | Automated demos with smooth transitions |
| `speaker-mode` | Presentations with speaker notes and slide numbers |

### `config`

Fine-tune RevealJS behavior directly (60+ options). Values here override preset defaults.

```yaml
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  center: false
```

Common options: `controls`, `progress`, `slideNumber`, `center`, `transition`, `transitionSpeed`, `viewDistance`.

### `customCSS`

Link an external CSS file for custom styling.

```yaml
customCSS: styles/custom.css
```

### `customStyles`

Inline CSS styles applied to the presentation.

```yaml
customStyles: |
  .reveal h1 { color: #00ff00; }
  .reveal p { font-size: 1.5em; }
```

Both `customCSS` and `customStyles` can be used together — both are applied.

---

## Narration

### `@audio:` — AI-generated voice narration

Adds ElevenLabs TTS narration to a slide. Requires `ELEVENLABS_API_KEY` in `.env` and a `--full` build.

**Multi-line format (recommended):**

```markdown
@audio: Welcome to this presentation.
@audio: Today we'll cover three topics.
@audio: Let's start with the basics.
```

Each `@audio:` line becomes a separate TTS request. Only changed lines regenerate when you rebuild — this saves time and API credits. A 1-second pause is automatically inserted between lines.

**Why multi-line is recommended:**
- Better readability — one thought per line
- Cleaner git diffs — changes isolated to specific lines
- Granular TTS caching — edit one sentence without regenerating the whole slide
- Automatic 1-second pauses between lines

**Single-line format:**

```markdown
@audio: Welcome to this presentation. Today we'll cover three topics.
```

### Pause Markers

Add explicit pauses inside `@audio:` blocks with `[Xs]` syntax:

```markdown
@audio: Here's an important point. [2s] Let that sink in.
```

Valid formats: `[1s]`, `[2.5s]`, `[500ms]`. Pauses must be inside `@audio:` blocks — using them in regular text triggers a linting error. Maximum pause: 30 seconds.

---

## Timing

### `@duration:` — slide display time

Sets how long a slide is shown. Use for slides without audio, or to override the auto-calculated duration.

```markdown
@duration: 5s
```

Format: number followed by `s` (seconds) or `ms` (milliseconds). Supports decimals: `2.5s`.

When audio is present, duration is calculated automatically from TTS length.

### `@pause-after:` — breathing room after a slide

Adds a pause before advancing to the next slide.

```markdown
@pause-after: 3s
```

Same format as `@duration:`. Default: `1s`. Use for emphasis or giving viewers time to absorb key points.

---

## Visual

### `@background:` — slide backgrounds

Set a background color, gradient, or image for any slide.

```markdown
@background: #1a1a2e                                              # hex color
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)   # gradient
@background: https://example.com/photo.jpg                        # image URL
```

Supported formats: hex (`#RGB`, `#RRGGBB`), `rgb()`/`rgba()`, `hsl()`/`hsla()`, CSS named colors, `linear-gradient()`, `radial-gradient()`, image URLs, `url()`.

### `@transition:` — slide transitions

Control how this slide enters. Each transition creates a distinct visual effect.

```markdown
@transition: fade
```

| Transition | Effect |
|------------|--------|
| `none` | Instant switch, no animation |
| `fade` | Cross-fade (smooth, professional) |
| `slide` | Slide in horizontally |
| `convex` | 3D rotation with convex perspective |
| `concave` | 3D rotation with concave perspective |
| `zoom` | Scale up from center |

Default is set by theme or `config.transition` in frontmatter.

### `@image-prompt:` — AI image generation

Generate images with Google Gemini. Requires `GEMINI_API_KEY` in `.env` and a `--full` build.

```markdown
@image-prompt: A futuristic holographic dashboard with neon blue interface elements
```

Prompts must be at least 10 characters. Be descriptive for better results — include style, colors, mood, and composition details. The generated image is used as the slide background (unless `@background:` is also set).

### `@background-video:` — video backgrounds

Play a video behind slide content.

```markdown
@background-video: videos/loop.mp4
```

Supported formats: MP4, WebM. File path is relative to the presentation directory.

### `@background-video-loop:` — loop video playback

```markdown
@background-video-loop: true
```

Values: `true` or `false`. Use with `@background-video:`.

### `@background-video-muted:` — mute video audio

```markdown
@background-video-muted: true
```

Values: `true` or `false`. Use with `@background-video:`. Usually set to `true` to avoid conflicting with narration.

**Typical video background setup:**

```markdown
@background-video: videos/ambient-loop.mp4
@background-video-loop: true
@background-video-muted: true
```

---

## Progressive Reveal

### `@fragment` — reveal bullet items one at a time

Append `@fragment` to bullet list items to make them appear progressively during the presentation.

```markdown
- Design the wireframes @fragment
- Build the prototype @fragment +1s
- Test with users @fragment +2s
```

The optional `+Ns` offset controls when each item appears relative to the previous one (used in video builds for timed reveal).

**Important:** Fragments **only work on bullet lists** (`-`, `*`, `+`). They do **not** work on numbered lists or paragraphs — the linter will flag this as an error.

---

## Advanced

### `@vertical-slide:` — 2D navigation

Group related slides vertically under a main topic. Navigate horizontally (`←` `→`) between chapters, vertically (`↑` `↓`) within them.

```markdown
# Chapter 1

Main overview...

@vertical-slide:
## 1.1 Background

Details...

@vertical-slide:
## 1.2 Context

More details...

---

# Chapter 2

Next topic...
```

### `@playwright:` — browser automation

Record live web interactions for demo slides. This is an advanced feature for creating interactive demos.

```markdown
@playwright:
- Action: Click button#submit
- Wait 2s
- Screenshot: result
```

**Three instruction types:**

| Type | Syntax | Purpose |
|------|--------|---------|
| **Action** | `Action: Click #selector` | Execute a browser action (click, type, scroll) |
| **Wait** | `Wait 2s` | Pause for a specified duration |
| **Screenshot** | `Screenshot: name` | Capture a screenshot with the given name |

Must have at least one instruction. Actions use CSS selectors for targeting elements.

### `@notes:` — speaker notes

Add notes visible only to the presenter. Press `S` during a presentation to open the speaker notes window.

```markdown
@notes: Remember to mention the quarterly results here
```

---

## Feature Compatibility

Not all features work in every build mode. Here's what to expect:

| Feature | Dev Mode | HTML Build | Full Build (`--full`) |
|---------|----------|------------|----------------------|
| Markdown / slides | Yes | Yes | Yes |
| Transitions | Yes | Yes | Yes |
| Backgrounds | Yes | Yes | Yes |
| Fragments | Yes | Yes | Yes |
| Custom CSS | Yes | Yes | Yes |
| Speaker Notes | Yes | Yes | Yes |
| Vertical Slides | Yes | Yes | Yes |
| Audio narration | Silent | Silent | Yes (TTS) |
| AI images | Cached only | Cached only | Yes (generated) |
| Video output | No | No | Yes (recorded) |

---

## Common Patterns

### Section Divider with Style

```markdown
# Section: Advanced Topics

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@pause-after: 1s
@audio: Now let's dive into advanced topics.
```

### Narrated Slide with Progressive Reveal

```markdown
# Key Takeaways

@audio: Let me walk you through each step.
@audio: First, we design. Then we build. Then we test.

- Design the wireframes @fragment
- Build the prototype @fragment +1s
- Test with users @fragment +2s
```

### Video Background with Narration

```markdown
# Ambient Demo

@background-video: videos/code-typing.mp4
@background-video-loop: true
@background-video-muted: true
@audio: Watch as we walk through the implementation.
```

---

## Linting & Validation

### Check your markdown before building

```bash
roughcut lint
```

The build also validates automatically — errors block the build, warnings are logged.

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| `@fragment` on numbered list | Use bullet list (`-`, `*`, `+`) instead |
| `@duration: 5 seconds` | Use `5s` or `500ms` format |
| Pause `[2s]` outside `@audio:` | Move pause markers inside `@audio:` blocks |
| Unknown directive `@duraton:` | Check spelling — the linter suggests corrections |
| Missing `title:` in frontmatter | Add required `title:` and `theme:` fields |
| `@fragment` in a heading | Only use on bullet list items |
| Empty `@audio:` block | Provide narration text after the colon |

---

## Quick Reference

All 21 directives at a glance:

| Directive | Where | Purpose |
|-----------|-------|---------|
| `title` | frontmatter | Presentation title (required) |
| `theme` | frontmatter | Visual theme (required) |
| `voice` | frontmatter | ElevenLabs voice ID |
| `resolution` | frontmatter | Video output resolution |
| `preset` | frontmatter | Configuration preset |
| `config` | frontmatter | RevealJS config overrides |
| `customCSS` | frontmatter | External CSS file path |
| `customStyles` | frontmatter | Inline CSS styles |
| `@audio:` | slide | Narration text (TTS) |
| `@duration:` | slide | Slide display time |
| `@pause-after:` | slide | Pause before next slide |
| `@transition:` | slide | Slide transition effect |
| `@background:` | slide | Background color/gradient/image |
| `@image-prompt:` | slide | AI image generation prompt |
| `@notes:` | slide | Speaker notes |
| `@playwright:` | slide | Browser automation |
| `@vertical-slide:` | slide | Start vertical slide group |
| `@background-video:` | slide | Video background file |
| `@background-video-loop:` | slide | Loop video background |
| `@background-video-muted:` | slide | Mute video background |
| `@fragment` | inline | Progressive reveal on bullets |

---

## Further Reading

- [Feature Reference](https://github.com/codeofficer/roughcut/blob/main/docs/FEATURES.md) — detailed directive documentation
- [Writing Best Practices](https://github.com/codeofficer/roughcut/blob/main/docs/TUTORIAL-WRITING-GUIDE.md) — content and design guidelines
- [Linting Rules](https://github.com/codeofficer/roughcut/blob/main/docs/LINTING_SPEC.md) — complete validation specification
