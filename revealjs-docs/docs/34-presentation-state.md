---
title: Presentation State
category: API
relevance_to_project: Medium
related_directives: [Playwright recording, state management]
---

# Presentation State

> **Video Recording Use Case**: State management is useful for pausing/resuming recordings, handling errors, and implementing test suites that verify slide navigation.

## Overview

RevealJS provides `getState()` and `setState()` methods to capture and restore the presentation's current position and mode. Think of it as creating a snapshot that can be saved, transmitted, or restored later.

## API Methods

### getState()

Captures the current presentation state as a serializable object.

```javascript
// Navigate to a slide
Reveal.slide(1);

// Capture current state
let state = Reveal.getState();
// Returns: {indexh: 1, indexv: 0, indexf: undefined, paused: false, overview: false}
```

**Returns**: State object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `indexh` | number | Horizontal slide index (0-based) |
| `indexv` | number | Vertical slide index (0-based) |
| `indexf` | number\|undefined | Fragment index (-1 = no fragments shown, 0+ = fragment index) |
| `paused` | boolean | Whether presentation is paused |
| `overview` | boolean | Whether overview mode is active |

### setState(state)

Restores a previously captured state.

```javascript
// Move to slide 1
Reveal.slide(1);
let state = Reveal.getState();
// {indexh: 1, indexv: 0, indexf: undefined, paused: false, overview: false}

// Navigate away
Reveal.slide(3);

// Restore saved state (back to slide 1)
Reveal.setState(state);
```

**Parameters**:
- `state` (object) - State object from `getState()`

**Effect**: Instantly navigates to the saved slide, fragment, and mode.

## State Object Structure

```typescript
interface PresentationState {
  indexh: number;        // Horizontal slide index
  indexv: number;        // Vertical slide index
  indexf?: number;       // Fragment index (undefined if no fragments)
  paused: boolean;       // Pause state
  overview: boolean;     // Overview mode state
}
```

### Example States

```javascript
// First slide, no fragments
{indexh: 0, indexv: 0, indexf: undefined, paused: false, overview: false}

// Third horizontal slide, second vertical slide
{indexh: 2, indexv: 1, indexf: undefined, paused: false, overview: false}

// Slide with 2 fragments shown
{indexh: 1, indexv: 0, indexf: 1, paused: false, overview: false}

// Paused presentation
{indexh: 0, indexv: 0, indexf: undefined, paused: true, overview: false}

// Overview mode active
{indexh: 0, indexv: 0, indexf: undefined, paused: false, overview: true}
```

## State Serialization

State objects are plain JavaScript objects that can be:
- Stringified with `JSON.stringify()`
- Stored in localStorage
- Sent over network (WebSocket, HTTP)
- Saved to file

```javascript
// Save state to localStorage
const state = Reveal.getState();
localStorage.setItem('presentation-state', JSON.stringify(state));

// Restore from localStorage
const savedState = JSON.parse(localStorage.getItem('presentation-state'));
if (savedState) {
  Reveal.setState(savedState);
}
```

## Use Cases

### 1. Bookmark Current Position

```javascript
// Save current position
const bookmark = Reveal.getState();

// User navigates around...

// Return to bookmarked position
Reveal.setState(bookmark);
```

### 2. Multi-Device Synchronization

```javascript
// Device A (presenter)
const state = Reveal.getState();
socket.emit('state-change', state);

// Device B (viewer)
socket.on('state-change', (state) => {
  Reveal.setState(state);
});
```

### 3. Session Recovery

```javascript
// Auto-save every 30 seconds
setInterval(() => {
  const state = Reveal.getState();
  sessionStorage.setItem('auto-save', JSON.stringify(state));
}, 30000);

// On page load, restore
window.addEventListener('load', () => {
  const saved = sessionStorage.getItem('auto-save');
  if (saved) {
    Reveal.setState(JSON.parse(saved));
  }
});
```

### 4. Testing and Automation

```javascript
// Navigate to specific state for testing
const testState = {
  indexh: 2,
  indexv: 1,
  indexf: 0,
  paused: false,
  overview: false
};

Reveal.setState(testState);
// Now at slide 2,1 with first fragment visible
```

## Limitations

1. **Does not capture**:
   - Configuration settings
   - Custom CSS state
   - Plugin-specific state
   - Audio/video playback position
   - User interactions outside RevealJS

2. **Fragment index specifics**:
   - `undefined` means no fragments or fragments not activated
   - `-1` means all fragments hidden
   - `0+` means fragment at that index is visible

3. **Navigation methods**:
   - `setState()` does not trigger transition animations
   - Jumps directly to target state
   - Events still fire (e.g., `slidechanged`)

---

**For Your Project**:

### Video Recording State Management

During Playwright video recording, use state management for:

#### 1. Error Recovery

```javascript
// Save state before each slide
let currentState = null;

Reveal.on('slidechanged', (event) => {
  currentState = Reveal.getState();
  console.log('State saved:', currentState);
});

// If error occurs during recording
async function recoverFromError() {
  if (currentState) {
    await page.evaluate((state) => {
      Reveal.setState(state);
    }, currentState);
    console.log('Recovered to:', currentState);
  }
}
```

#### 2. Recording Checkpoints

```javascript
// Create checkpoints for large presentations
const checkpoints = [];

for (let h = 0; h < totalSlides; h++) {
  checkpoints.push({
    indexh: h,
    indexv: 0,
    indexf: undefined,
    paused: false,
    overview: false
  });
}

// Resume from checkpoint on failure
async function resumeFromCheckpoint(checkpointIndex) {
  const state = checkpoints[checkpointIndex];
  await page.evaluate((s) => Reveal.setState(s), state);
}
```

#### 3. Parallel Recording Segments

```javascript
// Record slides in parallel by starting at different states
async function recordSegment(startIndex, endIndex) {
  const startState = {indexh: startIndex, indexv: 0, indexf: undefined, paused: false, overview: false};

  await page.evaluate((state) => {
    Reveal.setState(state);
  }, startState);

  // Record from startIndex to endIndex
  for (let i = startIndex; i <= endIndex; i++) {
    // Record slide...
    Reveal.next();
  }
}

// Run segments in parallel
await Promise.all([
  recordSegment(0, 10),
  recordSegment(11, 20),
  recordSegment(21, 30)
]);
```

#### 4. Fragment-Level Recording Control

```javascript
// Navigate to specific fragment state for fine-grained control
async function recordSlideWithFragments(h, v, totalFragments) {
  for (let f = -1; f < totalFragments; f++) {
    const state = {
      indexh: h,
      indexv: v,
      indexf: f,
      paused: false,
      overview: false
    };

    await page.evaluate((s) => Reveal.setState(s), state);

    // Record this fragment state
    await page.waitForTimeout(500); // Fragment animation
    await recordFrame();
  }
}
```

### Testing Slide Navigation

```javascript
// Verify all slides are accessible
async function testAllSlides() {
  const slides = await page.evaluate(() => {
    return Reveal.getTotalSlides();
  });

  for (let i = 0; i < slides; i++) {
    const state = {indexh: i, indexv: 0, indexf: undefined, paused: false, overview: false};

    await page.evaluate((s) => Reveal.setState(s), state);

    const currentState = await page.evaluate(() => Reveal.getState());

    console.assert(
      currentState.indexh === i,
      `Failed to navigate to slide ${i}`
    );
  }
}
```

### State Logging for Debugging

```javascript
// Log all state changes during recording
Reveal.on('slidechanged', (event) => {
  const state = Reveal.getState();
  console.log(`[${new Date().toISOString()}] State:`, JSON.stringify(state));

  // Append to log file
  fs.appendFileSync('recording.log',
    `${Date.now()},${state.indexh},${state.indexv},${state.indexf}\n`
  );
});
```

### Validation Rules

When using state management:

- [ ] State is captured before any critical operation
- [ ] State restoration is verified (check returned state matches)
- [ ] Fragment indices are handled correctly (-1, undefined, 0+)
- [ ] Events are monitored after setState() calls
- [ ] State changes are logged for debugging

### Common Pitfalls

1. **Pitfall**: Assuming setState() animates transitions
   **Solution**: setState() jumps directly; use Reveal.slide() for animations

2. **Pitfall**: Not waiting for setState() to complete
   **Solution**: setState() is synchronous but events fire async; wait for `slidechanged`

```javascript
// WRONG
Reveal.setState(state);
await page.screenshot(); // Might capture mid-transition

// RIGHT
await page.evaluate((s) => {
  return new Promise((resolve) => {
    Reveal.setState(s);
    Reveal.on('slidechanged', () => resolve(), {once: true});
  });
}, state);
await page.screenshot(); // Now safe
```

3. **Pitfall**: Not handling fragment index edge cases
   **Solution**: Check for undefined, -1, and valid indices

```javascript
function isValidState(state) {
  return (
    typeof state.indexh === 'number' &&
    typeof state.indexv === 'number' &&
    (state.indexf === undefined || typeof state.indexf === 'number') &&
    typeof state.paused === 'boolean' &&
    typeof state.overview === 'boolean'
  );
}
```

### Integration with Other Features

Combine state management with:

- **Auto-slide** - Pause/resume auto-advance
- **Speaker notes** - Sync notes window with main presentation
- **Events** - Track state changes for analytics
- **Keyboard** - Save state on specific key press

```javascript
// Example: Save state on 'B' key (bookmark)
Reveal.addKeyBinding({keyCode: 66, key: 'B'}, () => {
  const state = Reveal.getState();
  localStorage.setItem('bookmark', JSON.stringify(state));
  console.log('Bookmark saved!');
});

// Restore on 'R' key
Reveal.addKeyBinding({keyCode: 82, key: 'R'}, () => {
  const state = JSON.parse(localStorage.getItem('bookmark'));
  if (state) {
    Reveal.setState(state);
    console.log('Bookmark restored!');
  }
});
```
