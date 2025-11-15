---
title: Themes
category: CUSTOMIZATION
relevance_to_project: Medium
related_directives: [@theme:, @style:]
---

# Themes

> **Critical Note**: RevealJS includes 12 built-in visual themes that control the overall appearance (colors, fonts, backgrounds). Themes are loaded via CSS files and can be customized using CSS custom properties.

## Overview

RevealJS provides a theming system for visual presentation customization. Each theme is a standalone CSS file that defines colors, typography, backgrounds, and other visual elements. Themes affect the entire presentation's appearance globally.

For your video generation project, theme selection may be less critical since you're likely standardizing on a specific visual style, but understanding the theme system helps with:
- Custom styling requirements
- Consistent branding across generated videos
- Understanding CSS variable overrides

## Built-In Themes

RevealJS includes 12 pre-designed themes:

| Theme Name | Description | Best For |
|------------|-------------|----------|
| **black** (default) | Black background, white text, blue links | Dark, professional presentations |
| **white** | White background, black text, blue links | Clean, traditional presentations |
| **league** | Gray background, white text, blue links | Modern, neutral tone |
| **beige** | Beige background, dark text, brown links | Warm, vintage feel |
| **night** | Black background, thick white text, orange links | High contrast, evening talks |
| **serif** | Cappuccino background, gray text, brown links | Academic, formal presentations |
| **simple** | White background, black text, blue links | Minimal, straightforward |
| **solarized** | Cream background, dark green text, blue links | Eye-friendly, developer-focused |
| **moon** | Dark blue background, thick grey text, blue links | Cool, modern aesthetic |
| **dracula** | Dark purple background, pastel text | Developer favorite, low-light |
| **sky** | Blue background, thin dark text, blue links | Bright, airy presentations |
| **blood** | Dark background, thick white text, red links | Dramatic, high-impact |

> **Note**: Theme previews with screenshots are available in the [RevealJS docs](https://revealjs.com/themes/).

## Required HTML Structure

### Including a Theme

Themes are loaded via a `<link>` tag in the HTML `<head>`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Presentation</title>

    <!-- RevealJS core CSS -->
    <link rel="stylesheet" href="dist/reveal.css" />

    <!-- Theme CSS -->
    <link rel="stylesheet" href="dist/theme/black.css" />
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <!-- slides -->
      </div>
    </div>
  </body>
</html>
```

> **Structure Requirement**: The theme CSS MUST be loaded AFTER `reveal.css` to ensure proper style cascade.

### File Paths

Theme CSS files are located at:

```
dist/theme/[theme-name].css
```

**Available paths**:
- `dist/theme/black.css`
- `dist/theme/white.css`
- `dist/theme/league.css`
- `dist/theme/beige.css`
- `dist/theme/night.css`
- `dist/theme/serif.css`
- `dist/theme/simple.css`
- `dist/theme/solarized.css`
- `dist/theme/moon.css`
- `dist/theme/dracula.css`
- `dist/theme/sky.css`
- `dist/theme/blood.css`

### Changing Themes

To switch themes, change the theme CSS file reference:

```html
<!-- Switch from black to white theme -->
<link rel="stylesheet" href="dist/theme/white.css" />
```

Only **one** theme CSS should be included at a time.

## CSS Custom Properties

All themes expose CSS custom properties (CSS variables) that can be overridden for customization. Variables are defined in the `:root` pseudo-class.

### Common Theme Variables

The exact variables depend on the theme, but common ones include:

```css
:root {
  --r-background-color: #191919;
  --r-main-font: 'Source Sans Pro', Helvetica, sans-serif;
  --r-main-font-size: 42px;
  --r-main-color: #fff;
  --r-block-margin: 20px;
  --r-heading-margin: 0 0 20px 0;
  --r-heading-font: 'Source Sans Pro', Helvetica, sans-serif;
  --r-heading-color: #fff;
  --r-heading-line-height: 1.2;
  --r-heading-letter-spacing: normal;
  --r-heading-text-transform: uppercase;
  --r-heading-text-shadow: none;
  --r-heading-font-weight: 600;
  --r-heading1-text-shadow: none;
  --r-heading1-size: 2.5em;
  --r-heading2-size: 1.6em;
  --r-heading3-size: 1.3em;
  --r-heading4-size: 1em;
  --r-code-font: monospace;
  --r-link-color: #42affa;
  --r-link-color-dark: #068de9;
  --r-link-color-hover: #8dcffc;
  --r-selection-background-color: rgba(66, 175, 250, 0.75);
  --r-selection-color: #fff;
}
```

> **Reference**: See the [complete list of exposed variables](https://github.com/hakimel/reveal.js/blob/master/css/theme/template/exposer.scss).

### Overriding Theme Variables

Override variables in a custom stylesheet loaded **after** the theme:

```html
<link rel="stylesheet" href="dist/theme/black.css" />
<link rel="stylesheet" href="custom.css" />
```

**custom.css**:

```css
:root {
  --r-main-color: #e0e0e0; /* Lighter text color */
  --r-link-color: #ff6b6b; /* Red links */
  --r-heading-color: #ffd93d; /* Yellow headings */
}
```

## Creating Custom Themes

### Option 1: SCSS-Based Theme (Recommended)

RevealJS themes are built using SCSS (Sass). To create a custom theme:

1. **Copy a theme template**:
   ```bash
   cp css/theme/source/black.scss css/theme/source/mytheme.scss
   ```

2. **Edit variables** in your new SCSS file
3. **Compile to CSS**:
   ```bash
   npm run build -- css-themes
   ```
4. **Use the compiled CSS**:
   ```html
   <link rel="stylesheet" href="dist/theme/mytheme.css" />
   ```

> **Full Instructions**: See [/css/theme/README.md](https://github.com/hakimel/reveal.js/blob/master/css/theme/README.md) in the RevealJS repo.

### Option 2: Custom CSS from Scratch

For complete control, write custom CSS without using the theme system:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="dist/reveal.css" />
    <!-- No theme CSS - write your own -->
    <link rel="stylesheet" href="custom.css" />
  </head>
</html>
```

**custom.css**:

```css
.reveal {
  background-color: #1a1a2e;
  color: #eee;
  font-family: 'Arial', sans-serif;
}

.reveal h1,
.reveal h2,
.reveal h3 {
  color: #ff6b6b;
  font-weight: bold;
}

.reveal a {
  color: #4ecdc4;
}

/* Full customization */
```

## Theme Structure

Themes control these presentation aspects:

| Aspect | CSS Targets | Description |
|--------|-------------|-------------|
| **Background** | `.reveal` | Main presentation background |
| **Text Color** | `.reveal`, `.reveal p` | Body text color |
| **Typography** | `--r-main-font`, `--r-heading-font` | Font families |
| **Headings** | `.reveal h1-h6` | Heading styles |
| **Links** | `.reveal a` | Link colors and hover states |
| **Code Blocks** | `.reveal pre`, `.reveal code` | Code formatting |
| **Blockquotes** | `.reveal blockquote` | Quote styling |
| **Lists** | `.reveal ul`, `.reveal ol` | List formatting |
| **Tables** | `.reveal table` | Table styles |

## Configuration

No configuration options exist for themes - they're purely CSS-based. Theme selection is done via HTML `<link>` tags.

## Examples

### Standard Theme Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="dist/reveal.css" />
    <link rel="stylesheet" href="dist/theme/moon.css" />
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <section>
          <h1>My Presentation</h1>
          <p>Using the Moon theme</p>
        </section>
      </div>
    </div>
  </body>
</html>
```

### Theme with Custom Overrides

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="dist/reveal.css" />
    <link rel="stylesheet" href="dist/theme/black.css" />
    <style>
      :root {
        /* Override theme colors */
        --r-main-color: #f0f0f0;
        --r-heading-color: #ffd700;
        --r-link-color: #ff6347;
      }

      .reveal h1 {
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
    </style>
  </head>
  <body>
    <!-- presentation -->
  </body>
</html>
```

### Responsive Theme Adjustments

```css
:root {
  --r-main-font-size: 42px;
}

/* Smaller font on mobile */
@media (max-width: 768px) {
  :root {
    --r-main-font-size: 32px;
  }
}
```

---

## For Your Project

### Theme Relevance for Video Generation

For automated video generation, you likely want:
- **Single standardized theme** - Consistent branding across all videos
- **Custom theme** - Match your company/product branding
- **CSS variable overrides** - Fine-tune colors without forking themes

**Recommendation**: Choose ONE base theme and customize via CSS variables, or create a custom theme from scratch for your brand.

### Directive Mapping

Consider supporting theme selection in your markdown input:

```markdown
# Your Input Format:
@config:
@theme: black
@primary-color: #ff6b6b
@heading-color: #ffd93d

# Or for complete customization:
@config:
@custom-css: /path/to/custom-theme.css
```

**MUST** generate:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="dist/reveal.css" />
    <link rel="stylesheet" href="dist/theme/black.css" />
    <style>
      :root {
        --r-link-color: #ff6b6b;
        --r-heading-color: #ffd93d;
      }
    </style>
  </head>
</html>
```

### Video Recording Implications

**Theme affects**:
- Video file size (dark themes = smaller file size for screen recordings)
- Readability in various viewing environments
- Brand consistency across video series
- Contrast for text/background (important for accessibility)

**Recommendations**:
1. **Use dark themes for code-heavy content** (better for developers, smaller files)
2. **Use light themes for business/formal content** (professional appearance)
3. **Test contrast ratios** for video compression artifacts
4. **Standardize on 1-2 themes** for brand consistency

### CSS Generation

Your HTML generator should:

```javascript
function generateThemeHTML(config) {
  const themeName = config.theme || 'black';
  const customColors = config.customColors || {};

  const html = `
    <link rel="stylesheet" href="dist/reveal.css" />
    <link rel="stylesheet" href="dist/theme/${themeName}.css" />
    ${
      Object.keys(customColors).length
        ? `<style>
      :root {
        ${Object.entries(customColors)
          .map(([key, value]) => `--r-${key}: ${value};`)
          .join('\n        ')}
      }
    </style>`
        : ''
    }
  `;

  return html;
}
```

### Validation Rules

When generating theme HTML:

- [ ] Theme CSS file exists at specified path
- [ ] Theme CSS loaded AFTER reveal.css
- [ ] Only ONE theme CSS file included
- [ ] Custom CSS overrides come AFTER theme CSS
- [ ] CSS variables use `--r-` prefix (RevealJS convention)
- [ ] Colors use valid CSS color values
- [ ] Fonts reference available font families

### Common Pitfalls

1. **Pitfall**: Loading multiple theme CSS files
   **Solution**: Include only ONE theme CSS file

2. **Pitfall**: Theme CSS loaded before reveal.css
   **Solution**: Ensure load order: reveal.css → theme.css → custom.css

3. **Pitfall**: Overriding theme styles without using variables
   **Solution**: Use CSS custom properties for easy overrides

4. **Pitfall**: Hardcoding colors in HTML generation
   **Solution**: Use theme variables so users can switch themes

### Testing Strategy

For theme integration:

1. Test video rendering with each target theme
2. Verify colors/contrast in video output (not just browser)
3. Check text readability after video compression
4. Test with various background types (solid, gradient, image)
5. Verify font loading and fallbacks

### Performance Considerations

**For video generation**:
- **Dark themes** → Smaller video file sizes (less pixel change)
- **Light themes** → Larger file sizes (more pixel change)
- **Complex backgrounds** → Higher encoding bitrate needed
- **Custom fonts** → Ensure fonts load before recording starts

### Integration Example

```javascript
// Video generation with theme
async function generateVideo(markdown, config) {
  const theme = config.theme || 'black';

  // 1. Generate HTML with theme
  const html = generateHTML(markdown, { theme });

  // 2. Load in Playwright
  await page.goto(`data:text/html,${html}`);

  // 3. Wait for theme CSS to load
  await page.waitForSelector('.reveal.ready');

  // 4. Wait for custom fonts
  await page.evaluate(() => document.fonts.ready);

  // 5. Start recording
  await startVideoRecording();
}
```

### Recommended Default Theme

For automated video generation, consider:

- **For technical content**: `dracula` or `night` (developer-friendly, dark)
- **For business content**: `simple` or `white` (professional, clean)
- **For marketing content**: Custom theme matching brand colors
- **Default fallback**: `black` (RevealJS default, good contrast)

### CSS Variable Reference for Common Customizations

```css
/* Brand colors */
:root {
  --r-background-color: #yourBrandColor;
  --r-main-color: #yourTextColor;
  --r-heading-color: #yourHeadingColor;
  --r-link-color: #yourLinkColor;
}

/* Typography */
:root {
  --r-main-font: 'YourFont', sans-serif;
  --r-heading-font: 'YourHeadingFont', sans-serif;
  --r-main-font-size: 38px; /* Larger for video */
}

/* Video-optimized settings */
:root {
  --r-main-font-size: 48px; /* Larger text for video clarity */
  --r-heading1-size: 3em; /* More prominent headings */
  --r-block-margin: 30px; /* More spacing for video */
}
```
