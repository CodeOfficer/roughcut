# Complete Directive Reference

## The 20 Directives

### Frontmatter Directives (8)

#### 1. `title` (REQUIRED)
**Type:** String
**Description:** Presentation title displayed in browser and metadata
**Example:**
```yaml
title: "My Awesome Presentation"
```

#### 2. `theme` (REQUIRED)
**Type:** Enum
**Valid Values:** `black`, `white`, `league`, `beige`, `sky`, `night`, `serif`, `simple`, `solarized`, `blood`, `moon`, `dracula`
**Description:** RevealJS theme for visual styling
**Example:**
```yaml
theme: dracula
```

#### 3. `voice`
**Type:** String (Voice ID)
**Description:** ElevenLabs voice ID for TTS narration
**Default:** Falls back to `ELEVENLABS_VOICE_ID` environment variable
**Example:**
```yaml
voice: adam
voice: EXAVITQu4vr4xnSDxMaL
```

#### 4. `resolution`
**Type:** String (WIDTHxHEIGHT)
**Description:** Video output resolution
**Default:** `1920x1080`
**Example:**
```yaml
resolution: 1920x1080
resolution: 1280x720
```

#### 5. `preset`
**Type:** Enum
**Valid Values:** `video-recording`, `manual-presentation`, `auto-demo`, `speaker-mode`
**Description:** Configuration preset for different use cases
**Example:**
```yaml
preset: manual-presentation
```

#### 6. `config`
**Type:** Object
**Description:** RevealJS configuration overrides (60+ options)
**Example:**
```yaml
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  center: false
  transition: fade
```

#### 7. `customCSS`
**Type:** String (file path)
**Description:** Path to external CSS file
**Example:**
```yaml
customCSS: ./styles/custom.css
```

#### 8. `customStyles`
**Type:** String (multi-line)
**Description:** Inline CSS styles
**Example:**
```yaml
customStyles: |
  .reveal h1 { color: #ff0; }
  .custom-class { background: #000; }
```

---

### Slide-Level Directives (11)

#### 9. `@audio:`
**Format:** `@audio: Text content`
**Multi-line:** Recommended for TTS caching
**Description:** Narration text converted to speech

**Single-line:**
```markdown
@audio: This is narration text that will be spoken.
```

**Multi-line (RECOMMENDED):**
```markdown
@audio: First sentence establishes context.
@audio: Second sentence provides detail.
@audio: Third sentence adds nuance.
```

**With pause markers:**
```markdown
@audio: Welcome to the tutorial. [1s] Today we'll cover three topics.
```

**Pause syntax:** `[1s]`, `[2.5s]`, `[500ms]`, `[pause 1s]`

#### 10. `@duration:`
**Format:** `@duration: 5s` or `@duration: 500ms`
**Description:** Slide display time if no audio
**Validation:** Must end with `s` or `ms`, supports decimals

**Examples:**
```markdown
@duration: 5s
@duration: 2.5s
@duration: 1500ms
```

#### 11. `@pause-after:`
**Format:** `@pause-after: 2s`
**Description:** Pause after audio/content before advancing
**Default:** `1s`

**Example:**
```markdown
@pause-after: 2s
@pause-after: 500ms
```

#### 12. `@transition:`
**Format:** `@transition: fade`
**Valid Values:** `none`, `fade`, `slide`, `convex`, `concave`, `zoom`
**Description:** Transition effect for this slide

**Example:**
```markdown
@transition: fade
@transition: zoom
```

#### 13. `@background:`
**Format:** Multiple formats supported
**Description:** Slide background (color/gradient/image)

**Hex color:**
```markdown
@background: #1a1a2e
```

**RGB/RGBA:**
```markdown
@background: rgb(30, 30, 30)
@background: rgba(30, 30, 30, 0.8)
```

**Gradient:**
```markdown
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**Image:**
```markdown
@background: ./screenshot.png
```

#### 14. `@image-prompt:`
**Format:** `@image-prompt: Description of image to generate`
**Description:** AI image generation prompt for Gemini

**Example:**
```markdown
@image-prompt: A futuristic holographic interface displaying code and data visualizations, cyberpunk aesthetic with neon blues and purples
```

**Best practices:**
- Be specific about style and mood
- Mention key visual elements
- Specify composition
- Use descriptive adjectives

#### 15. `@notes:`
**Format:** `@notes: Speaker note content`
**Description:** Speaker notes (press 'S' to view in presentation)

**Example:**
```markdown
@notes: Remember to emphasize this point. Mention the example from last week.
```

#### 16. `@playwright:`
**Format:** `@playwright: Browser automation instruction`
**Description:** Browser automation instructions (advanced)

**Example:**
```markdown
@playwright: Click the "Start" button and wait for animation
```

#### 17. `@vertical-slide:`
**Format:** Directive only (no value)
**Description:** Create vertical slide groups for 2D navigation

**Example:**
```markdown
# Main Topic

Overview content

@vertical-slide:

## Sub-topic A

Details...

@vertical-slide:

## Sub-topic B

More details...
```

**Navigation:** RIGHT = next horizontal, DOWN = next vertical

#### 18. `@background-video:`
**Format:** `@background-video: ./video-file.mp4`
**Description:** Video background for slide

**Example:**
```markdown
@background-video: ./demo-video.mp4
```

#### 19. `@background-video-loop:`
**Format:** `@background-video-loop: true` or `false`
**Description:** Loop video background

**Example:**
```markdown
@background-video-loop: true
```

#### 20. `@background-video-muted:`
**Format:** `@background-video-muted: true` or `false`
**Description:** Mute video background

**Example:**
```markdown
@background-video-muted: true
```

**Complete video background example:**
```markdown
# Video Demo

@background-video: ./demo.mp4
@background-video-loop: true
@background-video-muted: true

@audio: This slide has a looping, muted video background.
```

---

### Inline Directive (1)

#### 21. `@fragment`
**Format:** `@fragment` or `@fragment +1s`
**Description:** Progressive reveal for list items
**CRITICAL:** Only works on BULLET lists (-, *, +), NOT numbered lists!

**Basic usage:**
```markdown
- First point @fragment
- Second point @fragment
- Third point @fragment
```

**With timing:**
```markdown
- First point @fragment
- Second point @fragment +1s    # Reveal 1 second after previous
- Third point @fragment +2s     # Reveal 2 seconds after previous
```

**WRONG - Don't do this:**
```markdown
1. First item @fragment         # ❌ LINTING ERROR
2. Second item @fragment        # ❌ LINTING ERROR
```

---

## Quick Reference: Valid Values

### Themes (12)
- `black` - Black background with white text
- `white` - White background with dark text
- `league` - Gray background with blue accents
- `beige` - Beige background with brown text
- `sky` - Blue background
- `night` - Dark background with orange accents
- `serif` - White background with serif fonts
- `simple` - White background, minimalist
- `solarized` - Solarized color scheme
- `blood` - Dark background with red accents
- `moon` - Dark blue background
- `dracula` - Dracula theme (code-friendly)

### Transitions (6)
- `none` - No transition
- `fade` - Cross fade
- `slide` - Slide horizontally
- `zoom` - Scale up/down
- `convex` - 3D convex effect
- `concave` - 3D concave effect

### Presets (4)
- `video-recording` - For final video output (no controls, embedded)
- `manual-presentation` - For live presenting (full controls, interactive)
- `auto-demo` - For auto-advance demos (progress bar visible)
- `speaker-mode` - For speaker view with notes

---

## Common Patterns

### Title Slide
```markdown
# Presentation Title

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@pause-after: 2s

@audio: Welcome to this presentation.
@audio: Today we'll explore key concepts in depth.

**A subtitle or tagline**
```

### Content Slide with Fragments
```markdown
# Key Concepts

@duration: 10s

@audio: Let's explore these concepts one by one.
@audio: Each builds on the previous.

- First concept @fragment
- Second concept @fragment +1s
- Third concept @fragment +2s
```

### Code Example Slide
```markdown
# Implementation Example

@duration: 15s

@audio: Here's how you implement this in Python.
@audio: Notice the use of type hints and error handling.

```python
def process_data(items: list) -> dict:
    """Process data and return results."""
    try:
        return {"success": True, "data": items}
    except Exception as e:
        return {"success": False, "error": str(e)}
```
```

### Conclusion Slide
```markdown
# Key Takeaways

@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@transition: zoom
@pause-after: 2s

@audio: You now understand the core concepts.
@audio: Practice these techniques to build mastery.

**What you learned:**

- ✅ Core concept one
- ✅ Core concept two
- ✅ Core concept three
```
