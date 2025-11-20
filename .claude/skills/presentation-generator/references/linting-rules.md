# Linting Rules and Validation

## Overview

The GenAI Tutorial Factory linter validates markdown **before** any expensive operations (TTS, image generation, video recording). This prevents wasted API credits and ensures quality.

## Validation Process

```
markdown file → Linter → Parser → Build Pipeline
                  ↓
                FAIL: Show all errors, stop build
                PASS: Continue to parser
```

## Error Format

Every error includes:
- File path and line number
- Current (incorrect) value
- Expected format
- Example of correct usage
- Suggestions for typos (if applicable)

---

## Required Frontmatter Validation

### Rule: `title` Must Be Present
**Error if missing:**
```
[ERROR] tutorials/my-tutorial/presentation.md
Missing required frontmatter field: title
```

**Error if empty:**
```
[ERROR] tutorials/my-tutorial/presentation.md
Frontmatter field 'title' cannot be empty
```

### Rule: `theme` Must Be Present and Valid
**Error if missing:**
```
[ERROR] tutorials/my-tutorial/presentation.md
Missing required frontmatter field: theme
```

**Error if invalid:**
```
[ERROR] tutorials/my-tutorial/presentation.md:3
Invalid value for theme: "dark"
Valid options: black, white, league, beige, sky, night, serif, simple, solarized, blood, moon, dracula
```

---

## Directive Syntax Validation

### Rule: Unknown Directives Are Errors
**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:42
Unknown directive: @duraton

Suggestions:
  - Did you mean: @duration?
```

**Common typos detected:**
- `@duraton` → Suggests `@duration`
- `@trasition` → Suggests `@transition`
- `@fragent` → Suggests `@fragment`
- `@backgroud` → Suggests `@background`

### Rule: Duration Format Must Be Valid
**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:45
Invalid duration format: "5 seconds"

Expected: Use "5s" or "500ms" (supports decimals like "2.5s")

Examples:
  @duration: 5s
  @duration: 2.5s
  @duration: 1500ms
```

**Valid formats:**
- `5s` - 5 seconds
- `2.5s` - 2.5 seconds (decimals supported)
- `1500ms` - 1500 milliseconds
- `0.5s` - 500 milliseconds

**Invalid formats:**
- `5 seconds` ❌
- `5` ❌
- `five seconds` ❌
- `5sec` ❌

### Rule: Transition Must Be Valid
**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:52
Invalid value for @transition: "fadeIn"

Valid options: none, fade, slide, convex, concave, zoom

Example:
  @transition: fade
```

**Valid values (case-sensitive):**
- `none`
- `fade`
- `slide`
- `convex`
- `concave`
- `zoom`

### Rule: Theme Must Be Valid (Case-Sensitive)
**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:3
Invalid value for theme: "Dark"

Valid options: black, white, league, beige, sky, night, serif, simple, solarized, blood, moon, dracula

Note: Values are case-sensitive. Did you mean: black?
```

### Rule: Preset Must Be Valid
**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:6
Invalid value for preset: "presentation"

Valid options: video-recording, manual-presentation, auto-demo, speaker-mode

Example:
  preset: manual-presentation
```

---

## Fragment Placement Validation

### Rule: Fragments Only on Bullet Lists

**CRITICAL RULE:** `@fragment` only works on bullet lists (-, *, +), NOT numbered lists!

**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:67
@fragment can only be used on list items (-, *, +)

Current: 1. Item one @fragment

Example:
  - Item one @fragment
```

**Valid usage:**
```markdown
- Item one @fragment
* Item two @fragment
+ Item three @fragment
```

**Invalid usage:**
```markdown
1. Item one @fragment         # ❌ ERROR
2. Item two @fragment          # ❌ ERROR

Some text @fragment            # ❌ ERROR (not on a list)
```

---

## Pause Marker Validation

### Rule: Pause Markers Only in @audio: Blocks

**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:75
Pause markers [Xs] can only be used inside @audio: directives

Current: This text has a pause [1s] in it.

Example:
  @audio: This narration has a pause [1s] in it.
```

**Valid usage:**
```markdown
@audio: Welcome to the tutorial. [1s] Let's begin.
@audio: First point. [pause 2s] Second point.
```

**Invalid usage:**
```markdown
This is regular text [1s] with pause.  # ❌ ERROR

- Bullet point [1s] with pause         # ❌ ERROR
```

---

## Content Validation

### Rule: Empty Slides Not Allowed

**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:80
Slide appears to be empty (no content after heading)

Each slide must have content or at least one directive
```

**Valid slide:**
```markdown
# Slide Title

@audio: Narration text

Some content here
```

**Invalid slide:**
```markdown
# Slide Title

---
```

### Rule: Empty Audio Blocks Not Allowed

**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:85
@audio directive cannot be empty

Example:
  @audio: This is narration text
```

---

## File Path Validation

### Rule: Asset References Must Use Relative Paths

**Warning (not error):**
```
[WARNING] tutorials/my-tutorial/presentation.md:92
Asset reference './screenshot.png' not found

Expected location: tutorials/my-tutorial/screenshot.png

This is a warning - build will continue, but asset won't appear.
```

**Valid asset references:**
```markdown
@background: ./image.png
@background-video: ./video.mp4
![Alt text](./diagram.svg)
```

**Note:** Asset validation produces warnings, not errors. The linter checks if files exist but allows the build to continue.

---

## Resolution Format Validation

### Rule: Resolution Must Be WIDTHxHEIGHT

**Error example:**
```
[ERROR] tutorials/my-tutorial/presentation.md:5
Invalid resolution format: "1920-1080"

Expected: 1920x1080 (WIDTHxHEIGHT with lowercase 'x')

Examples:
  resolution: 1920x1080
  resolution: 1280x720
```

**Valid formats:**
- `1920x1080`
- `1280x720`
- `3840x2160`

**Invalid formats:**
- `1920-1080` ❌
- `1920X1080` ❌ (uppercase X)
- `1920*1080` ❌
- `1920 x 1080` ❌ (spaces)

---

## Common Error Scenarios

### Scenario 1: Typo in Directive Name

**Input:**
```markdown
@duraton: 5s
```

**Error:**
```
[ERROR] Unknown directive: @duraton

Suggestions:
  - Did you mean: @duration?
```

**Fix:**
```markdown
@duration: 5s
```

### Scenario 2: Fragment on Numbered List

**Input:**
```markdown
1. First item @fragment
2. Second item @fragment
```

**Error:**
```
[ERROR] @fragment can only be used on list items (-, *, +)

Current: 1. First item @fragment

Example:
  - First item @fragment
```

**Fix:**
```markdown
- First item @fragment
- Second item @fragment
```

### Scenario 3: Invalid Theme

**Input:**
```yaml
theme: dark
```

**Error:**
```
[ERROR] Invalid value for theme: "dark"

Valid options: black, white, league, beige, sky, night, serif, simple, solarized, blood, moon, dracula

Note: Did you mean: black?
```

**Fix:**
```yaml
theme: black
```

### Scenario 4: Wrong Duration Format

**Input:**
```markdown
@duration: 5 seconds
```

**Error:**
```
[ERROR] Invalid duration format: "5 seconds"

Expected: Use "5s" or "500ms" (supports decimals like "2.5s")
```

**Fix:**
```markdown
@duration: 5s
```

### Scenario 5: Pause Marker Outside Audio

**Input:**
```markdown
# My Slide

This text has a pause [1s] in it.
```

**Error:**
```
[ERROR] Pause markers [Xs] can only be used inside @audio: directives

Current: This text has a pause [1s] in it.
```

**Fix:**
```markdown
# My Slide

@audio: This narration has a pause [1s] in it.

This is regular text.
```

---

## Validation Best Practices

### 1. Check Required Frontmatter
Always include `title` and `theme`:
```yaml
---
title: "My Presentation"
theme: dracula
---
```

### 2. Use Valid Enum Values
Double-check theme, transition, and preset values:
- Themes: lowercase, no spaces
- Transitions: lowercase, exact match
- Presets: hyphenated, lowercase

### 3. Fragments on Bullet Lists Only
NEVER use `@fragment` on numbered lists:
```markdown
# ✅ CORRECT
- Item @fragment

# ❌ WRONG
1. Item @fragment
```

### 4. Duration Format
Always end with `s` or `ms`:
```markdown
# ✅ CORRECT
@duration: 5s
@duration: 2.5s
@duration: 1500ms

# ❌ WRONG
@duration: 5 seconds
@duration: 5
```

### 5. Pause Markers in Audio Only
Use `[Xs]` only inside `@audio:` blocks:
```markdown
# ✅ CORRECT
@audio: Narration [1s] with pause.

# ❌ WRONG
Regular text [1s] with pause.
```

---

## Typo Detection (Levenshtein Distance)

The linter uses Levenshtein distance (edit distance ≤ 2) to suggest corrections for unknown directives.

**Examples:**
- `@duraton` → Suggests `@duration` (distance: 1)
- `@trasition` → Suggests `@transition` (distance: 1)
- `@fragent` → Suggests `@fragment` (distance: 1)
- `@backgroud` → Suggests `@background` (distance: 1)
- `@audoi` → Suggests `@audio` (distance: 1)

If multiple directives match within distance 2, all suggestions are shown.

---

## Linting Summary Checklist

Before building, verify:

- ✅ `title` present in frontmatter
- ✅ `theme` present and valid (one of 12 options)
- ✅ All directives spelled correctly
- ✅ Duration/pause formats: `5s` or `500ms`
- ✅ Transitions: one of 6 valid options
- ✅ Fragments ONLY on bullet lists (-, *, +)
- ✅ Pause markers `[Xs]` ONLY in `@audio:` blocks
- ✅ Asset paths use relative format (`./file.ext`)
- ✅ No empty slides
- ✅ No empty `@audio:` blocks

**Run the linter:**
The linter runs automatically before every build. You don't need to run it manually.

**If linting fails:**
1. Read the error messages carefully
2. Note the file path and line number
3. Fix the issue (examples provided in error)
4. Re-run the build

**Pro tip:** The linter shows ALL errors at once, not one-at-a-time. Fix all reported issues before re-running.
