---
title: Transitions
category: CUSTOMIZATION
relevance_to_project: High
related_directives: [@transition:]
---

# Transitions

> **@transition: Directive**: Maps directly to `data-transition` attribute on `<section>` elements

When navigating a presentation, we transition between slides by animating them from right to left by default. This transition can be changed by setting the `transition` config option to a valid transition style. Transitions can also be overridden for a specific slide using the `data-transition` attribute.

## Required DOM Structure

```html
<!-- Global transition set in config -->
<div class="reveal">
  <div class="slides">
    <!-- Per-slide transition override -->
    <section data-transition="zoom">
      <h2>This slide will override the presentation transition and zoom!</h2>
    </section>

    <!-- Transition speed control -->
    <section data-transition-speed="fast">
      <h2>Choose from three transition speeds: default, fast or slow!</h2>
    </section>
  </div>
</div>
```

> **Critical**: The `data-transition` attribute MUST be on the `<section>` element, not on inner content elements

## Transition Styles

| Name    | Effect                                                                     |
|---------|----------------------------------------------------------------------------|
| none    | Switch backgrounds instantly                                               |
| fade    | Cross fade — *default for background transitions*                          |
| slide   | Slide between backgrounds — *default for slide transitions*                 |
| convex  | Slide at a convex angle                                                    |
| concave | Slide at a concave angle                                                   |
| zoom    | Scale the incoming slide up so it grows in from the center of the screen  |

## Separate In-Out Transitions

You can also use different in and out transitions for the same slide by appending `-in` or `-out` to the transition name.

```html
<section data-transition="slide">The train goes on …</section>
<section data-transition="slide">and on …</section>
<section data-transition="slide-in fade-out">and stops.</section>
<section data-transition="fade-in slide-out">
  (Passengers entering and leaving)
</section>
<section data-transition="slide">And it starts again.</section>
```

> **DOM Requirement**: `data-transition` values must be valid CSS-compatible strings (lowercase, hyphen-separated)

## Background Transitions

We transition between slide backgrounds using a cross fade by default. This can be changed on a global level or overridden for specific slides.

### Global Config

```javascript
Reveal.initialize({
  backgroundTransition: 'slide',
});
```

### Per-Slide Override

```html
<section data-background-transition="zoom" data-background="#ff0000">
  <!-- Slide content -->
</section>
```

> **Structure Note**: Background transition attribute goes on the same `<section>` as `data-background`

## Transition Speeds

Three speed options available:

```html
<section data-transition-speed="default"><!-- Normal speed --></section>
<section data-transition-speed="fast"><!-- ~150ms faster --></section>
<section data-transition-speed="slow"><!-- ~150ms slower --></section>
```

---

**For Your Project - @transition: Directive Processing**:

### Markdown to HTML Conversion

```markdown
@transition: zoom
# My Slide Title
Content here
```

**MUST** generate:

```html
<section data-transition="zoom">
  <h2>My Slide Title</h2>
  <p>Content here</p>
</section>
```

### Valid Transition Values

Your markdown parser MUST validate `@transition:` values against this list:
- `none`
- `fade`
- `slide`
- `convex`
- `concave`
- `zoom`
- `slide-in` / `slide-out`
- `fade-in` / `fade-out`
- `convex-in` / `convex-out`
- `concave-in` / `concave-out`
- `zoom-in` / `zoom-out`
- Combined: `"slide-in fade-out"` (space-separated for in/out)

### Linting Requirements

```javascript
// In your linting system
const validTransitions = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];
const validModifiers = ['in', 'out'];

function validateTransition(value) {
  const parts = value.split(/\s+/);
  for (const part of parts) {
    const [base, modifier] = part.split('-');
    if (!validTransitions.includes(base)) {
      throw new Error(`Invalid transition: ${base}`);
    }
    if (modifier && !validModifiers.includes(modifier)) {
      throw new Error(`Invalid transition modifier: ${modifier}`);
    }
  }
}
```

### HTML Generation Template

```javascript
// Pseudocode for your HTML generator
function generateSlide(markdownSlide, directives) {
  const attrs = [];

  if (directives.transition) {
    attrs.push(`data-transition="${directives.transition}"`);
  }
  if (directives.transitionSpeed) {
    attrs.push(`data-transition-speed="${directives.transitionSpeed}"`);
  }

  return `<section ${attrs.join(' ')}>
    ${convertMarkdownToHTML(markdownSlide.content)}
  </section>`;
}
```

### Timing Considerations for Video

- **default**: ~800ms transition
- **fast**: ~400ms transition
- **slow**: ~1200ms transition

Account for these durations when synchronizing audio timing!
