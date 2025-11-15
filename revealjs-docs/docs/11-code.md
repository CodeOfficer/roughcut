---
title: Presenting Code
category: CONTENT
relevance_to_project: Medium
related_directives: []
requires_plugin: RevealHighlight
---

# Presenting Code

## Overview

reveal.js includes a powerful set of features for presenting syntax-highlighted code, powered by [highlight.js](https://highlightjs.org/). This functionality lives in the **Highlight plugin** and is included in the default presentation boilerplate.

## Required Plugin Setup

To use code highlighting, you must include the highlight plugin and a syntax theme:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include a highlight.js theme CSS -->
  <link rel="stylesheet" href="plugin/highlight/monokai.css" />
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Your slides -->
    </div>
  </div>

  <script src="dist/reveal.js"></script>
  <script src="plugin/highlight/highlight.js"></script>
  <script>
    Reveal.initialize({
      plugins: [RevealHighlight]
    });
  </script>
</body>
</html>
```

> **Plugin Requirement**: Code highlighting ONLY works when the RevealHighlight plugin is loaded. Without it, code blocks will display as plain text.

## Basic Code Block Structure

### Standard Code Block

```html
<section>
  <pre><code data-trim data-noescape>
(def lazy-fib
  (concat
   [0 1]
   ((fn rfib [a b]
        (lazy-cons (+ a b) (rfib b (+ a b)))) 0 1)))
  </code></pre>
</section>
```

> **Structure Requirement**: Code must be inside `<pre><code>` tags within a `<section>` element.

### Key Attributes

| Attribute | Required | Effect |
|-----------|----------|--------|
| `data-trim` | No | Automatically removes leading/trailing whitespace from code |
| `data-noescape` | No | Prevents HTML escaping (allows you to include `<mark>` tags, etc.) |

## Theming

Multiple syntax themes are available from [highlight.js](https://highlightjs.org/demo/). The default theme included with reveal.js is **Monokai**:

```html
<link rel="stylesheet" href="plugin/highlight/monokai.css" />
```

You can swap this for any highlight.js theme by changing the CSS file.

## Line Numbers & Highlights

### Basic Line Numbers

Add `data-line-numbers` to show line numbers:

```html
<section>
  <pre><code data-line-numbers>
function hello() {
  console.log("Hello, World!");
}
  </code></pre>
</section>
```

### Highlighting Specific Lines

Provide a comma-separated list to highlight specific lines:

```html
<section>
  <!-- Highlights line 3 and lines 8-10 -->
  <pre><code data-line-numbers="3,8-10">
<table>
  <tr>
    <td>Apples</td>
    <td>$1</td>
    <td>7</td>
  </tr>
  <tr>
    <td>Oranges</td>
    <td>$2</td>
    <td>18</td>
  </tr>
</table>
  </code></pre>
</section>
```

**Syntax for line ranges**:
- Single line: `"3"`
- Multiple lines: `"3,5,7"`
- Range: `"8-10"`
- Combined: `"3,8-10,15"`

### Line Number Offset (v4.2.0+)

Use `data-ln-start-from` to offset the starting line number (useful for code excerpts):

```html
<section>
  <!-- Line numbers start at 7 instead of 1 -->
  <pre><code data-line-numbers data-ln-start-from="7">
<tr>
  <td>Oranges</td>
  <td>$2</td>
  <td>18</td>
</tr>
  </code></pre>
</section>
```

## Step-by-step Highlights

You can create multiple highlight steps on the same code block by delimiting with `|`:

```html
<section>
  <!-- Three steps: first highlights 3-5, then 8-10, then 13-15 -->
  <pre><code data-line-numbers="3-5|8-10|13-15">
<table>
  <tr>
    <td>Apples</td>
    <td>$1</td>
    <td>7</td>
  </tr>
  <tr>
    <td>Oranges</td>
    <td>$2</td>
    <td>18</td>
  </tr>
  <tr>
    <td>Kiwi</td>
    <td>$3</td>
    <td>1</td>
  </tr>
</table>
  </code></pre>
</section>
```

> **Important**: Each step becomes a **fragment** (see docs/13-fragments.md). Users must press next/arrow key to advance through each highlight step.

**Step-by-step syntax**:
- `"1|2-3|4,6-10"` creates 3 steps:
  1. Highlight line 1
  2. Highlight lines 2-3
  3. Highlight line 4 and lines 6-10

## Language Selection

By default, highlight.js auto-detects the language. You can explicitly specify it with a `class="language-XXX"` attribute:

```html
<section>
  <pre><code data-trim class="language-python">
>>> import antigravity
>>> print(b"\x01\x02\x03")
>>> a = 2
  </code></pre>
</section>
```

See the [full list of supported languages](https://highlightjs.readthedocs.io/en/latest/supported-languages.html) in the highlight.js documentation.

## HTML Entities (v4.1.0+)

Code inside `<code>` blocks is parsed as HTML. To avoid manually escaping HTML characters like `<` and `>`, wrap your code in `<script type="text/template">`:

```html
<section>
  <pre><code><script type="text/template">
sealed class Either<out A, out B> {
  data class Left<out A>(val a: A) : Either<A, Nothing>()
  data class Right<out B>(val b: B) : Either<Nothing, B>()
}
  </script></code></pre>
</section>
```

> **Critical**: Without the `<script type="text/template">` wrapper, `<` must be escaped as `&lt;` and `>` as `&gt;`.

## Attribute Reference

| Attribute | On Element | Value | Description |
|-----------|-----------|-------|-------------|
| `data-trim` | `<code>` | (none) | Removes leading/trailing whitespace |
| `data-noescape` | `<code>` | (none) | Disables HTML escaping |
| `data-line-numbers` | `<code>` | (optional) line specs | Shows line numbers. Optionally highlights specific lines |
| `data-ln-start-from` | `<code>` | number | Line number to start counting from (v4.2.0+) |
| `class` | `<code>` | `language-XXX` | Explicitly sets the syntax highlighting language |

## Configuration Options

Configure the highlight plugin through the `highlight` config object:

```javascript
Reveal.initialize({
  highlight: {
    // Automatically highlight code blocks on load
    highlightOnLoad: true,  // default: true

    // Hook called before highlighting (e.g., to register custom languages)
    beforeHighlight: (hljs) => {
      // Access to highlight.js API
      hljs.registerLanguage('customlang', ...);
    }
  },
  plugins: [RevealHighlight]
});
```

### Manual Highlighting

Disable auto-highlighting and trigger manually:

```javascript
Reveal.initialize({
  highlight: {
    highlightOnLoad: false
  },
  plugins: [RevealHighlight]
}).then(() => {
  const highlight = Reveal.getPlugin('highlight');

  // Manually highlight a specific code block
  const codeBlock = document.querySelector('code');
  highlight.highlightBlock(codeBlock);
});
```

## The highlight.js API (v4.2.0+)

Use the `beforeHighlight` callback to access the [highlight.js API](https://highlightjs.readthedocs.io/en/latest/api.html) before code is highlighted:

```javascript
Reveal.initialize({
  highlight: {
    beforeHighlight: (hljs) => {
      // Register a custom language
      hljs.registerLanguage('mylang', function(hljs) {
        return {
          keywords: 'foo bar baz',
          contains: [/* ... */]
        };
      });
    }
  },
  plugins: [RevealHighlight]
});
```

---

**For Your Project**:

### Code Highlighting in Video Presentations

Code blocks work well in automated video presentations with some considerations:

#### Static Code Display

For basic code display without interactions:

```markdown
## Code Example

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`
```

**MUST** generate:

```html
<section>
  <h2>Code Example</h2>
  <pre><code data-trim class="language-python">
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
  </code></pre>
</section>
```

#### Step-by-step Code Highlights

For narrated code walkthroughs using step-by-step highlights:

```markdown
## Code Walkthrough

@narration: First, we define the function signature

```python [1-2]
def fibonacci(n):
    if n <= 1:

@narration: Then we handle the base case

```python [2]
    if n <= 1:
        return n

@narration: Finally, the recursive case

```python [3]
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`
```

**SHOULD** generate separate slides OR fragments:

**Option 1: Separate Slides** (Recommended for video)
```html
<section>
  <h2>Code Walkthrough</h2>
  <pre><code data-trim class="language-python" data-line-numbers="1-2">
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
  </code></pre>
</section>

<section>
  <h2>Code Walkthrough</h2>
  <pre><code data-trim class="language-python" data-line-numbers="2">
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
  </code></pre>
</section>
<!-- ... etc -->
```

**Option 2: Step-by-step on Same Slide** (Requires fragment timing)
```html
<section data-autoslide="8000">
  <h2>Code Walkthrough</h2>
  <pre><code data-trim class="language-python" data-line-numbers="1-2|2|3">
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
  </code></pre>
</section>
```

> **Note**: With step-by-step highlights using `|` delimiter, you need to account for fragment reveal timing. Each step is a fragment, so you need appropriate `data-autoslide` timing or character-level timing for narration sync.

### HTML Escaping for Generated Code

When your markdown-to-HTML generator creates code blocks, ensure:

1. **Wrap code in `<script type="text/template">`** to avoid manual HTML escaping:
   ```html
   <pre><code><script type="text/template">
   <!-- Your code with <, >, & characters -->
   </script></code></pre>
   ```

2. **OR** manually escape HTML entities:
   - `<` → `&lt;`
   - `>` → `&gt;`
   - `&` → `&amp;`

### Required Setup Steps

For your HTML generator:

1. **Include plugin files** in generated HTML:
   ```html
   <link rel="stylesheet" href="plugin/highlight/monokai.css" />
   <script src="plugin/highlight/highlight.js"></script>
   ```

2. **Register plugin** in Reveal.initialize:
   ```javascript
   Reveal.initialize({
     plugins: [RevealHighlight]
   });
   ```

3. **Generate proper structure**: `<pre><code class="language-X" data-trim>`

### Timing Considerations for Video

- **Static code**: No special timing needed, code appears instantly
- **Line-by-line highlights**: Each `|` step is a fragment
  - Default fragment fade: ~300ms
  - Must sync narration timing with fragment progression
  - Use `data-autoslide` or character-level timing to control
- **Full code blocks**: Consider readability time in narration
  - Short snippets: 2-3 seconds
  - Medium code: 5-8 seconds
  - Complex code: 10-15 seconds

### Validation Rules

- [ ] `<pre><code>` structure is correctly nested inside `<section>`
- [ ] If using explicit language, `class="language-XXX"` is valid
- [ ] Line number ranges use valid syntax: `"3,8-10"` not `"3-8,10"`
- [ ] Step-by-step delimiter is `|` not other characters
- [ ] HTML entities in code are properly escaped OR wrapped in `<script type="text/template">`
- [ ] Highlight plugin is loaded in Reveal.initialize
- [ ] Theme CSS file is included in document head

### Common Pitfalls

1. **Issue**: Code appears as plain text without syntax highlighting
   **Solution**: Ensure RevealHighlight plugin is loaded and theme CSS is included

2. **Issue**: HTML code breaks the layout
   **Solution**: Wrap code in `<script type="text/template">` or escape `<` and `>`

3. **Issue**: Line numbers don't show
   **Solution**: Add `data-line-numbers` attribute to `<code>` tag

4. **Issue**: Step-by-step highlights don't work
   **Solution**: Verify delimiter is `|` and `data-line-numbers` has correct syntax

5. **Issue**: Wrong language highlighting
   **Solution**: Add explicit `class="language-XXX"` to override auto-detection

6. **Issue**: Video timing off with step-by-step highlights
   **Solution**: Each `|` step is a fragment. Calculate total narration time and divide by number of steps for `data-autoslide` value.
