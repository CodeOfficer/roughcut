---
title: Fullscreen Mode
category: FEATURES
relevance_to_project: Low
related_directives: []
---

# Fullscreen Mode

> **Note**: RevealJS includes built-in support for fullscreen mode using the browser's Fullscreen API. For automated video generation, this feature is less relevant since Playwright controls the viewport.

## Overview

RevealJS supports fullscreen mode, allowing presentations to utilize the entire screen without browser chrome (address bar, tabs, etc.). This provides an immersive presentation experience for live presentations.

## Usage

### Keyboard Shortcut

- **Enter fullscreen**: Press `F` key
- **Exit fullscreen**: Press `ESC` key

### Requirements

- Presentation must have focus (user must click on presentation first if embedded)
- Browser must support [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- Some browsers require user gesture (cannot programmatically fullscreen without user action)

## API Methods

### Programmatic Control

RevealJS does not expose direct fullscreen API methods, but you can use the standard browser Fullscreen API:

```javascript
// Enter fullscreen
const presentationElement = document.querySelector('.reveal');

if (presentationElement.requestFullscreen) {
  presentationElement.requestFullscreen();
} else if (presentationElement.webkitRequestFullscreen) {
  // Safari
  presentationElement.webkitRequestFullscreen();
} else if (presentationElement.msRequestFullscreen) {
  // IE11
  presentationElement.msRequestFullscreen();
}

// Exit fullscreen
if (document.exitFullscreen) {
  document.exitFullscreen();
} else if (document.webkitExitFullscreen) {
  // Safari
  document.webkitExitFullscreen();
} else if (document.msExitFullscreen) {
  // IE11
  document.msExitFullscreen();
}

// Check if currently fullscreen
const isFullscreen = !!(
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.msFullscreenElement
);
```

### Fullscreen Events

Listen for fullscreen state changes:

```javascript
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen mode');
  } else {
    console.log('Exited fullscreen mode');
  }
});

// Safari
document.addEventListener('webkitfullscreenchange', () => {
  // Handle fullscreen change
});
```

## Configuration

No specific configuration options for fullscreen mode. It works automatically with keyboard shortcuts.

## Browser Support

Fullscreen API support varies by browser:

| Browser | Support | Prefix |
|---------|---------|--------|
| Chrome | Yes | None (standard) |
| Firefox | Yes | None (standard) |
| Safari | Yes | `webkit` prefix |
| Edge | Yes | None (standard) |
| IE11 | Yes | `ms` prefix |

## Embedded Presentations

When using [embedded presentations](37-presentation-size.md#embedded):

```html
<div class="reveal" style="width: 800px; height: 600px;">
  <div class="slides">
    <!-- slides -->
  </div>
</div>
```

**Important**: User must click on the presentation to give it focus before the `F` key will work.

```javascript
// Auto-focus embedded presentation
const revealElement = document.querySelector('.reveal');
revealElement.addEventListener('mouseenter', () => {
  revealElement.focus();
});
```

## Examples

### Basic Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="dist/reveal.css" />
    <link rel="stylesheet" href="dist/theme/black.css" />
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <section>
          <h2>Press F for Fullscreen</h2>
          <p>Press ESC to exit</p>
        </section>
      </div>
    </div>
    <script src="dist/reveal.js"></script>
    <script>
      Reveal.initialize();
    </script>
  </body>
</html>
```

### Programmatic Fullscreen

```javascript
// Add a custom fullscreen button
document.getElementById('fullscreenBtn').addEventListener('click', () => {
  const reveal = document.querySelector('.reveal');

  if (!document.fullscreenElement) {
    reveal.requestFullscreen().catch((err) => {
      console.error('Error attempting to enable fullscreen:', err);
    });
  } else {
    document.exitFullscreen();
  }
});
```

### Fullscreen with Custom Controls

```html
<button id="fullscreenToggle">Toggle Fullscreen</button>

<script>
  const btn = document.getElementById('fullscreenToggle');

  btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.querySelector('.reveal').requestFullscreen();
      btn.textContent = 'Exit Fullscreen';
    } else {
      document.exitFullscreen();
      btn.textContent = 'Enter Fullscreen';
    }
  });

  // Update button text on ESC key
  document.addEventListener('fullscreenchange', () => {
    btn.textContent = document.fullscreenElement
      ? 'Exit Fullscreen'
      : 'Enter Fullscreen';
  });
</script>
```

---

## For Your Project

### Relevance for Video Generation

Fullscreen mode is **NOT directly relevant** for automated video generation because:
- Playwright controls viewport size explicitly
- Videos don't have "fullscreen" mode - they're just video files
- Browser chrome (address bar, etc.) is not captured in Playwright screenshots

### When It Might Matter

Fullscreen API could be relevant if:
1. **Testing presentation behavior** in fullscreen during development
2. **Live presentation mode** - If your system has a "preview" mode for presenters
3. **Hybrid system** - If presentations can be both recorded AND presented live

### Playwright Already Handles Viewport

```javascript
// Playwright effectively provides "fullscreen" by default
await page.setViewportSize({
  width: 1920,
  height: 1080,
});
// No browser chrome captured in screenshots/videos
```

The viewport is already "fullscreen" from the recording perspective.

### Testing Fullscreen Behavior

If you need to test fullscreen API interactions:

```javascript
// Test that fullscreen doesn't break your presentation
await page.evaluate(() => {
  document.querySelector('.reveal').requestFullscreen();
});

await page.waitForTimeout(1000);

// Verify presentation still works
const slideCount = await page.evaluate(() => Reveal.getTotalSlides());
console.assert(slideCount > 0);

// Exit fullscreen
await page.evaluate(() => {
  document.exitFullscreen();
});
```

### Recommendation

**For video generation**: Ignore fullscreen mode entirely. It's not applicable.

**For live presentations**: If you build a "present" mode, implement fullscreen support for better presenter experience:

```javascript
// Present mode: enable fullscreen
function enterPresentMode() {
  document.querySelector('.reveal').requestFullscreen();
  Reveal.configure({
    controls: false,
    progress: false,
  });
}
```

### Common Pitfalls

1. **Pitfall**: Trying to enter fullscreen programmatically without user gesture
   **Solution**: Fullscreen must be triggered by user action (click, keypress)

2. **Pitfall**: Not checking browser support
   **Solution**: Feature-detect before using:
   ```javascript
   if ('requestFullscreen' in document.documentElement) {
     // Fullscreen is supported
   }
   ```

3. **Pitfall**: Forgetting to handle fullscreen exit
   **Solution**: Listen for `fullscreenchange` event

4. **Pitfall**: Applying fullscreen during automated testing/recording
   **Solution**: Don't use fullscreen API in Playwright - it's unnecessary

### Integration Notes

If implementing a live presentation viewer:

```javascript
// Add fullscreen button to presentation viewer
class PresentationViewer {
  constructor(presentationURL) {
    this.iframe = document.createElement('iframe');
    this.iframe.src = presentationURL;
    document.body.appendChild(this.iframe);

    this.addFullscreenButton();
  }

  addFullscreenButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Fullscreen';
    btn.addEventListener('click', () => {
      this.iframe.requestFullscreen();
    });
    document.body.appendChild(btn);
  }
}
```

### No Configuration Needed

For video generation, simply omit any fullscreen-related configuration. Playwright's viewport control provides everything needed.

```javascript
// Video recording setup - no fullscreen needed
Reveal.initialize({
  width: 1920,
  height: 1080,
  // No fullscreen configuration required
});
```

### Browser Permissions

Some browsers may require permissions for fullscreen. In Playwright, this is automatically granted:

```javascript
// Playwright automatically grants permissions
const context = await browser.newContext({
  permissions: ['fullscreen'], // Optional, usually auto-granted
});
```

### Summary

- **Live presentations**: Fullscreen is useful for presenter experience
- **Video generation**: Fullscreen is irrelevant (Playwright handles viewport)
- **Keyboard shortcut**: `F` to enter, `ESC` to exit
- **API**: Use standard browser Fullscreen API
- **Requirements**: User gesture required, browser support varies

**For your video generation project**: You can safely ignore this feature entirely.
