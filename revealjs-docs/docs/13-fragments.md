---
title: Fragments
category: CONTENT
relevance_to_project: High
related_directives: [@fragment:]
---

# Fragments

> **Direct Mapping**: Fragments correspond exactly to your @fragment: directive for animated list reveals

Fragments are used to highlight or incrementally reveal individual elements on a slide. Every element with the class `fragment` will be stepped through before moving on to the next slide.

The default fragment style is to start out invisible and fade in. This style can be changed by appending a different class to the fragment.

```html
<p class="fragment">Fade in</p>
<p class="fragment fade-out">Fade out</p>
<p class="fragment highlight-red">Highlight red</p>
<p class="fragment fade-in-then-out">Fade in, then out</p>
<p class="fragment fade-up">Slide up while fading in</p>
```

## Fragment Styles

| Name                    | Effect                                            |
|-------------------------|---------------------------------------------------|
| fade-out                | Start visible, fade out                           |
| fade-up                 | Slide up while fading in                          |
| fade-down               | Slide down while fading in                        |
| fade-left               | Slide left while fading in                        |
| fade-right              | Slide right while fading in                       |
| fade-in-then-out        | Fades in, then out on the next step               |
| current-visible         | Fades in, then out on the next step               |
| fade-in-then-semi-out   | Fades in, then to 50% on the next step            |
| grow                    | Scale up                                          |
| semi-fade-out           | Fade out to 50%                                   |
| shrink                  | Scale down                                        |
| strike                  | Strike through                                    |
| highlight-red           | Turn text red                                     |
| highlight-green         | Turn text green                                   |
| highlight-blue          | Turn text blue                                    |
| highlight-current-red   | Turn text red, then back to original on next step |
| highlight-current-green | Turn text green, then back to original            |
| highlight-current-blue  | Turn text blue, then back to original             |

## Custom Fragments (4.5.0+)

Custom effects can be implemented by defining CSS styles for `.fragment.effectname` and `.fragment.effectname.visible` respectively. The `visible` class is added to each fragment as they are stepped through in the presentation.

For example, the following defines a fragment style where elements are initially blurred but become focused when stepped through:

```html
<style>
  .fragment.blur {
    filter: blur(5px);
  }
  .fragment.blur.visible {
    filter: none;
  }
</style>
<section>
  <p class="fragment custom blur">One</p>
  <p class="fragment custom blur">Two</p>
  <p class="fragment custom blur">Three</p>
</section>
```

Note that we are adding a `custom` class to each fragment. This tells reveal.js to avoid applying its default fade-in fragment styles.

If you want all elements to remain blurred except the current fragment, you can substitute `visible` for `current-fragment`:

```css
.fragment.blur.current-fragment {
  filter: none;
}
```

## Nested Fragments

Multiple fragments can be applied to the same element sequentially by wrapping it. This will fade in the text on the first step, turn it red on the second and fade out on the third:

```html
<span class="fragment fade-in">
  <span class="fragment highlight-red">
    <span class="fragment fade-out"> Fade in > Turn red > Fade out </span>
  </span>
</span>
```

## Fragment Order

By default fragments will be stepped through in the order that they appear in the DOM. This display order can be changed using the `data-fragment-index` attribute. Note that multiple elements can appear at the same index.

```html
<p class="fragment" data-fragment-index="3">Appears last</p>
<p class="fragment" data-fragment-index="1">Appears first</p>
<p class="fragment" data-fragment-index="2">Appears second</p>
```

> **For @fragment: Directive**: Use `data-fragment-index` to control exact reveal order when building from markdown

## Events

When a fragment is either shown or hidden reveal.js will dispatch an event.

```javascript
Reveal.on('fragmentshown', (event) => {
  // event.fragment = the fragment DOM element
});
Reveal.on('fragmenthidden', (event) => {
  // event.fragment = the fragment DOM element
});
```

> **Audio Synchronization**: Listen to `fragmentshown` event to time your @narration: audio precisely with fragment reveals

---

**For Your Project**:

When processing @fragment: directives in your markdown:
1. Convert to `<li class="fragment">` or `<p class="fragment">`
2. Default to `fade-in` style unless specified
3. Use `data-fragment-index` for precise ordering
4. Hook `fragmentshown` event for audio timing
5. Consider transition duration (~300ms default) in your video timeline

Example markdown processing:
```markdown
@fragment:
- First item  → <li class="fragment" data-fragment-index="1">
- Second item → <li class="fragment" data-fragment-index="2">
```

Then in Playwright recording script:
```javascript
let fragmentCount = 0;
await page.evaluate(() => {
  Reveal.on('fragmentshown', () => {
    window.fragmentShown = true; // Signal for audio sync
  });
});
```
