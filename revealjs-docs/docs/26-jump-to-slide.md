---
title: Jump to Slide
category: FEATURES
relevance_to_project: Medium
related_directives: []
---

# Jump to Slide

> **Feature Available**: Since reveal.js 4.5.0

## Overview

Jump to Slide provides a keyboard-driven navigation shortcut that allows users to quickly navigate to a specific slide by typing its number or ID. This is particularly useful for presentations with many slides or for jumping to known sections during Q&A.

## How to Use

The jump-to-slide feature uses a three-step interaction:

1. **Activate**: Press `G` key
2. **Input**: Type a slide number or ID
3. **Confirm**: Press `Enter` to navigate

## Navigation Methods

### By Slide Number

Enter a numeric value to navigate to a specific slide index (0-based counting in the API, but 1-based for user input).

**Examples**:

| Input | Result |
|-------|--------|
| `5` | Navigate to slide number 5 |
| `6/2` | Navigate to horizontal slide 6, vertical slide 2 |

### By Slide ID

Type a string that matches a slide's `id` attribute. Reveal.js will locate the first slide with a matching ID.

**Example**:

| Input | Result |
|-------|--------|
| `the-end` | Navigate to `<section id="the-end">` |

## Required DOM Structure

For ID-based navigation to work, slides must have an `id` attribute:

```html
<div class="reveal">
  <div class="slides">
    <!-- Numeric navigation works with any section -->
    <section>
      <h2>First Slide</h2>
    </section>

    <!-- ID-based navigation requires id attribute -->
    <section id="introduction">
      <h2>Introduction</h2>
    </section>

    <!-- Vertical navigation with slash notation -->
    <section>
      <section>
        <h2>Horizontal 3, Vertical 1</h2>
      </section>
      <section>
        <h2>Horizontal 3, Vertical 2</h2>
      </section>
    </section>

    <section id="the-end">
      <h2>The End</h2>
    </section>
  </div>
</div>
```

> **Structure Requirement**: The `id` attribute must be placed on the `<section>` element, not on inner content elements.

## Configuration

### Disable Jump to Slide

Jump to Slide is enabled by default. To disable it:

```javascript
Reveal.initialize({
  jumpToSlide: false,
});
```

### Configuration Options

| Config Option | Type | Default | Description |
|---------------|------|---------|-------------|
| `jumpToSlide` | Boolean | `true` | Enable/disable the jump to slide feature |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Activate jump-to-slide input |
| `Enter` | Confirm navigation to entered slide |
| `Escape` | Cancel jump-to-slide (while input is active) |

## API Methods

While the primary interface is keyboard-driven, you can navigate programmatically using:

```javascript
// Navigate by slide number (0-indexed)
Reveal.slide(4);

// Navigate by horizontal and vertical indices
Reveal.slide(5, 2);

// Navigate by slide ID (requires # prefix)
Reveal.slide('#the-end');
```

See `31-api-methods.md` for complete API documentation.

## User Experience Considerations

### Visual Feedback

When activated, reveal.js displays an input overlay where users can type their target slide number or ID. The overlay provides visual feedback during input.

### Input Validation

- **Numbers**: Any positive integer is accepted (out-of-range values navigate to first/last slide)
- **Slash notation**: Format `H/V` for horizontal/vertical navigation
- **Strings**: Must match a slide's `id` attribute exactly (case-sensitive)

### Accessibility

- Keyboard-only navigation (no mouse required)
- Clear visual indication when jump mode is active
- ESC key to cancel at any time

---

**For Your Project**:

### Slide ID Naming

When generating HTML from markdown, consider adding meaningful `id` attributes to slides for easier jump navigation:

```markdown
## @slide-id: introduction
# Welcome

## @slide-id: key-findings
# Key Findings
```

Should generate:

```html
<section id="introduction">
  <h1>Welcome</h1>
</section>

<section id="key-findings">
  <h1>Key Findings</h1>
</section>
```

### Validation Rules

- [ ] All `@slide-id:` directives must generate valid HTML `id` attributes (no spaces, alphanumeric + hyphens/underscores)
- [ ] Duplicate `id` values should be detected and reported as errors
- [ ] IDs should be URL-safe (lowercase, hyphens preferred)

### Common Pitfalls

1. **Issue**: ID navigation fails silently
   **Solution**: Ensure `id` is on `<section>`, not nested elements. Verify ID matches exactly (case-sensitive).

2. **Issue**: Vertical slide navigation confusing
   **Solution**: Document that slash notation uses `horizontal/vertical` indices (e.g., `3/2` means 3rd horizontal stack, 2nd vertical slide).

### Video Recording Considerations

**Jump to Slide is a user-interactive feature** - it does not affect automated video recording. However:

- Consider disabling it during automated recording: `jumpToSlide: false`
- Interactive features are typically not used during Playwright-driven recording
- Keep enabled if you need to manually test specific slides during development

### Testing

When testing presentations:

```javascript
// Test navigation by ID
Reveal.slide('#introduction');
await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for transition

// Test navigation by slide number
Reveal.slide(5, 2); // Horizontal 5, Vertical 2
```

### Integration Notes

- Jump to Slide complements slide numbers (see `25-slide-numbers.md`)
- Works with all presentation modes (normal, overview, scroll view)
- Compatible with vertical slides (see `20-vertical-slides.md`)
