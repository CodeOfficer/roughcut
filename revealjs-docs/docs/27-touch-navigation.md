---
title: Touch Navigation
category: FEATURES
relevance_to_project: Low
related_directives: []
---

# Touch Navigation

> **Note**: Touch navigation is a user-interactive feature primarily for live presentations on touch devices. Not typically used during automated video recording.

## Overview

Touch navigation enables swipe gestures on touch-enabled devices (smartphones, tablets, touch screens) to navigate through presentations. This provides an intuitive, mobile-friendly interface for slide navigation.

## Gesture Behavior

### Horizontal Swipes

Swipe **left** or **right** to navigate between **horizontal slides**.

- **Swipe right** (or drag left): Go to previous horizontal slide
- **Swipe left** (or drag right): Go to next horizontal slide

### Vertical Swipes

Swipe **up** or **down** to navigate between **vertical slides** within a stack.

- **Swipe down** (or drag up): Go to previous vertical slide
- **Swipe up** (or drag down): Go to next vertical slide

> **Navigation Note**: Vertical swipes only work when the current horizontal slide has vertical children. See `20-vertical-slides.md` for more on 2D navigation.

## Required DOM Structure

No special DOM structure is required. Touch navigation works with standard reveal.js markup:

```html
<div class="reveal">
  <div class="slides">
    <!-- Horizontal navigation: swipe left/right -->
    <section>
      <h2>Slide 1</h2>
    </section>

    <!-- Vertical navigation: swipe up/down within this stack -->
    <section>
      <section>
        <h2>Slide 2A</h2>
      </section>
      <section>
        <h2>Slide 2B</h2>
      </section>
    </section>

    <section>
      <h2>Slide 3</h2>
    </section>
  </div>
</div>
```

## Preventing Swipe on Specific Elements

Use the `data-prevent-swipe` attribute to protect elements that need touch interaction (like scrollable content):

```html
<section>
  <!-- This element won't trigger slide navigation when swiped -->
  <div data-prevent-swipe style="overflow-y: scroll; height: 400px;">
    <p>Long scrollable content...</p>
    <p>Users can scroll this without changing slides</p>
  </div>
</section>
```

### Common Use Cases for `data-prevent-swipe`

| Element Type | Why It Needs Protection |
|--------------|-------------------------|
| Scrollable containers | Users need to scroll content without navigating |
| Image galleries | Users need to swipe through images within a slide |
| Embedded maps | Users need to pan/zoom the map |
| Carousels | Users need to swipe through carousel items |
| Interactive diagrams | Users need to interact with touch elements |

## Configuration

### Disable Touch Navigation

Touch navigation is **enabled by default**. To disable it entirely:

```javascript
Reveal.initialize({
  touch: false,
});
```

### Configuration Options

| Config Option | Type | Default | Description |
|---------------|------|---------|-------------|
| `touch` | Boolean | `true` | Enable/disable touch navigation globally |

> **Note**: There is no configuration for individual gesture directions. Touch navigation is all-or-nothing.

## Attributes Reference

| Attribute | Applied To | Required | Description |
|-----------|-----------|----------|-------------|
| `data-prevent-swipe` | Any element | No | Prevents swipe gestures on this element from triggering slide navigation |

## Gesture Detection

Reveal.js uses touch event listeners to detect swipe gestures:

- **Threshold**: Minimum swipe distance to trigger navigation (~40px typically)
- **Direction**: Primarily horizontal or vertical (not diagonal)
- **Velocity**: Faster swipes may have lower distance requirements

### Event Flow

1. `touchstart` - User touches screen
2. `touchmove` - User drags finger
3. `touchend` - User releases finger
4. Reveal.js calculates direction and distance
5. If threshold met and not prevented, navigate to appropriate slide

## Browser Support

Touch navigation works on:

- iOS Safari (iPhone, iPad)
- Android Chrome
- Android Firefox
- Windows touch devices
- Any device with touchscreen + modern browser

> **Compatibility**: Touch events are widely supported. No fallback needed for desktop (mouse navigation remains available).

## Accessibility Considerations

### Multi-Modal Navigation

Touch navigation **complements** other navigation methods:

- Keyboard navigation (arrow keys)
- On-screen navigation controls
- Jump-to-slide (G key)
- Programmatic API (`Reveal.next()`, etc.)

All methods work simultaneously - disabling touch doesn't affect keyboard or API navigation.

### Gesture Alternatives

Always provide non-touch alternatives:

- Visible navigation arrows for mouse users
- Keyboard shortcuts documented
- Jump-to-slide for quick access
- Overview mode for birds-eye view

---

**For Your Project**:

### Video Recording Mode

Touch navigation is **not relevant for automated video recording** since Playwright controls navigation programmatically via the API:

```javascript
// Automated recording uses API, not touch
await page.evaluate(() => Reveal.next());
```

**Recommendation**: Leave touch navigation enabled (default) for manual testing, but it won't affect automated recording.

### Configuration During Recording

You can optionally disable touch during recording if you're concerned about interference:

```javascript
Reveal.initialize({
  touch: false, // Optional: disable for automated recording
  // ... other config
});
```

However, this is typically **not necessary** since Playwright doesn't simulate touch events.

### Testing on Mobile Devices

If you're testing presentations on mobile devices:

1. **Leave touch enabled** for realistic testing
2. **Use `data-prevent-swipe`** on scrollable content areas
3. **Test both orientations** (portrait and landscape)
4. **Verify gesture thresholds** work comfortably for users

### Directive Integration

No special directives needed. Touch navigation is a runtime feature that doesn't affect HTML generation.

If you want to allow disabling touch per-presentation:

```markdown
@config:touch: false
```

Could generate:

```javascript
Reveal.initialize({
  touch: false,
});
```

### Common Pitfalls

1. **Issue**: Users can't scroll long content on mobile
   **Solution**: Add `data-prevent-swipe` to scrollable containers

   ```html
   <div data-prevent-swipe style="overflow-y: auto; max-height: 500px;">
     <!-- scrollable content -->
   </div>
   ```

2. **Issue**: Swipe gestures conflict with embedded content (maps, galleries)
   **Solution**: Wrap interactive embeds with `data-prevent-swipe`

   ```html
   <div data-prevent-swipe>
     <iframe src="https://maps.google.com/..."></iframe>
   </div>
   ```

3. **Issue**: Touch navigation feels too sensitive or not sensitive enough
   **Solution**: This is controlled internally by reveal.js. No configuration available. Consider disabling touch if problematic.

### Validation Rules

- [ ] If presentation includes scrollable content, ensure `data-prevent-swipe` is added
- [ ] If presentation includes interactive embeds (maps, galleries), ensure `data-prevent-swipe` is added
- [ ] Test on actual touch devices if target audience uses mobile

### Related Documentation

- `20-vertical-slides.md` - Understanding 2D navigation structure
- `33-keyboard.md` - Alternative keyboard navigation
- `29-overview-mode.md` - Alternative navigation mode
- `31-api-methods.md` - Programmatic navigation for recording
