---
title: Speaker View
category: FEATURES
relevance_to_project: High
related_directives: [@notes:, @narration:]
---

# Speaker View

> **Critical for Video Generation**: Speaker notes are essential for displaying @narration: text and timing information during video recording. The timer features directly map to your video generation workflow.

## Overview

RevealJS includes a built-in speaker notes plugin that opens a separate window showing:
- Current slide
- Speaker notes for current slide
- Preview of next slide
- Elapsed time timer
- Current wall-clock time
- Optional pacing timer

**Keyboard Shortcut**: Press `S` to open the speaker view

> **Important**: Opening speaker view requires a local web server (doesn't work with file:// protocol).

## Required DOM Structure

### Method 1: Aside Element (Recommended)

```html
<section>
  <h2>Some Slide</h2>

  <aside class="notes">
    Shhh, these are your private notes 📝
  </aside>
</section>
```

> **Structure Requirement**: `<aside class="notes">` must be a direct child of the `<section>` element. Place it after the slide content.

### Method 2: data-notes Attribute

```html
<section data-notes="Something important">
  <h2>Slide Content</h2>
</section>
```

**Use when**: Notes are short, single-line text.

### Method 3: Markdown Notes

```html
<section>
  <h2>Some Slide</h2>

  <aside class="notes" data-markdown>
    - First point
    - Second point
    - **Bold text** in notes
  </aside>
</section>
```

> **Markdown Support**: Add `data-markdown` attribute to `<aside>` to use Markdown formatting in notes.

## Markdown Plugin Integration

When using external markdown files, specify notes delimiter:

```html
<section data-markdown="example.md"
         data-separator="^\n\n\n"
         data-separator-vertical="^\n\n"
         data-separator-notes="^Note:">
# Title
## Sub-title

Here is some content...

Note:
This will only display in the notes window.
</section>
```

**Delimiter Options**:
- `^Note:` - Matches "Note:" at start of line
- `^notes?:` - Default, matches "note:" or "notes:"
- Custom regex pattern

## Plugin Configuration

### Loading the Plugin

```html
<script src="plugin/notes/notes.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealNotes],
  });
</script>
```

### Display Options

#### showNotes

Display notes inline with slides (useful for sharing or printing):

```javascript
Reveal.initialize({
  showNotes: false,  // Default: notes only in speaker view
  // showNotes: true,   // Show notes below slides
  // showNotes: 'separate-page',  // Print notes on separate PDF pages
});
```

**Values**:
| Value | Effect |
|-------|--------|
| `false` | Notes only visible in speaker view (default) |
| `true` | Notes appear below each slide |
| `'separate-page'` | Notes printed on separate pages in PDF export |

## Timing Configuration

### Default Timing Per Slide

```javascript
Reveal.initialize({
  defaultTiming: 120,  // 120 seconds (2 minutes) per slide
});
```

Sets baseline pace for presentation. Pacing timer shows:
- **Green**: On pace
- **Red**: Running over time
- **Blue**: Ahead of schedule

### Total Presentation Time

```javascript
Reveal.initialize({
  totalTime: 3600,  // 1 hour total (60 minutes × 60 seconds)
});
```

> **Priority**: If both `totalTime` and `defaultTiming` are set, `totalTime` takes precedence.

### Per-Slide Timing Override

```html
<section data-timing="180">
  <h2>Longer Slide</h2>
  <p>This slide gets 3 minutes (180 seconds)</p>
</section>

<section data-timing="60">
  <h2>Quick Slide</h2>
  <p>This slide gets 1 minute</p>
</section>
```

**Attribute**: `data-timing="seconds"`

Pacing timer adjusts automatically based on per-slide timings.

## Speaker View Features

### Timer Controls

**Elapsed Time Timer**:
- Starts when speaker view opens
- Hover over timer to reveal reset button
- Click reset to restart from 00:00

### Window Synchronization

- Speaker view and presentation window stay in sync
- Navigation in either window updates both
- Fragment steps synchronized
- Slide changes synchronized

### Next Slide Preview

Shows upcoming slide to help presenter prepare transitions.

### Layout

```
┌─────────────────────────────────────┐
│ Current Slide          │ Next Slide │
│ (large)                │ (preview)  │
├────────────────────────┴────────────┤
│ Speaker Notes                       │
│ Full text of notes for current...   │
├─────────────────────────────────────┤
│ ⏱ 00:05:23    🕐 2:30 PM    ⏲ -0:45 │
│ (elapsed)     (clock)       (pace)  │
└─────────────────────────────────────┘
```

## Server-Side Speaker Notes

For multi-device setups (e.g., laptop presenting + tablet for notes):

**Node.js Plugin**: [https://github.com/reveal/notes-server](https://github.com/reveal/notes-server)

Allows notes to run on separate device with same synchronization.

## Attributes Reference

| Attribute | Target | Values | Description |
|-----------|--------|--------|-------------|
| `class="notes"` | `<aside>` | - | Marks element as speaker notes |
| `data-notes` | `<section>` | string | Inline notes attribute |
| `data-markdown` | `<aside>` | - | Enable markdown in notes |
| `data-timing` | `<section>` | number | Seconds allocated for this slide |
| `data-separator-notes` | `<section>` | regex | Markdown notes delimiter |

## Configuration Reference

| Config Option | Type | Default | Description |
|---------------|------|---------|-------------|
| `showNotes` | boolean\|string | `false` | Display mode for notes |
| `defaultTiming` | number | `null` | Default seconds per slide |
| `totalTime` | number | `null` | Total presentation time (seconds) |

---

**For Your Project**:

### Mapping @narration: to Speaker Notes

Your `@narration:` directive should generate **both** audio and speaker notes:

```markdown
# Input (your markdown)
@slide:
@narration: Welcome to our presentation. Today we'll explore three key topics.
## Welcome
```

**MUST** generate:

```html
<section>
  <h2>Welcome</h2>

  <aside class="notes">
    <!-- Narration text for speaker view -->
    Welcome to our presentation. Today we'll explore three key topics.

    <!-- Duration info for video sync -->
    Duration: 4.2s
    Word count: 10 words
    Characters: 62
  </aside>
</section>
```

### Display Timing Information

During video recording with Playwright, the speaker view should display:

```html
<aside class="notes">
  <div class="narration-info">
    <strong>Narration Text:</strong>
    <p>Welcome to our presentation...</p>

    <strong>Timing:</strong>
    - Audio duration: 4.2 seconds
    - Character count: 62
    - Auto-slide timing: 5000ms (audio + 800ms buffer)

    <strong>Status:</strong>
    <span class="audio-status">⏸ Audio ready</span>
  </div>
</aside>
```

### Using data-timing for Video Recording

Set `data-timing` based on narration audio length:

```javascript
// Your HTML generator
const audioDuration = await getElevenLabsDuration(narrationText);
const bufferTime = 0.8; // 800ms for transition
const totalSeconds = Math.ceil(audioDuration + bufferTime);

const slideHTML = `
  <section data-timing="${totalSeconds}" data-autoslide="${totalSeconds * 1000}">
    <h2>${title}</h2>
    <aside class="notes">
      ${narrationText}
      Duration: ${audioDuration.toFixed(1)}s
    </aside>
  </section>
`;
```

### Playwright Recording Integration

Use speaker view during recording to verify timing:

```javascript
// Open speaker view programmatically
await page.evaluate(() => {
  Reveal.configure({ showNotes: true });
});

// Or open in separate window
const speakerPage = await context.newPage();
await speakerPage.goto('http://localhost:8000/?notes');

// Monitor timing info
await speakerPage.evaluate(() => {
  return document.querySelector('.notes').textContent;
});
```

### @notes: Directive (Optional)

If you want explicit notes separate from narration:

```markdown
@slide:
@narration: This is what the audience hears.
@notes: This is a reminder for the presenter - not spoken.
## Slide Title
```

**Generate**:

```html
<section>
  <h2>Slide Title</h2>
  <aside class="notes">
    <div class="narration">
      <strong>Audio:</strong> This is what the audience hears.
    </div>
    <div class="presenter-notes">
      <strong>Notes:</strong> This is a reminder for the presenter - not spoken.
    </div>
  </aside>
</section>
```

### Validation Rules

When generating speaker notes:

- [ ] `<aside class="notes">` is a direct child of `<section>`
- [ ] Notes are placed after slide content, before closing `</section>`
- [ ] `data-timing` value matches audio duration + buffer
- [ ] Narration text is properly escaped (HTML entities)
- [ ] Duration information is included for debugging
- [ ] Multi-line notes preserve formatting

### Common Pitfalls

1. **Pitfall**: Placing notes outside `<section>`
   **Solution**: Notes must be inside the slide's `<section>` element

2. **Pitfall**: Forgetting to enable Notes plugin
   **Solution**: Include `RevealNotes` in plugins array

3. **Pitfall**: Not setting `data-timing` for auto-slide coordination
   **Solution**: Always set both `data-timing` and `data-autoslide` from audio duration

4. **Pitfall**: HTML in notes breaking layout
   **Solution**: Escape HTML entities or use `.textContent` in your generator

### Testing Checklist

For video generation workflow:

```javascript
// Validate notes structure
const validateNotes = (slideElement) => {
  const notes = slideElement.querySelector('aside.notes');
  if (!notes) return false;

  // Check notes is direct child
  if (notes.parentElement !== slideElement) return false;

  // Verify timing matches
  const timing = parseInt(slideElement.dataset.timing);
  const autoslide = parseInt(slideElement.dataset.autoslide) / 1000;

  return Math.abs(timing - autoslide) < 1; // Within 1 second
};
```

### Timing Display in Speaker View

Enhance speaker view for video recording:

```css
/* Custom styling for video recording mode */
.notes .narration-info {
  font-family: monospace;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.notes .audio-status {
  color: #00aa00;
  font-weight: bold;
}

.notes .timing-warning {
  color: #ff0000;
  font-weight: bold;
}
```

Apply during recording:

```javascript
// Inject custom styles for recording
await page.addStyleTag({
  content: `
    .notes { font-size: 14px !important; }
    .narration-info { display: block !important; }
  `
});
```

### Audio-Notes Synchronization

Ensure notes display matches audio playback:

```javascript
// Listen for audio events during recording
Reveal.on('slidechanged', async (event) => {
  const notes = event.currentSlide.querySelector('aside.notes');
  const timing = event.currentSlide.dataset.timing;

  console.log(`Slide timing: ${timing}s`);
  console.log(`Notes: ${notes?.textContent}`);

  // Start audio playback
  // Wait for audio completion
  // Proceed to next slide
});
```
