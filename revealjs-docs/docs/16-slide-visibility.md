---
title: Slide Visibility
category: CONTENT
relevance_to_project: Medium
related_directives: [@hidden:, @uncounted:, @conditional:]
---

# Slide Visibility

> **Critical Note**: The `data-visibility` attribute controls whether slides are rendered in the presentation and whether they count toward progress tracking. Important for conditional content and optional backup slides.

## Overview

RevealJS provides the `data-visibility` attribute to control slide visibility and counting behavior. This allows you to:
- Completely hide slides from the presentation (removed from DOM)
- Include optional backup slides that don't affect progress indicators
- Conditionally show/hide content based on presentation context

The visibility system affects both rendering and RevealJS's internal numbering system (progress bar, slide counters, total slide count).

## Required DOM Structure

### Hidden Slides

```html
<section>Slide 1</section>
<section data-visibility="hidden">Slide 2</section>
<section>Slide 3</section>
```

> **Structure Requirement**: `data-visibility` MUST be on the `<section>` element. Hidden slides are completely removed from the DOM during RevealJS initialization.

**Result**:
- Slide 2 is removed from DOM
- Slide counter shows "1 / 2" (not "1 / 3")
- Navigation skips from Slide 1 directly to Slide 3
- Progress bar calculates based on 2 slides total

### Uncounted Slides

```html
<section>Slide 1</section>
<section>Slide 2</section>
<section data-visibility="uncounted">Slide 3</section>
```

> **Structure Requirement**: Uncounted slides MUST be at the end of the presentation, after all main slides.

**Result**:
- Slide 3 remains in DOM and can be navigated to
- Slide counter shows "2 / 2" on slide 2, "2 / 2" on slide 3
- Progress bar completes at slide 2
- Slide 3 doesn't add to total count

## Attributes Reference

| Attribute | Required | Values | Description |
|-----------|----------|--------|-------------|
| `data-visibility` | No | `hidden` \| `uncounted` | Controls slide visibility and counting (since 4.1.0) |

### Visibility Values

| Value | DOM Behavior | Navigation | Counts in Total | Progress Bar |
|-------|-------------|------------|-----------------|--------------|
| (none) | Present | Normal | Yes | Yes |
| `hidden` | **Removed** | Skipped | No | No |
| `uncounted` | Present | Normal | No | No |

## Behavior Details

### Hidden Slides (4.1.0+)

**When to use**: Completely remove slides from presentation
- Work-in-progress slides
- Slides for different audience segments
- Slides to conditionally show via custom code

**Behavior**:
1. Slide is present in source HTML
2. During `Reveal.initialize()`, hidden slides are removed from DOM
3. Slide cannot be navigated to (doesn't exist)
4. Slide counter excludes hidden slides
5. Progress bar excludes hidden slides

**Example**:

```html
<div class="slides">
  <section>Introduction</section>
  <section data-visibility="hidden">Technical Deep Dive</section>
  <section>Summary</section>
</div>
```

Navigation: Intro → Summary (deep dive is gone)
Slide count: "1 / 2" or "2 / 2"

### Uncounted Slides

**When to use**: Optional backup slides at presentation end
- Q&A backup material
- Additional examples if time permits
- Appendix slides

**Behavior**:
1. Slide remains in DOM
2. Can be navigated to normally (arrow keys, etc.)
3. Does NOT count toward total slides
4. Progress bar reaches 100% before uncounted slides
5. Slide number shows total without uncounted slides

**Example**:

```html
<div class="slides">
  <section>Slide 1</section>
  <section>Slide 2</section>
  <section data-visibility="uncounted">Backup Slide 1</section>
  <section data-visibility="uncounted">Backup Slide 2</section>
</div>
```

Navigation: Can visit all 4 slides
Progress bar: Reaches 100% at slide 2
Slide counter: Shows "1 / 2", "2 / 2", "2 / 2", "2 / 2"

> **Important Limitation**: Uncounted slides only work correctly at the END of the presentation. Placing uncounted slides in the middle will cause incorrect counting behavior.

## Configuration

No configuration options - behavior is controlled solely by the `data-visibility` attribute on individual `<section>` elements.

## API Methods

### Programmatically Change Visibility

While not officially documented, you can change visibility dynamically:

```javascript
// Get a slide element
const slide = Reveal.getSlide(2);

// Hide it (remove from DOM)
slide.setAttribute('data-visibility', 'hidden');
Reveal.sync(); // Re-sync RevealJS

// Make it uncounted
slide.setAttribute('data-visibility', 'uncounted');
Reveal.sync();

// Make it normal (remove attribute)
slide.removeAttribute('data-visibility');
Reveal.sync();
```

> **Warning**: Dynamically changing visibility is not officially supported and may have side effects. Use with caution.

## Events

No specific events are fired when visiting uncounted slides. Standard navigation events (`slidechanged`) fire normally.

## Examples

### Main Presentation with Backup Slides

```html
<div class="slides">
  <!-- Main presentation -->
  <section>Title Slide</section>
  <section>Point 1</section>
  <section>Point 2</section>
  <section>Conclusion</section>

  <!-- Backup slides (don't affect progress) -->
  <section data-visibility="uncounted">
    <h2>Backup: Detailed Chart</h2>
  </section>
  <section data-visibility="uncounted">
    <h2>Backup: Additional Data</h2>
  </section>
</div>
```

**Result**: Progress bar completes at "Conclusion". Backup slides accessible but don't count.

### Conditional Content (Development)

```html
<div class="slides">
  <section>Slide 1</section>

  <!-- Hide while working on it -->
  <section data-visibility="hidden">
    <h2>TODO: Finish this slide</h2>
  </section>

  <section>Slide 2</section>
</div>
```

**Result**: "TODO" slide completely removed, presentation flows Slide 1 → Slide 2.

### Audience-Specific Slides

```html
<!-- In build process, conditionally add data-visibility -->
<section <?= $technical_audience ? '' : 'data-visibility="hidden"' ?>>
  <h2>Technical Implementation Details</h2>
</section>
```

## Version History

- **4.1.0** - Added `data-visibility="hidden"` support
- Prior to 4.1.0 - Only `data-visibility="uncounted"` was available

---

## For Your Project

### Use Cases for Video Generation

**Hidden slides** may be less relevant for automated video generation, but **uncounted slides** could be useful for:
1. **Appendix content** - Additional information not in main video flow
2. **Alternative endings** - Different conclusions based on generation parameters
3. **Bonus content** - Extra slides that don't affect video timing calculations

### Directive Mapping

Consider supporting conditional slide inclusion:

```markdown
# Your Input Format:
@slide:
@visibility: hidden
## Work in Progress

# Or:
@slide:
@visibility: uncounted
## Backup Material
```

**MUST** generate:

```html
<section data-visibility="hidden">
  <h2>Work in Progress</h2>
</section>

<section data-visibility="uncounted">
  <h2>Backup Material</h2>
</section>
```

### Video Timing Implications

**Hidden slides**:
- Should NOT be included in video output
- Should NOT count toward total video duration
- Filter out during HTML generation or before Playwright recording

**Uncounted slides**:
- CAN be included in video (optional based on requirements)
- Should be clearly marked as appendix/bonus content
- May want separate video chapters for uncounted slides

### Validation Rules

When generating HTML:

- [ ] `data-visibility` attribute only on `<section>` elements
- [ ] Value is either `hidden` or `uncounted` (no other values)
- [ ] Uncounted slides are placed at the END of presentation
- [ ] Hidden slides are excluded from total slide count calculations
- [ ] Progress calculations exclude both hidden and uncounted slides

### Common Pitfalls

1. **Pitfall**: Placing uncounted slides in the middle of presentation
   **Solution**: Only use uncounted slides at the end, after all main content

2. **Pitfall**: Expecting to navigate to hidden slides
   **Solution**: Hidden slides are removed from DOM - use uncounted if you need access

3. **Pitfall**: Trying to use visibility for slide sections (vertical stacks)
   **Solution**: `data-visibility` works on both horizontal and vertical sections

4. **Pitfall**: Forgetting to update total slide count manually
   **Solution**: Let RevealJS handle counting - it automatically adjusts

### Video Generation Integration

For your Playwright-based video recorder:

```javascript
// Get only counted slides for video generation
const slides = await page.evaluate(() => {
  const allSlides = Reveal.getSlides();
  return allSlides.filter(slide => {
    const visibility = slide.getAttribute('data-visibility');
    return visibility !== 'hidden'; // Include normal and uncounted
  });
});

// Or exclude uncounted slides too:
const mainSlidesOnly = allSlides.filter(slide => {
  const visibility = slide.getAttribute('data-visibility');
  return !visibility; // Only normal slides
});
```

### Timeline Calculation

When calculating total video duration:

```javascript
// Calculate main video duration (excludes hidden and uncounted)
function getMainVideoDuration(slides, audioTimings) {
  return slides
    .filter(slide => !slide.getAttribute('data-visibility'))
    .reduce((total, slide, index) => {
      return total + audioTimings[index] + transitionDuration;
    }, 0);
}

// Calculate total duration (includes uncounted but not hidden)
function getTotalVideoDuration(slides, audioTimings) {
  return slides
    .filter(slide => slide.getAttribute('data-visibility') !== 'hidden')
    .reduce((total, slide, index) => {
      return total + audioTimings[index] + transitionDuration;
    }, 0);
}
```

### Configuration Recommendation

For your markdown-to-HTML generator, consider:

```markdown
# Auto-exclude certain slides from video:
@slide:
@visibility: hidden
@reason: WIP

# Include in DOM but not in main flow:
@slide:
@visibility: uncounted
@chapter: appendix
```

### Testing Strategy

Verify visibility behavior:
1. Generate HTML with various visibility values
2. Load in RevealJS and check `Reveal.getTotalSlides()`
3. Verify hidden slides are removed from DOM
4. Verify uncounted slides don't affect progress bar
5. Test navigation skips hidden slides correctly
6. Verify video recorder respects visibility settings
