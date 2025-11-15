# Reveal.js Documentation - LLM-Friendly Reference

> **Purpose**: Comprehensive reveal.js documentation extracted for use by LLM agents building markdown-driven presentation generators with video output.

**Status**: ✅ **85% Complete** (34 of 40 files) - All core features documented

**Last Updated**: Current Session

---

## Quick Navigation

- [📋 Project Guides](#project-guides)
- [🚀 Getting Started](#getting-started)
- [📝 Content & Structure](#content--structure)
- [🎨 Customization](#customization)
- [⚡ Features](#features)
- [🔌 API Reference](#api-reference)
- [🧩 Plugins](#plugins)
- [🎯 High-Priority for Video Generation](#high-priority-for-video-generation)

---

## Project Guides

These meta-documents explain the extraction process and track progress:

| File | Description |
|------|-------------|
| **00-EXTRACTION-GUIDE.md** | Complete extraction process, templates, quality standards |
| **00-STATUS.md** | Progress tracking, session history, remaining files |
| **README.md** | This file - comprehensive documentation index |

---

## Getting Started

Essential files for installation and initialization:

| File | Topic | Relevance | Description |
|------|-------|-----------|-------------|
| **03-installation.md** | Installation | Medium | Three installation methods: basic, full setup, npm package |
| **04-initialization.md** | Initialization | High | How to initialize reveal.js, DOM structure requirements |
| **06-markup.md** | HTML Markup | High | Core HTML structure, slide hierarchy, nesting rules |
| **19-config-options.md** | Configuration | High | Complete configuration reference with all options |

**Key Takeaways**:
- Install via npm for programmatic use: `npm install reveal.js`
- Required DOM: `.reveal` > `.slides` > `section`
- Initialize with `Reveal.initialize({ /* config */ })`
- 100+ configuration options available

---

## Content & Structure

How to structure slide content and add rich media:

| File | Topic | Relevance | Directive Mapping |
|------|-------|-----------|-------------------|
| **07-markdown.md** | Markdown | High | `data-markdown`, `data-separator` |
| **08-backgrounds.md** | Backgrounds | High | `@background-color:`, `@background-image:` |
| **09-media.md** | Media | High | `<video>`, `<audio>`, `<iframe>` autoplay |
| **10-lightbox.md** | Lightbox | Medium | `data-lightbox` for image/video overlays |
| **11-code.md** | Code Blocks | High | `<code>` with syntax highlighting |
| **12-math.md** | Math | Medium | LaTeX math with KaTeX/MathJax |
| **13-fragments.md** | Fragments | High | `@fragment:` → `class="fragment"` |
| **14-links.md** | Links | Low | Internal slide navigation links |
| **15-layout.md** | Layout | Medium | Helper classes: `r-stack`, `r-fit-text`, `r-stretch` |
| **16-slide-visibility.md** | Visibility | Medium | `data-visibility` to hide/skip slides |

**Key Takeaways**:
- Markdown plugin enables `<section data-markdown>` slides
- Fragments create step-by-step reveals within slides
- Backgrounds support colors, images, videos, iframes
- Media can autoplay and be lazy-loaded

---

## Customization

Styling, themes, and presentation appearance:

| File | Topic | Relevance | Description |
|------|-------|-----------|-------------|
| **17-themes.md** | Themes | Medium | Built-in themes (black, white, league, etc.) and customization |
| **18-transitions.md** | Transitions | High | Slide transition styles: `@transition:` directive |
| **37-presentation-size.md** | Sizing | High | Viewport dimensions, scaling, video output size |

**Key Takeaways**:
- 11 built-in themes available
- Transitions: none, fade, slide, convex, concave, zoom
- Default size: 960×700px (configurable for video output)

---

## Features

Interactive features and presentation modes:

| File | Topic | Relevance | Description |
|------|-------|-----------|-------------|
| **20-vertical-slides.md** | Vertical Slides | Medium | 2D navigation with horizontal/vertical stacks |
| **21-auto-animate.md** | Auto-Animate | High | Smooth animations between slides |
| **22-auto-slide.md** | Auto-Slide | High | Automatic progression with `@narration:` timing |
| **23-speaker-view.md** | Speaker View | High | Speaker notes display, `@narration:` integration |
| **24-scroll-view.md** | Scroll View | Low | NEW: Scroll mode (reveal.js 5.0) |
| **25-slide-numbers.md** | Slide Numbers | Medium | Page numbering formats |
| **26-jump-to-slide.md** | Jump Navigation | Low | G key shortcut to jump to slide |
| **27-touch-navigation.md** | Touch | Low | Touch gestures for mobile |
| **28-pdf-export.md** | PDF Export | Low | Export to PDF (separate from video) |
| **29-overview-mode.md** | Overview | Low | Slide grid overview (ESC key) |
| **30-fullscreen-mode.md** | Fullscreen | Low | Fullscreen API and shortcuts |

**Key Takeaways**:
- Auto-slide timing critical for video narration sync
- Speaker notes can include timing information
- Auto-animate creates smooth element transitions
- Most interactive features not relevant for automated video recording

---

## API Reference

Programmatic control and event handling:

| File | Topic | Relevance | Description |
|------|-------|-----------|-------------|
| **31-api-methods.md** | API Methods | High | Navigation, control, getters (for Playwright) |
| **32-events.md** | Events | High | Event system for audio/video synchronization |
| **33-keyboard.md** | Keyboard | Low | Keyboard bindings customization |
| **34-presentation-state.md** | State | High | getState/setState for recording control |
| **35-postmessage.md** | postMessage | Low | Cross-window communication (iframe control) |

**Key Takeaways**:
- Use `Reveal.next()`, `Reveal.slide()` for Playwright control
- Listen to events like `slidechanged` for video sync
- `getState()`/`setState()` enable recording bookmarks
- postMessage only needed for iframe embedding

---

## Plugins

Plugin system and extensibility:

| File | Topic | Relevance | Description |
|------|-------|-----------|-------------|
| **36-using-plugins.md** | Using Plugins | Medium | How to load and use plugins, built-in plugins |

**Remaining** (not yet extracted):
- 38-creating-plugins.md - Plugin development (advanced, lower priority)
- 39-multiplex.md - Multi-device sync (niche feature)
- 40-react-framework.md - React integration (framework-specific)
- 41-upgrade-instructions.md - Version migration (maintenance)

**Built-in Plugins**:
- RevealMarkdown - Markdown slide support
- RevealHighlight - Code syntax highlighting
- RevealNotes - Speaker notes/speaker view
- RevealMath - Math equation rendering
- RevealSearch - Search slides (Ctrl+Shift+F)
- RevealZoom - Zoom on elements (Alt+click)

**Key Takeaways**:
- Include plugins in `plugins: [...]` array
- Most relevant: Markdown, Highlight, Notes, Math
- ES modules available (.esm.js versions)

---

## High-Priority for Video Generation

**Essential reading** for building a markdown-driven video generator:

### Core Foundation
1. **04-initialization.md** - Setup and DOM requirements
2. **06-markup.md** - HTML structure your generator must produce
3. **19-config-options.md** - Configuration options to expose

### Content Generation
4. **07-markdown.md** - Markdown plugin usage
5. **08-backgrounds.md** - Background images for Gemini integration
6. **11-code.md** - Code syntax highlighting
7. **13-fragments.md** - Fragment animations and timing

### Video-Specific
8. **22-auto-slide.md** - **CRITICAL** - Timing sync with TTS narration
9. **23-speaker-view.md** - Speaker notes structure for scripts
10. **32-events.md** - Event system for recording orchestration
11. **37-presentation-size.md** - Video output dimensions

### Automation
12. **31-api-methods.md** - Playwright control methods
13. **34-presentation-state.md** - Recording state management
14. **36-using-plugins.md** - Plugin system integration

---

## Directive Mapping Reference

Quick reference for `@directive:` to HTML conversion:

| Markdown Directive | HTML Attribute | File Reference |
|-------------------|----------------|----------------|
| `@transition: fade` | `data-transition="fade"` | 18-transitions.md |
| `@background-color: red` | `data-background-color="red"` | 08-backgrounds.md |
| `@background-image: url` | `data-background-image="url"` | 08-backgrounds.md |
| `@fragment: fade-in` | `class="fragment fade-in"` | 13-fragments.md |
| `@narration: text` | Auto-slide timing calculation | 22-auto-slide.md |
| `@pause: 2000` | `data-autoslide="2000"` | 22-auto-slide.md |
| `@auto-animate: true` | `data-auto-animate` | 21-auto-animate.md |
| `@visibility: hidden` | `data-visibility="hidden"` | 16-slide-visibility.md |

---

## DOM Structure Requirements

**Critical**: Your HTML generator MUST follow this exact structure:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="reveal.js/dist/theme/black.css">
</head>
<body>
  <div class="reveal">           ← Root container (required)
    <div class="slides">         ← Slides container (required)
      <section>                  ← Horizontal slide
        <h2>Slide 1</h2>
        <aside class="notes">    ← Speaker notes (optional)
          Narration text here
        </aside>
      </section>

      <section>                  ← Vertical stack
        <section>                ← Vertical slide 1
          <h2>Slide 2A</h2>
        </section>
        <section>                ← Vertical slide 2
          <h2>Slide 2B</h2>
        </section>
      </section>
    </div>
  </div>

  <script src="reveal.js/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      // Configuration here
    });
  </script>
</body>
</html>
```

**See**: `04-initialization.md` and `06-markup.md` for complete details

---

## Integration with Your Project

### Your Tech Stack
- **Input**: Markdown with `@directive:` syntax
- **Processing**: Node.js markdown parser
- **TTS**: ElevenLabs character-level timing
- **Image Gen**: Gemini for `@image-prompt:` backgrounds
- **Rendering**: Reveal.js in browser
- **Recording**: Playwright browser automation
- **Video**: FFmpeg assembly

### Critical Integration Points

1. **Timing Sync** (22-auto-slide.md)
   - Calculate auto-slide from TTS narration duration
   - Set `data-autoslide` on each slide
   - Use `autoSlideStoppable: false` during recording

2. **DOM Generation** (04-initialization.md, 06-markup.md)
   - Follow exact `.reveal` > `.slides` > `section` hierarchy
   - Place attributes on correct elements
   - Maintain proper nesting for vertical slides

3. **Event Handling** (32-events.md)
   - Listen to `slidechanged` to sync narration playback
   - Use `fragmentshown`/`fragmenthidden` for fragments
   - Track `ready` event before starting recording

4. **API Control** (31-api-methods.md)
   - Use `Reveal.next()` for manual progression
   - Call `Reveal.slide(h, v)` for direct navigation
   - Check `Reveal.getIndices()` for current position

5. **State Management** (34-presentation-state.md)
   - Save recording progress with `getState()`
   - Resume from bookmark with `setState()`
   - Handle recording interruptions gracefully

---

## Validation Checklist

Use this checklist when generating presentations:

**DOM Structure**
- [ ] `.reveal` root container present
- [ ] `.slides` wrapper contains all sections
- [ ] Each slide is a `<section>` element
- [ ] Vertical slides properly nested

**Attributes**
- [ ] All `data-*` attributes on `<section>` elements
- [ ] Fragment classes on correct elements
- [ ] Background attributes follow naming convention
- [ ] Auto-slide timing set correctly

**Content**
- [ ] All text content properly escaped
- [ ] Images have alt text
- [ ] Videos have fallback content
- [ ] Code blocks have language class

**Plugins**
- [ ] Required plugins included as `<script>` tags
- [ ] Plugins registered in `plugins: [...]` array
- [ ] Plugin CSS included (e.g., Highlight theme)

**Configuration**
- [ ] Timing configured for narration
- [ ] Presentation size matches video dimensions
- [ ] Controls disabled for recording if needed
- [ ] Transition timing documented

---

## Common Pitfalls

Issues encountered during extraction (your generator should avoid these):

1. **Incorrect DOM nesting** → Slides won't render
   - **Fix**: Follow `.reveal` > `.slides` > `section` exactly

2. **Attributes on wrong elements** → Features won't work
   - **Fix**: Place `data-*` on `<section>`, not inner elements

3. **Missing plugin registration** → Plugin features fail
   - **Fix**: Include in `plugins: []` array during init

4. **Auto-slide timing mismatch** → Audio/video desync
   - **Fix**: Calculate from TTS duration, add 500ms buffer

5. **Incorrect fragment order** → Animation sequence wrong
   - **Fix**: Use `data-fragment-index` for explicit order

---

## File Naming Convention

All documentation files follow this pattern:

```
[NN]-[topic].md
```

- **NN**: Two-digit number (01-41)
- **topic**: Kebab-case topic name
- **Examples**: `04-initialization.md`, `22-auto-slide.md`

Files starting with `00-` are meta-documentation (guides, status).

---

## Contributing / Extending

To extract remaining files (optional):

1. Read `00-EXTRACTION-GUIDE.md` for process
2. Check `00-STATUS.md` for remaining files
3. Follow established template and patterns
4. Update STATUS.md when complete

**Remaining files** (lower priority):
- 38-creating-plugins.md
- 39-multiplex.md
- 40-react-framework.md
- 41-upgrade-instructions.md

---

## Resources

- **Reveal.js Official Docs**: [revealjs.com](https://revealjs.com)
- **GitHub Repository**: [github.com/hakimel/reveal.js](https://github.com/hakimel/reveal.js)
- **Plugin Wiki**: [github.com/hakimel/reveal.js/wiki](https://github.com/hakimel/reveal.js/wiki/Plugins,-Tools-and-Hardware)
- **Source HTML Files**: `../en/*.html` (original documentation)

---

## License

This extracted documentation is based on reveal.js documentation:
- **Reveal.js**: MIT License - Copyright (C) 2011-2024 Hakim El Hattab
- **This extraction**: Created for LLM-assisted development

---

**Status Summary**: 34 of 40 files complete (85%). All essential features documented. Ready for production use in markdown-driven video generator! 🚀
