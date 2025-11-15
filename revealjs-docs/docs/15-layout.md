---
title: Layout Helper Classes
category: content
directives:
  - "@stack:" (suggested for layered content)
  - "@fit-text:" (suggested for scaled headlines)
  - "@stretch:" (suggested for full-height media)
  - "@frame:" (suggested for bordered elements)
related_config:
  - "none"
dom_requirements: true
---

# Layout Helper Classes

## Overview

reveal.js provides CSS helper classes for controlling layout and styling content. These are purely presentation-related styling utilities.

> **Note**: For controlling presentation sizing, scaling, and centering, see docs/19-presentation-size.md.

## Stack (`r-stack`)

Centers and places multiple elements on top of each other. Designed to work with fragments for incremental reveals.

```html
<section>
  <div class="r-stack">
    <img class="fragment" src="image1.jpg" width="450" height="300" />
    <img class="fragment" src="image2.jpg" width="300" height="450" />
    <img class="fragment" src="image3.jpg" width="400" height="400" />
  </div>
</section>
```

### Showing Elements Individually

Use fragment classes to control visibility:

```html
<section>
  <div class="r-stack">
    <!-- First image fades out when advancing -->
    <img class="fragment fade-out" data-fragment-index="0"
         src="image1.jpg" width="450" height="300" />

    <!-- Second image shows only at index 0 -->
    <img class="fragment current-visible" data-fragment-index="0"
         src="image2.jpg" width="300" height="450" />

    <!-- Third image appears last and stays -->
    <img class="fragment" src="image3.jpg" width="400" height="400" />
  </div>
</section>
```

## Fit Text (`r-fit-text`)

Automatically scales text to be as large as possible without overflowing the slide. Powered by [fitty](https://github.com/rikschennink/fitty).

```html
<section>
  <h2 class="r-fit-text">BIG</h2>
</section>
```

### Multiple Fit Text Elements

```html
<section>
  <h2 class="r-fit-text">FIT TEXT</h2>
  <h2 class="r-fit-text">CAN BE USED FOR MULTIPLE HEADLINES</h2>
</section>
```

> **Note**: Each `r-fit-text` element is sized independently to fill available space.

## Stretch (`r-stretch`)

Resizes an element to cover the remaining vertical space in a slide after other content.

```html
<section>
  <h2>Stretch Example</h2>
  <img class="r-stretch" src="image.png" />
  <p>Image byline</p>
</section>
```

**How it works**: The image height = slide height - title height - paragraph height.

### Stretch Limitations

- **Only direct descendants** of `<section>` can be stretched
- **Only one element** per section can be stretched
- Element must be a direct child (not nested in divs)

**Valid**:
```html
<section>
  <h2>Title</h2>
  <img class="r-stretch" src="image.png" />  <!-- Direct child -->
</section>
```

**Invalid**:
```html
<section>
  <div>
    <img class="r-stretch" src="image.png" />  <!-- NOT a direct child -->
  </div>
</section>
```

## Frame (`r-frame`)

Adds a decorative border/frame around an element. Applies hover effect when inside an anchor.

```html
<section>
  <!-- Plain frame -->
  <img src="logo.svg" width="200" />

  <!-- Frame with hover effect -->
  <a href="#">
    <img class="r-frame" src="logo.svg" width="200" />
  </a>
</section>
```

## Class Reference

| Class | Effect | Usage |
|-------|--------|-------|
| `r-stack` | Centers and stacks child elements | `<div class="r-stack">` |
| `r-fit-text` | Auto-sizes text to fill space | `<h2 class="r-fit-text">` |
| `r-stretch` | Fills remaining vertical space | `<img class="r-stretch">` |
| `r-frame` | Adds decorative border | `<img class="r-frame">` |

---

**For Your Project**:

### Relevance to Video Generation

Layout classes have **medium relevance**:

1. **Useful for design**: `r-fit-text`, `r-frame`, `r-stretch` help create visually appealing slides
2. **Fragment interactions**: `r-stack` depends on fragments, which affect timing
3. **Static styling**: Most classes apply static CSS that renders in video

### Markdown to HTML Mapping

#### Stack Layout

```markdown
## Stacked Images
@stack:
  - ![Image 1](img1.jpg)
  - ![Image 2](img2.jpg)
  - ![Image 3](img3.jpg)
```

**COULD** generate:

```html
<section>
  <h2>Stacked Images</h2>
  <div class="r-stack">
    <img class="fragment" src="img1.jpg" />
    <img class="fragment" src="img2.jpg" />
    <img class="fragment" src="img3.jpg" />
  </div>
</section>
```

#### Fit Text

```markdown
## @fit-text: BIG HEADLINE
```

**SHOULD** generate:

```html
<section>
  <h2 class="r-fit-text">BIG HEADLINE</h2>
</section>
```

#### Stretch

```markdown
## Stretched Image
@stretch: image.png

Caption text
```

**SHOULD** generate:

```html
<section>
  <h2>Stretched Image</h2>
  <img class="r-stretch" src="image.png" />
  <p>Caption text</p>
</section>
```

#### Frame

```markdown
![Logo](logo.svg){.r-frame}
```

**SHOULD** generate:

```html
<section>
  <img class="r-frame" src="logo.svg" />
</section>
```

### Timing Considerations for Video

#### Stack with Fragments

When using `r-stack` with fragments:

```html
<section data-autoslide="6000">
  <div class="r-stack">
    <img class="fragment" src="img1.jpg" />  <!-- Shows at 0ms -->
    <img class="fragment" src="img2.jpg" />  <!-- Shows at ~3000ms -->
  </div>
</section>
```

- Default fragment timing: ~300ms fade
- Auto-slide timing must account for multiple fragments
- 2 fragments = need ~600ms + narration time

#### Fit Text Rendering

- `r-fit-text` calculations happen on page load
- Playwright must wait for text to resize before capturing
- Typically renders within 50-100ms

```javascript
// Wait for fit text to render
await page.waitForFunction(() => {
  const fitElements = document.querySelectorAll('.r-fit-text');
  return Array.from(fitElements).every(el =>
    el.style.transform && el.style.transform !== 'none'
  );
});
```

### Validation Rules

- [ ] `r-stack` contains only elements meant to overlap
- [ ] `r-stretch` is applied to direct child of `<section>`
- [ ] Only one `r-stretch` per section
- [ ] `r-fit-text` is on text elements (h1, h2, p, etc.)
- [ ] Frame elements have appropriate contrast against background

### Common Pitfalls

1. **Issue**: `r-stretch` doesn't work
   **Solution**: Ensure element is a direct child of `<section>`, not nested in a `<div>`

2. **Issue**: Multiple elements with `r-stretch` in one section
   **Solution**: Only one element can stretch. Remove `r-stretch` from others.

3. **Issue**: `r-fit-text` text is too small
   **Solution**: Reduce content length or check if container has constrained height

4. **Issue**: Stacked elements don't overlap properly
   **Solution**: Ensure `r-stack` wrapper is properly applied and elements have explicit dimensions

5. **Issue**: Frame doesn't show
   **Solution**: Check background color - frame may blend in. Adjust theme or use custom CSS.

### CSS Implementation Notes

These classes work through CSS:

```css
/* Stack - centers and overlays children */
.r-stack {
  display: flex;
  align-items: center;
  justify-content: center;
}

.r-stack > * {
  position: absolute;
}

/* Stretch - fills remaining space */
.r-stretch {
  max-height: /* calculated dynamically */;
  max-width: /* calculated dynamically */;
}

/* Frame - adds border */
.r-frame {
  border: 4px solid currentColor;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}
```

### Best Practices

1. **Use `r-stack` with fragments** for dramatic reveals
2. **Apply `r-fit-text` to short text** (1-5 words work best)
3. **Reserve `r-stretch` for hero images/videos** that should dominate
4. **Add `r-frame` to important visuals** that need emphasis
5. **Test on multiple screen sizes** - these classes are responsive

### Example: Complete Slide with Layout Classes

```html
<section>
  <h2 class="r-fit-text">Key Findings</h2>

  <div class="r-stack">
    <img class="fragment r-frame" src="chart1.png" />
    <img class="fragment r-frame" src="chart2.png" />
    <img class="fragment r-frame" src="chart3.png" />
  </div>

  <p class="fragment">Click through to see each chart</p>
</section>
```

```html
<section>
  <h2>Full-Height Image</h2>
  <img class="r-stretch r-frame" src="diagram.png" alt="System Architecture" />
  <p><em>Our system design</em></p>
</section>
```
