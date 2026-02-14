---
title: "roughcut — Slides from Markdown"
theme: dracula
---

# roughcut

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

@audio: Welcome to roughcut.
@audio: This presentation demonstrates the key features [0.3s] and shows you the markdown directive for each one.

**Slides from markdown. Narration from AI. Video from your terminal.**

---

# @audio — Narration

@transition: fade

@audio: This slide has narration. Each at-audio line becomes a sentence.
@audio: Pause markers like this [1s] add silence between phrases.

```markdown
@audio: This slide has narration.
@audio: Pause markers like this [1s] add silence.
```

Narration is cached by content fingerprint — only changed lines regenerate.

---

# Fragments — Progressive Reveal

@audio: Fragments reveal content one step at a time. Add at-fragment after any bullet item.

```markdown
- First point @fragment
- Second point @fragment
```

- First point @fragment
- Second point @fragment

---

# @transition — Slide Effects

@transition: convex

@audio: This slide uses a convex transition. You saw fade on the last slide and zoom on the title.

```markdown
@transition: convex
```

Options: `none`, `fade`, `slide`, `zoom`, `convex`, `concave`

---

# @background — Colors & Gradients

@background: #1a1a2e

@audio: Set any slide background with a hex color, gradient, or image URL.

```markdown
@background: #1a1a2e
@background: linear-gradient(135deg, #667eea, #764ba2)
```

This slide uses `#1a1a2e`. The title slide used a gradient.

---

# @duration — Slide Timing

@duration: 8s

@audio: The at-duration directive sets how long a slide stays on screen during video recording.
@audio: This slide is set to eight seconds.

```markdown
@duration: 8s
```

Useful for slides with more content or longer narration.

---

# @notes — Speaker Notes

@audio: Speaker notes are visible in presenter view but hidden from the audience.

```markdown
@notes: Remind audience about the docs site.
```

@notes: This note is only visible in speaker view (press S to open it).

Press **S** to see this slide's speaker note.

---

# Fragment Offsets — Timed Reveals

@audio: Add a timing offset to fragments to sync reveals with narration.
@audio: Watch these appear [1s] one [1s] by [1s] one.

```markdown
- Step one @fragment
- Step two @fragment +1s
- Step three @fragment +2s
```

- Step one @fragment
- Step two @fragment +1s
- Step three @fragment +2s

---

# Install & Build

@background: #0f0f23
@transition: fade

@audio: Install globally with npm. The default build creates HTML with zero API keys.
@audio: Add the full flag when you're ready for narration and video.

```bash
npm install -g roughcut

roughcut build -i presentation.md        # HTML only
roughcut build -i presentation.md --full  # + audio + video
```

---

# Get Started

@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@transition: zoom

@audio: Scaffold a new project, write your slides, and build.
@audio: That's all there is to it. Happy presenting!

```bash
roughcut init my-talk
cd my-talk
roughcut build -i presentation.md
```

**Three commands. One presentation. Zero hassle.**
