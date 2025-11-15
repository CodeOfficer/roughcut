---
title: Configuration Options
category: CUSTOMIZATION
relevance_to_project: High
related_directives: []
---

# Configuration Options

> **Critical for Setup**: These configuration values control reveal.js behavior during video recording

Presentation behavior can be fine-tuned using a wide array of configuration options. These objects can be included where you initialize reveal.js. It's also possible to change config values at runtime.

Note that **all** configuration values are **optional** and will default to the values specified below.

## Complete Configuration Reference

```javascript
Reveal.initialize({
  // Display presentation control arrows
  // - true: Display controls on all screens
  // - false: Hide controls on all screens
  // - "speaker-only": Only display controls in the speaker view
  controls: true,

  // Help the user learn the controls by providing hints
  controlsTutorial: true,

  // Determines where controls appear, "edges" or "bottom-right"
  controlsLayout: 'bottom-right',

  // Visibility rule for backwards navigation arrows
  controlsBackArrows: 'faded', // "faded", "hidden", or "visible"

  // Display a presentation progress bar
  progress: true,

  // Display the page number of the current slide
  // Can optionally be set as a string:
  // - "h.v":   Horizontal . vertical slide number (default)
  // - "h/v":   Horizontal / vertical slide number
  // - "c":     Flattened slide number
  // - "c/t":   Flattened slide number / total slides
  slideNumber: false,

  // Can be used to limit the contexts in which the slide number appears
  // - "all":      Always show the slide number
  // - "print":    Only when printing to PDF
  // - "speaker":  Only in the speaker view
  showSlideNumber: 'all',

  // Use 1 based indexing for # links to match slide number
  hashOneBasedIndex: false,

  // Add the current slide number to the URL hash
  hash: false,

  // Flags if we should monitor the hash and change slides accordingly
  respondToHashChanges: true,

  // Enable support for jump-to-slide navigation shortcuts
  jumpToSlide: true,

  // Push each slide change to the browser history
  history: false,

  // Enable keyboard shortcuts for navigation
  keyboard: true,

  // Optional function that blocks keyboard events when returning false
  // If you set this to 'focused', we will only capture keyboard events
  // for embedded decks when they are in focus
  keyboardCondition: null,

  // Disables the default reveal.js slide layout (scaling and centering)
  disableLayout: false,

  // Enable the slide overview mode
  overview: true,

  // Vertical centering of slides
  center: true,

  // Enables touch navigation on devices with touch input
  touch: true,

  // Loop the presentation
  loop: false,

  // Change the presentation direction to be RTL
  rtl: false,

  // Changes the behavior of our navigation directions
  // "default": Left/right arrows step horizontal, up/down step vertical
  // "linear":  Removes up/down arrows, left/right step through all
  // "grid":    When stepping left/right from a vertical stack to adjacent
  //            vertical stack, land at same vertical index
  navigationMode: 'default',

  // Randomizes the order of slides each time the presentation loads
  shuffle: false,

  // Turns fragments on and off globally
  fragments: true,

  // Flags whether to include the current fragment in the URL
  fragmentInURL: true,

  // Flags if the presentation is running in an embedded mode
  embedded: false,

  // Flags if we should show a help overlay when the question-mark key is pressed
  help: true,

  // Flags if it should be possible to pause the presentation (blackout)
  pause: true,

  // Flags if speaker notes should be visible to all viewers
  showNotes: false,

  // Global override for autoplaying embedded media (video/audio/iframe)
  // - null:   Media will only autoplay if data-autoplay is present
  // - true:   All media will autoplay, regardless of individual setting
  // - false:  No media will autoplay, regardless of individual setting
  autoPlayMedia: null,

  // Global override for preloading lazy-loaded iframes
  // - null:   Iframes with data-src AND data-preload will be loaded when within
  //           the viewDistance, iframes with only data-src will be loaded when visible
  // - true:   All iframes with data-src will be loaded when within the viewDistance
  // - false:  All iframes with data-src will be loaded only when visible
  preloadIframes: null,

  // Can be used to globally disable auto-animation
  autoAnimate: true,

  // Optionally provide a custom element matcher for auto-animation
  autoAnimateMatcher: null,

  // Default settings for auto-animate transitions
  autoAnimateEasing: 'ease',
  autoAnimateDuration: 1.0,
  autoAnimateUnmatched: true,

  // CSS properties that can be auto-animated
  autoAnimateStyles: [
    'opacity',
    'color',
    'background-color',
    'padding',
    'font-size',
    'line-height',
    'letter-spacing',
    'border-width',
    'border-color',
    'border-radius',
    'outline',
    'outline-offset',
  ],

  // Controls automatic progression to the next slide
  // - 0:      Auto-sliding only happens if the data-autoslide HTML attribute
  //           is present on the current slide or fragment
  // - 1+:     All slides will progress automatically at the given interval (ms)
  // - false:  No auto-sliding, even if data-autoslide is present
  autoSlide: 0,

  // Stop auto-sliding after user input
  autoSlideStoppable: true,

  // Use this method for navigation when auto-sliding
  autoSlideMethod: null,

  // Specify the average time in seconds that you think you will spend
  // presenting each slide (used for speaker view pacing timer)
  defaultTiming: null,

  // Enable slide navigation via mouse wheel
  mouseWheel: false,

  // Opens links in an iframe preview overlay
  previewLinks: false,

  // Exposes the reveal.js API through window.postMessage
  postMessage: true,

  // Dispatches all reveal.js events to the parent window through postMessage
  postMessageEvents: false,

  // Focuses body when page changes visibility to ensure keyboard shortcuts work
  focusBodyOnPageVisibilityChange: true,

  // Transition style - see transitions.md
  transition: 'slide', // none/fade/slide/convex/concave/zoom

  // Transition speed
  transitionSpeed: 'default', // default/fast/slow

  // Transition style for full page slide backgrounds
  backgroundTransition: 'fade', // none/fade/slide/convex/concave/zoom

  // The maximum number of pages a single slide can expand onto when printing to PDF
  pdfMaxPagesPerSlide: Number.POSITIVE_INFINITY,

  // Prints each fragment on a separate slide
  pdfSeparateFragments: true,

  // Offset used to reduce the height of content within exported PDF pages
  pdfPageHeightOffset: -1,

  // Number of slides away from the current that are visible
  viewDistance: 3,

  // Number of slides away from the current that are visible on mobile devices
  mobileViewDistance: 2,

  // The display mode that will be used to show slides
  display: 'block',

  // Hide cursor if inactive
  hideInactiveCursor: true,

  // Time before the cursor is hidden (in ms)
  hideCursorTime: 5000,
});
```

## Reconfiguring at Runtime

The configuration can be updated after initialization using the `configure` method:

```javascript
// Turn autoSlide off
Reveal.configure({ autoSlide: 0 });

// Start auto-sliding every 5s
Reveal.configure({ autoSlide: 5000 });
```

---

**For Your Project - Recommended Configuration**:

### During Video Recording (Playwright)

```javascript
Reveal.initialize({
  // Disable interactive controls for recording
  controls: false,
  progress: false,
  slideNumber: false,
  keyboard: false, // Or keyboardCondition: 'focused'
  overview: false,
  touch: false,
  help: false,

  // Center content for consistent framing
  center: true,

  // Disable looping - record start to finish
  loop: false,

  // Enable fragments for @fragment: support
  fragments: true,
  fragmentInURL: false, // Don't update URL during recording

  // Auto-slide controlled by @narration: timing
  autoSlide: 0, // Per-slide timing via data-autoslide
  autoSlideStoppable: false, // Prevent accidental stops

  // Disable unnecessary features
  pause: false,
  mouseWheel: false,
  shuffle: false,

  // Transitions as specified
  transition: 'slide', // Override with @transition:
  transitionSpeed: 'default',
  backgroundTransition: 'fade',

  // Auto-animate if needed
  autoAnimate: true,
  autoAnimateDuration: 0.8,

  // Viewport settings
  viewDistance: 3,

  // History disabled for recording
  hash: false,
  history: false,
});
```

### Critical Timing-Related Configs

| Config | Value for Recording | Reason |
|--------|---------------------|--------|
| `autoSlide` | `0` | Use per-slide `data-autoslide` based on @narration: duration |
| `autoSlideStoppable` | `false` | Prevent user interaction from stopping recording |
| `autoAnimateDuration` | `0.8` | Default transition time - account for in timeline |
| `transitionSpeed` | `'default'` | ~800ms - must sync with audio |
| `fragments` | `true` | Enable @fragment: support |

### HTML Structure for Config

RevealJS is initialized via JavaScript, typically at the end of your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="dist/reveal.css">
  <link rel="stylesheet" href="dist/theme/black.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Your slides here -->
    </div>
  </div>

  <script src="dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      // Your config here
    });
  </script>
</body>
</html>
```

> **Structure**: Config is passed to `Reveal.initialize()` as a JavaScript object, NOT as HTML attributes
