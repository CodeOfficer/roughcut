---
title: Lightbox
category: CONTENT
relevance_to_project: Medium
related_directives: []
version_added: 5.2.0
---

# Lightbox

> **New Feature**: Lightbox was added in reveal.js 5.2.0

## Overview

A lightbox is a modal that displays an image, video, or iframe in a full-screen overlay. It's triggered by clicking on elements that have specific `data-preview-*` attributes. This feature is great for displaying larger versions of thumbnails or opening videos and external links in an immersive overlay.

## Image Lightbox

### Basic Image Lightbox

The simplest lightbox opens the same image that's displayed:

```html
<section>
  <img src="reveal.png" data-preview-image>
</section>
```

> **Structure Requirement**: The `data-preview-image` attribute can be placed on any element, but is most commonly used on `<img>` tags.

### Custom Image Lightbox

You can open a different image than what's displayed by providing a value to `data-preview-image`:

```html
<section>
  <!-- Displays reveal.png but opens mastering.svg in lightbox -->
  <img src="reveal.png" data-preview-image="mastering.svg">
</section>
```

## Video Lightbox

Video lightboxes work identically to image lightboxes but use the `data-preview-video` attribute:

```html
<section>
  <!-- Opens the video's own src in lightbox -->
  <video src="video.mp4" data-preview-video></video>

  <!-- Opens a video from any element (like an image thumbnail) -->
  <img src="thumbnail.png" data-preview-video="video.mp4">
</section>
```

## Iframe Lightbox

Links can be opened in iframe lightboxes using the `data-preview-link` attribute:

```html
<section>
  <!-- Opens the link's href in an iframe -->
  <a href="https://example.com" data-preview-link>Open Website</a>

  <!-- Opens an iframe from any element -->
  <img src="thumbnail.png" data-preview-link="https://example.com">
</section>
```

> **Important**: Iframe lightboxes only work if the target website allows embedding. Many sites prevent embedding via `x-frame-options` or `Content-Security-Policy` headers.

## Lightbox Media Sizing

Control how media is sized within the lightbox using the `data-preview-fit` attribute:

### Fit Modes

| Value | Effect |
|-------|--------|
| `scale-down` | **(Default)** Scale media down if needed to fit in the lightbox |
| `contain` | Scale media up and down to fit the lightbox without cropping |
| `cover` | Scale media to cover the entire lightbox, even if some is cut off |

```html
<section>
  <!-- Image will cover the entire lightbox -->
  <img src="reveal.png" data-preview-image data-preview-fit="cover">
</section>
```

## Works on Any Element

Lightbox attributes work on any HTML element, not just images and videos:

```html
<section>
  <!-- Button triggers image lightbox -->
  <button data-preview-image="image.png">📸 View Image</button>

  <!-- Link triggers video lightbox -->
  <a data-preview-video="video.mp4">🎥 Watch Video</a>

  <!-- Div triggers iframe lightbox -->
  <div data-preview-link="https://example.com">
    Click to open website
  </div>
</section>
```

## Attribute Reference

| Attribute | Applies To | Value | Description |
|-----------|------------|-------|-------------|
| `data-preview-image` | Any element | (optional) image URL | Opens image in lightbox. If no value provided, uses element's `src` |
| `data-preview-video` | Any element | (optional) video URL | Opens video in lightbox. If no value provided, uses element's `src` |
| `data-preview-link` | Any element | (optional) URL | Opens URL in iframe lightbox. If no value on `<a>`, uses `href` |
| `data-preview-fit` | Any element with preview | `scale-down`\|`contain`\|`cover` | Controls how media is sized in the lightbox |

## Interaction Behavior

- **Click to open**: Clicking any element with a `data-preview-*` attribute opens the lightbox
- **Click to close**: Clicking outside the media or on the dark overlay closes the lightbox
- **ESC to close**: Pressing the Escape key closes the lightbox
- **Prevents navigation**: When open, the lightbox prevents slide navigation
- **Auto-pause videos**: Videos in lightboxes start paused if they have a `data-preview-video` attribute

---

**For Your Project**:

### Directive Mapping

Your markdown-to-HTML generator may want to support lightbox functionality. However, since lightboxes are typically interactive elements that may not fit a linear video presentation workflow, consider whether they should be supported.

**If supporting lightboxes**:

```markdown
![Thumbnail](thumbnail.png)
@lightbox-image: full-size.png
@lightbox-fit: contain
```

**MUST** generate:

```html
<section>
  <img src="thumbnail.png"
       data-preview-image="full-size.png"
       data-preview-fit="contain">
</section>
```

### Video Synchronization Considerations

**Important for video generation**: Lightbox interactions are **inherently user-triggered** and don't work well with automated video generation:

1. **Interactive elements**: Lightboxes require user clicks to open
2. **No auto-trigger**: There's no way to automatically open a lightbox
3. **Pauses presentation**: Lightboxes block slide navigation

**Recommendations**:
- **For video presentations**: Don't use lightboxes. Instead, embed full-size images/videos directly in slides
- **For interactive HTML**: Lightboxes work great for providing detail on demand
- **For Playwright recording**: You could programmatically click elements to trigger lightboxes, but timing would be complex

### Alternative for Video Generation

Instead of lightbox functionality, for video presentations you should:

```markdown
## Full-Screen Image
@image: full-size.png
@background-size: contain

## Full-Screen Video
@video: video.mp4
@video-autoplay: true
```

Generates slide with full-screen media:

```html
<section data-background-image="full-size.png"
         data-background-size="contain">
</section>

<section data-background-video="video.mp4">
  <video src="video.mp4" autoplay></video>
</section>
```

### Validation Rules

If implementing lightbox support:

- [ ] `data-preview-*` attribute is on a valid HTML element
- [ ] Image/video URLs are valid and accessible
- [ ] `data-preview-fit` only uses valid values: `scale-down`, `contain`, or `cover`
- [ ] Iframe URLs are from trusted sources that allow embedding
- [ ] Elements with lightbox attributes have appropriate cursor styling (e.g., `cursor: pointer`)

### Common Pitfalls

1. **Issue**: Lightbox doesn't open
   **Solution**: Verify the element has a valid `data-preview-*` attribute and the media URL is correct

2. **Issue**: Iframe lightbox shows blank or "refused to connect"
   **Solution**: The target website doesn't allow iframe embedding. Check browser console for errors.

3. **Issue**: Video doesn't play in lightbox
   **Solution**: Ensure video format is web-compatible (MP4, WebM) and URL is accessible

4. **Issue**: Lightbox appears behind other content
   **Solution**: RevealJS manages z-index automatically. Don't add custom z-index styles that interfere.

### Usage Context

**Best for**:
- Interactive HTML presentations shown in browsers
- Detail-on-demand workflows (thumbnails → full-size)
- Gallery-style presentations

**Not suitable for**:
- Automated video generation (requires user interaction)
- Linear, non-interactive video presentations
- Narrated presentations without pauses
