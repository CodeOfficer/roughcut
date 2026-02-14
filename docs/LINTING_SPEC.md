# Markdown Linting Specification

**Version:** 2.0.0
**Last Updated:** 2025-11-11

This document is the **source of truth** for valid markdown presentation format in roughcut. All presentations must pass linting before the build can proceed.

---

## Table of Contents

1. [Overview](#overview)
2. [Validation Philosophy](#validation-philosophy)
3. [Frontmatter Directives](#frontmatter-directives)
4. [Slide-Level Directives](#slide-level-directives)
5. [Inline Directives](#inline-directives)
6. [Pause Markers](#pause-markers)
7. [Common Errors](#common-errors)
8. [Examples](#examples)

---

## Overview

The linter validates your markdown **before** any expensive operations (TTS generation, image generation, video recording). This:

- **Catches errors early** - No wasted API credits
- **Provides helpful feedback** - Clear error messages with line numbers
- **Ensures consistency** - All presentations follow the same format
- **Prevents common mistakes** - Typo detection with suggestions

### Validation Process

```
markdown file → Linter → Parser → Build Pipeline
                  ↓
                FAIL: Show all errors, stop build
                PASS: Continue to parser
```

---

## Validation Philosophy

The linter follows these principles:

### 1. **Strict by Default**
- Unknown directives = ERROR (not warning)
- Invalid values = ERROR with helpful suggestions
- Only documented features are allowed

### 2. **Fail Fast**
- Validation happens before parser
- All errors reported at once (not one-at-a-time)
- No build work starts until linting passes

### 3. **Helpful Errors**
Every error includes:
- File path and line number
- Current (incorrect) value
- Expected format
- Example of correct usage
- Suggestions for typos (Levenshtein distance ≤ 2)

### 4. **No Plugin System**
- No custom directives allowed
- Keeps spec strict and predictable
- Request new features via GitHub issues

---

## Frontmatter Directives

### Required Structure

```yaml
---
title: "Your Presentation Title"
theme: dracula
---
```

### Required Fields

#### `title` (REQUIRED)
Presentation title displayed in browser and metadata.

**Type:** String
**Example:**
```yaml
title: "My Awesome Presentation"
```

**Validation:**
- Must be present
- Cannot be empty

---

#### `theme` (REQUIRED)
RevealJS theme for visual styling.

**Type:** Enum
**Valid Values:**
```
black, white, league, beige, sky, night, serif, simple,
solarized, blood, moon, dracula
```

**Example:**
```yaml
theme: dracula
```

**Validation:**
- Must be present
- Must be one of the valid values above
- Case-sensitive

**Common Error:**
```
[ERROR] Invalid value for @theme: "dark"
Valid options: black, white, league, beige, sky, night, serif,
                simple, solarized, blood, moon, dracula
```

---

### Optional Fields

#### `voice`
ElevenLabs voice ID for TTS narration.

**Type:** Voice ID
**Default:** Falls back to `ELEVENLABS_VOICE_ID` environment variable
**Example:**
```yaml
voice: adam
voice: EXAVITQu4vr4xnSDxMaL
```

**Validation:**
- Must be alphanumeric (can include `-` and `_`)
- Cannot be empty if provided

---

#### `resolution`
Video output resolution.

**Type:** Resolution string
**Default:** `1920x1080`
**Example:**
```yaml
resolution: 1920x1080
resolution: 1280x720
```

**Validation:**
- Must match format: `WIDTHxHEIGHT` (digits only)
- Minimum: `640x480`

**Common Error:**
```
[ERROR] Invalid resolution format: "1920-1080"
Expected: 1920x1080
```

---

## Slide-Level Directives

### Single-Line Directives

#### `@duration:`
Expected slide duration in seconds or milliseconds.

**Format:** `@duration: 5s` or `@duration: 500ms`
**Example:**
```markdown
@duration: 8s
@duration: 2.5s
@duration: 1500ms
```

**Validation:**
- Must end with `s` (seconds) or `ms` (milliseconds)
- Supports decimals: `2.5s`
- Cannot be empty

**Common Error:**
```
[ERROR] Invalid duration format: "5 seconds"
Expected: Use "5s" or "500ms" (supports decimals like "2.5s")
```

---

#### `@pause-after:`
Pause duration after audio ends before advancing to next slide.

**Format:** `@pause-after: 2s`
**Default:** `1s`
**Example:**
```markdown
@pause-after: 2s
@pause-after: 0.5s
```

**Validation:**
- Same as `@duration:` - must end with `s` or `ms`

---

#### `@transition:`
RevealJS transition effect for this slide.

**Type:** Enum
**Valid Values:**
```
none, fade, slide, convex, concave, zoom
```

**Example:**
```markdown
@transition: zoom
@transition: fade
```

**Validation:**
- Must be one of the valid values above
- Case-sensitive

---

#### `@background:`
Background color, gradient, or image URL.

**Type:** Color/Gradient/URL
**Example:**
```markdown
@background: #1e1e1e
@background: rgb(30, 30, 30)
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@background: https://example.com/image.jpg
```

**Validation:**
- Hex colors: `#RGB`, `#RRGGBB`, `#RRGGBBAA`
- RGB/RGBA: `rgb(r,g,b)`, `rgba(r,g,b,a)`
- HSL/HSLA: `hsl(h,s,l)`, `hsla(h,s,l,a)`
- Gradients: `linear-gradient(...)`, `radial-gradient(...)`
- URLs: `http://...`, `https://...`, `url(...)`
- CSS named colors: `black`, `white`, `red`, etc.

---

#### `@image-prompt:`
AI image generation prompt (uses Gemini).

**Format:** `@image-prompt: Descriptive prompt here`
**Requires:** `GEMINI_API_KEY` environment variable
**Example:**
```markdown
@image-prompt: A futuristic cityscape at sunset with flying cars
```

**Validation:**
- Must be at least 10 characters (be descriptive for better AI results)
- Cannot be empty

**Common Error:**
```
[ERROR] Image prompt must be at least 10 characters
        (be descriptive for better AI results)
```

---

#### `@notes:`
Speaker notes for this slide.

**Format:** `@notes: Your notes here`
**Example:**
```markdown
@notes: Remember to emphasize the key benefits in this section
```

**Validation:**
- Cannot be empty if provided

---

### Multi-Line Directives

#### `@audio:` (RECOMMENDED: Multi-line format)
Audio narration text with optional pause markers.

**Single-line format:**
```markdown
@audio: This is the narration text [2s] with pauses.
```

**Multi-line format (RECOMMENDED):**
```markdown
@audio: This is the first sentence.
@audio: This is the second sentence.
@audio: This is the third sentence with a pause [2s] inside.
```

**Why multi-line?**
- **Better readability** - One thought per line
- **Intelligent caching** - Only changed lines regenerate TTS
- **Automatic pauses** - 1s pause inserted between lines

**Pause markers:**
- Format: `[1s]`, `[2.5s]` (supports decimals)
- Valid range: `> 0s` and `≤ 30s`
- Only allowed inside `@audio:` blocks

**Validation:**
- Cannot be empty
- Pause markers must be valid format
- Pause markers ONLY in `@audio:` blocks

**Common Errors:**
```
[ERROR] Empty @audio: block (no text provided)
Example: @audio: Your narration text here

[ERROR] Pause markers [Xs] can only be used inside @audio: blocks
Current: Regular text [2s] outside audio
```

---

#### `@playwright:` (Advanced)
Browser automation instructions.

**Format:** Multi-line list
```markdown
@playwright:
- Action: Click button#submit
- Wait 2s
- Screenshot: form-submitted
```

**Instruction types:**
- `Action:` - Browser action (click, type, etc.)
- `Wait` - Pause duration
- `Screenshot:` - Capture screenshot with name

**Validation:**
- Cannot be empty
- Must have at least one instruction

---

## Inline Directives

### `@fragment`
Progressive disclosure marker for list items.

**IMPORTANT:** Can ONLY be used on **bullet list items** (-, *, +), NOT numbered lists (1., 2., 3.)

**Basic usage:**
```markdown
- Item one @fragment
- Item two @fragment
- Item three @fragment
```

**With timing offset:**
```markdown
- Item one @fragment
- Item two @fragment +1s
- Item three @fragment +2.5s
```

**Validation:**
- Must be on bullet list items: `- `, `* `, or `+ `
- Timing offset format: `+Ns` or `+N.Ns`
- Cannot be on numbered lists or regular text

**Common Error:**
```
[ERROR] @fragment can only be used on list items
Current: 1. Item one @fragment
Example: - Item one @fragment
```

**Valid:**
```markdown
- Design wireframes @fragment
- Develop features @fragment
- Test thoroughly @fragment
```

**Invalid:**
```markdown
1. Design wireframes @fragment   ❌ Numbered list
2. Develop features @fragment    ❌ Numbered list
```

---

## Pause Markers

### Syntax

**Format:** `[Xs]` where X is a number (supports decimals)

**Examples:**
```markdown
@audio: Text here [1s] more text [2.5s] end.
```

### Rules

1. **Only in @audio blocks**
   - ✅ `@audio: Text [2s] more`
   - ❌ `Regular content [2s] error`

2. **Valid duration**
   - Must be > 0 seconds
   - Must be ≤ 30 seconds
   - Supports decimals: `[2.5s]`

3. **Format**
   - Must be exactly `[Ns]` format
   - ❌ `[2 seconds]` - invalid
   - ❌ `[2sec]` - invalid
   - ✅ `[2s]` - valid

### Common Errors

```
[ERROR] Invalid pause marker format: "[2 seconds]"
Expected: Use [1s], [2s], [2.5s], etc.

[ERROR] Pause duration must be greater than 0

[ERROR] Pause duration too long (max 30 seconds).
        Consider splitting into separate slides.
```

---

## Common Errors

### 1. Unknown Directive

```
[ERROR] Unknown directive: @duraton
Suggestions:
  - Did you mean: @duration?
  - See docs/LINTING_SPEC.md for all supported directives
```

**Fix:** Check spelling, refer to this spec

---

### 2. Invalid Enum Value

```
[ERROR] Invalid value for @transition: "invalid-transition"
Expected: Valid options: none, fade, slide, convex, concave, zoom
```

**Fix:** Use one of the listed values

---

### 3. Empty Single-Line Directive

```
[ERROR] Invalid syntax for @duration
Expected: @duration: value
Example: @duration: 8s
```

**Fix:** Provide a value after the colon

---

### 4. Fragment on Numbered List

```
[ERROR] @fragment can only be used on list items
Current: 1. Item one @fragment
Example: - Item one @fragment
```

**Fix:** Change numbered list (1., 2., 3.) to bullet list (-, *, +)

---

### 5. Missing Required Frontmatter

```
[ERROR] Missing required frontmatter field: "title"
Expected: Presentation title
Example: title: "My Presentation"
```

**Fix:** Add required field to frontmatter

---

### 6. Empty Slide

```
[ERROR] Slide 1 has no content (only directives)
Suggestions:
  - Add markdown content to the slide
  - Remove empty slide if not needed
```

**Fix:** Add actual markdown content (headings, paragraphs, lists, etc.)

---

## Examples

### ✅ Valid Minimal Presentation

```markdown
---
title: "Hello World"
theme: dracula
---

# Welcome

This is my first slide.

---

# Slide Two

@audio: This slide has narration.

Content here.
```

---

### ✅ Valid Full-Featured Slide

```markdown
# Advanced Features

@duration: 10s
@pause-after: 2s
@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@image-prompt: A futuristic holographic interface with neon colors

@audio: This slide showcases all the features.
@audio: Notice how each directive controls a different aspect.
@audio: The pause markers add natural breaks [2s] in the narration.

@notes: Remember to emphasize the key points during presentation

**Key features:**

- Multi-line audio format @fragment
- Progressive disclosure @fragment +1s
- Beautiful transitions @fragment +2s
- AI-generated images @fragment +3s
```

---

### ❌ Invalid Examples

**Wrong: Numbered list with @fragment**
```markdown
1. First item @fragment   ❌
2. Second item @fragment  ❌
```

**Fix: Use bullet lists**
```markdown
- First item @fragment   ✅
- Second item @fragment  ✅
```

---

**Wrong: Pause marker outside @audio**
```markdown
Regular content with pause [2s] here.  ❌
```

**Fix: Move inside @audio**
```markdown
@audio: Narration with pause [2s] here.  ✅
```

---

**Wrong: Invalid duration format**
```markdown
@duration: 5 seconds  ❌
```

**Fix: Use correct format**
```markdown
@duration: 5s  ✅
```

---

## How Linting Works

### 1. **Pre-Build Validation**
```
Read markdown → Lint → Pass? → Continue building
                        ↓ Fail
                    Show all errors
                    Stop build
```

### 2. **Error Reporting**
- All errors shown at once (not one-at-a-time)
- Each error includes file, line number, suggestions
- Build does not proceed until all errors fixed

### 3. **What Gets Validated**
- ✅ Frontmatter structure and required fields
- ✅ All directive syntax and values
- ✅ Pause marker format and placement
- ✅ Fragment usage (must be on bullet lists)
- ✅ Empty slides detection
- ✅ Unknown directives with typo suggestions

---

## Getting Help

### Linting Failed?

1. **Read the error message carefully** - includes line number and suggestion
2. **Check this spec** - search for the directive or error type
3. **Look at examples** - `tutorials/simple-demo` and `tutorials/full-demo`
4. **Test incrementally** - use `npm run build:fast` for quick iteration

### Still Stuck?

- Check existing presentations: `tutorials/simple-demo/presentation.md`
- Review test suite: `src/core/__tests__/linter.test.ts`
- Open an issue: https://github.com/anthropics/genai-tutorial-factory/issues

---

## Version History

**v2.0.0** (2025-11-11)
- Initial linting system with comprehensive validation
- 52 test cases covering all rules
- Strict validation with helpful error messages
- Support for 10 directive types
- Typo detection using Levenshtein distance

---

**This specification is enforced by the linter. All presentations must pass validation before building.**
