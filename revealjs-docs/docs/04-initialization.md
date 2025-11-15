---
title: Initialization
category: INITIALIZATION
relevance_to_project: High
related_directives: []
---

# Initialization

> **Critical Setup**: How to properly initialize reveal.js for your bundled presentations

The most common reveal.js use case is to have a single presentation which covers the full viewport. As of 4.0 we also support running multiple presentations in parallel on the same page as well as including the library as an ES module.

## Single Presentation (Global Reveal Object)

If you only have a single presentation on the page we recommend initializing reveal.js using the global `Reveal` object. The `Reveal.initialize` method accepts one argument; a reveal.js config object.

```html
<script src="dist/reveal.js"></script>
<script>
  Reveal.initialize({ transition: 'none' });
</script>
```

> **Required HTML Structure**:
> ```html
> <div class="reveal">
>   <div class="slides">
>     <!-- Slides here -->
>   </div>
> </div>
> ```

The `initialize` method returns a promise which will resolve as soon as the presentation is ready and can be interacted with via the API.

```javascript
Reveal.initialize().then(() => {
  // reveal.js is ready
});
```

## Multiple Presentations

To run multiple presentations side-by-side on the same page you can create instances of the `Reveal` class. The `Reveal` constructor accepts two arguments: the `.reveal` HTML element root of the presentation and an optional config object.

### Required Config and Structure

```html
<div class="reveal deck1" style="width: 500px; height: 400px;">
  <div class="slides">
    <!-- Deck 1 slides -->
  </div>
</div>

<div class="reveal deck2" style="width: 500px; height: 400px;">
  <div class="slides">
    <!-- Deck 2 slides -->
  </div>
</div>

<script src="dist/reveal.js"></script>
<script>
  let deck1 = new Reveal(document.querySelector('.deck1'), {
    embedded: true,
    keyboardCondition: 'focused', // only react to keys when focused
  });
  deck1.initialize();

  let deck2 = new Reveal(document.querySelector('.deck2'), {
    embedded: true,
  });
  deck2.initialize();
</script>
```

> **Critical**: Set `embedded: true` config option. This makes presentations size themselves according to their `.reveal` root element size, rather than the browser viewport.

> **Structure**: You MUST manually define the `width` and `height` CSS properties for each `.reveal` element.

## ES Module

We provide two JavaScript bundles:

1. **`dist/reveal.js`** - UMD bundle with ES5 syntax, exposes to global window
2. **`dist/reveal.esm.js`** - ES module for modern bundlers or `<script type="module">`

### Using ES Modules in Browser

```html
<script type="module">
  import Reveal from 'dist/reveal.esm.js';
  import Markdown from 'plugin/markdown/markdown.esm.js';
  Reveal.initialize({
    plugins: [Markdown],
  });
</script>
```

### Using ES Modules with Bundlers

If installing from npm and bundling:

```javascript
import Reveal from 'reveal.js';
Reveal.initialize();
```

## Uninitializing reveal.js

If you want to uninitialize reveal.js you can use the `destroy` API method. This will undo all changes that the framework has made to the DOM, remove all event listeners and unregister/destroy all plugins.

```javascript
Reveal.destroy();
```

---

**For Your Project - HTML Generation Requirements**:

### Minimal Working HTML Structure

Your markdown-to-HTML converter MUST generate this exact structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Required reveal.js styles -->
  <link rel="stylesheet" href="dist/reveal.css">
  <link rel="stylesheet" href="dist/theme/black.css" id="theme">

  <!-- Optional: Theme for code syntax highlighting -->
  <link rel="stylesheet" href="plugin/highlight/monokai.css">
</head>
<body>
  <!-- CRITICAL STRUCTURE -->
  <div class="reveal">
    <div class="slides">

      <!-- Your generated slides go here -->
      <section>
        <h2>Slide 1</h2>
        <p>Content</p>
      </section>

      <section>
        <h2>Slide 2</h2>
        <ul>
          <li class="fragment">Fragment 1</li>
          <li class="fragment">Fragment 2</li>
        </ul>
      </section>

    </div>
  </div>

  <!-- Required reveal.js scripts -->
  <script src="dist/reveal.js"></script>

  <!-- Optional plugins -->
  <script src="plugin/notes/notes.js"></script>
  <script src="plugin/markdown/markdown.js"></script>
  <script src="plugin/highlight/highlight.js"></script>

  <!-- Initialize -->
  <script>
    Reveal.initialize({
      hash: true,
      plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
    });
  </script>
</body>
</html>
```

### DOM Hierarchy Requirements

**Level 1** - Document root:
```html
<html>
```

**Level 2** - Head and body:
```html
<head>
  <!-- CSS links -->
</head>
<body>
```

**Level 3** - Reveal container (CRITICAL):
```html
<div class="reveal">
```

**Level 4** - Slides container (CRITICAL):
```html
<div class="slides">
```

**Level 5** - Individual slides (CRITICAL):
```html
<section>
  <!-- Slide content -->
</section>
```

**Level 6+** - Slide content:
```html
<h2>Title</h2>
<p>Paragraph</p>
<ul>
  <li class="fragment">Item</li>
</ul>
```

### Critical Requirements

1. **Nesting is mandatory**: `.reveal` > `.slides` > `<section>`
2. **Class names are exact**: `reveal` and `slides` (lowercase, no prefixes)
3. **Element types matter**: `<div class="reveal">` and `<div class="slides">` must be `<div>`s
4. **Sections are slides**: Each `<section>` is one slide
5. **Initialize after DOM**: `Reveal.initialize()` must be called after DOM is ready

### Vertical Slides

For vertical stacks, nest `<section>` inside `<section>`:

```html
<section><!-- Horizontal slide 1 -->
  <section>Vertical slide 1.1</section>
  <section>Vertical slide 1.2</section>
</section>
<section><!-- Horizontal slide 2 -->
  <section>Vertical slide 2.1</section>
  <section>Vertical slide 2.2</section>
</section>
```

### Validation Checklist

Your HTML generator should validate:

- [ ] `<div class="reveal">` exists
- [ ] `<div class="slides">` is direct child of `.reveal`
- [ ] All slides are `<section>` elements
- [ ] `<section>` elements are direct children of `.slides` (or nested in `<section>` for vertical)
- [ ] `Reveal.initialize()` is called in a `<script>` tag
- [ ] Required CSS and JS files are linked correctly
- [ ] No `<section>` elements outside of `.slides`

### For Playwright Recording

```javascript
// In your Playwright script
const page = await browser.newPage();
await page.goto('file:///path/to/generated.html');

// Wait for reveal.js to be ready
await page.waitForFunction(() => window.Reveal && window.Reveal.isReady());

// Now you can control the presentation
await page.evaluate(() => {
  Reveal.configure({
    autoSlide: 0,
    keyboard: false,
    // ... recording config
  });
});
```
