# Format Option 1: "Annotated Reveal.js Markdown"

## Philosophy
Extend reveal.js's native markdown with audio/playwright metadata

## Design Principles
- Uses reveal.js native markdown syntax and delimiters
- Adds `[AUDIO]` and `[PLAYWRIGHT]` blocks as extensions
- Low learning curve - creators can reference reveal.js docs directly
- Preserves full reveal.js feature compatibility

---

## Complete Example Tutorial

```markdown
---
title: "Introduction to Git"
theme: dracula
resolution: 1920x1080
voice: adam
---

# Welcome to Git
<!-- .slide: data-audio="welcome-intro" data-duration="8" data-pause-after="2" -->

Git is a distributed version control system.

[AUDIO]
Welcome to this tutorial on Git. In this session, we'll learn how version control
can help you track changes and collaborate with others.
[/AUDIO]

Note:
This slide introduces the core concept. Keep energy high!

---

# Why Use Version Control?
<!-- .slide: data-audio="why-vcs" data-duration="12" data-pause-after="3" -->

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
<!-- .slide: data-audio="install-git" data-duration="15" data-pause-after="2" data-background="#1e1e1e" -->

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
<!-- .slide: data-audio="demo-create-repo" data-duration="20" data-pause-after="5" -->

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
<!-- .slide: data-audio="summary" data-duration="6" data-pause-after="3" data-transition="zoom" -->

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

---

## Key Features Demonstrated

### Native Reveal.js Support
- ✅ Horizontal slide delimiter: `---`
- ✅ Slide attributes: `<!-- .slide: ... -->`
- ✅ Element attributes: `<!-- .element: ... -->`
- ✅ Fragments: `class="fragment"`
- ✅ Fragment indices: `data-fragment-index="0"`
- ✅ Code highlighting: ``` ```bash [1|2|3] ```
- ✅ Speaker notes: `Note:`
- ✅ Transitions: `data-transition="zoom"`
- ✅ Backgrounds: `data-background="#1e1e1e"`
- ✅ Themes: Front matter `theme: dracula`

### Custom Extensions
- ✅ `[AUDIO]...[/AUDIO]` - Narration text for ElevenLabs
- ✅ `[PAUSE 2s]` - Inline pause markers within audio
- ✅ `[PLAYWRIGHT]...[/PLAYWRIGHT]` - Browser automation instructions
- ✅ `data-pause-after="3"` - Pause duration after audio finishes
- ✅ `data-audio="id"` - Audio segment identifier
- ✅ `data-duration="8"` - Expected audio duration in seconds

### Reveal.js Primitives Used
- **Slides**: Horizontal sections (`---` delimiter)
- **Fragments**: Step-by-step content reveals
- **Transitions**: Slide change animations
- **Backgrounds**: Slide-specific background colors/images
- **Themes**: Global presentation styling
- **Speaker Notes**: Presenter-only content
- **Auto-Animate**: Smooth element transitions (not shown in example, but supported)
- **Vertical Slides**: Nested optional content (not shown, but delimiter is `^^`)

---

## Parsing Strategy

### 1. Extract Front Matter
```yaml
---
title: "Introduction to Git"
theme: dracula
voice: adam
---
```

### 2. Split on Slide Delimiter
```
Split on: \n---\n
Result: Array of slide markdown strings
```

### 3. For Each Slide:

**a) Extract slide metadata**
```html
<!-- .slide: data-audio="id" data-duration="8" data-pause-after="2" -->
```

**b) Extract custom blocks**
```markdown
[AUDIO]...[/AUDIO]
[PLAYWRIGHT]...[/PLAYWRIGHT]
```

**c) Extract speaker notes**
```markdown
Note:
Content here
```

**d) Clean and preserve reveal.js syntax**
- Keep `<!-- .element: -->` comments
- Keep fragment classes
- Keep code block annotations `[1|2|3]`
- Pass to reveal.js markdown parser

### 4. Generate HTML
```html
<section data-markdown
         data-slide-id="slide-001"
         data-audio-duration="8"
         data-pause-after="2">
  <textarea data-template>
    [cleaned markdown here]
  </textarea>
</section>
```

---

## Creator Experience

### Workflow
1. Create new tutorial: `npm run tutorial:create-revealjs my-git-tutorial`
2. Edit `script.md` using this format
3. Reference reveal.js docs for advanced features
4. Build: `npm run tutorial:revealjs my-git-tutorial`
5. Get outputs:
   - `presentation/index.html` (interactive)
   - `output/tutorial.mp4` (video)

### Learning Resources
- Reveal.js markdown docs: https://revealjs.com/markdown/
- Reveal.js features: https://revealjs.com/
- Our extensions: See project documentation

---

## Advantages

1. **Low Learning Curve**: Uses reveal.js native syntax
2. **Future-Proof**: New reveal.js features work automatically
3. **Clear Separation**: Audio/Playwright in dedicated blocks
4. **Flexible**: Mix reveal.js features with custom directives
5. **Familiar**: Creators can copy/paste from reveal.js examples
6. **Extensible**: Easy to add new custom blocks
7. **Readable**: Natural markdown with minimal special syntax

## Disadvantages

1. **Mixed Syntax**: Combines HTML comments with custom blocks
2. **Longer**: More verbose than minimalist options
3. **Learning Two Systems**: Must understand reveal.js + our extensions
