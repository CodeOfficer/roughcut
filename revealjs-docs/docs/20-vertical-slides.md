---
title: Vertical Slides
category: FEATURES
relevance_to_project: High
related_directives: [@slide:, @section:, @vertical:]
---

# Vertical Slides

> **Critical Note**: Vertical slides create a 2D navigation grid by nesting `<section>` elements within parent `<section>` elements. This DOM structure is fundamental to RevealJS and MUST be preserved exactly in generated HTML.

## Overview

RevealJS supports two-dimensional slide navigation:
- **Horizontal slides** (left/right) - Main presentation flow, top-level slides
- **Vertical slides** (up/down) - Sub-slides nested within a horizontal slide

Vertical slides allow logical grouping of related content. They're useful for:
- Optional detail slides that can be skipped
- Progressive elaboration of a concept
- Alternative paths through content
- Appendix or supplementary material

**Navigation**: Use left/right arrows for main flow, up/down arrows to dive into vertical stacks.

## Required DOM Structure

### Basic Horizontal Slides (No Nesting)

```html
<div class="slides">
  <section>Horizontal Slide 1</section>
  <section>Horizontal Slide 2</section>
  <section>Horizontal Slide 3</section>
</div>
```

**Navigation**: Left/right only → 1 → 2 → 3

### Vertical Slide Stack (Nested Sections)

```html
<div class="slides">
  <section>Horizontal Slide</section>
  <section>
    <section>Vertical Slide 1</section>
    <section>Vertical Slide 2</section>
  </section>
</div>
```

> **Structure Requirement**:
> - Parent `<section>` creates a vertical stack (container)
> - Nested `<section>` elements are the actual slides in the stack
> - Parent section itself is NOT a slide - only children are slides

**Navigation**:
- Left/right: "Horizontal" → "Vertical Slide 1" → ...
- Up/down (when in stack): "Vertical Slide 1" ↔ "Vertical Slide 2"

### Complete Example with Mixed Structure

```html
<div class="reveal">
  <div class="slides">
    <!-- Horizontal slide 1 -->
    <section>
      <h2>Title Slide</h2>
    </section>

    <!-- Vertical stack (horizontal position 2) -->
    <section>
      <section>
        <h2>Topic Overview</h2>
        <p>Main point</p>
      </section>
      <section>
        <h2>Topic Detail 1</h2>
        <p>Detailed explanation</p>
      </section>
      <section>
        <h2>Topic Detail 2</h2>
        <p>Even more detail</p>
      </section>
    </section>

    <!-- Horizontal slide 3 -->
    <section>
      <h2>Next Topic</h2>
    </section>

    <!-- Another vertical stack (horizontal position 4) -->
    <section>
      <section>
        <h2>Summary</h2>
      </section>
      <section>
        <h2>Questions</h2>
      </section>
    </section>
  </div>
</div>
```

**Resulting slide grid**:
```
[Title] → [Topic Overview] → [Next Topic] → [Summary]
                ↓                                  ↓
          [Topic Detail 1]                   [Questions]
                ↓
          [Topic Detail 2]
```

## Visual Representation

RevealJS slide coordinates follow a 2D grid:

```
Position:  (0,0)      (1,0)      (2,0)
           Slide 1 → Slide 2 → Slide 3
                        ↓
                     (1,1)
                     Slide 2a
                        ↓
                     (1,2)
                     Slide 2b
```

- **(h, v)** = horizontal index, vertical index
- Horizontal index increments for each top-level section
- Vertical index increments for nested sections

## Navigation Modes

The `navigationMode` config option controls how keyboard navigation works:

```javascript
Reveal.initialize({
  navigationMode: 'default', // or 'linear' or 'grid'
});
```

### Navigation Mode Options

| Mode | Description | Use Case |
|------|-------------|----------|
| **default** | Left/right for horizontal<br>Up/down for vertical<br>Space steps through all | Standard presentations with optional detail slides |
| **linear** | Left/right steps through ALL slides<br>No up/down navigation | Enforced linear path, no skipping |
| **grid** | Maintains vertical index when moving horizontally | Aligned vertical stacks, same depth navigation |

### Default Navigation Mode

**Keyboard behavior**:
- **Left/Right** → Move between top-level (horizontal) slides
- **Up/Down** → Move within vertical stack (when present)
- **Space** → Step through all slides (horizontal then vertical)
- **Shift+Space** → Step backward through all slides

**Example** with structure `1 → 2 → 2a → 2b → 3`:
- Right from "2": Skips to "3" (bypasses vertical slides)
- Right from "2b": Goes to "3"
- Down from "2": Goes to "2a"
- Space from "2": Goes to "2a" (then 2b, then 3)

### Linear Navigation Mode

```javascript
Reveal.initialize({
  navigationMode: 'linear',
});
```

**Behavior**:
- Up/down arrows disabled
- Left/right step through EVERY slide in sequence
- No skipping of vertical slides

**Example**: `1 → 2 → 2a → 2b → 3` (in that order)

**Use case**: Training videos or linear tutorials where all content must be viewed.

### Grid Navigation Mode

```javascript
Reveal.initialize({
  navigationMode: 'grid',
});
```

**Behavior**: Maintains vertical index when moving horizontally between stacks.

**Example structure**:
```
1.1 → 2.1 → 3.1
↓     ↓     ↓
1.2   2.2   3.2
↓     ↓     ↓
1.3   2.3   3.3
```

**Standard mode**: From 1.3, pressing right goes to 2.1 (top of next stack)
**Grid mode**: From 1.3, pressing right goes to 2.3 (same depth in next stack)

**Use case**: Aligned vertical slides where each horizontal position has parallel content at each vertical level.

## Attributes Reference

No special attributes are needed for vertical slides - structure is determined purely by DOM nesting.

### Slide Attributes Apply to Both Types

All slide-level attributes work on both horizontal and vertical slides:

```html
<section>
  <section data-transition="zoom" data-background="red">
    <!-- Vertical slide with transition and background -->
  </section>
</section>
```

## Configuration

### Navigation Mode

| Option | Default | Values | Description |
|--------|---------|--------|-------------|
| `navigationMode` | `'default'` | `'default'` \| `'linear'` \| `'grid'` | Controls keyboard navigation behavior |

### Related Config Options

```javascript
Reveal.initialize({
  navigationMode: 'default',

  // Control keyboard navigation
  keyboard: true,

  // Control arrow key visibility
  controls: true,
  controlsTutorial: true, // Show hints for vertical navigation

  // Show/hide control arrows for vertical slides
  controlsLayout: 'bottom-right',
  controlsBackArrows: 'faded',
});
```

## API Methods

### Navigation Methods

```javascript
// Navigate to specific slide
Reveal.slide(horizontalIndex, verticalIndex);
Reveal.slide(2, 1); // Go to horizontal 2, vertical 1

// Get current position
const indices = Reveal.getIndices();
console.log(indices); // { h: 2, v: 1, f: 0 }

// Navigate by direction
Reveal.left();   // Horizontal left
Reveal.right();  // Horizontal right
Reveal.up();     // Vertical up
Reveal.down();   // Vertical down

// Check if vertical slides exist
const hasVertical = Reveal.isVertical(); // True if current position has vertical slides
```

### Query Methods

```javascript
// Get all slides (flat array)
const allSlides = Reveal.getSlides();

// Get horizontal slides only
const horizontalSlides = Reveal.getHorizontalSlides();

// Get vertical slides for current horizontal position
const verticalSlides = Reveal.getVerticalSlides();

// Get total slide count
const total = Reveal.getTotalSlides(); // Includes all vertical slides
```

## Events

Standard events fire for both horizontal and vertical navigation:

```javascript
Reveal.on('slidechanged', (event) => {
  console.log('Slide changed to:', event.indexh, event.indexv);
  // event.indexh = horizontal index
  // event.indexv = vertical index (0 if no vertical stack)
});
```

## Examples

### Topic with Optional Details

```html
<section>
  <h2>Introduction</h2>
</section>

<!-- Main topic with optional deep-dives -->
<section>
  <section>
    <h2>Main Topic</h2>
    <p>High-level overview (sufficient for most audiences)</p>
  </section>
  <section>
    <h2>Technical Details</h2>
    <p>For interested audience members (can be skipped)</p>
  </section>
  <section>
    <h2>Advanced Implementation</h2>
    <p>Deep technical dive (optional)</p>
  </section>
</section>

<section>
  <h2>Conclusion</h2>
</section>
```

**Presenter can**:
- Skip details by pressing right from "Main Topic" → "Conclusion"
- Dive into details by pressing down → "Technical Details"

### Progressive Disclosure

```html
<section>
  <section>
    <h2>Problem Statement</h2>
    <p>What we're trying to solve</p>
  </section>
  <section>
    <h2>Approach 1</h2>
    <p>First potential solution</p>
  </section>
  <section>
    <h2>Approach 2</h2>
    <p>Alternative solution</p>
  </section>
  <section>
    <h2>Recommended Solution</h2>
    <p>Best approach and why</p>
  </section>
</section>
```

### Parallel Content Tracks (Grid Mode)

```javascript
Reveal.initialize({
  navigationMode: 'grid',
});
```

```html
<!-- Feature comparison across products -->
<section>
  <section><h2>Product A - Overview</h2></section>
  <section><h2>Product A - Features</h2></section>
  <section><h2>Product A - Pricing</h2></section>
</section>

<section>
  <section><h2>Product B - Overview</h2></section>
  <section><h2>Product B - Features</h2></section>
  <section><h2>Product B - Pricing</h2></section>
</section>

<section>
  <section><h2>Product C - Overview</h2></section>
  <section><h2>Product C - Features</h2></section>
  <section><h2>Product C - Pricing</h2></section>
</section>
```

With grid mode, moving right from "Product A - Pricing" goes directly to "Product B - Pricing" (same vertical depth).

---

## For Your Project

### Relevance for Video Generation

Vertical slides present a challenge for linear video generation:
- **Videos are inherently linear** - viewers cannot navigate up/down
- **Multiple possible paths** through presentation
- **Content organization** differs from traditional linear flow

### Decision Point: How to Handle Vertical Slides

**Option 1: Flatten to Linear Sequence**
```markdown
# Input (nested structure):
@slide:
@title: Main Topic

@slide-vertical:
@title: Detail 1

@slide-vertical:
@title: Detail 2

# Generate video with linear sequence:
Main Topic → Detail 1 → Detail 2
```

**Option 2: Skip Vertical Slides**
```markdown
# Generate video with only horizontal slides
Main Topic → (skip details) → Next Topic
```

**Option 3: Generate Multiple Video Variants**
```markdown
# Generate:
- main-video.mp4 (horizontal slides only)
- detailed-video.mp4 (all slides)
- topic1-deep-dive.mp4 (specific vertical stack)
```

**Recommendation**: **Option 1** (flatten to linear) is simplest and most useful for automated video generation.

### Directive Mapping

For your markdown input, consider:

```markdown
# Input Format Option A (Explicit Nesting):
@slide-horizontal:
@title: Topic Overview

@slide-vertical:
@title: Detail 1

@slide-vertical:
@title: Detail 2

@slide-horizontal:
@title: Next Topic

# Input Format Option B (Indentation):
@slide:
@title: Topic Overview

  @slide:
  @title: Detail 1

  @slide:
  @title: Detail 2

@slide:
@title: Next Topic
```

**MUST** generate:

```html
<section>
  <h2>Topic Overview</h2>
</section>

<section>
  <section>
    <h2>Detail 1</h2>
  </section>
  <section>
    <h2>Detail 2</h2>
  </section>
</section>

<section>
  <h2>Next Topic</h2>
</section>
```

### HTML Generation Rules

When generating HTML from markdown:

- [ ] Horizontal slides are top-level `<section>` elements
- [ ] Vertical slides are wrapped in a parent `<section>` (container)
- [ ] Parent section contains ONLY child `<section>` elements (no direct content)
- [ ] Nested sections can have all normal slide attributes
- [ ] Vertical stacks count as ONE horizontal position

### Validation Rules

```javascript
function validateVerticalStructure(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const slides = doc.querySelector('.slides');

  slides.querySelectorAll('section').forEach((section) => {
    const hasNestedSections = section.querySelectorAll('section').length > 0;
    const hasDirectContent = Array.from(section.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );

    if (hasNestedSections && hasDirectContent) {
      console.error('Invalid: section has both nested sections and direct content');
    }
  });
}
```

- [ ] No section has both nested sections AND direct content
- [ ] Vertical slides are 2 levels deep maximum (no triple nesting)
- [ ] Each vertical stack has at least 1 child section

### Video Recording Strategy

For Playwright-based recording:

```javascript
// Flatten all slides to linear sequence
const slides = await page.evaluate(() => {
  const indices = [];
  let h = 0;

  while (Reveal.getSlide(h, 0)) {
    let v = 0;
    while (Reveal.getSlide(h, v)) {
      indices.push({ h, v });
      v++;
    }
    h++;
  }

  return indices;
});

// Record each slide in sequence
for (const { h, v } of slides) {
  await page.evaluate(
    ({ h, v }) => Reveal.slide(h, v),
    { h, v }
  );
  await recordSlide();
}
```

### Navigation Mode Recommendation

For video generation, use **linear mode**:

```javascript
Reveal.initialize({
  navigationMode: 'linear',
  controls: false, // Hide navigation arrows in video
});
```

This ensures predictable, sequential navigation during recording.

### Common Pitfalls

1. **Pitfall**: Placing content directly in parent section alongside nested sections
   ```html
   <!-- WRONG -->
   <section>
     <h2>Title</h2> <!-- Direct content -->
     <section>Nested slide</section> <!-- Nested section -->
   </section>
   ```
   **Solution**: Put all content in nested sections, leave parent empty

2. **Pitfall**: Triple-nesting sections
   ```html
   <!-- WRONG -->
   <section>
     <section>
       <section>Too deep!</section>
     </section>
   </section>
   ```
   **Solution**: Maximum 2 levels (parent container + nested slides)

3. **Pitfall**: Forgetting vertical slides exist during video recording
   **Solution**: Always flatten to linear sequence before recording

4. **Pitfall**: Inconsistent vertical stack depths in grid mode
   **Solution**: If using grid mode, ensure all vertical stacks have same depth

### Testing Strategy

1. Generate HTML with various nesting patterns
2. Validate DOM structure (no content in parent sections)
3. Test navigation (can reach all slides)
4. Verify slide counting (getTotalSlides includes all)
5. Test video recording (all slides captured in correct order)

### Integration Example

```javascript
// Parse markdown with vertical slides
function parseMarkdown(markdown) {
  const slides = [];
  let currentHorizontal = null;

  for (const line of markdown.split('\n')) {
    if (line.startsWith('@slide-horizontal:') || line.startsWith('@slide:')) {
      if (currentHorizontal) slides.push(currentHorizontal);
      currentHorizontal = { type: 'horizontal', vertical: [] };
    } else if (line.startsWith('@slide-vertical:')) {
      if (!currentHorizontal) throw new Error('Vertical slide without horizontal parent');
      currentHorizontal.vertical.push({ type: 'vertical' });
    }
  }

  if (currentHorizontal) slides.push(currentHorizontal);
  return slides;
}

// Generate HTML
function generateHTML(slides) {
  return slides
    .map((slide) => {
      if (slide.vertical.length === 0) {
        // Simple horizontal slide
        return `<section>${slide.content}</section>`;
      } else {
        // Vertical stack
        return `<section>${slide.vertical
          .map((v) => `<section>${v.content}</section>`)
          .join('')}</section>`;
      }
    })
    .join('');
}
```

### Timing Calculation

For videos with vertical slides:

```javascript
// Calculate total video duration
function getTotalDuration(slides, narrationTimings) {
  let totalMs = 0;
  let slideIndex = 0;

  for (const slide of slides) {
    if (slide.vertical.length === 0) {
      // Horizontal slide
      totalMs += narrationTimings[slideIndex] + transitionDuration;
      slideIndex++;
    } else {
      // Vertical stack - sum all nested slides
      for (const v of slide.vertical) {
        totalMs += narrationTimings[slideIndex] + transitionDuration;
        slideIndex++;
      }
    }
  }

  return totalMs;
}
```
