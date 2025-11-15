---
title: Auto-Animate
category: FEATURES
relevance_to_project: Medium
related_directives: []
---

# Auto-Animate

> **Note**: Auto-animate is a presentation feature. Less critical for static markdown-to-video conversion, but important if you want smooth code demonstrations.

reveal.js can automatically animate elements across slides. All you need to do is add `data-auto-animate` to two adjacent slide `<section>` elements and Auto-Animate will animate all matching elements between the two.

## Required DOM Structure

```html
<div class="reveal">
  <div class="slides">
    <section data-auto-animate>
      <h1>Auto-Animate</h1>
    </section>
    <section data-auto-animate>
      <h1 style="margin-top: 100px; color: red;">Auto-Animate</h1>
    </section>
  </div>
</div>
```

> **Critical Structure**: `data-auto-animate` MUST be on adjacent `<section>` elements

## How Elements are Matched

When you navigate between two auto-animated slides we'll do our best to automatically find matching elements in the two slides:

- **Text**: Match if both text contents and node type are identical
- **Images/Videos/Iframes**: Match by `src` attribute
- **DOM Order**: Elements are matched in order they appear

### Manual Matching with data-id

In situations where automatic matching is not feasible you can give the objects that you want to animate between a matching `data-id` attribute.

```html
<section data-auto-animate>
  <div data-id="box" style="height: 50px; background: salmon;"></div>
</section>
<section data-auto-animate>
  <div data-id="box" style="height: 200px; background: blue;"></div>
</section>
```

> **Structure Requirement**: `data-id` must be on the element you want to animate, not a parent

## Animation Settings

| Attribute                    | Default | Description                                                                 |
|------------------------------|---------|-----------------------------------------------------------------------------|
| data-auto-animate-easing     | ease    | A CSS easing function                                                       |
| data-auto-animate-unmatched  | true    | Whether elements with no match should fade in                               |
| data-auto-animate-duration   | 1.0     | Animation duration in seconds                                               |
| data-auto-animate-delay      | 0       | Animation delay in seconds (element-level only, not slide-level)            |
| data-auto-animate-id         | *absent*| An id tying auto-animate slides together                                    |
| data-auto-animate-restart    | *absent*| Breaks apart two adjacent auto-animate slides                               |

### Global Config

```javascript
Reveal.initialize({
  autoAnimateEasing: 'ease-out',
  autoAnimateDuration: 0.8,
  autoAnimateUnmatched: false,
});
```

### Per-Slide Override

```html
<section
  data-auto-animate
  data-auto-animate-easing="ease-in-out"
  data-auto-animate-duration="2">
  <!-- content -->
</section>
```

## Auto-Animate Groups

### data-auto-animate-id

Use to specify arbitrary ids for slides. Two adjacent slides will only auto-animate if they have the same id or if both don't have one.

```html
<section data-auto-animate data-auto-animate-id="group-a">
  <h1>Group A - Slide 1</h1>
</section>
<section data-auto-animate data-auto-animate-id="group-a">
  <h1>Group A - Slide 2</h1>
</section>

<section data-auto-animate data-auto-animate-id="group-b">
  <h1>Group B - Slide 1</h1>
</section>
```

### data-auto-animate-restart

Applying this attribute to a slide will prevent auto-animate between the previous slide and it (even if they have the same id) but *not* between it and the next slide.

```html
<section data-auto-animate>Animates from previous</section>
<section data-auto-animate data-auto-animate-restart>
  Does NOT animate from previous, but...
</section>
<section data-auto-animate>
  ...DOES animate from previous
</section>
```

## Animating Code Blocks

We support animations between code blocks. Make sure that the code block has `data-line-numbers` enabled and that all blocks have a matching `data-id` value.

```html
<section data-auto-animate>
  <pre data-id="code-animation"><code data-trim data-line-numbers>
    let planets = [
      { name: 'mars', diameter: 6779 },
    ]
  </code></pre>
</section>
<section data-auto-animate>
  <pre data-id="code-animation"><code data-trim data-line-numbers>
    let planets = [
      { name: 'mars', diameter: 6779 },
      { name: 'earth', diameter: 12742 },
      { name: 'jupiter', diameter: 139820 }
    ]
  </code></pre>
</section>
```

> **DOM Structure**:
> - `data-id` on `<pre>` element
> - `data-trim data-line-numbers` on `<code>` element
> - Nested structure: `<pre><code>content</code></pre>`

## Events

```javascript
Reveal.on('autoanimate', (event) => {
  // event.fromSlide, event.toSlide
});
```

## State Attributes (Advanced)

reveal.js adds state attributes during auto-animation:

- **Slide states**: `data-auto-animate="pending"` → `data-auto-animate="running"`
- **Element states**: `data-auto-animate-target="unique-id"` or `"unmatched"`

---

**For Your Project**:

Auto-animate is **optional** for basic markdown presentations. Consider it if you want:

1. **Smooth code demonstrations** - Shows code evolving line-by-line
2. **Visual transitions** - Elements morphing between slides

### HTML Generation for Code Demos

If supporting code auto-animation:

```markdown
@auto-animate: true
@code-id: demo-1
```javascript
function hello() {
  console.log('world');
}
```

```markdown
@auto-animate: true
@code-id: demo-1
```javascript
function hello(name) {
  console.log('Hello ' + name);
}
```

Should generate:

```html
<section data-auto-animate>
  <pre data-id="demo-1"><code class="language-javascript" data-trim data-line-numbers>
function hello() {
  console.log('world');
}
  </code></pre>
</section>
<section data-auto-animate>
  <pre data-id="demo-1"><code class="language-javascript" data-trim data-line-numbers>
function hello(name) {
  console.log('Hello ' + name);
}
  </code></pre>
</section>
```

**Key structure requirements**:
- Same `data-id` on both `<pre>` elements
- Both sections have `data-auto-animate`
- Code content formatted identically (whitespace matters!)
