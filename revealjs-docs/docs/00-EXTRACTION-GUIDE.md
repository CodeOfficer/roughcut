# RevealJS Documentation Extraction Guide

## Project Context

**Goal**: Extract reveal.js documentation from HTML files into LLM-friendly markdown files for use by another Claude agent working on a markdown-driven presentation builder.

**User's Project**: A system that:
- Takes markdown input with `@directive:` syntax
- Generates RevealJS HTML presentations + MP4 videos
- Uses ElevenLabs TTS for `@narration:` with character-level timing
- Uses Gemini for `@image-prompt:` backgrounds
- Uses Playwright for browser automation
- Uses FFmpeg for video assembly

**Critical Requirement**: Document the EXACT DOM structure RevealJS expects. The HTML generator MUST adhere strictly to this format.

## Completed Files (9 High-Priority)

✅ **31-api-methods.md** - Navigation API, control methods
✅ **32-events.md** - Event system (slidechanged, fragmentshown, etc.)
✅ **13-fragments.md** - Fragment animations, classes, timing
✅ **22-auto-slide.md** - Auto-slide timing, data-autoslide attributes
✅ **18-transitions.md** - Transition styles, data-transition attribute
✅ **21-auto-animate.md** - Auto-animation between slides
✅ **19-config-options.md** - Complete configuration reference
✅ **04-initialization.md** - Setup, DOM structure requirements

## File Naming Convention

```
[NN]-[topic].md
```

Examples:
- 01-home.md
- 04-initialization.md
- 13-fragments.md
- 31-api-methods.md

## Source HTML Files Location

```
/Users/rjones/auditboard/revealjs-docs/revealjs.com/en/[topic].html
```

## Markdown File Structure Template

```markdown
---
title: [Page Title]
category: [INITIALIZATION|FEATURES|CONTENT|CUSTOMIZATION|API|PLUGINS|OTHER]
relevance_to_project: [High|Medium|Low]
related_directives: [@directive:, ...]
---

# [Title]

> **Critical Note**: [Key integration point or requirement]

## Overview

[Main description]

## Required DOM Structure

```html
<!-- EXACT HTML structure with comments -->
<section data-attribute="value">
  <h2>Content</h2>
</section>
```

> **Structure Requirement**: [Critical nesting or attribute requirements]

## [Feature Sections]

### Configuration

| Config Option | Default | Description |
|---------------|---------|-------------|
| option | value | Description |

### API Methods

```javascript
Reveal.methodName();
```

### Attributes Reference

| Attribute | Required | Values | Description |
|-----------|----------|--------|-------------|
| data-attr | No | string | Purpose |

## [Additional Sections as Needed]

---

**For Your Project**: [Specific guidance for markdown-to-HTML conversion]

### [Directive Mapping]

```markdown
@directive: value
```

**MUST** generate:

```html
<section data-attribute="value">
  <!-- content -->
</section>
```

### Validation Rules

- [ ] Check 1
- [ ] Check 2

### Common Pitfalls

1. **Issue**: Description
   **Solution**: Fix

```
\`\`\`

## Extraction Process

### 1. Read HTML Source

```bash
Read: /Users/rjones/auditboard/revealjs-docs/revealjs.com/en/[topic].html
```

### 2. Extract Article Content

HTML structure:
```html
<article class="article ...">
  <!-- This is the content to extract -->
  <h1>Title</h1>
  <p>Content...</p>
  <pre><code>Examples...</code></pre>
</article>
```

### 3. Convert to Markdown

Key conversions:
- `<h1>` → `#` (but use `##` for main sections within doc)
- `<h2>` → `##`
- `<pre><code class="language-X">` → ` ```X`
- `<table>` → Markdown tables
- Preserve code examples with syntax highlighting

### 4. Emphasize DOM Structure

**CRITICAL**: For every feature, show:
1. The exact HTML structure
2. Required attributes and their placement
3. Parent-child relationships
4. What can/cannot be modified

Example:
```markdown
## Backgrounds

**Required Structure**:

```html
<section data-background-color="red">
  <!-- Content -->
</section>
```

> **Critical**: `data-background-color` MUST be on `<section>`, not inner elements
```

### 5. Add Project-Specific Annotations

At the end of each file, add:

```markdown
---

**For Your Project**:

[How this feature maps to @directives]
[HTML generation requirements]
[Validation rules]
[Timing considerations for video]
```

## Priority Order

### High Priority (DONE)
- API Methods
- Events
- Fragments
- Auto-Slide
- Transitions
- Auto-Animate
- Config Options
- Initialization

### Medium Priority (TODO)
- Backgrounds (08) - data-background-* attributes
- Markdown (07) - <section data-markdown>
- Speaker View (23) - <aside class="notes">
- Presentation State (34) - getState/setState

### Lower Priority (TODO)
- Installation (03)
- Markup (06)
- Media (09)
- Code (11)
- Math (12)
- Links (14)
- Layout (15)
- Slide Visibility (16)
- Themes (17)
- Presentation Size (19)
- Vertical Slides (20)
- Scroll View (24)
- Slide Numbers (25)
- Jump to Slide (26)
- Touch Navigation (27)
- PDF Export (28)
- Overview Mode (29)
- Fullscreen Mode (30)
- Keyboard (33)
- postMessage (35)
- Using Plugins (36)
- Creating Plugins (38)
- Multiplex (39)
- React Framework (40)
- Upgrade Instructions (41)
- Lightbox (10) - NEW feature
- Home (01)
- Demo (02)

## Key Integration Points to Document

For each feature, ensure you capture:

### 1. HTML Attributes
- Exact attribute names (case-sensitive!)
- Where they must be placed (section vs inner elements)
- Valid values
- Default values

### 2. DOM Hierarchy
```
<div class="reveal">          ← Root container
  <div class="slides">        ← Slides container
    <section>                 ← Slide (horizontal)
      <section>               ← Vertical slide (optional)
        <h2>Content</h2>      ← Slide content
        <aside class="notes"> ← Speaker notes (optional)
```

### 3. Timing Implications
- Transition durations (default ~800ms)
- Fragment reveal timing
- Auto-slide timing
- Animation durations

### 4. Event Hooks
- When events fire
- What data they provide
- How to use for audio/video sync

## HTML Files Location Reference

All source files:
```
/Users/rjones/auditboard/revealjs-docs/revealjs.com/en/
├── api.html
├── auto-animate.html
├── auto-slide.html
├── backgrounds.html
├── code.html
├── config.html
├── creating-plugins.html
├── events.html
├── fragments.html
├── fullscreen.html
├── index.html
├── initialization.html
├── installation.html
├── jump-to-slide.html
├── keyboard.html
├── layout.html
├── lightbox.html
├── links.html
├── markdown.html
├── markup.html
├── math.html
├── media.html
├── multiplex.html
├── overview.html
├── pdf-export.html
├── plugins.html
├── postmessage.html
├── presentation-size.html
├── presentation-state.html
├── react.html
├── scroll-view.html
├── slide-numbers.html
├── slide-visibility.html
├── speaker-view.html
├── themes.html
├── touch-navigation.html
├── transitions.html
└── upgrading.html
```

## Next Session Instructions

1. **Update todo list**: Mark current task as in_progress
2. **Read HTML file**: Use Read tool on `/Users/rjones/.../en/[topic].html`
3. **Extract content**: Focus on the `<article>` element content
4. **Create markdown**: Follow template above
5. **Emphasize DOM structure**: Show exact HTML requirements
6. **Add project annotations**: How it maps to @directives
7. **Update todo list**: Mark as completed, move to next
8. **Continue**: Process remaining ~30 files

## Quality Checklist

For each markdown file:

- [ ] Front matter with all fields
- [ ] Main description
- [ ] DOM structure examples with comments
- [ ] Required attributes table
- [ ] Code examples preserved
- [ ] Configuration options documented
- [ ] API methods (if applicable)
- [ ] Events (if applicable)
- [ ] Project-specific section at end
- [ ] Cross-references to related docs
- [ ] Timing/duration notes for video sync
- [ ] Validation requirements

## Example Reference

See completed files for examples:
- **13-fragments.md** - Good example of directive mapping
- **22-auto-slide.md** - Good example of timing documentation
- **04-initialization.md** - Good example of DOM structure requirements
- **19-config-options.md** - Good example of configuration documentation

## Final Deliverable

When all files complete, create:
- **README.md** - Index of all files with categories and descriptions
- Organized by category (INITIALIZATION, FEATURES, CONTENT, etc.)
- Quick reference for LLM agent
- Cross-reference map showing related topics
