# Markdown Format Proposals for Reveal.js + Audio + Playwright

## Design Goals
1. **Readable**: Non-technical creators can write tutorials easily
2. **Expressive**: Support all reveal.js features (fragments, notes, themes)
3. **Audio-first**: Clear audio narration blocks with timing
4. **Playwright-ready**: Embed automation instructions naturally
5. **Extensible**: Easy to add new features without breaking format

---

## Format Option 1: "Annotated Reveal.js Markdown" (Recommended)

**Philosophy**: Extend reveal.js's native markdown with audio/playwright metadata

### Example Tutorial:

```markdown
---
title: "Introduction to Git"
theme: dracula
resolution: 1920x1080
voice: adam
---

# Welcome to Git
<!-- .slide: data-audio="welcome-intro" data-duration="8" -->

Git is a distributed version control system.

[AUDIO]
Welcome to this tutorial on Git. In this session, we'll learn how version control
can help you track changes and collaborate with others.
[/AUDIO]

Note:
This slide introduces the core concept. Keep energy high!

---

# Why Use Version Control?
<!-- .slide: data-audio="why-vcs" data-duration="12" -->

- Track changes over time <!-- .element: class="fragment" data-fragment-index="0" -->
- Collaborate with teams <!-- .element: class="fragment" data-fragment-index="1" -->
- Revert mistakes easily <!-- .element: class="fragment" data-fragment-index="2" -->

[AUDIO]
Why should you use version control? First, it tracks every change you make.
[PAUSE 2s]
Second, it enables seamless collaboration with your team.
[PAUSE 2s]
And third, you can easily revert mistakes and recover your work.
[/AUDIO]

[PLAYWRIGHT]
# Wait for fragments to appear (auto-timed with audio)
Wait: fragment-0 shown
Wait: 2s
Wait: fragment-1 shown
Wait: 2s
Wait: fragment-2 shown
[/PLAYWRIGHT]

Note:
Emphasize each benefit with pauses. Let fragments appear naturally.

---

# Installing Git
<!-- .slide: data-audio="install-git" data-duration="15" data-background="#1e1e1e" -->

```bash [1|2|3]
# macOS
brew install git

# Ubuntu
sudo apt install git

# Verify installation
git --version
```

[AUDIO]
Let's install Git. On macOS, use Homebrew with the command "brew install git".
[PAUSE 3s]
On Ubuntu, use apt with "sudo apt install git".
[PAUSE 3s]
Finally, verify the installation by running "git dash dash version".
[/AUDIO]

[PLAYWRIGHT]
# Highlight code lines as audio narrates
Wait: code-line-highlight-1
Wait: 3s
Wait: code-line-highlight-2
Wait: 3s
Wait: code-line-highlight-3
[/PLAYWRIGHT]

Note:
Code highlighting syncs with audio automatically via reveal.js line numbers.

---

## Demo: Creating a Repository
<!-- .slide: data-audio="demo-create-repo" data-duration="20" -->

Let me show you how to create your first Git repository.

[AUDIO]
Now, let's create your first Git repository. I'll walk you through each step
in a real terminal window.
[/AUDIO]

[PLAYWRIGHT]
# Open new browser tab with terminal
Action: Open tab "https://replit.com/@demo/terminal"
Wait: 3s
# Type commands with realistic delays
Action: Type "mkdir my-project"
Action: Press Enter
Wait: 1s
Action: Type "cd my-project"
Action: Press Enter
Wait: 1s
Action: Type "git init"
Action: Press Enter
Wait: 2s
# Screenshot the result
Action: Screenshot "terminal-git-init"
# Return to presentation
Action: Close tab
[/PLAYWRIGHT]

Note:
Live demo adds authenticity. Ensure terminal is visible before typing.

---

# Summary
<!-- .slide: data-audio="summary" data-duration="6" data-transition="zoom" -->

You now know how to:
- Install Git ✓
- Create repositories ✓
- Track changes ✓

[AUDIO]
Great job! You now know how to install Git, create repositories, and track
your changes. Keep practicing and you'll master it in no time!
[/AUDIO]

Note:
End with encouragement. Upbeat tone.
```

### Features Demonstrated:
- ✅ Front matter for global config
- ✅ Reveal.js native delimiters (`---`)
- ✅ Slide-specific metadata (`<!-- .slide: ... -->`)
- ✅ `[AUDIO]` blocks for narration
- ✅ `[PAUSE]` markers for fragment timing
- ✅ `[PLAYWRIGHT]` blocks for automation
- ✅ Fragment syntax from reveal.js
- ✅ Code highlighting with line reveals `[1|2|3]`
- ✅ Speaker notes with `Note:`
- ✅ Transitions, backgrounds, themes

---

## Format Option 2: "YAML Header Blocks" (Most Structured)

**Philosophy**: Each slide is a YAML document with explicit sections

### Example Tutorial:

```markdown
---
tutorial:
  title: "Introduction to Git"
  theme: dracula
  voice: adam
  resolution: 1920x1080
---

===SLIDE===
id: welcome
duration: 8
transition: slide
background: default

## Content
# Welcome to Git

Git is a distributed version control system.

## Audio
Welcome to this tutorial on Git. In this session, we'll learn how version control
can help you track changes and collaborate with others.

## Notes
This slide introduces the core concept. Keep energy high!

===SLIDE===
id: why-vcs
duration: 12
fragments: true

## Content
# Why Use Version Control?

- Track changes over time
- Collaborate with teams
- Revert mistakes easily

## Audio
Why should you use version control? First, it tracks every change you make.
{{PAUSE 2s}}
Second, it enables seamless collaboration with your team.
{{PAUSE 2s}}
And third, you can easily revert mistakes and recover your work.

## Fragments
- fragment-1: "Track changes over time" @ 0s
- fragment-2: "Collaborate with teams" @ 2s
- fragment-3: "Revert mistakes easily" @ 4s

## Playwright
Wait: fragment-1 shown
Wait: 2s
Wait: fragment-2 shown
Wait: 2s
Wait: fragment-3 shown

## Notes
Emphasize each benefit with pauses. Let fragments appear naturally.

===SLIDE===
id: install-git
duration: 15
background: "#1e1e1e"

## Content
# Installing Git

```bash [1|2|3]
# macOS
brew install git

# Ubuntu
sudo apt install git

# Verify installation
git --version
```

## Audio
Let's install Git. On macOS, use Homebrew with the command "brew install git".
{{PAUSE 3s}}
On Ubuntu, use apt with "sudo apt install git".
{{PAUSE 3s}}
Finally, verify the installation by running "git dash dash version".

## Playwright
Wait: code-line-highlight-1
Wait: 3s
Wait: code-line-highlight-2
Wait: 3s
Wait: code-line-highlight-3

## Notes
Code highlighting syncs with audio automatically.
```

### Features:
- ✅ Explicit structure with `===SLIDE===` delimiters
- ✅ YAML-style metadata per slide
- ✅ Named sections: Content, Audio, Notes, Playwright, Fragments
- ✅ Fragment timing definitions
- ✅ `{{PAUSE}}` syntax for inline timing

---

## Format Option 3: "Minimalist Inline" (Fastest to Write)

**Philosophy**: Minimal syntax, maximum inference, optimized for speed

### Example Tutorial:

```markdown
# Introduction to Git
@theme: dracula
@voice: adam

---

# Welcome to Git
@duration: 8s

Git is a distributed version control system.

@audio: Welcome to this tutorial on Git. In this session, we'll learn how
version control can help you track changes and collaborate with others.

---

# Why Use Version Control?
@duration: 12s

- Track changes over time @fragment
- Collaborate with teams @fragment +2s
- Revert mistakes easily @fragment +2s

@audio: Why should you use version control? First, it tracks every change
you make. [2s] Second, it enables seamless collaboration with your team.
[2s] And third, you can easily revert mistakes and recover your work.

---

# Installing Git
@duration: 15s
@background: #1e1e1e

```bash [1|2|3]
brew install git
sudo apt install git
git --version
```

@audio: Let's install Git. On macOS, use Homebrew. [3s] On Ubuntu, use apt.
[3s] Verify with git dash dash version.

---

## Demo: Creating a Repository
@duration: 20s

@playwright:
- Open tab: https://replit.com/@demo/terminal
- Wait 3s
- Type: "mkdir my-project" + Enter
- Wait 1s
- Type: "cd my-project" + Enter
- Wait 1s
- Type: "git init" + Enter
- Wait 2s
- Screenshot: terminal-git-init
- Close tab

@audio: Now, let's create your first Git repository. I'll walk you through
each step in a real terminal window.

---

# Summary
@duration: 6s
@transition: zoom

You now know how to:
- Install Git ✓
- Create repositories ✓
- Track changes ✓

@audio: Great job! You now know how to install Git, create repositories,
and track your changes. Keep practicing!
```

### Features:
- ✅ `@directive:` syntax for metadata
- ✅ Inline timing: `@fragment +2s` (relative timing)
- ✅ Inline pauses: `[2s]` in audio text
- ✅ Compact playwright: `- Action: value` list syntax
- ✅ Minimal punctuation, maximum readability

---

## Comparison Matrix

| Feature | Option 1: Annotated | Option 2: YAML Blocks | Option 3: Minimalist |
|---------|---------------------|----------------------|---------------------|
| **Readability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Learning Curve** | Low (uses reveal.js) | Medium (YAML knowledge) | Very Low |
| **Expressiveness** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Parsing Complexity** | Medium | High | Low |
| **Extensibility** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Reveal.js Compatibility** | ⭐⭐⭐⭐⭐ (native) | ⭐⭐⭐ (transform) | ⭐⭐⭐⭐ (transform) |
| **Creator Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## My Recommendation: **Option 1 (Annotated Reveal.js Markdown)**

### Why:
1. **Native reveal.js compatibility** - Uses their markdown syntax directly
2. **Low learning curve** - Creators can reference reveal.js docs
3. **Future-proof** - As reveal.js adds features, they work automatically
4. **Clear separation** - Audio/Playwright in dedicated blocks
5. **Flexible** - Can mix reveal.js features with custom directives

### Parsing Strategy:
1. Extract front matter (YAML)
2. Split on `---` for slides
3. Parse reveal.js comments for slide metadata
4. Extract `[AUDIO]`, `[PLAYWRIGHT]` blocks as custom extensions
5. Pass remaining markdown to reveal.js native parser
6. Map audio segments to slide indices

### Creator Experience:
```markdown
Write slide content in familiar markdown
↓
Add [AUDIO] block for narration
↓
(Optional) Add [PLAYWRIGHT] for automation
↓
(Optional) Add Note: for speaker notes
↓
Run: npm run tutorial:build my-git-tutorial
↓
Get: video.mp4 + presentation.html
```

Would you like me to proceed with **Option 1** for the implementation plan?
