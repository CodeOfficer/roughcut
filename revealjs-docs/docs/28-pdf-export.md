---
title: PDF Export
category: FEATURES
relevance_to_project: Low
related_directives: []
---

# PDF Export

> **Browser Requirement**: PDF export only works reliably in **Google Chrome** and **Chromium**. Other browsers may have issues with print stylesheets.

## Overview

Reveal.js presentations can be exported to PDF using Chrome's built-in print-to-PDF functionality. The framework includes special print stylesheets that format slides appropriately for PDF output.

**Example**: [RevealJS SlideShare Example](https://slideshare.net/hakimel/revealjs-300)

## Export Process

### Step 1: Open with Print-PDF Query Parameter

Add `?print-pdf` to your presentation URL:

```
http://localhost:8000/?print-pdf
http://localhost:8000/presentation.html?print-pdf
```

**Live example**: [revealjs.com/demo?print-pdf](https://revealjs.com/demo?print-pdf)

> **Critical**: The `?print-pdf` query parameter activates special print stylesheets. Without it, the PDF will not format correctly.

### Step 2: Open Chrome Print Dialog

Press **Ctrl+P** (Windows/Linux) or **Cmd+P** (macOS) to open the print dialog.

### Step 3: Configure Print Settings

| Setting | Required Value | Purpose |
|---------|---------------|---------|
| **Destination** | Save as PDF | Export to PDF file instead of printer |
| **Layout** | Landscape | Match presentation aspect ratio |
| **Margins** | None | Remove whitespace around slides |
| **Background graphics** | Enabled | Include slide backgrounds, images, colors |

![Chrome Print Settings Example](https://s3.amazonaws.com/hakim-static/reveal-js/pdf-print-settings-2.png)

### Step 4: Save PDF

Click **Save** and choose a filename. Each slide becomes a separate PDF page.

## Configuration Options

### Speaker Notes in PDF

Include speaker notes in the exported PDF:

```javascript
// Notes appear as overlay on each slide
Reveal.configure({
  showNotes: true
});

// Notes appear on separate page after each slide
Reveal.configure({
  showNotes: 'separate-page'
});
```

> **Note**: See `23-speaker-view.md` for speaker notes structure (`<aside class="notes">`).

### Page Numbers

Enable slide numbers to show page numbers in PDF:

```javascript
Reveal.configure({
  slideNumber: true // or 'c/t', 'h.v', etc.
});
```

See `25-slide-numbers.md` for slide number formats.

### Maximum Pages Per Slide

Limit how many PDF pages a tall slide can span:

```javascript
// Prevent any slide from spanning multiple pages
Reveal.configure({
  pdfMaxPagesPerSlide: 1
});

// Allow slides to span up to 3 pages
Reveal.configure({
  pdfMaxPagesPerSlide: 3
});
```

**Default**: No limit (slides expand to fit content)

### Fragment Handling

By default, each fragment step creates a separate PDF page:

```html
<section>
  <p>First</p>
  <p class="fragment">Second</p>
  <p class="fragment">Third</p>
</section>
```

**Default behavior**: Creates **3 PDF pages** (one for each fragment state)

To print all fragments together on one page:

```javascript
Reveal.configure({
  pdfSeparateFragments: false
});
```

Now creates **1 PDF page** with all fragments visible.

### Configuration Reference

| Config Option | Type | Default | Description |
|---------------|------|---------|-------------|
| `showNotes` | Boolean or String | `false` | Include speaker notes. `true` = overlay, `'separate-page'` = separate page |
| `pdfMaxPagesPerSlide` | Number | `Number.MAX_VALUE` | Maximum PDF pages a single slide can span |
| `pdfSeparateFragments` | Boolean | `true` | Print each fragment step on a separate page |
| `pdfPageHeightOffset` | Number | `-1` | Fine-tune page height offset (rarely needed) |

## Required DOM Structure

No special DOM structure required. Standard reveal.js markup exports correctly:

```html
<div class="reveal">
  <div class="slides">
    <section>
      <h2>Title Slide</h2>
    </section>

    <section>
      <h2>Content Slide</h2>
      <aside class="notes">
        These notes appear in PDF if showNotes is enabled
      </aside>
    </section>
  </div>
</div>
```

## How Print-PDF Mode Works

When `?print-pdf` is detected in the URL:

1. **Disables transitions**: Slides don't animate
2. **Removes pagination**: All slides render sequentially
3. **Applies print stylesheet**: Special CSS for PDF layout
4. **Expands fragments**: Shows all fragment states (unless `pdfSeparateFragments: false`)
5. **Flattens layout**: Converts slide deck into printable pages

### CSS Print Media Query

Reveal.js uses `@media print` stylesheets to format content:

```css
@media print {
  /* PDF-specific styles applied here */
  .reveal .slides section {
    page-break-after: always;
  }
}
```

## Alternative Export Methods

### DeckTape (Command-Line)

For automated PDF generation, use [decktape](https://github.com/astefanutti/decktape):

```bash
# Install
npm install -g decktape

# Export presentation to PDF
decktape reveal http://localhost:8000/presentation.html output.pdf

# With custom size
decktape reveal --size 1920x1080 http://localhost:8000/presentation.html output.pdf
```

**Advantages**:
- Automated (no manual print dialog)
- Scriptable in CI/CD pipelines
- Consistent output across environments
- Supports headless Chrome

## Troubleshooting

### Common Issues

1. **Issue**: Slides cut off or overlap
   **Solution**:
   - Verify **Margins: None** in print dialog
   - Check presentation size (see `37-presentation-size.md`)
   - Try adjusting `pdfMaxPagesPerSlide`

2. **Issue**: Backgrounds missing or white
   **Solution**:
   - Enable **Background graphics** in print dialog
   - Check that `data-background-*` attributes are set correctly

3. **Issue**: Fragments all showing at once
   **Solution**:
   - Default behavior is separate pages per fragment
   - Check `pdfSeparateFragments` config

4. **Issue**: PDF has too many pages (one per fragment)
   **Solution**:
   - Set `pdfSeparateFragments: false` to combine fragments

5. **Issue**: Text too small or too large
   **Solution**:
   - Adjust presentation width/height config (see `37-presentation-size.md`)
   - Browser zoom level affects print output

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Chromium | ✅ Full | Recommended |
| Edge (Chromium) | ✅ Full | Should work (same engine as Chrome) |
| Firefox | ⚠️ Partial | May have layout issues |
| Safari | ⚠️ Partial | May have layout issues |

## Quality Considerations

### Resolution

PDF output quality depends on:

- **Presentation size**: Larger dimensions = higher resolution
- **Browser zoom**: 100% zoom recommended
- **Image quality**: Use high-res images for backgrounds/content
- **Vector graphics**: SVGs export crisply

### File Size

Large PDFs may result from:

- High-res background images
- Many slides
- Separate pages for fragments
- Embedded media (videos don't work in PDF)

**Optimization tips**:
- Compress images before embedding
- Use `pdfSeparateFragments: false` to reduce page count
- Consider removing decorative backgrounds for PDF export

---

**For Your Project**:

### Video vs PDF Export

Your project generates **MP4 videos**, not PDFs. PDF export is a separate feature for creating **static slide decks**.

| Feature | Video Export (Your Project) | PDF Export (This Doc) |
|---------|----------------------------|----------------------|
| **Output** | MP4 video file | PDF document |
| **Includes audio** | ✅ Yes (TTS narration) | ❌ No |
| **Animated** | ✅ Yes (transitions, fragments) | ❌ Static pages |
| **Tool** | Playwright + FFmpeg | Chrome print dialog |
| **Use case** | Presentations with narration | Handouts, sharing slides |

### When to Use PDF Export

Consider implementing PDF export alongside video generation for:

1. **Handouts**: Static slide deck for reference
2. **Sharing**: Easy distribution (smaller than video)
3. **Printing**: Physical copies for meetings
4. **Archival**: Long-term storage format

### Implementation Considerations

If you want to add PDF export to your project:

**Option 1: User-Initiated (Manual)**

- Serve presentation HTML with `?print-pdf` parameter
- User opens in Chrome and prints manually
- No automation needed

**Option 2: Automated (DeckTape)**

```javascript
// In your Node.js project
const { execSync } = require('child_process');

// Generate PDF alongside video
execSync(`decktape reveal http://localhost:3000/presentation.html output.pdf`);
```

**Option 3: Playwright-Based**

```javascript
// Use your existing Playwright setup
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/presentation.html?print-pdf');
await page.pdf({
  path: 'output.pdf',
  format: 'A4',
  landscape: true,
  printBackground: true
});
```

### Configuration Directive

Add optional PDF configuration:

```markdown
@pdf:export: true
@pdf:include-notes: separate-page
@pdf:separate-fragments: false
```

Generate config:

```javascript
Reveal.configure({
  showNotes: 'separate-page',
  pdfSeparateFragments: false
});
```

### Validation Rules

- [ ] Verify Chrome/Chromium available for PDF export
- [ ] Check that backgrounds export correctly (need `printBackground: true`)
- [ ] Test fragment handling matches expectations
- [ ] Verify speaker notes appear if requested

### Common Pitfalls

1. **Issue**: Trying to export video as PDF
   **Solution**: These are separate features. Video = MP4, PDF = static slides

2. **Issue**: PDF missing narration audio
   **Solution**: PDFs are static documents. Audio only exists in video format.

3. **Issue**: Animations don't work in PDF
   **Solution**: PDFs are static. Transitions/fragments appear as separate pages or all-visible.

### Related Documentation

- `23-speaker-view.md` - Speaker notes structure for PDF inclusion
- `25-slide-numbers.md` - Page numbering in PDF
- `13-fragments.md` - Fragment behavior in PDF export
- `37-presentation-size.md` - Size configuration affects PDF dimensions
