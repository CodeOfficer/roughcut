---
title: "{{TITLE}}"
theme: dracula
---

# {{TITLE}}

@transition: zoom

Welcome to your new presentation.

Edit this file to add your content.

---

# Getting Started

Use three dashes `---` to separate slides.

- **Bold text** for emphasis
- *Italic text* for nuance
- `Code snippets` for technical content

---

# Progressive Reveal

Bullet points can appear one at a time:

- First point @fragment
- Second point @fragment
- Third point @fragment

---

# Audio Narration

@audio: Add narration with the audio directive.
@audio: Each line becomes a sentence in the voiceover.

To generate audio, run:
`roughcut build --full`

---

# That's It!

**Your presentation is ready.**

Run `roughcut build` to build.
