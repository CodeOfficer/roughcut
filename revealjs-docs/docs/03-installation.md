---
title: Installation
category: INITIALIZATION
relevance_to_project: Medium
related_directives: []
---

# Installation

> **For Your Project**: Your markdown-driven generator will likely use **npm installation** (method 3) to programmatically generate presentations.

## Overview

Reveal.js offers three installation methods suited for different use cases:

1. **Basic Setup** - Download and open in browser (easiest, no build tools)
2. **Full Setup** - Git clone with dev server (recommended for development)
3. **npm Package** - Install as dependency (best for programmatic use)

## Method 1: Basic Setup

**Best for**: Quick demos, one-off presentations, minimal setup

### Steps

1. **Download** the latest version:
   - [https://github.com/hakimel/reveal.js/archive/master.zip](https://github.com/hakimel/reveal.js/archive/master.zip)

2. **Unzip** the archive

3. **Edit** `index.html` with your content

4. **Open** `index.html` in a web browser

**That's it!** 🚀

### Limitations

- No build tools or development server
- External Markdown files won't load (requires web server)
- No hot reload or auto-refresh
- Manual dependency management

### When to Use

- Learning reveal.js
- Simple presentations with inline content
- No external resources needed
- Sharing via file:// protocol

## Method 2: Full Setup (Recommended)

**Best for**: Active development, external Markdown, customizing reveal.js source

### Prerequisites

- **Node.js** 10.0.0 or later ([nodejs.org](https://nodejs.org/))
- **Git** (for cloning repository)

### Steps

1. **Clone** the repository:

   ```bash
   git clone https://github.com/hakimel/reveal.js.git
   ```

2. **Install** dependencies:

   ```bash
   cd reveal.js && npm install
   ```

3. **Start** development server:

   ```bash
   npm start
   ```

4. **Open** [http://localhost:8000](http://localhost:8000)

### Development Server Features

- **Live reload**: Automatic refresh on file changes
- **Hot Module Replacement**: Fast updates without full reload
- **Local web server**: Enables external Markdown loading
- **Build tools**: Minification, bundling, etc.

### Custom Port

Change the default port (8000) if needed:

```bash
npm start -- --port=8001
```

### Project Structure

```
reveal.js/
├── dist/          # Compiled/minified files
├── plugin/        # Built-in plugins
├── css/           # Core styles
├── js/            # Source JavaScript
├── index.html     # Example presentation
├── package.json   # npm configuration
└── README.md      # Documentation
```

## Method 3: Installing From npm

**Best for**: Using reveal.js as a dependency, programmatic generation, build tools

### Installation

```bash
# npm
npm install reveal.js

# yarn
yarn add reveal.js
```

### ES Module Usage

```javascript
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';

let deck = new Reveal({
  plugins: [Markdown]
});

deck.initialize();
```

### Required Styles

Include reveal.js CSS and a theme:

```html
<link rel="stylesheet" href="/node_modules/reveal.js/dist/reveal.css" />
<link rel="stylesheet" href="/node_modules/reveal.js/dist/theme/black.css" />
```

### npm Package Structure

When installed via npm, reveal.js provides:

| Path | Contents |
|------|----------|
| `reveal.js` | Main ES module export |
| `reveal.js/dist/` | Compiled CSS and JS |
| `reveal.js/plugin/` | Plugin modules |
| `reveal.js/dist/theme/` | Built-in themes |

### Using with Bundlers

**Webpack**:

```javascript
// webpack.config.js
module.exports = {
  entry: './src/presentation.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

// src/presentation.js
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';

Reveal.initialize();
```

**Vite**:

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Vite handles reveal.js imports automatically
});

// main.js
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/moon.css';

Reveal.initialize();
```

**Rollup**:

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    css({ output: 'bundle.css' })
  ]
};
```

## Installation Comparison

| Feature | Basic Setup | Full Setup | npm Install |
|---------|-------------|------------|-------------|
| **Setup Time** | < 1 minute | 5-10 minutes | 2-5 minutes |
| **Build Tools** | ❌ No | ✅ Yes | ✅ Yes (your choice) |
| **Dev Server** | ❌ No | ✅ Yes (port 8000) | ⚠️ Optional |
| **Hot Reload** | ❌ No | ✅ Yes | ⚠️ Depends on setup |
| **External Markdown** | ❌ No* | ✅ Yes | ✅ Yes (with server) |
| **Customization** | ⚠️ Limited | ✅ Full access | ✅ Full access |
| **Updates** | Manual download | `git pull` | `npm update` |
| **Use Case** | Demos, learning | Development | Production, automation |

*External Markdown requires any web server (e.g., `python -m http.server`)

## Next Steps

After installation, refer to:

- **06-markup.md** - Basic HTML structure for slides
- **19-config-options.md** - Configuration reference
- **04-initialization.md** - How to initialize reveal.js

---

**For Your Project**:

### Recommended Installation Method

For your markdown-to-video generator, use **npm installation** (Method 3):

```bash
npm install reveal.js
```

### Integration Strategy

**Your build process should**:

1. **Install reveal.js** as a dependency
2. **Generate HTML** with reveal.js structure
3. **Reference reveal.js** assets from node_modules
4. **Serve HTML** to Playwright for recording

### Example Project Setup

```bash
# Initialize your project
npm init -y

# Install dependencies
npm install reveal.js playwright elevenlabs-node marked

# Project structure
my-presentation-generator/
├── src/
│   ├── generator.js      # Markdown → HTML converter
│   ├── video-recorder.js # Playwright video capture
│   └── narration.js      # ElevenLabs TTS integration
├── templates/
│   └── presentation.html # HTML template
├── output/
│   ├── presentation.html # Generated presentation
│   └── presentation.mp4  # Final video
└── package.json
```

### HTML Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="node_modules/reveal.js/dist/theme/black.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Generated slides inserted here -->
    </div>
  </div>

  <script src="node_modules/reveal.js/dist/reveal.js"></script>
  <script src="node_modules/reveal.js/plugin/highlight/highlight.js"></script>
  <script>
    Reveal.initialize({
      plugins: [RevealHighlight],
      // Your custom config
    });
  </script>
</body>
</html>
```

### Generator Code Sketch

```javascript
// src/generator.js
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export function generatePresentation(markdownContent) {
  // Parse markdown with @directives
  const slides = parseMarkdownToSlides(markdownContent);

  // Generate HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="node_modules/reveal.js/dist/reveal.css">
      <link rel="stylesheet" href="node_modules/reveal.js/dist/theme/black.css">
    </head>
    <body>
      <div class="reveal">
        <div class="slides">
          ${slides.map(slide => generateSlideHTML(slide)).join('\n')}
        </div>
      </div>
      <script src="node_modules/reveal.js/dist/reveal.js"></script>
      <script>
        Reveal.initialize({
          autoSlide: ${calculateAutoSlide()},
          // ... config from directives
        });
      </script>
    </body>
    </html>
  `;

  return html;
}
```

### Using CDN (Alternative)

Instead of node_modules, use CDN for simpler deployment:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css">
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
```

**Pros**:
- No node_modules in output
- Smaller deployment size
- Cached across users

**Cons**:
- Requires internet connection
- Less control over versioning
- Potential CDN downtime

### Validation Rules

- [ ] Verify reveal.js installed: `node_modules/reveal.js/dist/reveal.js` exists
- [ ] Check CSS paths resolve correctly in generated HTML
- [ ] Test that Playwright can load reveal.js assets
- [ ] Ensure plugin paths are correct (if using plugins)

### Common Pitfalls

1. **Issue**: reveal.js not found in generated HTML
   **Solution**: Use correct relative/absolute paths from output HTML location

2. **Issue**: Styles not loading
   **Solution**: Include both `reveal.css` (core) and theme CSS (e.g., `black.css`)

3. **Issue**: Plugins not working
   **Solution**: Include plugin scripts and register in `plugins: [...]` array

4. **Issue**: Playwright can't load local files
   **Solution**: Serve HTML via local server, not `file://` protocol

### Related Documentation

- `04-initialization.md` - How to initialize reveal.js programmatically
- `06-markup.md` - HTML structure your generator must produce
- `19-config-options.md` - Configuration options to expose via directives
- `36-using-plugins.md` - How to include and use plugins
