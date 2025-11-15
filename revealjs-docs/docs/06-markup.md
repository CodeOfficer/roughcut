---
title: Markup
category: CONTENT
relevance_to_project: High
related_directives: [@slide:, all directives]
---

# Markup

> **Foundational Document**: This defines the core HTML structure that your markdown-to-HTML converter MUST generate. Every presentation requires this exact DOM hierarchy.

## Overview

RevealJS presentations use a specific HTML structure that must be followed precisely. The basic hierarchy is:

```
.reveal (container)
└── .slides (slides wrapper)
    └── section (individual slide)
        └── content (HTML elements)
```

## Required DOM Structure

### Minimal Working Example

```html
<html>
  <head>
    <link rel="stylesheet" href="dist/reveal.css" />
    <link rel="stylesheet" href="dist/theme/white.css" />
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <section>Slide 1</section>
        <section>Slide 2</section>
      </div>
    </div>
    <script src="dist/reveal.js"></script>
    <script>
      Reveal.initialize();
    </script>
  </body>
</html>
```

> **Critical Structure**: The hierarchy `.reveal > .slides > section` is mandatory and cannot be changed.

### DOM Hierarchy Explained

```html
<div class="reveal">               <!-- Root container (REQUIRED) -->
  <div class="slides">             <!-- Slides wrapper (REQUIRED) -->
    <section>                      <!-- Horizontal slide 1 (REQUIRED) -->
      <h2>Title</h2>               <!-- Slide content (your choice) -->
      <p>Content here</p>
    </section>
    <section>                      <!-- Horizontal slide 2 -->
      <h2>Another Slide</h2>
    </section>
  </div>
</div>
```

**Requirements**:
- `<div class="reveal">` must be the outermost container
- `<div class="slides">` must be direct child of `.reveal`
- `<section>` elements must be direct children of `.slides`
- Each `<section>` represents one slide
- Slide content goes inside `<section>` elements

## Horizontal vs Vertical Slides

### Horizontal Slides (Linear Progression)

```html
<div class="reveal">
  <div class="slides">
    <section>Slide 1</section>
    <section>Slide 2</section>
    <section>Slide 3</section>
  </div>
</div>
```

**Navigation**: Left/Right arrows or swipe

### Vertical Slides (Nested Sections)

```html
<div class="reveal">
  <div class="slides">
    <section>Horizontal Slide</section>
    <section>
      <section>Vertical Slide 1</section>
      <section>Vertical Slide 2</section>
    </section>
  </div>
</div>
```

> **Nesting Rule**: Nest `<section>` elements inside another `<section>` to create vertical slides. The first nested section is the "root" shown in horizontal navigation.

**Navigation**:
- Horizontal: Left/Right arrows
- Vertical: Up/Down arrows

See [20-vertical-slides.md](20-vertical-slides.md) for full details.

## Viewport

The **viewport** is the DOM element that determines the presentation's size on the page.

- **Default viewport**: `<body>` element
- **Multi-presentation pages**: Each `.reveal` element becomes its own viewport

When RevealJS initializes, it adds the `reveal-viewport` class to the viewport element.

```html
<!-- Single presentation: body is viewport -->
<body class="reveal-viewport">
  <div class="reveal">...</div>
</body>

<!-- Multiple presentations: each .reveal is viewport -->
<body>
  <div class="reveal reveal-viewport">...</div>
  <div class="reveal reveal-viewport">...</div>
</body>
```

## Slide States

Apply custom states to slides using the `data-state` attribute. The state name becomes a class on the viewport when that slide is active.

### Syntax

```html
<section data-state="make-it-pop">
  <h2>Special Slide</h2>
</section>
```

When this slide is active, the viewport gets the class `make-it-pop`:

```html
<body class="reveal-viewport make-it-pop">
  <!-- presentation -->
</body>
```

### CSS Styling with States

```css
/* Style applied only when slide with data-state="make-it-pop" is active */
.make-it-pop {
  filter: drop-shadow(0 0 10px purple);
}

.make-it-pop .reveal {
  background: radial-gradient(circle, purple, black);
}
```

### JavaScript Event Listeners

Listen for state changes:

```javascript
Reveal.on('make-it-pop', () => {
  console.log('✨ Special slide is now active');
});
```

**Event firing**: State events fire when entering the slide and when leaving it.

### Use Cases for Slide States

1. **Background changes**
   ```html
   <section data-state="dark-bg">Content</section>
   ```
   ```css
   .dark-bg { background: #000; color: #fff; }
   ```

2. **Animation triggers**
   ```javascript
   Reveal.on('animate-logo', () => {
     document.querySelector('.logo').classList.add('spin');
   });
   ```

3. **Audio/video control**
   ```javascript
   Reveal.on('video-slide', () => {
     document.querySelector('video').play();
   });
   ```

4. **Analytics tracking**
   ```javascript
   Reveal.on('important-slide', () => {
     analytics.track('Viewed important slide');
   });
   ```

## Attributes Reference

| Attribute | Target | Values | Description |
|-----------|--------|--------|-------------|
| `class="reveal"` | `<div>` | - | Root container (required) |
| `class="slides"` | `<div>` | - | Slides wrapper (required) |
| `data-state` | `<section>` | string | Custom state name |

## Valid Section Nesting

```html
<!-- ✅ CORRECT: Horizontal slides -->
<div class="slides">
  <section>Slide 1</section>
  <section>Slide 2</section>
</div>

<!-- ✅ CORRECT: Vertical slides -->
<div class="slides">
  <section>
    <section>Vertical 1</section>
    <section>Vertical 2</section>
  </section>
</div>

<!-- ✅ CORRECT: Mixed -->
<div class="slides">
  <section>Horizontal</section>
  <section>
    <section>Vertical 1</section>
    <section>Vertical 2</section>
  </section>
  <section>Horizontal</section>
</div>

<!-- ❌ WRONG: Three levels of nesting -->
<div class="slides">
  <section>
    <section>
      <section>TOO DEEP</section>
    </section>
  </section>
</div>

<!-- ❌ WRONG: Section not in .slides -->
<div class="reveal">
  <section>Wrong placement</section>
</div>

<!-- ❌ WRONG: Wrong class names -->
<div class="reveal-container">
  <div class="slide-wrapper">
    <section>Wrong structure</section>
  </div>
</div>
```

---

**For Your Project**:

### HTML Generation Requirements

Your markdown-to-HTML converter must output the exact structure RevealJS expects:

```markdown
# Input (your markdown)
@slide:
## Welcome
Content here

@slide:
## Slide 2
More content
```

**MUST** generate:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="dist/reveal.css" />
  <link rel="stylesheet" href="dist/theme/white.css" />
</head>
<body>
  <div class="reveal">
    <div class="slides">

      <section>
        <h2>Welcome</h2>
        <p>Content here</p>
      </section>

      <section>
        <h2>Slide 2</h2>
        <p>More content</p>
      </section>

    </div>
  </div>

  <script src="dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      // your config
    });
  </script>
</body>
</html>
```

### Directive to Attribute Mapping

Map all slide-level directives to attributes on `<section>`:

```markdown
@slide:
@state: important
@background-color: #ff0000
@transition: zoom
## Important Slide
```

**MUST** generate:

```html
<section
  data-state="important"
  data-background-color="#ff0000"
  data-transition="zoom"
>
  <h2>Important Slide</h2>
</section>
```

> **Critical**: All `data-*` attributes go on the `<section>` element, NOT on inner elements.

### Template Structure

Create a base HTML template with the required structure:

```javascript
// pseudocode for your generator
function generateHTML(slides, config) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${config.title || 'Presentation'}</title>
  <link rel="stylesheet" href="${config.revealPath}/reveal.css">
  <link rel="stylesheet" href="${config.revealPath}/theme/${config.theme}.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slides.map(slide => generateSlide(slide)).join('\n')}
    </div>
  </div>

  <script src="${config.revealPath}/reveal.js"></script>
  <script>
    Reveal.initialize(${JSON.stringify(config.revealConfig)});
  </script>
</body>
</html>
  `.trim();
}

function generateSlide(slide) {
  const attrs = buildAttributes(slide.directives);
  return `
    <section${attrs}>
      ${slide.content}
    </section>
  `;
}
```

### Validation Rules

Your HTML generator must validate:

- [ ] `<div class="reveal">` exists
- [ ] `<div class="slides">` is direct child of `.reveal`
- [ ] All slides are `<section>` elements
- [ ] Sections are direct children of `.slides` (or nested within another section)
- [ ] Maximum 2 levels of section nesting
- [ ] All `data-*` attributes are on `<section>`, not inner elements
- [ ] Class names are exact (case-sensitive): `reveal`, `slides`
- [ ] RevealJS CSS and JS are included

### Validation Function

```javascript
function validateStructure(html) {
  const errors = [];

  // Parse HTML
  const dom = parseHTML(html);

  // Check for .reveal
  const reveal = dom.querySelector('.reveal');
  if (!reveal) {
    errors.push('Missing <div class="reveal">');
  }

  // Check for .slides
  const slides = reveal?.querySelector('.slides');
  if (!slides) {
    errors.push('Missing <div class="slides">');
  }

  // Check sections are direct children
  const sections = slides?.children || [];
  for (const child of sections) {
    if (child.tagName !== 'SECTION') {
      errors.push(`Invalid child of .slides: <${child.tagName}>`);
    }
  }

  // Check nesting depth
  const nestedSections = dom.querySelectorAll('section section section');
  if (nestedSections.length > 0) {
    errors.push('Section nesting too deep (max 2 levels)');
  }

  return errors;
}
```

### Common Pitfalls

1. **Pitfall**: Using different class names
   **Solution**: Must be exactly `reveal` and `slides` (case-sensitive)

2. **Pitfall**: Placing content outside `<section>`
   **Solution**: All slide content must be wrapped in `<section>`

3. **Pitfall**: Wrong nesting order
   **Solution**: Always `.reveal > .slides > section`

4. **Pitfall**: Too many nesting levels
   **Solution**: Maximum 2 levels (horizontal > vertical)

5. **Pitfall**: Putting `data-*` attributes on wrong elements
   **Solution**: Slide attributes go on `<section>`, not on `<h2>` or `<p>`

### Testing Your Generator

```javascript
// Test cases for your HTML generator
const testCases = [
  {
    name: 'Single slide',
    markdown: '@slide:\n## Test',
    expectedSections: 1
  },
  {
    name: 'Multiple slides',
    markdown: '@slide:\n## Slide 1\n\n@slide:\n## Slide 2',
    expectedSections: 2
  },
  {
    name: 'Slide with state',
    markdown: '@slide:\n@state: special\n## Test',
    expectedAttr: 'data-state="special"'
  },
  {
    name: 'Nested sections',
    markdown: '@slide:\n@vertical:\n## V1\n\n@vertical:\n## V2',
    expectedStructure: 'section > section'
  }
];

testCases.forEach(test => {
  const html = generateHTML(test.markdown);
  const errors = validateStructure(html);
  if (errors.length > 0) {
    console.error(`Test "${test.name}" failed:`, errors);
  }
});
```

### Integration with Playwright

Ensure structure is correct before recording:

```javascript
// In your Playwright script
await page.goto('http://localhost:8000/presentation.html');

// Validate structure
const structureValid = await page.evaluate(() => {
  const reveal = document.querySelector('.reveal');
  const slides = document.querySelector('.slides');
  const sections = document.querySelectorAll('.slides > section');

  return reveal && slides && sections.length > 0;
});

if (!structureValid) {
  throw new Error('Invalid RevealJS structure');
}

// Proceed with recording...
```
