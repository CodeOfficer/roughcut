---
title: Keyboard Bindings
category: api
directives:
  - "(none - configured via JavaScript)"
related_config:
  - "keyboard"
dom_requirements: false
---

# Keyboard Bindings

RevealJS provides comprehensive keyboard control for navigation and features. You can customize keyboard bindings by overriding defaults or adding new bindings programmatically.

---

## Default Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `’` `“` `Space` `N` `L` `J` | Next slide |
| `` `‘` `P` `H` `K` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |

### Features

| Key | Action |
|-----|--------|
| `ESC` `O` | Toggle overview mode |
| `F` | Toggle fullscreen |
| `S` | Open speaker notes window |
| `V` | Pause presentation (blackout) |
| `B` `.` | Pause presentation (blackout) |
| `?` | Show keyboard help overlay |

---

## Customizing Keyboard Bindings

### Configuration Method

Override default bindings using the `keyboard` config option:

```javascript
Reveal.configure({
  keyboard: {
    27: () => { console.log('ESC pressed') },  // Custom function for ESC
    13: 'next',                                 // ENTER goes to next slide
    32: null                                    // Disable SPACE key
  }
});
```

**Or at initialization:**

```javascript
Reveal.initialize({
  keyboard: {
    // Custom bindings
    84: () => startTimer(),  // T key
    82: () => resetTimer()   // R key
  }
});
```

### Action Types

The `keyboard` object maps **key codes** to **actions**. Actions can be one of three types:

| Type | Description | Example |
|------|-------------|---------|
| **Function** | Triggers a callback function | `27: () => { alert('ESC') }` |
| **String** | Calls a reveal.js API method name | `13: 'next'` |
| **null** | Disables the key (blocks default action) | `32: null` |

### Examples

#### Custom Function

```javascript
Reveal.configure({
  keyboard: {
    // Custom callback for 'T' key
    84: () => {
      const time = new Date().toLocaleTimeString();
      console.log('Timer started at', time);
      startPresentationTimer();
    }
  }
});
```

#### API Method String

```javascript
Reveal.configure({
  keyboard: {
    13: 'next',           // ENTER ’ next slide
    78: 'next',           // N ’ next slide
    80: 'prev',           // P ’ previous slide
    70: 'toggleFullscreen',  // F ’ fullscreen
    79: 'toggleOverview'  // O ’ overview
  }
});
```

**Available API method names:** See [31-api-methods.md](31-api-methods.md) for full list.

#### Disable Default Binding

```javascript
Reveal.configure({
  keyboard: {
    32: null,  // Disable SPACE key navigation
    37: null,  // Disable LEFT arrow
    38: null   // Disable UP arrow
  }
});
```

**Use case:** Prevent accidental navigation during presentations with interactive elements.

---

## Programmatic Key Binding API

### addKeyBinding()

Add custom key bindings via JavaScript at runtime.

**Method signature:**
```typescript
addKeyBinding(
  binding: number | KeyBinding,
  callback: () => void
): void
```

**Simple form (keyCode only):**

```javascript
// Add binding for 'R' key (keyCode 82)
Reveal.addKeyBinding(82, () => {
  console.log('R key pressed');
  resetPresentation();
});
```

**Extended form (with help overlay info):**

```javascript
Reveal.addKeyBinding(
  {
    keyCode: 84,              // 'T' key
    key: 'T',                 // Label shown in help overlay
    description: 'Start timer'  // Description in help overlay
  },
  () => {
    startTimer();
  }
);
```

### removeKeyBinding()

Remove a custom key binding by its key code.

**Method signature:**
```typescript
removeKeyBinding(keyCode: number): void
```

**Example:**

```javascript
// Remove custom binding for 'T' key
Reveal.removeKeyBinding(84);
```

### Binding Priority

Key bindings follow this priority order (highest to lowest):

1. **Config bindings** (`keyboard` config option) - Highest priority
2. **Custom bindings** (via `addKeyBinding()`) - Medium priority
3. **Default bindings** (built-in reveal.js shortcuts) - Lowest priority

```javascript
// Default: SPACE ’ next slide

// Add custom binding (overrides default)
Reveal.addKeyBinding(32, () => console.log('Custom SPACE'));

// Config binding (overrides custom AND default)
Reveal.configure({
  keyboard: {
    32: () => console.log('Config SPACE')  // This wins
  }
});
```

---

## Key Codes Reference

Common key codes for customization:

| Key | Code | Key | Code | Key | Code |
|-----|------|-----|------|-----|------|
| ENTER | 13 | ESC | 27 | SPACE | 32 |
|  | 37 | ‘ | 38 | ’ | 39 |
| “ | 40 | A | 65 | B | 66 |
| C | 67 | D | 68 | E | 69 |
| F | 70 | G | 71 | H | 72 |
| I | 73 | J | 74 | K | 75 |
| L | 76 | M | 77 | N | 78 |
| O | 79 | P | 80 | Q | 81 |
| R | 82 | S | 83 | T | 84 |
| U | 85 | V | 86 | W | 87 |
| X | 88 | Y | 89 | Z | 90 |
| 0 | 48 | 1 | 49 | 2 | 50 |
| 3 | 51 | 4 | 52 | 5 | 53 |
| 6 | 54 | 7 | 55 | 8 | 56 |
| 9 | 57 | Home | 36 | End | 35 |

**To find key codes:**
```javascript
document.addEventListener('keydown', (e) => {
  console.log('Key:', e.key, 'Code:', e.keyCode);
});
```

---

## Help Overlay

Press `?` to show the keyboard help overlay, which displays all active keyboard shortcuts.

### Adding Custom Shortcuts to Help

When using `addKeyBinding()` with the extended form, your shortcut appears in the help overlay:

```javascript
Reveal.addKeyBinding(
  {
    keyCode: 84,
    key: 'T',                    // Shows "T" in overlay
    description: 'Start timer'   // Shows description
  },
  startTimer
);
```

**Without extended form:** Binding works but doesn't appear in help overlay.

---

## Project Integration Notes

### Configuration in Video Generation

For automated video generation, you typically **don't need custom keyboard bindings** because:
- Navigation is controlled programmatically via API (not keyboard)
- Playwright/automation doesn't rely on keyboard shortcuts

**However**, you might want to **disable certain keys** during recording:

```javascript
Reveal.initialize({
  keyboard: {
    // Disable interactive keys that could interfere
    32: null,  // No SPACE navigation
    27: null,  // No ESC (overview mode)
    83: null   // No speaker notes window
  }
});
```

### Use Cases for Custom Bindings

**Live presentations:**
1. Custom timer controls (T = start, R = reset)
2. Toggle custom overlays (annotations, notes)
3. Trigger external actions (recording, polls)

**Interactive kiosks:**
1. Limit navigation to specific keys only
2. Add PIN-protected admin shortcuts
3. Custom help/info triggers

**Accessibility:**
1. Alternative navigation keys
2. Single-key triggers for complex actions
3. Voice-command integration hooks

---

## Disabling All Keyboard Input

To completely disable keyboard navigation:

```javascript
Reveal.initialize({
  keyboard: false
});
```

**Use case:** Presentations with embedded interactive content (games, forms) where you don't want accidental navigation.

### Conditional Re-enabling

```javascript
// Disable keyboard
Reveal.configure({ keyboard: false });

// Re-enable with custom bindings later
Reveal.configure({
  keyboard: {
    39: 'next',  // Only right arrow works
    37: 'prev'   // Only left arrow works
  }
});
```

---

## Plugin Usage

Plugins can add their own keyboard bindings without conflicting with user or default bindings.

### Example Plugin with Keyboard Binding

```javascript
const MyPlugin = {
  id: 'my-plugin',
  init: (reveal) => {
    // Add plugin-specific binding
    reveal.addKeyBinding(
      {
        keyCode: 77,  // 'M' key
        key: 'M',
        description: 'My Plugin Action'
      },
      () => {
        console.log('Plugin action triggered');
        // Plugin-specific code
      }
    );
  }
};

Reveal.initialize({
  plugins: [MyPlugin]
});
```

**Benefits:**
- Plugins can add bindings programmatically
- Bindings appear in help overlay automatically
- User can override via config if needed

---

## Event Handling

While keyboard bindings trigger actions, you can also listen to keyboard events directly:

```javascript
Reveal.on('ready', () => {
  document.addEventListener('keydown', (event) => {
    if (event.keyCode === 84) {  // 'T' key
      console.log('T pressed, but handled outside reveal.js');
    }
  });
});
```

**Difference from keyboard bindings:**
- **Bindings**: Integrated with reveal.js, pre-processed, appear in help
- **Event listeners**: Raw keyboard events, not integrated with reveal.js

**Best practice:** Use `addKeyBinding()` for reveal.js-related actions.

---

## Common Patterns

### Timer Controls

```javascript
let timer = null;

Reveal.initialize({
  keyboard: {
    84: () => {  // T = start
      timer = setInterval(() => {
        console.log('Timer tick');
      }, 1000);
    },
    82: () => {  // R = reset
      clearInterval(timer);
      timer = null;
    }
  }
});
```

### Conditional Navigation

```javascript
Reveal.initialize({
  keyboard: {
    39: () => {  // Right arrow
      if (userHasCompletedQuiz()) {
        Reveal.next();
      } else {
        alert('Complete the quiz to proceed');
      }
    }
  }
});
```

### Debug Mode Toggle

```javascript
let debugMode = false;

Reveal.addKeyBinding(
  { keyCode: 68, key: 'D', description: 'Toggle debug mode' },
  () => {
    debugMode = !debugMode;
    document.body.classList.toggle('debug-mode');
    console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
  }
);
```

---

## Accessibility Considerations

### Alternative Key Mappings

Provide alternative keys for users who can't use arrow keys:

```javascript
Reveal.initialize({
  keyboard: {
    // WASD navigation (gaming-style)
    65: 'left',   // A
    87: 'up',     // W
    68: 'right',  // D
    83: 'down',   // S

    // Or HJKL (vim-style) - already default
    72: 'left',   // H
    74: 'down',   // J
    75: 'up',     // K
    76: 'right'   // L
  }
});
```

### Screen Reader Considerations

- Keyboard shortcuts may conflict with screen reader shortcuts
- Consider providing configuration to disable certain keys
- Document all keyboard shortcuts in accessible format

---

## Best Practices

1. **Document custom shortcuts** - Tell users what keys you've customized
2. **Show in help overlay** - Use extended form of `addKeyBinding()`
3. **Avoid conflicts** - Check default bindings before adding new ones
4. **Test across keyboards** - International keyboards may have different layouts
5. **Provide alternatives** - Don't rely solely on keyboard (add on-screen controls)
6. **Use semantic API methods** - Use string API method names when possible

---

## Common Issues and Solutions

### Issue: Custom binding not working

**Cause 1:** Config binding taking priority
**Solution:** Check `keyboard` config option doesn't override your custom binding

**Cause 2:** Key already has default binding
**Solution:** Default bindings have lowest priority, your custom should work

### Issue: Key binding works but not in help overlay

**Cause:** Used simple form instead of extended form
**Solution:**
```javascript
// Wrong (doesn't show in help)
Reveal.addKeyBinding(84, callback);

// Right (shows in help)
Reveal.addKeyBinding(
  { keyCode: 84, key: 'T', description: 'My action' },
  callback
);
```

### Issue: Binding triggers twice

**Cause:** Added same binding in config AND via `addKeyBinding()`
**Solution:** Remove one of them

---

## Related Documentation

- **[31-api-methods.md](31-api-methods.md)** - API methods that can be called via string bindings
- **[29-overview-mode.md](29-overview-mode.md)** - ESC/O keyboard shortcut details
- **[30-fullscreen-mode.md](30-fullscreen-mode.md)** - F key fullscreen toggle
- **[26-jump-to-slide.md](26-jump-to-slide.md)** - Keyboard-based slide jumping

---

## Configuration Reference

### keyboard

**Type:** `boolean | object`
**Default:** `true` (default bindings enabled)

**Values:**

| Value | Effect |
|-------|--------|
| `true` | Default keyboard bindings enabled |
| `false` | All keyboard bindings disabled |
| `{ keyCode: action }` | Custom bindings (replaces/extends defaults) |

**Example:**
```javascript
Reveal.initialize({
  keyboard: {
    27: () => customEscHandler(),  // Function
    13: 'next',                     // String (API method)
    32: null                        // Null (disable)
  }
});
```

---

## Summary

- **Default shortcuts**: Arrow keys, SPACE, ESC, O, F, S, V, B, ?
- **Customization**: Via `keyboard` config option (highest priority)
- **Programmatic**: `addKeyBinding()` and `removeKeyBinding()` methods
- **Action types**: Function, API method string, or null (disable)
- **Help overlay**: Press `?` to see all shortcuts
- **Plugin support**: Plugins can add bindings without conflicts
- **Video generation**: Usually disable keyboard, use API navigation instead
- **Priority**: Config > Custom bindings > Defaults
