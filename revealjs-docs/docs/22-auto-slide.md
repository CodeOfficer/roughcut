---
title: Auto-Slide
category: FEATURES
relevance_to_project: High
related_directives: [@pause:, @narration:]
---

# Auto-Slide

> **Critical for Video Generation**: Auto-slide timing directly controls video duration and must sync with @narration: audio length

Presentations can be configured to step through slides automatically, without any user input. To enable this you will need to specify an interval for slide changes using the `autoSlide` config option. The interval is provided in milliseconds.

```javascript
// Slide every five seconds
Reveal.initialize({
  autoSlide: 5000,
  loop: true,
});
```

A play/pause control element will automatically appear for auto-sliding decks. Sliding is automatically paused if the user starts interacting with the deck. It's also possible to pause or resume sliding by pressing »A« on the keyboard.

You can disable the auto-slide controls and prevent sliding from being paused by specifying `autoSlideStoppable: false` in your [config options](./19-config-options.md).

## Slide Timing

> **@narration: Integration**: Set `data-autoslide` per slide to match your TTS audio duration

It's also possible to override the slide duration for individual slides and fragments by using the `data-autoslide` attribute.

```html
<section data-autoslide="2000">
  <p>After 2 seconds the first fragment will be shown.</p>
  <p class="fragment" data-autoslide="10000">
    After 10 seconds the next fragment will be shown.
  </p>
  <p class="fragment">
    Now, the fragment is displayed for 2 seconds before the next slide is shown.
  </p>
</section>
```

> **Character-Level Timing**: For ElevenLabs TTS with character-level timing, calculate `data-autoslide` value from the sum of all character durations in the slide's narration

## Auto-Slide Method

The `autoSlideMethod` config option can be used to override the default function used for navigation when auto-sliding.

We step through all slides, both horizontal and [vertical](./20-vertical-slides.md), by default. To only navigate along the top layer and ignore vertical slides, you can provide a method that calls `Reveal.right()`.

```javascript
Reveal.configure({
  autoSlideMethod: () => Reveal.right(),
});
```

## Events

We fire events whenever auto-sliding is paused or resumed.

```javascript
Reveal.on('autoslideresumed', (event) => {
  /* ... */
});
Reveal.on('autoslidepaused', (event) => {
  /* ... */
});
```

> **@pause: Directive**: Use `Reveal.toggleAutoSlide()` or listen to these events to implement your @pause: directive behavior

---

**For Your Project - Critical Implementation Details**:

### Calculating Auto-Slide Timing from TTS Audio

Your pipeline should:

1. **Get TTS audio duration** from ElevenLabs API response
2. **Set data-autoslide** value to match:
   ```javascript
   // Example: narration is 3.5 seconds
   const narrationDurationMs = audioMetadata.duration * 1000; // 3500ms
   slideElement.setAttribute('data-autoslide', narrationDurationMs);
   ```

3. **Account for fragments** if using @fragment:
   ```javascript
   // If slide has 3 fragments with separate narrations:
   const fragmentDurations = [1000, 1500, 2000]; // ms
   fragments.forEach((fragment, i) => {
     fragment.setAttribute('data-autoslide', fragmentDurations[i]);
   });
   ```

### @pause: Directive Implementation

```javascript
// In your directive processor
if (directive === '@pause:') {
  const pauseDuration = parseInt(directiveValue); // milliseconds
  slideElement.setAttribute('data-autoslide', pauseDuration);
  slideElement.setAttribute('data-pause-only', 'true'); // No narration
}
```

### Video Recording Sync

```javascript
// In Playwright script - wait for auto-slide completion
await page.evaluate(() => {
  return new Promise(resolve => {
    Reveal.on('slidechanged', (event) => {
      if (event.indexh === Reveal.getTotalSlides() - 1) {
        resolve(); // Last slide reached
      }
    });
  });
});
```

### Recommended Config for Recording

```javascript
Reveal.initialize({
  autoSlide: 0, // Don't use global, use per-slide timing
  autoSlideStoppable: false, // Prevent accidental stops
  autoSlideMethod: null, // Default behavior (includes vertical)
  loop: false, // Don't loop during recording
});
```
