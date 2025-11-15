---
title: Events
category: API
relevance_to_project: High
related_directives: [@narration:, @pause:, @fragment:]
---

# Events

> **Critical for Synchronization**: Use these events to coordinate audio playback timing with slide transitions and fragment reveals

We dispatch a number of events to make it easy for you to react to changes in the presentation. `Reveal.on()` is used to add event listeners, and `Reveal.off()` is used to remove them.

```javascript
Reveal.on('eventname', callbackFunction);
```

## Ready

The `ready` event is fired when reveal.js has loaded all non-async dependencies and is ready to accept API calls. To check if reveal.js is already 'ready' you can call `Reveal.isReady()`.

```javascript
Reveal.on('ready', (event) => {
  // event.currentSlide, event.indexh, event.indexv
});
```

We also add a `.ready` class to the `.reveal` element so that you can hook into this with CSS.

The `Reveal.initialize` method also returns a Promise which resolves when the presentation is ready. The following is synonymous to adding a listener for the `ready` event:

```javascript
Reveal.initialize().then(() => {
  // reveal.js is ready
});
```

> **Recording Setup**: Wait for `ready` event before starting Playwright video recording

## Slide Changed

The `slidechanged` event is fired each time the slide changes. The event object holds the index values of the current slide as well as a reference to the previous and current slide HTML elements.

Some libraries, like MathJax, get confused by the transforms and display states of slides. Often times, this can be fixed by calling their update or render function from this callback.

```javascript
Reveal.on('slidechanged', (event) => {
  // event.previousSlide, event.currentSlide, event.indexh, event.indexv
});
```

> **Audio Sync Point**: Use `slidechanged` to trigger narration audio for the new slide based on your @narration: timing

## Slide Transition End

The `slidechanged` event fires instantly as soon as the slide changes. If you'd rather invoke your event listener when the slide has finished transitioning and is fully visible, you can use the `slidetransitionend` event. The `slidetransitionend` event includes the same event data as `slidechanged`.

```javascript
Reveal.on('slidetransitionend', (event) => {
  console.log(event.currentSlide);
});
```

> **Video Timing**: Use `slidetransitionend` for precise timing - wait until transition completes before starting audio

## Resize

The `resize` event is fired when reveal.js changes the scale of the presentation.

```javascript
Reveal.on('resize', (event) => {
  // event.scale, event.oldScale, event.size
});
```

## Feature-specific Events

- [Overview mode events](./29-overview-mode.md#events)
- [Fragment events](./13-fragments.md#events)
- [Auto-Slide events](./22-auto-slide.md#events)

---

**For Your Project**: Critical event workflow for video generation:

1. **`ready`** - Initialize Playwright recording
2. **`slidechanged`** - Trigger @narration: audio playback
3. **`slidetransitionend`** - Ensure visual transition complete before audio
4. **`fragmentshown`** - Sync @fragment: reveals with audio timing
5. **`autoslideresumed/paused`** - Handle @pause: directive timing

Example integration:
```javascript
// In your Playwright script
await page.evaluate(() => {
  Reveal.on('slidechanged', (event) => {
    // Signal to your pipeline: start narration for slide event.indexh
    window.currentSlideIndex = event.indexh;
  });

  Reveal.on('fragmentshown', (event) => {
    // Sync fragment timing for @fragment: directives
    window.lastFragmentTime = Date.now();
  });
});
```
