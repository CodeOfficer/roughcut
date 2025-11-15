---
title: Slide Backgrounds
category: CONTENT
relevance_to_project: High
related_directives: [@background-color:, @image-prompt:]
---

# Slide Backgrounds

> **Critical for @background-color: and @image-prompt: directives**: All background attributes MUST be on `<section>` elements

Slides are contained within a limited portion of the screen by default to allow them to fit any display and scale uniformly. You can apply full page backgrounds outside of the slide area by adding background attributes to your `<section>` elements.

## Required DOM Structure

```html
<section data-background-color="value">
  <!-- Slide content -->
</section>
```

> **Critical**: ALL `data-background-*` attributes go on the `<section>` element, NOT on inner content elements

## Color Backgrounds

All CSS color formats are supported: hex values, keywords, `rgba()`, `hsl()`.

```html
<section data-background-color="aquamarine">
  <h2>Content</h2>
</section>

<section data-background-color="rgb(70, 70, 255)">
  <h2>Content</h2>
</section>

<section data-background-color="#ff0000">
  <h2>Content</h2>
</section>
```

## Gradient Backgrounds

All CSS gradient formats are supported: `linear-gradient`, `radial-gradient`, `conic-gradient`.

```html
<section data-background-gradient="linear-gradient(to bottom, #283b95, #17b2c3)">
  <h2>Content</h2>
</section>

<section data-background-gradient="radial-gradient(#283b95, #17b2c3)">
  <h2>Content</h2>
</section>
```

> **Note**: Use `data-background-gradient`, not `data-background-color`, for gradients

## Image Backgrounds

By default, background images are resized to cover the full page.

### Image Background Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-background-image` | - | URL of the image to show. GIFs restart when the slide opens. |
| `data-background-size` | `cover` | See [background-size](https://developer.mozilla.org/docs/Web/CSS/background-size) on MDN. |
| `data-background-position` | `center` | See [background-position](https://developer.mozilla.org/docs/Web/CSS/background-position) on MDN. |
| `data-background-repeat` | `no-repeat` | See [background-repeat](https://developer.mozilla.org/docs/Web/CSS/background-repeat) on MDN. |
| `data-background-opacity` | `1` | Opacity of the background image on a 0-1 scale. 0 is transparent and 1 is fully opaque. |

### Examples

```html
<section data-background-image="http://example.com/image.png">
  <h2>Image</h2>
</section>

<section data-background-image="http://example.com/image.png"
         data-background-size="100px"
         data-background-repeat="repeat">
  <h2>This background image will be sized to 100px and repeated</h2>
</section>

<section data-background-image="path/to/image.jpg"
         data-background-opacity="0.5">
  <h2>Semi-transparent background</h2>
</section>
```

## Video Backgrounds

Automatically plays a full size video behind the slide.

### Video Background Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-background-video` | - | A single video source, or a comma separated list of video sources. |
| `data-background-video-loop` | `false` | Flags if the video should play repeatedly. |
| `data-background-video-muted` | `false` | Flags if the audio should be muted. |
| `data-background-size` | `cover` | Use `cover` for full screen and some cropping or `contain` for letterboxing. |
| `data-background-opacity` | `1` | Opacity of the background video on a 0-1 scale. |

### Examples

```html
<section data-background-video="https://example.com/video.mp4"
         data-background-video-loop
         data-background-video-muted>
  <h2>Video</h2>
</section>

<section data-background-video="video1.mp4,video2.webm"
         data-background-video-loop>
  <h2>Multiple video sources</h2>
</section>
```

> **Note**: Boolean attributes like `data-background-video-loop` don't need a value

## Iframe Backgrounds

Embeds a web page as a slide background that covers 100% of the reveal.js width and height. The iframe is in the background layer, behind your slides.

### Iframe Background Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-background-iframe` | - | URL of the iframe to load |
| `data-background-interactive` | `false` | Include this attribute to make it possible to interact with the iframe contents. Enabling this will prevent interaction with the slide content. |

### Examples

```html
<section data-background-iframe="https://slides.com"
         data-background-interactive>
  <h2>Iframe</h2>
</section>
```

Iframes are lazy-loaded when they become visible. To preload iframes ahead of time, append a `data-preload` attribute to the slide `<section>`. You can also enable preloading globally using the `preloadIframes` configuration option.

```html
<section data-background-iframe="https://example.com" data-preload>
  <!-- This iframe will be preloaded -->
</section>
```

## Background Transitions

Backgrounds transition using cross fade by default. This can be changed using the `backgroundTransition` config option or per-slide with `data-background-transition`.

```html
<section data-background-transition="zoom"
         data-background="#ff0000">
  <h2>Zooming background transition</h2>
</section>
```

Valid values: `none`, `fade`, `slide`, `convex`, `concave`, `zoom`

See [Transitions documentation](./18-transitions.md#background-transitions) for more details.

## Parallax Background

For a parallax scrolling background, set these configuration options:

```javascript
Reveal.initialize({
  // Parallax background image
  parallaxBackgroundImage: 'https://example.com/background.jpg',

  // Parallax background size (CSS syntax, currently only pixels supported)
  parallaxBackgroundSize: '2100px 900px',

  // Number of pixels to move the parallax background per slide
  // Calculated automatically unless specified
  // Set to 0 to disable movement along an axis
  parallaxBackgroundHorizontal: 200,
  parallaxBackgroundVertical: 50
});
```

> **Note**: Background size must be much bigger than screen size to allow for scrolling

---

**For Your Project - Directive Processing**:

### @background-color: Directive

```markdown
@background-color: aquamarine
# My Slide
Content here
```

**MUST** generate:

```html
<section data-background-color="aquamarine">
  <h2>My Slide</h2>
  <p>Content here</p>
</section>
```

### @image-prompt: Directive (AI-Generated Backgrounds)

When processing `@image-prompt:` with Gemini API:

1. **Generate image** with Gemini
2. **Save image** to local path
3. **Set background attribute**:

```html
<section data-background-image="path/to/generated-image.png"
         data-background-size="cover"
         data-background-opacity="1">
  <h2>Slide Title</h2>
  <p>Content</p>
</section>
```

### Validation Rules

Your linting system should validate:

```javascript
// Valid color formats
const validColorFormats = [
  /^#[0-9A-Fa-f]{6}$/,           // #ff0000
  /^#[0-9A-Fa-f]{3}$/,            // #f00
  /^rgb\(\d+,\s*\d+,\s*\d+\)$/,  // rgb(255, 0, 0)
  /^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/, // rgba(255, 0, 0, 0.5)
  /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/, // hsl(0, 100%, 50%)
  // ... or CSS color keywords
];

function validateBackgroundColor(value) {
  return validColorFormats.some(regex => regex.test(value)) ||
         isCSSColorKeyword(value);
}
```

### HTML Generation Template

```javascript
function generateSlide(markdownSlide, directives) {
  const attrs = [];

  if (directives.backgroundColor) {
    attrs.push(`data-background-color="${directives.backgroundColor}"`);
  }

  if (directives.imagePrompt) {
    // Generate image first, then:
    const imagePath = await generateImage(directives.imagePrompt);
    attrs.push(`data-background-image="${imagePath}"`);
    attrs.push(`data-background-size="cover"`);
  }

  return `<section ${attrs.join(' ')}>
    ${convertMarkdownToHTML(markdownSlide.content)}
  </section>`;
}
```

### Attribute Placement Checklist

- [ ] `data-background-color` is on `<section>`, not `<h2>` or `<p>`
- [ ] `data-background-image` is on `<section>`, not inner elements
- [ ] Background attributes combined with other slide attributes (data-transition, etc.)
- [ ] Attribute values are properly quoted
- [ ] Image paths are valid and accessible
- [ ] Opacity values are between 0 and 1

### Common Mistakes

❌ **Wrong**: Background on inner element
```html
<section>
  <div data-background-color="red">  <!-- WRONG -->
    <h2>Title</h2>
  </div>
</section>
```

✅ **Correct**: Background on section
```html
<section data-background-color="red">  <!-- CORRECT -->
  <h2>Title</h2>
</section>
```

❌ **Wrong**: Using data-background-color for gradients
```html
<section data-background-color="linear-gradient(...)">  <!-- WRONG -->
```

✅ **Correct**: Using data-background-gradient
```html
<section data-background-gradient="linear-gradient(...)">  <!-- CORRECT -->
```
