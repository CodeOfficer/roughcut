---
title: Scroll View
category: features
directives:
  - "(none - global presentation mode)"
related_config:
  - "view"
  - "scrollProgress"
  - "scrollSnap"
  - "scrollLayout"
  - "scrollActivationWidth"
dom_requirements: false
new_in_version: "5.0.0"
---

# Scroll View

**New in reveal.js 5.0:** Scroll View is an alternative presentation mode that displays your deck as a scrollable webpage instead of discrete slides. All animations, fragments, and features continue to workyou simply scroll instead of clicking.

---

## Overview

### Why Scroll View?

**For presenting:** Slide decks are ideal (traditional mode)
**For reading:** Scrollable pages are easier for self-paced consumption (scroll mode)

Scroll View gives you **both formats from one source**present in slide mode, share in scroll mode.

### Key Benefits

1. **No extra work** - Same HTML works in both modes
2. **Mobile-friendly** - Auto-enables on small screens
3. **Feature-complete** - Animations, fragments, backgrounds all work
4. **Shareable** - Better for async consumption (email, docs)

---

## Basic Usage

### Enable Scroll View

```javascript
Reveal.initialize({
  view: 'scroll',  // Activate scroll view

  // Optional: Force scrollbar always visible
  scrollProgress: true
});
```

**Default:** `view: 'slide'` (traditional slide mode)

### URL Activation

Activate scroll view via URL parameter without changing code:

```
https://yoursite.com/presentation.html?view=scroll
```

**Example:** Official demo in scroll mode:
https://revealjs.com/demo/?view=scroll

**Use case:** Share a single URL, recipients add `?view=scroll` if preferred.

---

## Behavior Changes

### Vertical Slides Flattened

Scroll View **flattens** your deck into a **single linear flow**:

```
Normal Mode (2D grid):
Slide 1 í Slide 2 í Slide 3
          ì
          Slide 2.1
          ì
          Slide 2.2

Scroll Mode (1D list):
Slide 1
Slide 2
Slide 2.1  ê No differentiation, just next in sequence
Slide 2.2
Slide 3
```

**Implication:** All slides appear in DOM order, vertical/horizontal distinction lost.

### Animations & Fragments

**All features work:**
-  Fragments still reveal step-by-step
-  Auto-animate transitions still occur
-  Backgrounds still change
-  Media still plays

**Difference:** Triggered by scroll position instead of navigation clicks.

---

## Automatic Activation (Mobile)

Scroll View **automatically activates** on mobile devices for better UX.

**Default behavior:**

```javascript
// Automatic activation at viewport widths < default breakpoint
scrollActivationWidth: 435  // pixels (default)
```

**When viewport width < 435px:**
- Scroll View automatically enabled
- User can still manually switch modes

### Disable Automatic Activation

```javascript
Reveal.initialize({
  scrollActivationWidth: null  // or 0
});
```

**Use case:** You want manual control only, no automatic switching.

### Custom Breakpoint

```javascript
Reveal.initialize({
  scrollActivationWidth: 768  // Activate at tablet size
});
```

---

## Scrollbar Configuration

Scroll View renders a **custom scrollbar** broken up by slides and fragments.

### scrollProgress

Controls scrollbar visibility:

```javascript
Reveal.initialize({
  scrollProgress: 'auto'  // default
});
```

| Value | Behavior |
|-------|----------|
| `'auto'` | Show while scrolling, hide when idle (default) |
| `true` | Always visible |
| `false` | Never show scrollbar |

**Features:**
- Segments by slide (visual indicator of slide boundaries)
- Shows fragment positions (slides with fragments get more vertical space)
- Progress indicator

---

## Scroll Snapping

Controls whether scrolling "snaps" to slide boundaries.

### scrollSnap

```javascript
Reveal.initialize({
  scrollSnap: 'mandatory'  // default
});
```

| Value | Behavior | Use Case |
|-------|----------|----------|
| `'mandatory'` | Always snap to closest slide (default) | Touch devices, "flick" between slides |
| `'proximity'` | Only snap when near slide top | Smoother reading experience |
| `false` | No snapping, continuous scroll | Document-style reading |

**Examples:**

#### Always Snap (Default)

```javascript
scrollSnap: 'mandatory'
```

Feels like **swiping through slides** on mobile. Quick "flicks" jump between slides.

#### Proximity Snap

```javascript
scrollSnap: 'proximity'
```

Scroll freely, but if you **stop near** a slide boundary, it snaps into place.

#### No Snap

```javascript
scrollSnap: false
```

Pure scrolling, like reading a long webpage. No automatic positioning.

---

## Scroll Layout

Controls how slides are sized in scroll view.

### scrollLayout

```javascript
Reveal.initialize({
  scrollLayout: 'full'  // default
});
```

| Value | Description | Visual |
|-------|-------------|--------|
| `'full'` | Each slide fills full viewport height | One slide visible at a time |
| `'compact'` | Slides sized to match aspect ratio | Multiple slides visible, less whitespace |

### Full Layout (Default)

```javascript
Reveal.initialize({
  view: 'scroll',
  scrollLayout: 'full'
});
```

**Behavior:**
- Each slide takes up entire viewport height
- May have whitespace above/below slide content
- One slide visible at a time (like traditional slides)

**Use case:** Presentation-like feel, clear slide boundaries

### Compact Layout

```javascript
Reveal.initialize({
  view: 'scroll',
  scrollLayout: 'compact'
});
```

**Behavior:**
- Each slide width matches viewport width
- Slide height matches aspect ratio (from `width`/`height` config)
- Multiple slides may be visible simultaneously
- Less whitespace, denser layout

**Use case:** Document-style reading, efficient use of screen space

---

## Project Integration Notes

### Relevance to Video Generation

Scroll View is **NOT typically used for video generation** because:
- L Videos are linear playback (no scrolling interaction)
- L Designed for web browsing, not recording
- L Scroll position doesn't map to video timeline

**However**, you might consider:
- Generating a **"reading version"** webpage alongside video
- Offering users choice: watch video OR read scrollable version
- Using scroll view for documentation/reference material

### Configuration for Video Recording

If recording in Scroll View mode (unusual):

```javascript
Reveal.initialize({
  view: 'scroll',
  scrollSnap: false,       // Continuous scroll for smooth recording
  scrollProgress: false,   // Hide scrollbar from video
  scrollLayout: 'full'     // Clear slide boundaries
});
```

**Playwright automation:**
```javascript
// Navigate to specific slide in scroll mode
await page.evaluate((slideIndex) => {
  const slides = document.querySelectorAll('.slides > section');
  slides[slideIndex].scrollIntoView({ behavior: 'smooth' });
}, 5);

// Wait for scroll to complete
await page.waitForTimeout(1000);
```

---

## Configuration Reference

### view

**Type:** `'slide' | 'scroll'`
**Default:** `'slide'`

```javascript
Reveal.initialize({
  view: 'scroll'  // Enable scroll view
});
```

### scrollProgress

**Type:** `'auto' | boolean`
**Default:** `'auto'`

| Value | Effect |
|-------|--------|
| `'auto'` | Show scrollbar while scrolling, hide when idle |
| `true` | Always show scrollbar |
| `false` | Never show scrollbar |

### scrollSnap

**Type:** `'mandatory' | 'proximity' | false`
**Default:** `'mandatory'`

| Value | Effect |
|-------|--------|
| `'mandatory'` | Always snap to closest slide |
| `'proximity'` | Snap only when near a slide |
| `false` | No snapping, continuous scroll |

### scrollLayout

**Type:** `'full' | 'compact'`
**Default:** `'full'`

| Value | Effect |
|-------|--------|
| `'full'` | Each slide fills viewport height |
| `'compact'` | Slides sized to aspect ratio, denser |

### scrollActivationWidth

**Type:** `number | null`
**Default:** `435` (pixels)

**Effect:** Automatically activate scroll view when viewport width is below this value.

**Disable:** Set to `null` or `0`

---

## Complete Example

```javascript
Reveal.initialize({
  // Enable scroll view
  view: 'scroll',

  // Always show custom scrollbar
  scrollProgress: true,

  // Smooth continuous scrolling (no snap)
  scrollSnap: false,

  // Dense layout (less whitespace)
  scrollLayout: 'compact',

  // Disable automatic mobile activation
  scrollActivationWidth: null,

  // Standard slide dimensions (affects compact layout)
  width: 1920,
  height: 1080
});
```

---

## Use Cases

### 1. Shareable Documentation

```javascript
// Default configuration for reading
Reveal.initialize({
  view: 'scroll',
  scrollSnap: 'proximity',
  scrollLayout: 'compact'
});
```

**Benefit:** Presentations become readable documents you can email.

### 2. Mobile-First Presentations

```javascript
// Let mobile devices use scroll, desktop uses slides
Reveal.initialize({
  view: 'slide',  // Desktop default
  scrollActivationWidth: 768  // Scroll on tablets & phones
});
```

### 3. Hybrid Mode (User Choice)

```html
<!-- Let user choose via URL -->
<p>
  <a href="?view=slide">Slide Mode</a> |
  <a href="?view=scroll">Scroll Mode</a>
</p>
```

**Benefit:** Single presentation, multiple viewing experiences.

---

## API Access

### Switch Modes Programmatically

```javascript
// Switch to scroll view
Reveal.configure({ view: 'scroll' });

// Switch to slide view
Reveal.configure({ view: 'slide' });

// Get current view mode
const currentView = Reveal.getConfig().view;
console.log(currentView); // 'scroll' or 'slide'
```

### Detect Scroll Position

```javascript
// In scroll view, monitor scroll position
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const currentSlideIndex = Math.floor(scrollY / viewportHeight);

  console.log('At slide:', currentSlideIndex);
});
```

---

## Browser Compatibility

Scroll View works in all modern browsers:
-  Chrome, Firefox, Safari, Edge
-  Mobile browsers (iOS Safari, Chrome Mobile)
-  CSS Scroll Snap support required for snapping feature

**Fallback:** If browser doesn't support scroll snap, continuous scrolling is used.

---

## Best Practices

1. **Test both modes** - Ensure your presentation works well in slide AND scroll view
2. **Consider content density** - Dense slides may work better in compact layout
3. **Use scroll for sharing** - Link to `?view=scroll` when sending to readers
4. **Optimize for mobile** - Leverage automatic activation for better mobile UX
5. **Avoid scroll-dependent scripts** - Don't rely on scroll events that differ between modes

---

## Common Issues and Solutions

### Issue: Slides look cramped in scroll view

**Solution:** Use `scrollLayout: 'full'` for more breathing room

```javascript
Reveal.initialize({
  view: 'scroll',
  scrollLayout: 'full'  // More space per slide
});
```

### Issue: Too much whitespace in scroll view

**Solution:** Use `scrollLayout: 'compact'` for denser layout

```javascript
Reveal.initialize({
  view: 'scroll',
  scrollLayout: 'compact'
});
```

### Issue: Scrollbar is distracting

**Solution:** Use auto-hide mode

```javascript
Reveal.initialize({
  scrollProgress: 'auto'  // Hides when not scrolling
});
```

### Issue: Fragments don't work in scroll view

**Cause:** They do work! But may need to scroll more slowly to see them.
**Solution:** Fragments reveal as you scroll past their trigger point.

---

## Related Features

- **[20-vertical-slides.md](20-vertical-slides.md)** - Flattened in scroll view
- **[13-fragments.md](13-fragments.md)** - Still work, triggered by scroll
- **[29-overview-mode.md](29-overview-mode.md)** - Not available in scroll view
- **[31-api-methods.md](31-api-methods.md)** - `configure()` to switch views

---

## Examples

**Official demo in scroll view:**
https://revealjs.com/demo/?view=scroll

**Slides.com example:**
https://slides.com/news/scroll-mode/scroll

---

## Summary

- **Purpose:** Alternative presentation mode for reading/browsing
- **Activation:** `view: 'scroll'` config or `?view=scroll` URL param
- **Auto-enable:** On mobile devices (configurable breakpoint)
- **Features:** Scrollbar, snapping, layout options
- **Compatibility:** All reveal.js features work in scroll mode
- **Use case:** Shareable presentations, mobile viewing, documentation
- **Video generation:** Not typically used (designed for interactive web browsing)
- **Best for:** Async consumption, reading at own pace, mobile devices
