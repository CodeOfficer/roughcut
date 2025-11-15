---
title: Math
category: CONTENT
relevance_to_project: Low
related_directives: []
requires_plugin: RevealMath (KaTeX, MathJax2, or MathJax3)
---

# Math

## Overview

The Math plugin lets you include beautifully typeset math formulas in your slides using [LaTeX](https://en.wikipedia.org/wiki/LaTeX) syntax. Three typesetting libraries are available: **KaTeX** (recommended), **MathJax 2**, and **MathJax 3**.

## Required Plugin Setup

You must initialize reveal.js with one of the Math plugin variants:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Your reveal.js setup -->
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Slides with math -->
    </div>
  </div>

  <script src="dist/reveal.js"></script>
  <script src="plugin/math/math.js"></script>
  <script>
    // Choose ONE of these plugin variants
    Reveal.initialize({
      plugins: [RevealMath.KaTeX]      // Recommended
      // plugins: [RevealMath.MathJax2]
      // plugins: [RevealMath.MathJax3]
    });
  </script>
</body>
</html>
```

> **Plugin Requirement**: Math rendering ONLY works when a RevealMath plugin variant is loaded.

## Basic Math Structure

### LaTeX in HTML Slides

Add LaTeX formulas directly in your slide content using math delimiters:

```html
<section>
  <h2>The Lorenz Equations</h2>
  \[\begin{aligned}
  \dot{x} &amp; = \sigma(y-x) \\
  \dot{y} &amp; = \rho x - y - xz \\
  \dot{z} &amp; = -\beta z + xy
  \end{aligned} \]
</section>
```

### LaTeX in Markdown Slides

Use math delimiters inside `data-markdown` sections:

```html
<section data-markdown>
  ## Math Formula

  $$ J(\theta_0,\theta_1) = \sum_{i=0} $$
</section>
```

## Math Delimiters

Different delimiters control whether math is displayed inline or as a block:

| Delimiter | Mode | Example | Result |
|-----------|------|---------|--------|
| `$$...$$` | Display (block) | `$$ E = mc^2 $$` | Centered, larger |
| `$...$` | Inline | `$E = mc^2$` | Inline with text |
| `\[...\]` | Display (block) | `\[ E = mc^2 \]` | Centered, larger |
| `\(...\)` | Inline | `\( E = mc^2 \)` | Inline with text |

**Display mode** (block):
```html
<section>
  <p>The famous equation:</p>
  $$ E = mc^2 $$
</section>
```

**Inline mode**:
```html
<section>
  <p>Einstein's equation $E = mc^2$ changed physics.</p>
</section>
```

## Typesetting Libraries

### Comparison

| Library | Plugin | Config | Added | Notes |
|---------|--------|--------|-------|-------|
| [KaTeX](https://katex.org/) | `RevealMath.KaTeX` | `katex` | v4.2.0 | **Recommended**. Fast, no dependencies |
| [MathJax 2](https://docs.mathjax.org/en/v2.7-latest/) | `RevealMath.MathJax2` | `mathjax2` | Earlier | Older, widely compatible |
| [MathJax 3](https://www.mathjax.org/) | `RevealMath.MathJax3` | `mathjax3` | v4.2.0 | Modern, more features |

### KaTeX (Recommended)

**Plugin Registration**:
```javascript
Reveal.initialize({
  plugins: [RevealMath.KaTeX]
});
```

**Configuration** (default values shown):
```javascript
Reveal.initialize({
  katex: {
    version: 'latest',  // KaTeX version to load from CDN
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  plugins: [RevealMath.KaTeX]
});
```

**Using a Specific Version**:
```javascript
Reveal.initialize({
  katex: {
    version: '0.13.18'  // Fixed version from CDN
  },
  plugins: [RevealMath.KaTeX]
});
```

**Offline/Local KaTeX**:
```javascript
Reveal.initialize({
  katex: {
    local: 'node_modules/katex'  // Path to local KaTeX installation
  },
  plugins: [RevealMath.KaTeX]
});
```

> **Note**: When using `local`, the `version` option is ignored.

### MathJax 2

**Plugin Registration**:
```javascript
Reveal.initialize({
  plugins: [RevealMath.MathJax2]
});
```

**Configuration** (default values shown):
```javascript
Reveal.initialize({
  mathjax2: {
    mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@2/MathJax.js',
    config: 'TeX-AMS_HTML-full',
    // Pass other options into MathJax.Hub.Config()
    tex2jax: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)']
      ],
      skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
  },
  plugins: [RevealMath.MathJax2]
});
```

**Using a Specific Version**:
```javascript
Reveal.initialize({
  mathjax2: {
    mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@2.7.8/MathJax.js'
  },
  plugins: [RevealMath.MathJax2]
});
```

### MathJax 3

**Plugin Registration**:
```javascript
Reveal.initialize({
  plugins: [RevealMath.MathJax3]
});
```

**Configuration** (default values shown):
```javascript
Reveal.initialize({
  mathjax3: {
    mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
    tex: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)']
      ]
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
  },
  plugins: [RevealMath.MathJax3]
});
```

**Using Different Output Formats**:
```javascript
Reveal.initialize({
  mathjax3: {
    // tex-svg is smaller than tex-mml-chtml
    mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
  },
  plugins: [RevealMath.MathJax3]
});
```

**Common Output Formats**:
- `tex-mml-chtml.js` - Recognizes TeX and MathML, outputs HTML+CSS (most general, largest)
- `tex-svg.js` - TeX only, outputs SVG (smaller, good for most cases)
- `tex-chtml.js` - TeX only, outputs HTML+CSS

## Configuration Reference

### KaTeX Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `version` | string | `'latest'` | KaTeX version to load from CDN. Ignored if `local` is set. |
| `local` | string | undefined | Path to local KaTeX installation |
| `delimiters` | array | See above | Array of delimiter objects: `{left, right, display}` |
| `ignoredTags` | array | See above | HTML tags to skip when searching for math |

### MathJax 2 Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mathjax` | string | CDN URL | URL to MathJax library |
| `config` | string | `'TeX-AMS_HTML-full'` | MathJax config preset |
| `tex2jax` | object | See above | Options passed to `MathJax.Hub.Config()` |

### MathJax 3 Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mathjax` | string | CDN URL | URL to MathJax library (includes output format) |
| `tex` | object | See above | TeX input processor options |
| `options` | object | See above | General MathJax options |

---

**For Your Project**:

### Relevance to Video Presentations

Math rendering has **low relevance** to automated video generation because:

1. **Static Content**: Math equations are rendered once and appear as static images/SVG in the final output
2. **No Timing Considerations**: Equations appear instantly with no animation
3. **No Narration Sync Needed**: Math equations don't change or animate by default

### When to Use Math

Use math equations if your presentation includes:
- Scientific formulas
- Mathematical proofs
- Statistical equations
- Physics equations

### Markdown to HTML Generation

If your markdown syntax supports math blocks, map them to LaTeX delimiters:

```markdown
## Einstein's Equation

$$
E = mc^2
$$

Or inline: $E = mc^2$ is famous.
```

**SHOULD** generate:

```html
<section>
  <h2>Einstein's Equation</h2>

  $$
  E = mc^2
  $$

  <p>Or inline: $E = mc^2$ is famous.</p>
</section>
```

### Required Setup Steps

1. **Choose a library**: KaTeX is recommended for performance
2. **Include plugin script** in HTML:
   ```html
   <script src="plugin/math/math.js"></script>
   ```
3. **Register plugin** with chosen variant:
   ```javascript
   Reveal.initialize({
     plugins: [RevealMath.KaTeX]  // or MathJax2, MathJax3
   });
   ```
4. **Use proper delimiters** in slide content

### Math in Generated HTML

Your HTML generator should:

1. **Preserve LaTeX syntax** exactly as written:
   ```html
   <!-- Don't modify or escape LaTeX -->
   $$ E = mc^2 $$
   ```

2. **Don't escape dollar signs** used for math delimiters

3. **Handle HTML entities** properly:
   ```html
   <!-- Use &amp; for ampersands in aligned environments -->
   \[\begin{aligned}
   x &amp; = y \\
   a &amp; = b
   \end{aligned}\]
   ```

### Playwright Rendering Considerations

When recording with Playwright:

1. **Wait for math to render**: Math libraries render asynchronously
   ```javascript
   // Wait for math rendering to complete
   await page.waitForFunction(() => {
     return document.querySelectorAll('.katex').length > 0 ||
            document.querySelectorAll('.MathJax').length > 0;
   });
   ```

2. **Check for rendering errors**: Both libraries add error classes when LaTeX is invalid

3. **Consider render time**: Complex equations may take 100-500ms to render

### Validation Rules

- [ ] RevealMath plugin (KaTeX, MathJax2, or MathJax3) is loaded
- [ ] Math delimiters are properly balanced: `$$` has closing `$$`, etc.
- [ ] LaTeX syntax is valid (no syntax errors)
- [ ] `&` characters in LaTeX are escaped as `&amp;` in HTML
- [ ] Plugin script is included before Reveal.initialize
- [ ] Only ONE math plugin variant is loaded (not multiple)

### Common Pitfalls

1. **Issue**: Math appears as raw LaTeX text
   **Solution**: Ensure RevealMath plugin is loaded and registered

2. **Issue**: Math delimiters conflict with Markdown
   **Solution**: Use `$$` delimiters which work well in both HTML and Markdown

3. **Issue**: Complex equations don't render
   **Solution**: Check browser console for LaTeX syntax errors

4. **Issue**: Math doesn't appear in recorded video
   **Solution**: Wait for rendering to complete before capturing screenshot

5. **Issue**: Dollar signs in non-math text get parsed as math
   **Solution**: Escape literal dollar signs as `\$` or add the containing element to `ignoredTags`

6. **Issue**: Multiple math plugins loaded causes conflicts
   **Solution**: Only load ONE plugin variant: KaTeX OR MathJax2 OR MathJax3

### Performance Notes

- **KaTeX**: Fastest rendering, no dependencies, works offline easily
- **MathJax 2**: Slower, more LaTeX features, larger file size
- **MathJax 3**: Modern, faster than v2, modular output formats

For video generation with many math-heavy slides, **KaTeX is strongly recommended** for render speed.
