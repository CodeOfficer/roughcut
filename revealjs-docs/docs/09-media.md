---
title: Media
category: CONTENT
relevance_to_project: Medium
related_directives: [@video:, @audio:, @image:]
---

# Media

> **Video Generation Note**: While your project generates video output (not embedded media), understanding media attributes helps if you later add overlay videos or reference materials.

## Overview

RevealJS provides autoplay, lazy loading, and lifecycle management for `<video>`, `<audio>`, and `<iframe>` elements based on slide visibility.

## Autoplay

### Per-Element Autoplay

```html
<section>
  <video data-autoplay src="video.mp4"></video>
</section>
```

**Behavior**: Media starts playing automatically when slide becomes visible.

### Global Autoplay Configuration

```javascript
Reveal.initialize({
  autoPlayMedia: null,  // Default: respect data-autoplay attribute
  // autoPlayMedia: true,  // ALL media autoplays
  // autoPlayMedia: false, // NO media autoplays
});
```

| Value | Behavior |
|-------|----------|
| `null` (default) | Respect `data-autoplay` attribute on each element |
| `true` | ALL media autoplays, ignoring `data-autoplay` |
| `false` | NO media autoplays, ignoring `data-autoplay` |

### Auto-Pause on Slide Exit

By default, video/audio and YouTube/Vimeo iframes pause when leaving a slide.

**Override**: Add `data-ignore` to prevent auto-pause:

```html
<video data-autoplay data-ignore src="background-music.mp4"></video>
```

## Attributes Reference

| Attribute | Target | Description |
|-----------|--------|-------------|
| `data-autoplay` | `<video>`, `<audio>`, `<iframe>` | Autoplay when slide is shown |
| `data-ignore` | `<video>`, `<audio>`, `<iframe>` | Don't pause when leaving slide |
| `data-src` | All media | Lazy load (instead of `src`) |
| `data-preload` | `<iframe>` | Preload before slide is visible |

## Lazy Loading

Use `data-src` instead of `src` for lazy loading:

```html
<section>
  <img data-src="image.png">
  <iframe data-src="https://example.com"></iframe>
  <video>
    <source data-src="video.webm" type="video/webm" />
    <source data-src="video.mp4" type="video/mp4" />
  </video>
</section>
```

**Behavior**: Media loads only when slide is within `viewDistance` of current slide.

### Configuration

```javascript
Reveal.initialize({
  viewDistance: 3,  // Preload 3 slides in each direction (default)
});
```

### Iframe-Specific Lazy Loading

Iframes ignore `viewDistance` and load only when their slide becomes visible (to prevent background audio/video).

**Override**: Use `data-preload` to respect `viewDistance`:

```html
<iframe data-src="https://example.com" data-preload></iframe>
```

**Global override**:

```javascript
Reveal.initialize({
  preloadIframes: null,  // Default: load only when visible
  // preloadIframes: true,  // Preload within viewDistance
  // preloadIframes: false, // Never preload
});
```

## Lightbox

See [10-lightbox.md](10-lightbox.md) for full details.

```html
<img src="thumbnail.png" data-preview-video="fullsize-video.mp4">
<a href="https://example.com" data-preview-link>Open Link</a>
```

## Iframes

### Auto-Detection

RevealJS auto-detects and autoplays YouTube/Vimeo embeds when slide becomes visible.

### Post Messages

RevealJS sends messages to embedded iframes:

```javascript
// Inside iframe
window.addEventListener('message', (event) => {
  if (event.data === 'slide:start') {
    // Slide containing iframe is visible
  } else if (event.data === 'slide:stop') {
    // Slide containing iframe is hidden
  }
});
```

---

**For Your Project**:

Your project generates MP4 videos, not HTML presentations with embedded media. However:

### Possible Use Cases

1. **Reference videos** - If you later want to embed example videos in slides
2. **Background videos** - For visual effects (via data-background-video)
3. **Audio overlay** - Background music separate from narration

### If Adding Media Support

```markdown
@slide:
@video: demo.mp4
@autoplay: true
## Video Demo
```

**Generate**:

```html
<section>
  <h2>Video Demo</h2>
  <video data-autoplay controls>
    <source src="demo.mp4" type="video/mp4">
  </video>
</section>
```

### Integration with Your Audio

Your ElevenLabs narration audio could theoretically be embedded:

```html
<section>
  <h2>Slide Title</h2>
  <audio data-autoplay data-ignore src="narration-slide-1.mp3"></audio>
  <aside class="notes">
    Narration: This is the narration text...
  </aside>
</section>
```

But this requires separate audio files. Your current approach (Playwright recording) captures everything in one video, which is simpler.

### Validation Rules

If adding media:

- [ ] Use `data-autoplay` for automatic playback
- [ ] Use `data-src` for lazy loading
- [ ] Include fallback formats (webm + mp4)
- [ ] Add controls attribute for user control
- [ ] Set appropriate poster image for videos

### Testing Media Integration

```javascript
// Verify media loads and plays
await page.evaluate(() => {
  const video = document.querySelector('video[data-autoplay]');
  return new Promise((resolve) => {
    video.addEventListener('play', () => resolve(true));
    Reveal.slide(0); // Trigger autoplay
  });
});
```
