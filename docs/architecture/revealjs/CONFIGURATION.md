# RevealJS Configuration Reference

**Phase 2: Configuration Enhancement**
**Version**: 2.0.0
**Last Updated**: 2025-11-15

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration Presets](#configuration-presets)
4. [Complete Options Reference](#complete-options-reference)
5. [Examples](#examples)
6. [Validation](#validation)
7. [Best Practices](#best-practices)

---

## Overview

The GenAI Tutorial Factory now supports **60+ RevealJS configuration options** through frontmatter. You can customize every aspect of your presentation's behavior, from navigation controls to transition effects.

### Configuration Priority

When multiple configuration sources are present, they are merged in this order (lowest to highest priority):

1. **Default Configuration** - Sensible defaults built into the system
2. **Preset Configuration** - Optional preset (e.g., `manual-presentation`)
3. **User Configuration** - Your custom `config:` section

**Example:**
```yaml
---
title: My Presentation
theme: dracula
preset: manual-presentation    # Applies preset defaults
config:
  slideNumber: 'c/t'           # Overrides preset's slideNumber setting
  transition: fade              # Overrides preset's transition setting
---
```

---

## Quick Start

### Using a Preset (Recommended)

The simplest way to configure your presentation is to use a preset:

```yaml
---
title: My Presentation
theme: dracula
preset: manual-presentation
---
```

### Custom Configuration

For fine-grained control, add a `config:` section:

```yaml
---
title: My Presentation
theme: dracula
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  center: true
  transition: fade
---
```

### Combining Preset + Custom Config

Start with a preset and override specific options:

```yaml
---
title: My Presentation
theme: dracula
preset: manual-presentation
config:
  transition: fade     # Override preset's transition
  center: false        # Override preset's centering
---
```

---

## Configuration Presets

Presets provide optimized configurations for common use cases.

### Available Presets

| Preset | Description | Use Case |
|--------|-------------|----------|
| `video-recording` | Clean interface for automated video recording | Default for `npm run build` |
| `manual-presentation` | Full controls for live presentations | Interactive presenting to audience |
| `auto-demo` | Automated demo mode with progress indicator | Development testing with `npm run dev:auto` |
| `speaker-mode` | Optimized for speaker notes view | Presentations with speaker notes |

### Preset Details

#### `video-recording`

**Purpose**: Automated video recording via Playwright
**Optimizations**:
- No UI controls (clean recording)
- Pre-renders all slides (no lazy loading)
- Disables user interaction
- Hides progress bar and slide numbers

**Configuration**:
```typescript
{
  controls: false,
  progress: false,
  slideNumber: false,
  keyboard: false,
  overview: false,
  touch: false,
  help: false,
  center: true,
  loop: false,
  fragments: true,
  fragmentInURL: false,
  autoSlide: 0,
  autoSlideStoppable: false,
  pause: false,
  mouseWheel: false,
  shuffle: false,
  viewDistance: 999,        // Pre-render all slides
  mobileViewDistance: 999,
  transition: 'slide',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
  hash: false,
  history: false,
  embedded: true,
}
```

#### `manual-presentation`

**Purpose**: Live presentations with full user control
**Optimizations**:
- All navigation controls visible
- Progress indicators enabled
- Slide numbers shown (current/total format)
- Full keyboard/mouse navigation

**Configuration**:
```typescript
{
  controls: true,
  progress: true,
  slideNumber: 'c/t',       // Shows "3/10"
  keyboard: true,
  overview: true,
  touch: true,
  help: true,
  center: true,
  loop: false,
  fragments: true,
  fragmentInURL: true,
  autoSlide: 0,
  autoSlideStoppable: true,
  pause: true,
  mouseWheel: true,
  hash: true,
  history: true,
  transition: 'slide',
  transitionSpeed: 'default',
}
```

#### `auto-demo`

**Purpose**: Automated demos with visible automation
**Optimizations**:
- No manual controls (automation drives navigation)
- Progress bar visible for feedback
- Clean appearance

**Configuration**:
```typescript
{
  controls: false,
  progress: true,
  slideNumber: false,
  keyboard: false,
  overview: false,
  touch: false,
  help: false,
  center: true,
  loop: false,
  fragments: true,
  fragmentInURL: false,
  autoSlide: 0,
  pause: false,
  mouseWheel: false,
  transition: 'slide',
  transitionSpeed: 'default',
}
```

#### `speaker-mode`

**Purpose**: Presentations with speaker notes
**Optimizations**:
- Full controls for presenter
- Slide numbers visible in speaker view
- Speaker-only elements enabled

**Configuration**:
```typescript
{
  controls: true,
  progress: true,
  slideNumber: 'c/t',
  showSlideNumber: 'speaker', // Only show in speaker view
  keyboard: true,
  overview: true,
  touch: true,
  help: true,
  center: true,
  loop: false,
  fragments: true,
  fragmentInURL: true,
  autoSlide: 0,
  pause: true,
  hash: true,
  history: true,
}
```

---

## Complete Options Reference

All 60+ configuration options supported by RevealJS.

### Display & Controls

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `controls` | `boolean \| 'speaker-only'` | `true` | Display presentation control arrows |
| `controlsTutorial` | `boolean` | `true` | Show help overlay when ? is pressed |
| `controlsLayout` | `'bottom-right' \| 'edges'` | `'bottom-right'` | Controls layout position |
| `controlsBackArrows` | `'faded' \| 'hidden' \| 'visible'` | `'faded'` | Back arrow visibility |
| `progress` | `boolean` | `true` | Display progress bar at bottom |
| `slideNumber` | `boolean \| 'h.v' \| 'h/v' \| 'c' \| 'c/t'` | `false` | Display slide numbers |
| `showSlideNumber` | `'all' \| 'print' \| 'speaker'` | `'all'` | Limit slide number visibility |

**Slide Number Formats:**
- `false`: No slide numbers
- `true`: Show slide numbers (default format)
- `'h.v'`: Horizontal.vertical (e.g., "1.2")
- `'h/v'`: Horizontal/vertical (e.g., "1/2")
- `'c'`: Flattened slide number (e.g., "3")
- `'c/t'`: Current/total (e.g., "3/10")

### Navigation & Keyboard

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hash` | `boolean` | `true` | Add current slide to URL hash |
| `hashOneBasedIndex` | `boolean` | `false` | Use 1-based indexing for # links |
| `history` | `boolean` | `true` | Push slide changes to browser history |
| `keyboard` | `boolean` | `true` | Enable keyboard shortcuts |
| `keyboardCondition` | `null \| 'focused'` | `null` | When keyboard should be active |
| `overview` | `boolean` | `true` | Enable slide overview mode (ESC key) |
| `center` | `boolean` | `true` | Vertically center slides |
| `touch` | `boolean` | `true` | Enable touch navigation |
| `loop` | `boolean` | `false` | Loop the presentation |
| `rtl` | `boolean` | `false` | Right-to-left presentation |
| `navigationMode` | `'default' \| 'linear' \| 'grid'` | `'default'` | Navigation behavior |
| `shuffle` | `boolean` | `false` | Randomize slide order |

**Navigation Modes:**
- `'default'`: Left/right = horizontal, up/down = vertical
- `'linear'`: Left/right step through all slides sequentially
- `'grid'`: Grid-like navigation

### Fragments

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fragments` | `boolean` | `true` | Enable slide fragments |
| `fragmentInURL` | `boolean` | `false` | Include current fragment in URL |

### Transitions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `transition` | `'none' \| 'fade' \| 'slide' \| 'convex' \| 'concave' \| 'zoom'` | `'slide'` | Slide transition style |
| `transitionSpeed` | `'default' \| 'fast' \| 'slow'` | `'default'` | Transition speed |
| `backgroundTransition` | `'none' \| 'fade' \| 'slide' \| 'convex' \| 'concave' \| 'zoom'` | `'fade'` | Background transition style |

### Presentation Size

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `960` | Presentation width (pixels) |
| `height` | `number` | `700` | Presentation height (pixels) |
| `margin` | `number` | `0.04` | Empty space around content (factor) |
| `minScale` | `number` | `0.2` | Minimum scaling bound |
| `maxScale` | `number` | `2.0` | Maximum scaling bound |

### Media & Iframes

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoPlayMedia` | `boolean \| null` | `false` | Global override for media autoplay |
| `preloadIframes` | `boolean \| null` | `null` | Global override for iframe preloading |

**Media Autoplay Values:**
- `null`: Respect individual element attributes
- `true`: Force all media to autoplay
- `false`: Prevent all media autoplay

### Auto-Slide (Timing)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoSlide` | `number \| false` | `0` | Auto-advance interval (ms), 0 = disabled |
| `autoSlideStoppable` | `boolean` | `true` | Stop auto-sliding after user input |
| `defaultTiming` | `number \| null` | `null` | Average time per slide (seconds) |

**Note**: Our system controls timing via audio, but these options are available for custom use cases.

### Performance

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `viewDistance` | `number` | `3` | Slides away from current that are visible |
| `mobileViewDistance` | `number` | `2` | View distance on mobile devices |

**Performance Tip**: Set `viewDistance: 999` for video recording to pre-render all slides.

### Mouse & Interaction

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mouseWheel` | `boolean` | `false` | Enable slide navigation via mouse wheel |
| `previewLinks` | `boolean` | `false` | Opens links in iframe preview overlay |
| `pause` | `boolean` | `true` | Allow pausing presentation (blackout) |
| `help` | `boolean` | `true` | Show help overlay when ? pressed |

### Embedded & Help

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `embedded` | `boolean` | `false` | Running in embedded mode (iframe) |
| `showNotes` | `boolean` | `false` | Show speaker notes to all viewers |

### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `disableLayout` | `boolean` | `false` | Disable automatic slide layout |
| `hideInactiveCursor` | `boolean` | `false` | Hide cursor if inactive |
| `hideCursorTime` | `number` | `5000` | Time before cursor hidden (ms) |
| `postMessage` | `boolean` | `true` | Enable postMessage API |
| `postMessageEvents` | `boolean` | `false` | Dispatch events via postMessage |
| `focusBodyOnPageVisibilityChange` | `boolean` | `true` | Focus body on visibility change |

### PDF Export

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pdfMaxPagesPerSlide` | `number` | `Infinity` | Max pages a slide can expand to |
| `pdfSeparateFragments` | `boolean` | `true` | Print each fragment on separate slide |
| `pdfPageHeightOffset` | `number` | `-1` | Offset to reduce content height |

---

## Examples

### Example 1: Simple Manual Presentation

```yaml
---
title: Team Q4 Update
theme: dracula
preset: manual-presentation
---

# Q4 Results
@audio: Let's review our Q4 results...

---

# Revenue Growth
@audio: Revenue increased by 25%...
```

**Result**: Full controls, slide numbers shown as "1/2", keyboard navigation enabled.

---

### Example 2: Fast Transitions

```yaml
---
title: Quick Demo
theme: night
preset: auto-demo
config:
  transition: fade
  transitionSpeed: fast
---
```

**Result**: Fast fade transitions between slides, no manual controls.

---

### Example 3: Custom Slide Size

```yaml
---
title: Wide Presentation
theme: black
config:
  width: 1920
  height: 1080
  margin: 0.1
---
```

**Result**: Full HD dimensions with larger margins.

---

### Example 4: Loop Presentation

```yaml
---
title: Kiosk Display
theme: simple
config:
  controls: false
  progress: false
  loop: true
  autoSlide: 5000
---
```

**Result**: Auto-advances every 5 seconds, loops back to start, no controls.

---

### Example 5: Speaker Notes Mode

```yaml
---
title: Conference Talk
theme: serif
preset: speaker-mode
config:
  showNotes: false         # Hide notes from main view
  slideNumber: 'c/t'       # Show slide counter
  transition: slide
---

# Introduction
@audio: Welcome everyone...
@notes: Remember to introduce yourself first

---

# Main Content
@audio: Today we'll cover three topics...
@notes: Pause here for questions
```

**Result**: Optimized for speaker notes view, slide numbers visible.

---

### Example 6: Grid Navigation

```yaml
---
title: Product Catalog
theme: moon
config:
  navigationMode: grid
  overview: true
---
```

**Result**: Grid-based navigation, press ESC for overview mode.

---

### Example 7: Right-to-Left Presentation

```yaml
---
title: Arabic Presentation
theme: white
config:
  rtl: true
  center: true
---
```

**Result**: Right-to-left text direction for RTL languages.

---

### Example 8: Mobile-Optimized

```yaml
---
title: Mobile Demo
theme: sky
config:
  touch: true
  mobileViewDistance: 1
  width: 414
  height: 896
---
```

**Result**: Optimized for mobile viewing and touch navigation.

---

## Validation

The system validates all configuration options during the **linting phase** (before expensive operations like TTS API calls).

### Validation Features

1. **Type checking**: Ensures correct data types (boolean, string, number)
2. **Enum validation**: Validates against allowed values
3. **Typo suggestions**: Uses Levenshtein distance to suggest corrections
4. **Helpful error messages**: Includes current value, expected value, and examples

### Example Validation Errors

**Unknown option:**
```yaml
config:
  controsl: true  # Typo
```
**Error:**
```
[ERROR] config.controsl
  Unknown config option: "controsl"
  Did you mean "controls"?
  Example: true
```

**Invalid value:**
```yaml
config:
  transition: invalid
```
**Error:**
```
[ERROR] config.transition
  Invalid value for transition
  Current: "invalid"
  Expected: none, fade, slide, convex, concave, zoom
  Example: "none", "fade", "slide", "convex", "concave", "zoom"
```

**Type mismatch:**
```yaml
config:
  controls: "yes"  # Should be boolean
```
**Error:**
```
[ERROR] config.controls
  Expected boolean (true/false), got string
  Current: "yes"
  Expected: boolean | string
  Example: true, false, or "speaker-only"
```

---

## Best Practices

### 1. Start with a Preset

Always start with a preset that matches your use case, then customize:

```yaml
preset: manual-presentation
config:
  transition: fade  # Only override what you need
```

### 2. Use Meaningful Slide Numbers

For presentations to audiences, use `'c/t'` format so they know progress:

```yaml
config:
  slideNumber: 'c/t'  # Shows "5/20"
```

### 3. Optimize for Recording

When building videos, ensure smooth recording:

```yaml
preset: video-recording
config:
  viewDistance: 999     # Pre-render all slides
  transition: slide      # Smooth transitions
  transitionSpeed: default
```

### 4. Test in Dev Mode

Always test your presentation in dev mode before building:

```bash
# Manual testing
TUTORIAL=my-presentation npm run dev

# Automated testing
TUTORIAL=my-presentation npm run dev:auto
```

### 5. Disable Features You Don't Need

For cleaner presentations, disable unnecessary features:

```yaml
config:
  controls: false
  progress: false
  help: false
```

### 6. Consider Accessibility

Enable features that improve accessibility:

```yaml
config:
  keyboard: true
  overview: true
  slideNumber: 'c/t'
  help: true
```

### 7. Match Video Resolution

When building videos, match config to your resolution:

```yaml
resolution: 1920x1080
config:
  width: 1920
  height: 1080
  margin: 0.04
```

---

## Troubleshooting

### Config Not Working

**Problem**: Config changes aren't applied

**Solutions**:
1. Check linting output for validation errors
2. Ensure proper YAML indentation (2 spaces)
3. Run `npm test` to verify config schema
4. Check `npm run build` output for parser errors

### Preset Not Found

**Problem**: `Unknown preset: "manual"`

**Solution**: Use exact preset name (case-sensitive):
- ✅ `preset: manual-presentation`
- ❌ `preset: manual`

### Type Errors

**Problem**: `Expected boolean, got string`

**Solution**: Use correct types:
```yaml
# ❌ Wrong
config:
  controls: "true"

# ✅ Correct
config:
  controls: true
```

### Indentation Errors

**Problem**: Config not parsed correctly

**Solution**: Use 2-space indentation:
```yaml
# ✅ Correct
config:
  controls: true
  progress: false

# ❌ Wrong (tabs or 4 spaces)
config:
    controls: true
```

---

## Related Documentation

- **Keyboard Shortcuts**: `docs/KEYBOARD_SHORTCUTS.md`
- **Markdown Format**: `docs/MARKDOWN_FORMAT.md`
- **Linting Specification**: `docs/LINTING_SPEC.md`
- **RevealJS Documentation**: `revealjs-docs/`
- **Migration Plan**: `docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md`

---

## Changelog

### Phase 2 (2025-11-15)

- ✅ Added support for 60+ RevealJS options
- ✅ Implemented 4 configuration presets
- ✅ Added config validation with helpful errors
- ✅ Integrated validation into linting system
- ✅ Updated parser to support `preset` field
- ✅ Updated directive registry with `preset` and expanded `config` notes

### Phase 1 (2025-11-15)

- ✅ Initial support for 5 core options (controls, progress, slideNumber, center, overview)
- ✅ Fixed fragment indices to be 0-based
- ✅ Removed hardcoded font sizes
- ✅ Validated DOM structure against RevealJS requirements

---

**For questions or issues, see**: https://github.com/anthropics/claude-code/issues
