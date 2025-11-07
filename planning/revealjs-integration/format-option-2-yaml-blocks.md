# Format Option 2: "YAML Header Blocks"

## Philosophy
Each slide is a structured document with explicit YAML-style sections

## Design Principles
- Maximum structure and explicitness
- Named sections for each slide component
- Clear separation between content, audio, automation, and notes
- Machine-readable metadata

---

## Complete Example Tutorial

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
pause_after: 2
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
pause_after: 3
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
pause_after: 2
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

===SLIDE===
id: demo-create-repo
duration: 20
pause_after: 5

## Content
## Demo: Creating a Repository

Let me show you how to create your first Git repository.

## Audio
Now, let's create your first Git repository. I'll walk you through each step
in a real terminal window.

## Playwright
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

## Notes
Live demo adds authenticity. Ensure terminal is visible before typing.

===SLIDE===
id: summary
duration: 6
pause_after: 3
transition: zoom

## Content
# Summary

You now know how to:
- Install Git ✓
- Create repositories ✓
- Track changes ✓

## Audio
Great job! You now know how to install Git, create repositories, and track
your changes. Keep practicing and you'll master it in no time!

## Notes
End with encouragement. Upbeat tone.
```

---

## Key Features Demonstrated

### Structured Sections
- ✅ `===SLIDE===` - Explicit slide delimiter
- ✅ YAML-style metadata per slide (id, duration, pause_after, etc.)
- ✅ `## Content` - Markdown content section
- ✅ `## Audio` - Narration text section
- ✅ `## Playwright` - Automation instructions section
- ✅ `## Fragments` - Fragment timing definitions
- ✅ `## Notes` - Speaker notes section

### Reveal.js Primitives
- **Slides**: Explicit `===SLIDE===` markers
- **Fragments**: Defined in `## Fragments` section with timing
- **Transitions**: `transition: zoom` in metadata
- **Backgrounds**: `background: "#1e1e1e"` in metadata
- **Themes**: Global `theme: dracula` in front matter
- **Speaker Notes**: `## Notes` section
- **Code Highlighting**: Preserved in `## Content` section

### Custom Features
- ✅ `pause_after: 3` - Pause duration after slide audio
- ✅ `{{PAUSE 2s}}` - Inline pause markers in audio
- ✅ Fragment timing: `"text" @ 0s` syntax
- ✅ Structured actions: Clear `Action:` and `Wait:` syntax

---

## Parsing Strategy

### 1. Extract Front Matter
```yaml
---
tutorial:
  title: "..."
  theme: dracula
---
```

### 2. Split on Slide Delimiter
```
Split on: ===SLIDE===
Result: Array of slide blocks
```

### 3. For Each Slide Block:

**a) Parse metadata (first lines)**
```yaml
id: welcome
duration: 8
pause_after: 2
transition: slide
```

**b) Split into named sections**
```
Split on: ## Content, ## Audio, ## Playwright, ## Fragments, ## Notes
```

**c) Extract each section**
```typescript
{
  content: "# Welcome to Git\n...",
  audio: "Welcome to this tutorial...",
  playwright: "Action: Click...",
  fragments: ["fragment-1: ...", "fragment-2: ..."],
  notes: "This slide introduces..."
}
```

### 4. Generate Reveal.js HTML
```html
<section data-markdown
         data-slide-id="welcome"
         data-audio-duration="8"
         data-pause-after="2"
         data-transition="slide">
  <textarea data-template>
    [content section]
  </textarea>
</section>
```

---

## Creator Experience

### Workflow
1. Create new tutorial: `npm run tutorial:create-revealjs my-git-tutorial`
2. Edit `script.md` using structured format
3. Fill in each section explicitly
4. Build: `npm run tutorial:revealjs my-git-tutorial`
5. Get outputs:
   - `presentation/index.html`
   - `output/tutorial.mp4`

### Template Structure
```markdown
===SLIDE===
id: slide-name
duration: 10
pause_after: 2

## Content
[Markdown here]

## Audio
[Narration here]

## Playwright
[Optional actions]

## Notes
[Speaker notes]
```

---

## Advantages

1. **Maximum Clarity**: Each section is explicitly labeled
2. **Easy to Parse**: Structured format with predictable sections
3. **Self-Documenting**: Section names explain their purpose
4. **Consistent**: Every slide follows same structure
5. **Extensible**: Easy to add new sections
6. **Machine-Readable**: YAML-style metadata
7. **No Ambiguity**: Clear boundaries between sections
8. **Fragment Timing**: Explicit timing definitions for fragments

## Disadvantages

1. **Verbose**: Requires more typing and visual space
2. **Rigid**: Must follow exact section structure
3. **Learning Curve**: Must learn custom format (not reveal.js native)
4. **Repetitive**: Section headers repeat for every slide
5. **Less Portable**: Can't easily copy/paste reveal.js examples
6. **Transform Required**: Must convert to reveal.js markdown

---

## Comparison with Option 1

| Aspect | Option 1 (Annotated) | Option 2 (YAML Blocks) |
|--------|---------------------|------------------------|
| **Structure** | Mixed inline | Explicit sections |
| **Parsing** | Medium complexity | Easier (split on headers) |
| **Creator Speed** | Faster | Slower (more typing) |
| **Reveal.js Compat** | Native | Requires transform |
| **Readability** | Good | Excellent (clear labels) |
| **Fragment Control** | Inline | Dedicated section |
| **Learning Curve** | Low (reveal.js docs) | Medium (custom format) |
| **Extensibility** | Good | Excellent |
