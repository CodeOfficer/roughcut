---
title: postMessage API
category: API
relevance_to_project: Low
related_directives: []
---

# postMessage API

> **Use Case**: Cross-window communication when reveal.js runs in an iframe or separate window. Enables external control and event monitoring.

## Overview

The postMessage API provides a standard mechanism for communicating with a reveal.js presentation running in another window context (typically an iframe). This enables parent windows to:

- **Control presentations**: Navigate slides, trigger actions
- **Query state**: Get slide counts, current position, configuration
- **Monitor events**: Receive notifications when slides change, fragments appear, etc.

This uses the browser's native [`window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API for secure cross-origin communication.

## Sending Commands

### Basic Command Structure

Commands are sent as JSON-stringified objects with two properties:

```javascript
targetWindow.postMessage(
  JSON.stringify({
    method: 'methodName',   // API method to call
    args: [arg1, arg2]      // Array of arguments (optional)
  }),
  '*'  // Target origin ('*' or specific origin)
);
```

### Example: Navigate to Slide

```javascript
// Navigate to slide 2
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'slide', args: [2] }),
  '*'
);
```

### Example: Navigate Horizontally and Vertically

```javascript
// Navigate to horizontal slide 3, vertical slide 1
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'slide', args: [3, 1] }),
  '*'
);
```

### Example: Call API Method

```javascript
// Go to next slide
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'next' }),
  '*'
);

// Toggle overview mode
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'toggleOverview' }),
  '*'
);

// Configure reveal.js
iframe.contentWindow.postMessage(
  JSON.stringify({
    method: 'configure',
    args: [{ autoSlide: 5000 }]
  }),
  '*'
);
```

> **Available Methods**: All reveal.js API methods can be called via postMessage. See `31-api-methods.md` for complete list.

## Receiving Events

### Enable Event Broadcasting

By default, reveal.js does **not** broadcast events to the parent window. Enable it:

```javascript
Reveal.initialize({
  postMessageEvents: true
});
```

### Listen for Events

Subscribe to events in the parent window:

```javascript
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  // Check for reveal.js events
  if (data.namespace === 'reveal' && data.eventName === 'slidechanged') {
    console.log('Slide changed:', data.state);
    // data.state contains: { indexh, indexv, previousSlide, currentSlide }
  }
});
```

### Event Data Structure

All events have this structure:

```javascript
{
  namespace: 'reveal',        // Always 'reveal' for reveal.js events
  eventName: 'slidechanged',  // Name of the event
  state: { /* event data */ } // Event-specific data
}
```

### Example: Monitor Slide Changes

```javascript
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.namespace === 'reveal') {
    switch (data.eventName) {
      case 'slidechanged':
        console.log('Now on slide:', data.state.indexh, data.state.indexv);
        break;

      case 'fragmentshown':
        console.log('Fragment shown:', data.state.fragment);
        break;

      case 'fragmenthidden':
        console.log('Fragment hidden:', data.state.fragment);
        break;

      case 'paused':
        console.log('Presentation paused');
        break;

      case 'resumed':
        console.log('Presentation resumed');
        break;
    }
  }
});
```

> **Available Events**: All reveal.js events are broadcast. See `32-events.md` for complete event reference.

## Receiving Callbacks (Return Values)

### Query Methods

When you call a getter method via postMessage, reveal.js responds with the return value:

```javascript
// Send query
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'getTotalSlides' }),
  '*'
);

// Listen for response
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (
    data.namespace === 'reveal' &&
    data.eventName === 'callback' &&
    data.method === 'getTotalSlides'
  ) {
    console.log('Total slides:', data.result);
  }
});
```

### Callback Data Structure

```javascript
{
  namespace: 'reveal',
  eventName: 'callback',      // Indicates this is a method return value
  method: 'getTotalSlides',   // Method that was called
  result: 42                   // Return value from the method
}
```

### Example: Get Presentation State

```javascript
// Query current indices
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'getIndices' }),
  '*'
);

// Handle response
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (
    data.namespace === 'reveal' &&
    data.eventName === 'callback' &&
    data.method === 'getIndices'
  ) {
    console.log('Current position:', data.result);
    // data.result = { h: 2, v: 1, f: 0 }
  }
});
```

## Configuration

### Configuration Options

| Config Option | Type | Default | Description |
|---------------|------|---------|-------------|
| `postMessage` | Boolean | `true` | Exposes reveal.js API through window.postMessage |
| `postMessageEvents` | Boolean | `false` | Broadcasts all reveal.js events to parent window via postMessage |

### Example Configuration

```javascript
Reveal.initialize({
  // Enable API access via postMessage (enabled by default)
  postMessage: true,

  // Enable event broadcasting to parent window
  postMessageEvents: true
});
```

### Disable postMessage

To completely disable postMessage API:

```javascript
Reveal.initialize({
  postMessage: false,
  postMessageEvents: false
});
```

> **Security Note**: Disabling postMessage prevents external control, which may be desired for sensitive presentations.

## Security Considerations

### Origin Validation

**Always validate message origins** in production:

```javascript
// ❌ Unsafe: Accept messages from any origin
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  // Process data...
});

// ✅ Safe: Validate origin
window.addEventListener('message', (event) => {
  // Only accept messages from trusted origin
  if (event.origin !== 'https://trusted-domain.com') {
    return;
  }

  const data = JSON.parse(event.data);
  // Process data...
});
```

### Target Origin

When sending messages, **specify target origin**:

```javascript
// ❌ Unsafe: Send to any origin
iframe.contentWindow.postMessage(message, '*');

// ✅ Safe: Send to specific origin
iframe.contentWindow.postMessage(
  message,
  'https://presentation-domain.com'
);
```

### Content Security Policy

Ensure CSP headers allow frame-ancestors if embedding reveal.js:

```http
Content-Security-Policy: frame-ancestors 'self' https://trusted-parent.com
```

## Common Use Cases

### 1. External Navigation Controls

Build custom navigation UI in parent window:

```html
<!-- Parent window -->
<button onclick="prevSlide()">Previous</button>
<button onclick="nextSlide()">Next</button>
<iframe id="presentation" src="presentation.html"></iframe>

<script>
const iframe = document.getElementById('presentation');

function prevSlide() {
  iframe.contentWindow.postMessage(
    JSON.stringify({ method: 'prev' }),
    '*'
  );
}

function nextSlide() {
  iframe.contentWindow.postMessage(
    JSON.stringify({ method: 'next' }),
    '*'
  );
}
</script>
```

### 2. Progress Tracking

Monitor presentation progress from parent window:

```javascript
let currentSlide = 0;
let totalSlides = 0;

// Get total slides
iframe.contentWindow.postMessage(
  JSON.stringify({ method: 'getTotalSlides' }),
  '*'
);

// Listen for slide changes
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.namespace === 'reveal') {
    if (data.eventName === 'callback' && data.method === 'getTotalSlides') {
      totalSlides = data.result;
      updateProgress();
    }

    if (data.eventName === 'slidechanged') {
      currentSlide = data.state.indexh + 1;
      updateProgress();
    }
  }
});

function updateProgress() {
  document.getElementById('progress').textContent =
    `Slide ${currentSlide} of ${totalSlides}`;
}
```

### 3. Synchronized Presentations

Control multiple presentations simultaneously:

```javascript
const iframes = document.querySelectorAll('iframe.presentation');

function syncSlide(slideIndex) {
  iframes.forEach(iframe => {
    iframe.contentWindow.postMessage(
      JSON.stringify({ method: 'slide', args: [slideIndex] }),
      '*'
    );
  });
}
```

### 4. Analytics Integration

Track presentation engagement:

```javascript
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.namespace === 'reveal' && data.eventName === 'slidechanged') {
    // Send analytics event
    gtag('event', 'slide_view', {
      slide_index: data.state.indexh,
      slide_id: data.state.currentSlide.id
    });
  }
});
```

## Troubleshooting

### Common Issues

1. **Issue**: postMessage not working
   **Solution**:
   - Verify `postMessage: true` in config
   - Check that you're sending to correct window (`iframe.contentWindow`)
   - Ensure reveal.js is fully initialized before sending messages

2. **Issue**: Events not received
   **Solution**:
   - Enable `postMessageEvents: true` in reveal.js config
   - Verify event listener is registered before events fire
   - Check namespace filter (`data.namespace === 'reveal'`)

3. **Issue**: Callbacks never received
   **Solution**:
   - Check that `data.eventName === 'callback'`
   - Match `data.method` to the method you called
   - Ensure method actually returns a value

4. **Issue**: JSON parse errors
   **Solution**:
   - Wrap `JSON.parse()` in try-catch
   - Filter for reveal.js messages before parsing
   - Some browser extensions may post other messages

---

**For Your Project**:

### Relevance Assessment

The postMessage API is **low relevance** for your video recording project because:

1. **Your use case**: Automated video generation with Playwright
2. **Playwright control**: Direct JavaScript evaluation, not cross-window messaging
3. **No iframes**: Your generator likely controls a single browser context

### When You Might Need postMessage

Consider implementing if you add:

1. **Live presentation mode**: Web interface to control presentations
2. **Preview feature**: Embed presentation in editor with live preview
3. **Multi-screen setup**: Control presentation from separate device
4. **LMS integration**: Embed presentations in learning management system

### Alternative: Direct API Access

Your Playwright scripts can call API directly:

```javascript
// Instead of postMessage:
await page.evaluate(() => Reveal.next());

// Instead of postMessageEvents:
await page.evaluate(() => {
  Reveal.on('slidechanged', (event) => {
    // Handle event in browser context
  });
});
```

### If You Add Iframe Support

If you later support embedding presentations:

```markdown
@embed:mode: iframe
@embed:allow-postmessage: true
```

Could generate:

```javascript
Reveal.initialize({
  postMessage: true,
  postMessageEvents: true
});
```

And provide parent window JavaScript:

```javascript
// External control API
const presentation = new PresentationController(iframe);
await presentation.next();
await presentation.slide(5);
```

### Validation Rules

- [ ] If using iframes, ensure correct origin validation
- [ ] If enabling postMessage, document security considerations
- [ ] If broadcasting events, consider performance impact (many events)

### Related Documentation

- `31-api-methods.md` - API methods available via postMessage
- `32-events.md` - Events broadcast via postMessageEvents
- `39-multiplex.md` - Alternative for multi-device sync
