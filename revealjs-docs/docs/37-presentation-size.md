---
title: Presentation Size
category: CUSTOMIZATION
relevance_to_project: High
related_directives: [@config:, @size:, @dimensions:]
---

# Presentation Size

> **Critical Note**: RevealJS uses a "normal" authoring size and automatically scales to fit different viewports. For video generation, you MUST set explicit dimensions to ensure consistent output resolution.

## Overview

RevealJS employs a responsive sizing system:
1. Define a "normal" size (authoring resolution)
2. RevealJS automatically scales presentation to fit any display
3. Aspect ratio is preserved during scaling
4. Content layout remains consistent regardless of viewport

**For video generation**, this means:
- Set explicit `width` and `height` for consistent video dimensions
- Disable responsive scaling during recording
- Control output video resolution precisely

## Configuration Options

### Size Configuration

```javascript
Reveal.initialize({
  // The "normal" size - resolution at which presentation is authored
  width: 960,   // Default: 960px
  height: 700,  // Default: 700px

  // Margin around content (percentage of display size)
  margin: 0.04, // Default: 0.04 (4%)

  // Scaling bounds
  minScale: 0.2, // Minimum scale factor (default: 0.2 = 20%)
  maxScale: 2.0, // Maximum scale factor (default: 2.0 = 200%)
});
```

### Attributes Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number \| string | `960` | Presentation width in pixels or percentage |
| `height` | number \| string | `700` | Presentation height in pixels or percentage |
| `margin` | number | `0.04` | Empty space around content (0-1, percentage) |
| `minScale` | number | `0.2` | Minimum scaling factor (e.g., 0.2 = 20%) |
| `maxScale` | number | `2.0` | Maximum scaling factor (e.g., 2.0 = 200%) |
| `center` | boolean | `true` | Vertically center slides based on content |
| `embedded` | boolean | `false` | Embed in portion of page vs. full viewport |
| `disableLayout` | boolean | `false` | Disable automatic scaling and centering |

## Sizing Modes

### Standard Mode (Default)

Full-viewport presentation with automatic scaling:

```javascript
Reveal.initialize({
  width: 960,
  height: 700,
  // Fills entire browser viewport, scales to fit
});
```

**Behavior**:
- Presentation fills entire browser window
- Scales automatically to fit any screen size
- Maintains 960:700 aspect ratio
- Adds margins based on `margin` config

### Common Resolutions

| Resolution | Aspect Ratio | Use Case |
|------------|--------------|----------|
| 960x700 | 1.37:1 | Default RevealJS size |
| 1920x1080 | 16:9 | **Recommended for video** - Full HD |
| 1280x720 | 16:9 | HD video, smaller file size |
| 1024x768 | 4:3 | Traditional presentation |
| 1600x900 | 16:9 | 900p resolution |
| 3840x2160 | 16:9 | 4K video (high quality) |

> **Recommendation for video generation**: Use **1920x1080** (16:9) for high-quality video or **1280x720** for smaller files.

### Percentage-Based Sizing

Use percentage strings for relative sizing:

```javascript
Reveal.initialize({
  width: '100%',
  height: '100%',
  margin: 0,
});
```

**Use case**: Presentation fills container exactly (useful with `embedded: true`).

## Centering

### Vertical Centering (Default)

```javascript
Reveal.initialize({
  center: true, // Default
});
```

**Behavior**: Slides are vertically centered based on content height.

```html
<!-- Short slide -->
<section>
  <h2>Title</h2>
</section>
<!-- Centered vertically in viewport -->
```

### Fixed Positioning

```javascript
Reveal.initialize({
  center: false,
});
```

**Behavior**: Slides are top-aligned, content flows from top.

```html
<!-- Short slide -->
<section>
  <h2>Title</h2>
  <!-- Stays at top, doesn't center -->
</section>
```

**For video**: Use `center: true` for balanced appearance, or `center: false` for consistent positioning.

## Embedded Mode

### Full-Viewport Mode (Default)

```javascript
Reveal.initialize({
  embedded: false, // Default
});
```

Presentation takes over entire browser viewport.

### Embedded Mode

```javascript
Reveal.initialize({
  embedded: true,
});
```

```html
<div class="reveal" style="width: 800px; height: 600px;">
  <div class="slides">
    <!-- slides -->
  </div>
</div>
```

**Behavior**:
- Presentation size based on `.reveal` element dimensions
- Can embed multiple presentations on same page
- Manually trigger layout updates after size changes

### Manual Layout Updates

When `.reveal` dimensions change:

```javascript
// Change presentation size
document.querySelector('.reveal').style.width = '50vw';

// Notify RevealJS of size change
Reveal.layout();
```

## Custom Layout (BYOL)

### Bring Your Own Layout

```javascript
Reveal.initialize({
  disableLayout: true,
});
```

**Behavior**:
- Disables automatic scaling and centering
- Slides cover 100% of available width and height
- You control all responsive styling
- RevealJS does not apply any transforms

**Use case**: Complete control over layout, custom responsive design.

## API Methods

### Layout Control

```javascript
// Trigger layout recalculation
Reveal.layout();

// Get current scale
const scale = Reveal.getScale(); // e.g., 1.5 = 150%

// Get configured size
const config = Reveal.getConfig();
console.log(config.width, config.height); // 960, 700
```

## Scaling Behavior

### How Scaling Works

1. **Normal size**: Presentation authored at configured `width` × `height`
2. **Viewport size**: Actual browser window dimensions
3. **Scale calculation**: RevealJS calculates scale to fit viewport while preserving aspect ratio
4. **Bounds applied**: Scale clamped to `minScale` and `maxScale`
5. **Transform applied**: CSS transforms scale the presentation

### Scale Calculation Formula

```javascript
// Simplified version of RevealJS scaling
function calculateScale(presentationWidth, presentationHeight, viewportWidth, viewportHeight, margin, minScale, maxScale) {
  // Account for margin
  const availableWidth = viewportWidth * (1 - margin);
  const availableHeight = viewportHeight * (1 - margin);

  // Calculate scale to fit
  const scaleX = availableWidth / presentationWidth;
  const scaleY = availableHeight / presentationHeight;

  // Use smaller scale to fit both dimensions
  let scale = Math.min(scaleX, scaleY);

  // Apply bounds
  scale = Math.max(minScale, Math.min(maxScale, scale));

  return scale;
}
```

### Margin Behavior

```javascript
Reveal.initialize({
  margin: 0.1, // 10% margin
});
```

- Margin is a percentage (0 to 1) of viewport size
- Creates empty space around presentation
- Margin applies to both width and height
- `margin: 0` = presentation touches viewport edges
- `margin: 0.1` = 10% of viewport is empty space

### Scale Bounds

```javascript
Reveal.initialize({
  minScale: 0.5,  // Never smaller than 50%
  maxScale: 1.5,  // Never larger than 150%
});
```

**Use cases**:
- **minScale**: Prevent tiny presentations on small screens
- **maxScale**: Prevent excessive scaling on large displays

## Examples

### Video Generation (Full HD 16:9)

```javascript
Reveal.initialize({
  width: 1920,
  height: 1080,
  margin: 0,
  minScale: 1,
  maxScale: 1,
  center: true,
  embedded: false,
  disableLayout: false,
  controls: false, // Hide controls in video
});
```

**Result**: Fixed 1920x1080 presentation, no scaling, perfect for video recording.

### Video Generation (HD 720p)

```javascript
Reveal.initialize({
  width: 1280,
  height: 720,
  margin: 0,
  minScale: 1,
  maxScale: 1,
  center: true,
});
```

**Result**: Fixed 1280x720, smaller file sizes.

### Standard Interactive Presentation

```javascript
Reveal.initialize({
  width: 960,
  height: 700,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  center: true,
});
```

**Result**: Responsive presentation that scales to fit any screen.

### Embedded Presentation

```html
<div class="container">
  <div class="reveal" style="width: 100%; height: 500px;">
    <div class="slides">
      <!-- slides -->
    </div>
  </div>
</div>

<script>
  Reveal.initialize({
    embedded: true,
    width: '100%',
    height: '100%',
  });
</script>
```

### Custom Layout (No Scaling)

```javascript
Reveal.initialize({
  disableLayout: true,
});
```

```css
/* Custom responsive CSS */
.reveal .slides {
  width: 100vw !important;
  height: 100vh !important;
  transform: none !important;
}
```

---

## For Your Project

### Critical for Video Generation

Presentation size is **ESSENTIAL** for video generation:
- **Video resolution** = Playwright viewport size = RevealJS presentation size
- **Consistency** = Same dimensions every time
- **Quality** = Higher resolution = better quality (but larger files)

### Recommended Configuration for Video

```javascript
Reveal.initialize({
  // Match your target video resolution
  width: 1920,
  height: 1080,

  // No margins (use full viewport)
  margin: 0,

  // Disable scaling (fixed size)
  minScale: 1,
  maxScale: 1,

  // Center slides
  center: true,

  // Standard mode (not embedded)
  embedded: false,

  // Use RevealJS layout engine
  disableLayout: false,

  // Hide UI elements for video
  controls: false,
  progress: false,
  slideNumber: false, // Or customize as needed
});
```

### Directive Mapping

Allow users to specify video resolution:

```markdown
# Your Input Format:
@config:
@resolution: 1080p
# or
@resolution: 720p
# or
@width: 1920
@height: 1080

# Or use presets:
@video-quality: high   # 1920x1080
@video-quality: medium # 1280x720
@video-quality: low    # 854x480
```

**MUST** generate:

```javascript
const resolutions = {
  '1080p': { width: 1920, height: 1080 },
  '720p': { width: 1280, height: 720 },
  '480p': { width: 854, height: 480 },
};

Reveal.initialize({
  width: resolutions['1080p'].width,
  height: resolutions['1080p'].height,
  margin: 0,
  minScale: 1,
  maxScale: 1,
});
```

### Playwright Integration

Set Playwright viewport to match RevealJS size:

```javascript
const width = 1920;
const height = 1080;

// Set browser viewport
await page.setViewportSize({ width, height });

// Initialize RevealJS with same dimensions
await page.evaluate(({ width, height }) => {
  Reveal.initialize({
    width,
    height,
    margin: 0,
    minScale: 1,
    maxScale: 1,
  });
}, { width, height });
```

> **Critical**: Playwright viewport and RevealJS size MUST match exactly.

### Validation Rules

When generating presentation HTML:

- [ ] `width` and `height` are positive numbers
- [ ] Aspect ratio is standard (16:9, 4:3, etc.)
- [ ] `margin` is between 0 and 1
- [ ] `minScale` ≤ `maxScale`
- [ ] For video: `minScale` = `maxScale` = 1 (no scaling)
- [ ] For video: `margin` = 0 (use full viewport)
- [ ] Playwright viewport matches RevealJS size

### Common Video Resolutions

```javascript
const VIDEO_PRESETS = {
  // 16:9 aspect ratio (recommended)
  '4K': { width: 3840, height: 2160, bitrate: '10000k' },
  '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
  '720p': { width: 1280, height: 720, bitrate: '2500k' },
  '480p': { width: 854, height: 480, bitrate: '1000k' },

  // 4:3 aspect ratio (legacy)
  'XGA': { width: 1024, height: 768, bitrate: '2000k' },
  'SVGA': { width: 800, height: 600, bitrate: '1500k' },

  // Ultra-wide (21:9)
  'UWQHD': { width: 3440, height: 1440, bitrate: '8000k' },
};
```

### Performance Considerations

| Resolution | File Size | Quality | Use Case |
|------------|-----------|---------|----------|
| 3840x2160 (4K) | Very large | Excellent | High-end displays, future-proofing |
| 1920x1080 (1080p) | Large | Great | **Recommended default** |
| 1280x720 (720p) | Medium | Good | Smaller files, fast loading |
| 854x480 (480p) | Small | Acceptable | Quick previews, low bandwidth |

**Recommendation**: Use **1920x1080** as default, allow configuration.

### Common Pitfalls

1. **Pitfall**: Playwright viewport doesn't match RevealJS size
   ```javascript
   // WRONG
   await page.setViewportSize({ width: 1280, height: 720 });
   Reveal.initialize({ width: 1920, height: 1080 }); // Mismatch!
   ```
   **Solution**: Always match dimensions exactly

2. **Pitfall**: Scaling enabled during video recording
   ```javascript
   // WRONG
   Reveal.initialize({
     width: 1920,
     height: 1080,
     minScale: 0.2, // Will scale down!
     maxScale: 2.0,
   });
   ```
   **Solution**: Set `minScale` and `maxScale` to 1

3. **Pitfall**: Using margins in video recording
   ```javascript
   // WRONG
   Reveal.initialize({
     margin: 0.04, // Wastes pixels!
   });
   ```
   **Solution**: Set `margin: 0` for videos

4. **Pitfall**: Non-standard aspect ratios
   ```javascript
   // AWKWARD
   Reveal.initialize({
     width: 1000,
     height: 600, // 1.67:1 (odd ratio)
   });
   ```
   **Solution**: Use standard ratios (16:9, 4:3)

5. **Pitfall**: Forgetting to call `Reveal.layout()` after size changes
   ```javascript
   document.querySelector('.reveal').style.width = '1280px';
   // Missing: Reveal.layout();
   ```
   **Solution**: Always call `Reveal.layout()` after manual size changes

### Testing Strategy

1. **Verify dimensions**: Check actual rendered size matches config
   ```javascript
   const bounds = document.querySelector('.reveal').getBoundingClientRect();
   console.assert(bounds.width === 1920);
   console.assert(bounds.height === 1080);
   ```

2. **Test different resolutions**: Generate videos at multiple resolutions
3. **Check aspect ratio**: Verify no distortion
4. **Validate scaling**: Ensure `minScale === maxScale === 1` for video
5. **Test with Playwright**: Verify viewport matches RevealJS size

### Integration Example

```javascript
async function setupPresentationForVideo(page, config) {
  const resolution = config.videoResolution || '1080p';
  const sizes = {
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '4K': { width: 3840, height: 2160 },
  };

  const { width, height } = sizes[resolution];

  // 1. Set Playwright viewport
  await page.setViewportSize({ width, height });

  // 2. Navigate to presentation
  await page.goto(presentationURL);

  // 3. Initialize RevealJS with matching size
  await page.evaluate(
    ({ width, height }) => {
      Reveal.initialize({
        width,
        height,
        margin: 0,
        minScale: 1,
        maxScale: 1,
        center: true,
        controls: false,
        progress: false,
      });
    },
    { width, height }
  );

  // 4. Wait for initialization
  await page.waitForFunction(() => Reveal.isReady());

  // 5. Verify size
  const actualSize = await page.evaluate(() => {
    const bounds = document.querySelector('.reveal').getBoundingClientRect();
    return { width: bounds.width, height: bounds.height };
  });

  if (actualSize.width !== width || actualSize.height !== height) {
    throw new Error(`Size mismatch: expected ${width}x${height}, got ${actualSize.width}x${actualSize.height}`);
  }

  return { width, height };
}
```

### FFmpeg Encoding Settings

When encoding videos, match resolution:

```bash
# 1080p encoding
ffmpeg -framerate 30 -i frames_%04d.png \
  -c:v libx264 -preset slow -crf 18 \
  -vf "scale=1920:1080:flags=lanczos" \
  -pix_fmt yuv420p \
  output_1080p.mp4

# 720p encoding
ffmpeg -framerate 30 -i frames_%04d.png \
  -c:v libx264 -preset slow -crf 20 \
  -vf "scale=1280:720:flags=lanczos" \
  -pix_fmt yuv420p \
  output_720p.mp4
```

### Configuration Template

```javascript
// config/video-settings.js
export const VIDEO_SETTINGS = {
  '1080p': {
    reveal: {
      width: 1920,
      height: 1080,
      margin: 0,
      minScale: 1,
      maxScale: 1,
      center: true,
    },
    playwright: {
      width: 1920,
      height: 1080,
    },
    ffmpeg: {
      scale: '1920:1080',
      bitrate: '5000k',
      crf: 18,
    },
  },
  '720p': {
    reveal: {
      width: 1280,
      height: 720,
      margin: 0,
      minScale: 1,
      maxScale: 1,
      center: true,
    },
    playwright: {
      width: 1280,
      height: 720,
    },
    ffmpeg: {
      scale: '1280:720',
      bitrate: '2500k',
      crf: 20,
    },
  },
};
```
