# Format Option 3: "Minimalist Inline"

## Philosophy
Minimal syntax, maximum inference, optimized for creator speed

## Design Principles
- Fastest to write
- Use `@directive:` syntax for metadata
- Inline timing markers in audio text
- Compact notation for playwright actions
- Infer structure where possible

---

## Complete Example Tutorial

```markdown
# Introduction to Git
@theme: dracula
@voice: adam

---

# Welcome to Git
@duration: 8s
@pause-after: 2s

Git is a distributed version control system.

@audio: Welcome to this tutorial on Git. In this session, we'll learn how
version control can help you track changes and collaborate with others.

---

# Why Use Version Control?
@duration: 12s
@pause-after: 3s

- Track changes over time @fragment
- Collaborate with teams @fragment +2s
- Revert mistakes easily @fragment +2s

@audio: Why should you use version control? First, it tracks every change
you make. [2s] Second, it enables seamless collaboration with your team.
[2s] And third, you can easily revert mistakes and recover your work.

---

# Installing Git
@duration: 15s
@pause-after: 2s
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
@pause-after: 5s

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
@pause-after: 3s
@transition: zoom

You now know how to:
- Install Git ✓
- Create repositories ✓
- Track changes ✓

@audio: Great job! You now know how to install Git, create repositories,
and track your changes. Keep practicing!
```

---

## Key Features Demonstrated

### Directive Syntax
- ✅ `@directive: value` - Compact metadata format
- ✅ `@duration: 8s` - Duration with unit
- ✅ `@pause-after: 2s` - Pause after audio finishes
- ✅ `@audio:` - Inline audio narration
- ✅ `@playwright:` - Compact action list
- ✅ `@fragment` - Inline fragment marker
- ✅ `@fragment +2s` - Fragment with relative timing

### Inline Features
- ✅ `[2s]` - Inline pause in audio text (shorthand)
- ✅ `+ Enter` - Compact keyboard action notation
- ✅ `@background: #hex` - Direct color specification

### Reveal.js Primitives
- **Slides**: Standard `---` delimiter (reveal.js native)
- **Fragments**: `@fragment` directive on content lines
- **Transitions**: `@transition: zoom`
- **Backgrounds**: `@background: #1e1e1e`
- **Themes**: `@theme: dracula`
- **Code Highlighting**: Preserved `[1|2|3]` syntax

### Compact Playwright Notation
```markdown
@playwright:
- Action: params
- Wait time
- Type: "text" + Key
- Screenshot: name
```

---

## Parsing Strategy

### 1. Extract Global Directives
```markdown
# Title
@theme: dracula
@voice: adam
```
Parse: Lines starting with `@` before first `---`

### 2. Split on Slide Delimiter
```
Split on: ---
Result: Array of slide strings
```

### 3. For Each Slide:

**a) Extract slide-level directives**
```markdown
@duration: 8s
@pause-after: 2s
@background: #hex
@transition: zoom
```

**b) Extract inline fragment markers**
```markdown
- Text here @fragment
- More text @fragment +2s
```
Parse: Find `@fragment` in content, calculate timing

**c) Extract audio directive**
```markdown
@audio: Text here [2s] more text [3s] end.
```
Parse inline `[Xs]` pause markers

**d) Extract playwright directive**
```markdown
@playwright:
- Action: value
- Wait Xs
```
Parse list format, split on `-`

**e) Clean remaining content**
Remove all `@` directives, pass to reveal.js

### 4. Generate HTML
```html
<section data-markdown
         data-slide-id="slide-001"
         data-audio-duration="8"
         data-pause-after="2"
         data-background="#1e1e1e">
  <textarea data-template>
    [cleaned content]
  </textarea>
</section>
```

---

## Creator Experience

### Workflow
1. Create tutorial: `npm run tutorial:create-revealjs my-git-tutorial`
2. Write slides quickly using `@` directives
3. Add inline timing with `[2s]` notation
4. Build: `npm run tutorial:revealjs my-git-tutorial`
5. Get outputs immediately

### Speed Optimizations
- **No closing tags**: `@audio:` not `[AUDIO]...[/AUDIO]`
- **Inline timing**: `[2s]` not `[PAUSE 2s]`
- **Relative fragments**: `@fragment +2s` not explicit indices
- **Compact actions**: `Type: "text" + Enter` not multi-line
- **Units included**: `8s` not `8` with separate unit config

---

## Advantages

1. **Fastest to Write**: Minimal syntax, maximum speed
2. **Readable**: Natural flow, minimal punctuation
3. **Inline Everything**: No nested blocks or closing tags
4. **Intuitive Timing**: `[2s]` and `+2s` are self-explanatory
5. **Low Visual Noise**: Clean markdown appearance
6. **Easy to Learn**: Simple pattern recognition
7. **Flexible**: Optional directives, infer defaults
8. **Copy-Paste Friendly**: Less structure to maintain

## Disadvantages

1. **Parsing Complexity**: More inference required
2. **Less Explicit**: Relies on conventions and patterns
3. **Ambiguity Risk**: `@` could conflict with markdown features
4. **Harder to Validate**: Less structure = harder error detection
5. **Fragment Control**: Relative timing may be less precise
6. **Less Expressive**: Can't handle very complex scenarios as easily
7. **Custom Learning**: Not standard markdown or reveal.js syntax

---

## Comparison with Other Options

| Aspect | Option 1 (Annotated) | Option 2 (YAML) | Option 3 (Minimalist) |
|--------|---------------------|-----------------|----------------------|
| **Typing Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Readability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Parsing** | Medium | Easy | Hard |
| **Explicit** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Reveal.js Compat** | Native | Transform | Transform |
| **Error Detection** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Extensibility** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | Low | Medium | Very Low |

---

## Best Use Cases

### Choose Option 3 When:
- Creator speed is top priority
- Simple presentations with basic features
- Rapid prototyping and iteration
- Creators are experienced with markdown
- Want minimal visual clutter

### Avoid Option 3 When:
- Need precise fragment timing control
- Complex multi-step animations required
- Multiple creators need consistency
- Formal validation is critical
- Need to support reveal.js advanced features
