---
title: Internal Links
category: CONTENT
relevance_to_project: Low
related_directives: []
---

# Internal Links

## Overview

reveal.js supports creating links between slides for non-linear navigation. You can link to slides by ID or by index number, and add custom navigation buttons.

## ID-Based Links

Link to slides using a unique `id` attribute on the target slide:

```html
<section>
  <a href="#/grand-finale">Go to the last slide</a>
</section>

<section>
  <h2>Slide 2</h2>
</section>

<section id="grand-finale">
  <h2>The end</h2>
  <a href="#/0">Back to the first</a>
</section>
```

> **Structure Requirement**: The target `<section>` must have an `id` attribute. The link `href` format is `#/<id>`.

**Link Format**:
- `href="#/my-slide-id"` → navigates to `<section id="my-slide-id">`

## Numbered Links

Link to slides by their index (position in the presentation):

### Horizontal Slide Links

```html
<a href="#/2">Go to 2nd slide</a>
<a href="#/0">Go to first slide</a>
```

**Format**: `href="#/<horizontal-index>"`
**Index**: Zero-based (first slide is `#/0`, second is `#/1`, etc.)

### Vertical Slide Links

For presentations with vertical slides (see docs/20-vertical-slides.md):

```html
<a href="#/3/2">Go to the 2nd vertical slide inside of the 3rd slide</a>
```

**Format**: `href="#/<horizontal-index>/<vertical-index>"`
**Example**: `#/3/2` = 4th horizontal slide, 3rd vertical slide down

## Navigation Classes

Add relative navigation controls by assigning special classes to any clickable element:

```html
<section>
  <!-- Directional navigation -->
  <button class="navigate-left">Left</button>
  <button class="navigate-right">Right</button>
  <button class="navigate-up">Up</button>
  <button class="navigate-down">Down</button>

  <!-- Sequential navigation -->
  <button class="navigate-prev">Prev</button>  <!-- Previous vertical OR horizontal -->
  <button class="navigate-next">Next</button>  <!-- Next vertical OR horizontal -->
</section>
```

### Available Navigation Classes

| Class | Navigates To |
|-------|-------------|
| `navigate-left` | Previous horizontal slide |
| `navigate-right` | Next horizontal slide |
| `navigate-up` | Previous vertical slide |
| `navigate-down` | Next vertical slide |
| `navigate-prev` | Previous slide (vertical first, then horizontal) |
| `navigate-next` | Next slide (vertical first, then horizontal) |

### Automatic `enabled` Class

reveal.js automatically adds the `enabled` class to navigation elements when they're valid:

```html
<!-- On first slide, only navigate-right gets 'enabled' class -->
<button class="navigate-left">Left</button>           <!-- No 'enabled' -->
<button class="navigate-right enabled">Right</button> <!-- Has 'enabled' -->
```

Use this in CSS to style enabled/disabled states:

```css
.navigate-left,
.navigate-right {
  opacity: 0.3;
}

.navigate-left.enabled,
.navigate-right.enabled {
  opacity: 1;
  cursor: pointer;
}
```

## Lightbox Links

Open external websites in an iframe overlay without leaving the presentation:

```html
<section>
  <a href="https://example.com" data-preview-link>Open Link</a>
</section>
```

> **Important**: This only works if the target website allows iframe embedding. Many sites block embedding via `x-frame-options` or `Content-Security-Policy` headers.

See docs/10-lightbox.md for full lightbox documentation.

## Link Behavior

### Default Browser Behavior

Regular links (`<a href="...">`) in slides:
- **Without special attributes**: Follow standard browser behavior (navigate away from presentation)
- **With `#/` format**: Navigate within presentation

### Opening External Links

To open external links in a new tab:

```html
<section>
  <a href="https://example.com" target="_blank">External Link</a>
</section>
```

---

**For Your Project**:

### Relevance to Video Presentations

Internal links have **low relevance** for automated video generation because:

1. **Interactive Feature**: Links require user clicks, which don't exist in video playback
2. **Non-Linear Navigation**: Videos are inherently linear
3. **No User Input**: Video players can't handle slide-to-slide navigation

### When Links Might Be Used

Consider supporting links for:
- **Interactive HTML output**: If you generate both video AND interactive HTML versions
- **Table of contents**: Links could help in non-video modes
- **Reference slides**: "See slide X for details" could be useful in HTML

### Markdown to HTML Generation

If you want to support slide links in markdown:

```markdown
## Slide 1

See [the conclusion](#/conclusion) for results.

---

## Slide 2

Content...

---

## Conclusion {#conclusion}

Results here.

[Back to start](#/0)
```

**COULD** generate:

```html
<section>
  <h2>Slide 1</h2>
  <p>See <a href="#/conclusion">the conclusion</a> for results.</p>
</section>

<section>
  <h2>Slide 2</h2>
  <p>Content...</p>
</section>

<section id="conclusion">
  <h2>Conclusion</h2>
  <p>Results here.</p>
  <p><a href="#/0">Back to start</a></p>
</section>
```

### Custom Navigation Buttons

If you want to add custom navigation in generated HTML:

```html
<section>
  <h2>Content</h2>

  <div class="custom-nav">
    <button class="navigate-prev">← Previous</button>
    <button class="navigate-next">Next →</button>
  </div>
</section>
```

Style these buttons in your CSS to match your design.

### Playwright Considerations

When recording with Playwright:

1. **Links don't auto-trigger**: Playwright won't click links automatically
2. **Linear recording**: Videos capture slides in sequence regardless of links
3. **Could use for special cases**: You could programmatically click specific links to record non-linear paths

```javascript
// Example: Clicking a link during recording
await page.click('a[href="#/conclusion"]');
await page.waitForTimeout(500); // Wait for navigation
// Continue recording...
```

### Validation Rules

- [ ] Link `href` format is valid: `#/<id>` or `#/<h-index>` or `#/<h-index>/<v-index>`
- [ ] Target slides with ID links actually have matching `id` attributes
- [ ] Index-based links point to existing slides (not out of bounds)
- [ ] Navigation class names are spelled correctly
- [ ] External links with `target="_blank"` have `rel="noopener noreferrer"` for security

### Common Pitfalls

1. **Issue**: Link doesn't navigate
   **Solution**: Ensure `href` starts with `#/` and format is correct

2. **Issue**: Link navigates away from presentation
   **Solution**: Missing `#/` prefix. Use `href="#/2"` not `href="2"`

3. **Issue**: Navigation buttons always clickable even when invalid
   **Solution**: Use CSS to check for `.enabled` class

4. **Issue**: Vertical slide link doesn't work
   **Solution**: Ensure presentation actually has vertical slides at that position

5. **Issue**: ID-based link doesn't work
   **Solution**: Check that target `<section id="...">` exists and ID matches exactly (case-sensitive)

### Best Practices

1. **Use ID-based links** when possible - they're more maintainable than index-based
2. **Add descriptive IDs** to important slides: `id="conclusion"` not `id="slide7"`
3. **Test navigation** in both directions (forward and backward links)
4. **Consider accessibility**: Add `aria-label` to navigation buttons
5. **Style disabled states**: Use CSS to show when navigation isn't available

### Example: Complete Navigation System

```html
<section id="intro">
  <h2>Introduction</h2>
  <p><a href="#/details">Jump to details</a></p>
</section>

<section id="details">
  <h2>Details</h2>

  <nav class="slide-nav">
    <button class="navigate-prev">← Back</button>
    <a href="#/intro">Intro</a> |
    <a href="#/conclusion">Conclusion</a>
    <button class="navigate-next">Next →</button>
  </nav>
</section>

<section id="conclusion">
  <h2>Conclusion</h2>
  <p><a href="#/0">Return to start</a></p>
</section>
```

```css
/* Style navigation */
.slide-nav {
  margin-top: 2em;
  padding: 1em;
  border-top: 2px solid #ccc;
}

button[class^="navigate-"] {
  padding: 0.5em 1em;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.5;
}

button[class^="navigate-"].enabled {
  opacity: 1;
}

button[class^="navigate-"]:not(.enabled) {
  cursor: not-allowed;
}
```
