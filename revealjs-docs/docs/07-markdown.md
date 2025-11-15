---
title: Markdown
category: CONTENT
relevance_to_project: High
related_directives: [@markdown:, all content directives]
---

# Markdown

> **Critical Note**: Markdown support in RevealJS provides an alternative to HTML markup. For your project, this documentation helps understand the underlying structure that your markdown-to-HTML converter must replicate.

## Overview

RevealJS allows writing slide content using Markdown syntax, which is then converted to HTML at runtime via the Markdown plugin. This plugin uses [marked](https://github.com/chjj/marked) for parsing.

Your project differs by converting markdown to HTML **before** RevealJS initialization, but the resulting DOM structure must match what the Markdown plugin would generate.

## Required DOM Structure

### Inline Markdown (Recommended for Simple Content)

```html
<section data-markdown>
  <textarea data-template>
    ## Slide 1
    A paragraph with some text and a [link](https://hakim.se).
    ---
    ## Slide 2
    ---
    ## Slide 3
  </textarea>
</section>
```

> **Structure Requirement**: The `data-markdown` attribute tells RevealJS to process this section's content as markdown. The `<textarea data-template>` wrapper preserves formatting.

### Alternative: Script Template

```html
<section data-markdown>
  <script type="text/template">
    ## Slide Title
    - List item 1
    - List item 2
  </script>
</section>
```

> **Note**: Both `<textarea data-template>` and `<script type="text/template">` work identically. The textarea approach is more common.

## Slide Separators

Markdown slides are separated using horizontal rules:

| Separator | Usage | DOM Result |
|-----------|-------|------------|
| `---` (three dashes) | Horizontal slide break | New `<section>` at same level |
| `\n\n\n` (three newlines) | Can be customized via `data-separator` | Configurable |

```markdown
## Slide 1
Content here
---
## Slide 2
More content
---
## Slide 3
```

This generates:
```html
<div class="slides">
  <section><!-- Slide 1 --></section>
  <section><!-- Slide 2 --></section>
  <section><!-- Slide 3 --></section>
</div>
```

## External Markdown Files

Load markdown content from external files:

```html
<section
  data-markdown="example.md"
  data-separator="^\n\n\n"
  data-separator-vertical="^\n\n"
  data-separator-notes="^Note:"
  data-charset="iso-8859-15"
>
  <!-- Content loaded at runtime -->
</section>
```

### External File Attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-markdown` | Yes | - | Path to markdown file (requires local web server) |
| `data-separator` | No | `^\r?\n---\r?\n$` | Regex for horizontal slide breaks |
| `data-separator-vertical` | No | disabled | Regex for vertical slide breaks |
| `data-separator-notes` | No | `notes?:` | Regex for speaker notes delimiter |
| `data-charset` | No | utf-8 | Character encoding |

> **Important**: External markdown requires RevealJS to run from a local web server (file:// protocol won't work).

> **Cross-Platform Note**: Windows uses `\r\n` for line breaks, Unix/Mac use `\n`. Use `\r?\n` in regex patterns to support both.

## Element Attributes via Comments

Add HTML attributes to markdown elements using special comment syntax:

```html
<section data-markdown>
  <script type="text/template">
    - Item 1 <!-- .element: class="fragment" data-fragment-index="2" -->
    - Item 2 <!-- .element: class="fragment" data-fragment-index="1" -->
  </script>
</section>
```

This generates:
```html
<ul>
  <li class="fragment" data-fragment-index="2">Item 1</li>
  <li class="fragment" data-fragment-index="1">Item 2</li>
</ul>
```

**Syntax**: `<!-- .element: attr="value" attr2="value2" -->`

## Slide Attributes via Comments

Add attributes to the slide's `<section>` element:

```html
<section data-markdown>
  <script type="text/template">
    <!-- .slide: data-background="#ff0000" -->
    Markdown content
  </script>
</section>
```

This generates:
```html
<section data-background="#ff0000">
  <p>Markdown content</p>
</section>
```

**Syntax**: `<!-- .slide: attr="value" -->`

## Syntax Highlighting

Code blocks support line highlighting using bracket syntax:

```html
<section data-markdown>
  <textarea data-template>
    ```js [1-2|3|4]
    let a = 1;
    let b = 2;
    let c = x => 1 + 2 + x;
    c(3);
    ```
  </textarea>
</section>
```

**Line Highlight Syntax**:
- `[1-2|3|4]` - Step through: lines 1-2, then 3, then 4
- `[1,3]` - Highlight lines 1 and 3 simultaneously
- `[1-5]` - Highlight lines 1 through 5

See [code highlighting documentation](11-code.md) for full details.

### Line Number Offset

Start line numbers at a specific value:

```markdown
```js [712: 1-2|3|4]
let a = 1;
let b = 2;
let c = x => 1 + 2 + x;
c(3);
```
```

Line numbers will show as 712, 713, 714, 715.

## Markdown Plugin Configuration

### Loading the Plugin

```html
<script src="plugin/markdown/markdown.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealMarkdown],
  });
</script>
```

### Configuring marked.js

Pass options to the underlying marked parser:

```javascript
Reveal.initialize({
  // Options passed to marked
  // See https://marked.js.org/using_advanced#options
  markdown: {
    smartypants: true,
    breaks: true,
    gfm: true,
  },
});
```

**Common marked Options**:

| Option | Default | Description |
|--------|---------|-------------|
| `smartypants` | false | Use smart typography (curly quotes, em dashes) |
| `breaks` | false | Convert `\n` to `<br>` (GitHub style) |
| `gfm` | true | GitHub Flavored Markdown |
| `pedantic` | false | Strict markdown compliance |

## Formatting Sensitivity

> **Warning**: Markdown parsing is sensitive to:
> - **Indentation** - Avoid mixing tabs and spaces
> - **Line breaks** - Avoid consecutive blank lines where not intended
> - **Whitespace** - Extra spaces can affect parsing

```html
<!-- GOOD -->
<section data-markdown>
  <textarea data-template>
## Title
Content here
  </textarea>
</section>

<!-- BAD - Mixed indentation -->
<section data-markdown>
  <textarea data-template>
    ## Title
\t\tContent here  <!-- Tab + spaces mix -->
  </textarea>
</section>
```

---

**For Your Project**:

### Architecture Difference

**RevealJS Approach**: Markdown → (runtime) → HTML
- Client-side conversion using marked.js plugin
- `data-markdown` attribute triggers processing
- Conversion happens when presentation loads

**Your Approach**: Markdown → (pre-generation) → HTML → RevealJS
- Server-side/build-time conversion
- No `data-markdown` needed on slides
- Direct HTML structure from your generator

### Required HTML Generation

Your markdown converter must produce the **same DOM structure** that the Markdown plugin would generate:

```markdown
# Input (your markdown)
@slide:
## Welcome
- Point 1
- Point 2
```

**MUST** generate:

```html
<section>
  <h2>Welcome</h2>
  <ul>
    <li>Point 1</li>
    <li>Point 2</li>
  </ul>
</section>
```

**NOT**:
```html
<!-- WRONG - no section wrapper -->
<h2>Welcome</h2>
<ul>
  <li>Point 1</li>
  <li>Point 2</li>
</ul>

<!-- WRONG - incorrect nesting -->
<div class="slide">
  <section>
    ...
  </section>
</div>
```

### Element Attributes from Directives

Map your directives to element attributes:

```markdown
@fragment:
- Item 1
- Item 2
```

**MUST** generate:

```html
<ul>
  <li class="fragment">Item 1</li>
  <li class="fragment">Item 2</li>
</ul>
```

### Slide Attributes from Directives

```markdown
@slide:
@background-color: #ff0000
## Red Slide
```

**MUST** generate:

```html
<section data-background-color="#ff0000">
  <h2>Red Slide</h2>
</section>
```

### Validation Rules

When generating HTML from markdown:

- [ ] Every slide is wrapped in `<section>`
- [ ] Sections are direct children of `<div class="slides">`
- [ ] All RevealJS attributes are on `<section>`, not inner elements
- [ ] Fragment classes are on the target element (li, p, etc.)
- [ ] Code blocks include proper language classes
- [ ] Links are properly formed with href attributes
- [ ] Images include alt text

### Common Pitfalls

1. **Pitfall**: Using `<div>` instead of `<section>` for slides
   **Solution**: Always use `<section>` - RevealJS requires it

2. **Pitfall**: Placing `data-background-*` on inner elements
   **Solution**: All `data-*` slide attributes go on `<section>`

3. **Pitfall**: Forgetting to wrap lists in `<ul>` or `<ol>`
   **Solution**: Follow standard HTML structure from markdown

4. **Pitfall**: Not escaping HTML entities in markdown
   **Solution**: Use proper HTML entities (`&lt;`, `&gt;`, `&amp;`)

### Parser Recommendation

For your server-side markdown conversion, consider:
- **marked** (same as RevealJS) - Best compatibility
- **markdown-it** - More features, plugins
- **remark** - AST-based, powerful transformations

Using **marked** ensures 100% compatibility with RevealJS examples.

### Testing Strategy

To verify your HTML matches RevealJS expectations:

1. Create a test slide with RevealJS markdown plugin
2. Generate your HTML version
3. Compare DOM structure in browser DevTools
4. Validate both render identically
5. Test with all your directives

```javascript
// Validation helper
function validateSlideStructure(slideElement) {
  const checks = [
    slideElement.tagName === 'SECTION',
    slideElement.parentElement.classList.contains('slides'),
    // Add more checks...
  ];
  return checks.every(Boolean);
}
```
