---
title: Using Plugins
category: PLUGINS
relevance_to_project: Medium
related_directives: []
---

# Using Plugins

> **Key Concept**: Plugins extend reveal.js with additional functionality like Markdown support, syntax highlighting, speaker notes, and more.

## Overview

Plugins are modular extensions that add features to reveal.js. To use a plugin, you need to:

1. **Include** the plugin script (and styles if needed)
2. **Register** the plugin in the `plugins` array during initialization

Reveal.js provides several built-in plugins and supports third-party plugins.

## Basic Usage

### Standard Script Loading

```html
<!-- 1. Include plugin script -->
<script src="plugin/markdown/markdown.js"></script>

<!-- 2. Register plugin during initialization -->
<script>
  Reveal.initialize({
    plugins: [RevealMarkdown]
  });
</script>
```

### ES Module Loading

```html
<script type="module">
  import Reveal from 'dist/reveal.esm.js';
  import Markdown from 'plugin/markdown/markdown.esm.js';

  Reveal.initialize({
    plugins: [Markdown]
  });
</script>
```

> **Module Naming**: When using ES modules, swap `.js` for `.esm.js` in the import path.

## Built-in Plugins

Reveal.js includes 6 official plugins distributed with the framework:

| Plugin Name | Description | Script Path |
|-------------|-------------|-------------|
| **RevealHighlight** | Syntax highlighted code blocks | `plugin/highlight/highlight.js` |
| **RevealMarkdown** | Write slide content in Markdown | `plugin/markdown/markdown.js` |
| **RevealSearch** | Search slide content (Ctrl+Shift+F) | `plugin/search/search.js` |
| **RevealNotes** | Speaker notes in separate window | `plugin/notes/notes.js` |
| **RevealMath** | Render math equations (KaTeX/MathJax) | `plugin/math/math.js` |
| **RevealZoom** | Alt+click to zoom on elements | `plugin/zoom/zoom.js` |

### Example: Multiple Plugins

```html
<!-- Include plugin scripts -->
<script src="plugin/markdown/markdown.js"></script>
<script src="plugin/highlight/highlight.js"></script>
<script src="plugin/notes/notes.js"></script>

<!-- Register all plugins -->
<script>
  Reveal.initialize({
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
  });
</script>
```

### ES Module Example

```javascript
import Reveal from 'dist/reveal.esm.js';
import Markdown from 'plugin/markdown/markdown.esm.js';
import Highlight from 'plugin/highlight/highlight.esm.js';
import Notes from 'plugin/notes/notes.esm.js';
import Math from 'plugin/math/math.esm.js';
import Search from 'plugin/search/search.esm.js';
import Zoom from 'plugin/zoom/zoom.esm.js';

Reveal.initialize({
  plugins: [Markdown, Highlight, Notes, Math, Search, Zoom]
});
```

## Plugin Details

### RevealHighlight

Syntax highlighting for code blocks using [highlight.js](https://highlightjs.org/).

**See**: `11-code.md` for usage details

**Requires**: Highlight.js theme CSS

```html
<link rel="stylesheet" href="plugin/highlight/monokai.css">
<script src="plugin/highlight/highlight.js"></script>
```

### RevealMarkdown

Write slide content using Markdown syntax with frontmatter support.

**See**: `07-markdown.md` for usage details

**Usage**: Add `data-markdown` attribute to slides

```html
<section data-markdown>
  # Slide Title
  - Bullet point
  - Another bullet
</section>
```

### RevealSearch

Search through slide content using Ctrl+Shift+F (Cmd+Shift+F on Mac).

**Features**:
- Full-text search across all slides
- Highlights search matches
- Keyboard navigation through results

```html
<script src="plugin/search/search.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealSearch]
  });
</script>
```

### RevealNotes

Speaker notes displayed in a separate window, synchronized with main presentation.

**See**: `23-speaker-view.md` for usage details

**Usage**: Add `<aside class="notes">` to slides

```html
<section>
  <h2>Slide Content</h2>
  <aside class="notes">
    These notes only appear in speaker view.
  </aside>
</section>
```

### RevealMath

Render mathematical equations using KaTeX or MathJax.

**See**: `12-math.md` for usage details

**Usage**: Write LaTeX in slides

```html
<section>
  \[ E = mc^2 \]
</section>
```

### RevealZoom

Zoom into specific elements for emphasis.

**Usage**: Alt+Click (Option+Click on Mac) on any element

```html
<script src="plugin/zoom/zoom.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealZoom]
  });
</script>
```

## Plugin API

### Check Plugin Registration

```javascript
// Check if a plugin is registered
Reveal.hasPlugin('markdown');
// true or false
```

### Get Plugin Instance

```javascript
// Get reference to specific plugin
const markdownPlugin = Reveal.getPlugin('markdown');
// { id: "markdown", init: function, ... }

// Call plugin methods if available
markdownPlugin.someMethod();
```

### Get All Plugins

```javascript
// Get all registered plugins
const plugins = Reveal.getPlugins();
// {
//   markdown: { id: "markdown", init: ... },
//   highlight: { id: "highlight", init: ... }
// }
```

### API Methods Reference

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `hasPlugin(id)` | `id: string` | `boolean` | Check if plugin is registered |
| `getPlugin(id)` | `id: string` | `object` | Get plugin instance by ID |
| `getPlugins()` | none | `object` | Get all registered plugins |

## Loading Order

Plugins are initialized **after** reveal.js core initialization, in the order they appear in the `plugins` array:

```javascript
Reveal.initialize({
  plugins: [
    RevealMarkdown,  // Initialized first
    RevealHighlight, // Initialized second
    RevealNotes      // Initialized third
  ]
});
```

> **Important**: Some plugins depend on DOM content being ready. Place them after plugins that modify the DOM (e.g., RevealMarkdown).

## Third-Party Plugins

Reveal.js has a rich ecosystem of community plugins. See the [Plugins, Tools and Hardware wiki](https://github.com/hakimel/reveal.js/wiki/Plugins,-Tools-and-Hardware).

### Using Third-Party Plugins

```html
<!-- 1. Include third-party plugin -->
<script src="path/to/third-party-plugin.js"></script>

<!-- 2. Register it like built-in plugins -->
<script>
  Reveal.initialize({
    plugins: [ThirdPartyPlugin]
  });
</script>
```

## Plugin Configuration

Some plugins accept configuration options. Pass them during initialization:

```javascript
Reveal.initialize({
  // Plugin-specific configuration
  math: {
    mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
    config: 'TeX-AMS_HTML-full'
  },

  plugins: [RevealMath]
});
```

Check individual plugin documentation for available options.

## Dependencies (Deprecated)

> **⚠️ Deprecated since reveal.js 4.0.0**: Use standard `<script defer>` tags or ES modules instead.

The old `dependencies` array is no longer recommended:

```javascript
// ❌ Old way (deprecated)
Reveal.initialize({
  dependencies: [
    { src: 'plugin/markdown/markdown.js', async: true }
  ]
});

// ✅ New way
```html
<script defer src="plugin/markdown/markdown.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealMarkdown]
  });
</script>
```

### Migration from Dependencies

| Old (dependencies) | New (plugins) |
|-------------------|---------------|
| `dependencies: [{ src: 'path' }]` | `<script defer src="path">` + `plugins: [Plugin]` |
| `async: true` | Use `defer` attribute |
| `callback: function` | Use `DOMContentLoaded` or module imports |
| `condition: function` | Check condition before loading script |

---

**For Your Project**:

### Recommended Plugins

For your markdown-driven video generator, these plugins are relevant:

| Plugin | Relevance | Reason |
|--------|-----------|--------|
| **RevealMarkdown** | ✅ High | Your project uses markdown input |
| **RevealHighlight** | ✅ High | Code examples need syntax highlighting |
| **RevealMath** | ⚠️ Medium | If presentations include equations |
| **RevealNotes** | ⚠️ Medium | Could sync with `@narration:` timing |
| **RevealSearch** | ❌ Low | User-interactive, not for automated recording |
| **RevealZoom** | ❌ Low | User-interactive, not for automated recording |

### Plugin Integration Strategy

**Option 1: Include All By Default**

Load common plugins for all presentations:

```javascript
// Generated HTML includes:
Reveal.initialize({
  plugins: [RevealMarkdown, RevealHighlight, RevealMath]
});
```

**Option 2: Conditional Loading**

Only load plugins based on markdown directives:

```markdown
@plugins: markdown, highlight, math
```

Generates:

```javascript
Reveal.initialize({
  plugins: [RevealMarkdown, RevealHighlight, RevealMath]
});
```

**Option 3: Auto-Detection**

Scan markdown content and automatically include needed plugins:

```javascript
// Your generator logic:
const needsMarkdown = content.includes('@markdown:');
const needsCode = content.includes('```');
const needsMath = content.includes('$$') || content.includes('\\[');

const plugins = [];
if (needsMarkdown) plugins.push('RevealMarkdown');
if (needsCode) plugins.push('RevealHighlight');
if (needsMath) plugins.push('RevealMath');
```

### Directive Examples

```markdown
@plugin:highlight: true
@plugin:math: true
@plugin:notes: false

## Slide 1
```

Could generate configuration:

```javascript
Reveal.initialize({
  plugins: [RevealHighlight, RevealMath]
  // RevealNotes omitted because set to false
});
```

### ES Module vs Script Tags

**For Playwright automation**, use ES modules for better bundling:

```javascript
// build-presentation.js
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';

// Your build logic here
```

**For simple HTML generation**, use script tags:

```html
<!-- Easier to template -->
<script src="dist/reveal.js"></script>
<script src="plugin/highlight/highlight.js"></script>
<script>
  Reveal.initialize({
    plugins: [RevealHighlight]
  });
</script>
```

### Plugin Paths

When generating HTML, ensure correct plugin paths:

```javascript
// Your HTML generator
const pluginPath = (plugin) => {
  return `node_modules/reveal.js/plugin/${plugin}/${plugin}.js`;
};

// Or use CDN
const pluginPath = (plugin) => {
  return `https://cdn.jsdelivr.net/npm/reveal.js/plugin/${plugin}/${plugin}.js`;
};
```

### Validation Rules

- [ ] Verify all referenced plugins are actually included as `<script>` tags
- [ ] Check plugin registration order (Markdown before Highlight if both used)
- [ ] Ensure plugin CSS files are included (especially Highlight themes)
- [ ] Test that plugins work in headless Chrome/Playwright environment

### Common Pitfalls

1. **Issue**: Plugin not found error
   **Solution**: Ensure plugin script is included before `Reveal.initialize()` call

2. **Issue**: Plugin seems loaded but not working
   **Solution**: Check that plugin is in the `plugins: [...]` array

3. **Issue**: ES module import errors
   **Solution**: Verify you're using `.esm.js` versions and correct import paths

4. **Issue**: Code not highlighting
   **Solution**: Include Highlight.js theme CSS: `<link rel="stylesheet" href="plugin/highlight/monokai.css">`

### Related Documentation

- `07-markdown.md` - RevealMarkdown plugin usage
- `11-code.md` - RevealHighlight plugin usage
- `12-math.md` - RevealMath plugin usage
- `23-speaker-view.md` - RevealNotes plugin usage
- `38-creating-plugins.md` - How to create custom plugins
