# Reveal.js Research Summary

## Native Markdown Support
- Uses `marked` library
- Slide delimiter: `---` (horizontal) and `^^` (vertical/nested)
- Speaker notes: `Note:` prefix
- Can embed HTML with special comments: `<!-- .slide: attr="value" -->`
- Code highlighting with line-by-line reveal: ``` ```python [1-2|3|4] ```

## Core Navigation API
```javascript
Reveal.next()                    // Next slide
Reveal.prev()                    // Previous slide
Reveal.slide(h, v, f)           // Go to specific slide
Reveal.nextFragment()           // Next fragment step
Reveal.getIndices()             // Returns {h, v, f}
Reveal.getCurrentSlide()        // DOM element
Reveal.getTotalSlides()         // Total count
Reveal.getProgress()            // 0.0 to 1.0
```

## Critical Events for Audio Sync
```javascript
Reveal.on('ready', (event) => {})
Reveal.on('slidechanged', (event) => {
  // event.indexh, event.indexv, event.currentSlide, event.previousSlide
})
Reveal.on('slidetransitionend', (event) => {})
Reveal.on('fragmentshown', (event) => {})
Reveal.on('fragmenthidden', (event) => {})
```

## Major Features
1. **Vertical Slides**: Nested optional content (up/down navigation)
2. **Fragments**: Step-by-step reveals with effects (fade, grow, highlight, etc.)
3. **Speaker Notes**: `<aside class="notes">` or `Note:` in markdown
4. **Auto-Animate**: Smooth element transitions between slides
5. **Themes**: Built-in themes (black, white, dracula, etc.)
6. **Media Support**: Auto-play video/audio per slide
7. **Code Highlighting**: Syntax highlighting with line-by-line reveal

## Configuration for Orchestration
```javascript
Reveal.initialize({
  autoSlide: 0,                 // Disabled - Playwright controls timing
  hash: true,                   // URL bookmarking
  fragments: true,              // Enable step-by-step
  fragmentInURL: true,          // Track fragments in URL
  autoPlayMedia: false,         // Manual media control
  transition: 'slide',          // Visual transition
  plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
});
```

## Playwright Integration Points
- All APIs accessible via `window.Reveal` in browser context
- Events can be captured and queued in window object
- Programmatic navigation from Playwright: `page.evaluate(() => window.Reveal.next())`
- State inspection: `page.evaluate(() => window.Reveal.getIndices())`

## Recommended Sync Strategy
1. Use `slidechanged` event as primary trigger
2. Combine with `slidetransitionend` for precise timing
3. Support fragment-level sync with `fragmentshown` events
4. Maintain event queue in browser context, poll from Playwright
5. Use custom data attributes for audio metadata: `data-audio-duration`, `data-audio-cue`
