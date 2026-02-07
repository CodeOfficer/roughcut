---
name: presentation-generator
description: Interactively create RevealJS presentations from topics, notes, or outlines. Guides the user through topic research, design choices (theme, style, audience, length), outline preview, and section-by-section generation using the GenAI Tutorial Factory's custom markdown format with 21 directives. Triggers on "create a presentation", "turn these notes into slides", "generate a tutorial on Y", or "make a slideshow about Z".
---

# Presentation Generator

## What This Skill Produces

Complete `tutorials/<name>/presentation.md` files that build successfully into:
- Interactive RevealJS HTML presentations
- MP4 videos with TTS narration (when using full build)

The GenAI Tutorial Factory uses a **custom markdown format** — not standard RevealJS syntax. This skill is the expert in that format.

## Interactive Workflow

Follow these phases in order. **Do not skip the design choices phase** — it prevents rework and produces better presentations.

### Phase 0: Topic Discovery

Determine what the user has:

**If they provide notes/outline/content:** Extract the topic, key concepts, audience, and style from their input. Proceed to Phase 1.

**If they say "create a presentation about X":** Research the topic first:
1. Use WebSearch to gather current information on the topic
2. Summarize findings into 5-8 key themes/sections
3. Present the research summary and ask: "Does this capture what you want to cover? Anything to add or remove?"
4. Proceed to Phase 1 with the refined research

### Phase 1: Design Choices

Use AskUserQuestion to present structured choices. Ask these as **a single multi-question prompt**:

**Question 1 — Presentation Style:**
- **Tutorial** — Hands-on, code-heavy, step-by-step learning
- **Overview** — Conceptual, high-level explanation of a topic
- **Demo** — Live walkthrough, showing tools/features in action
- **Status Update** — Brief, metrics-focused, for stakeholders

**Question 2 — Audience Level:**
- **Beginner** — No prior knowledge assumed, explain fundamentals
- **Intermediate** — Familiar with basics, focus on practical application
- **Advanced** — Deep technical content, assumes strong foundation

**Question 3 — Theme** (recommend based on content type, see Style Guide below):
- Present 3 theme options with rationale, marking the recommended one

**Question 4 — Length:**
- **Quick** (5-8 slides) — Lightning talk, brief overview
- **Standard** (10-15 slides) — Most presentations, good depth
- **Deep Dive** (15-25 slides) — Comprehensive coverage, tutorials

### Phase 2: Outline Preview

Create and present the outline **before generating any slides**:

```
## Proposed Structure (N slides)

**Section 1: Introduction** (2 slides)
1. Title slide — "[Title]"
2. Overview — Hook + what we'll cover

**Section 2: [Topic]** (4 slides)
3. [Concept] — bullets + fragments
4. [Detail] — code example
5. [Visual] — @image-prompt slide
6. [Deep dive] — vertical slide group

**Section 3: [Topic]** (3 slides)
...

**Conclusion** (2 slides)
N-1. Key takeaways
N. Next steps / resources

Estimated narration: ~X minutes

Approve this structure, or tell me what to change?
```

**Wait for user approval before generating slides.**

### Phase 3: Section-by-Section Generation

For each section:
1. Generate 3-5 slides following the content rules below
2. Self-check: verify text limits, no tables, fragments on bullets only
3. Show to user with running tally: "Generated 8/15 slides"
4. User approves or requests changes
5. Continue to next section

### Phase 4: Build & Deliver

After writing the complete `tutorials/<name>/presentation.md` file:

```bash
TUTORIAL=<name> npm run tutorial:html
```

**This is mandatory.** The user cannot view the presentation until you build it. If linting fails, read the errors, fix the markdown, and rebuild. The linter catches all syntax issues with helpful suggestions.

Once built, tell the user:
```bash
# Preview in browser
TUTORIAL=<name> npm run dev

# Test auto-advance timing
TUTORIAL=<name> npm run dev:auto

# Full build with TTS audio + video (costs API credits!)
TUTORIAL=<name> npm run tutorial:full
```

---

## Theme & Style Guide

### Theme Recommendations by Content Type

| Content Type | Primary Theme | Alternative | Why |
|---|---|---|---|
| Technical / Code | `dracula` | `night` | Dark backgrounds make code readable |
| Business / Professional | `sky` | `simple` | Clean, blue-toned, corporate-friendly |
| Creative / Design | `moon` | `blood` | Distinctive atmosphere |
| Academic / Formal | `serif` | `beige` | Traditional, warm, readable |
| General Purpose | `black` | `white` | Neutral, works for anything |

All 12 valid themes: `black`, `white`, `league`, `beige`, `sky`, `night`, `serif`, `simple`, `solarized`, `blood`, `moon`, `dracula`

### Background Gradient Palette

Use these curated gradients for visual variety between sections:

- **Title/Hero:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` — blue-purple, professional
- **Introduction:** `linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)` — deep blue-cyan, inviting
- **Success/Conclusion:** `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)` — green, achievement
- **Warning/Important:** `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)` — pink-red, attention
- **Calm/Neutral:** `linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)` — lavender-pink, soft
- **Dark accent:** `#1a1a2e` — near-black with blue tint, good for code sections

### Transition Strategy

- **Title slides:** `zoom` — dramatic entrance
- **Content slides:** `fade` — smooth, default choice
- **Section breaks:** `convex` or `concave` — visual separation
- **Code slides:** `slide` — clean horizontal movement
- **Conclusion:** `zoom` — bookend with the title

---

## Custom Markdown Format Essentials

### Required Frontmatter

```yaml
---
title: "Presentation Title"    # REQUIRED
theme: dracula                 # REQUIRED (one of 12 themes)
preset: manual-presentation    # Recommended for iteration
voice: adam                    # Optional: ElevenLabs voice
resolution: 1920x1080         # Optional: video resolution
config:                        # Optional: RevealJS overrides
  controls: true
  progress: true
customCSS: ./styles/custom.css # Optional: external CSS file
---
```

**Important:** Do NOT use `customStyles` with inline YAML (`|` pipe syntax) — it causes linter issues. Use `customCSS` with an external CSS file instead.

### Key Directives (Most Used)

Slides are separated by `---` on its own line.

**@audio:** — Narration text (multi-line format recommended for caching)
```markdown
@audio: First sentence establishes context.
@audio: Second sentence adds detail.
@audio: Third sentence wraps up. [1s] With a pause.
```

**@fragment** — Progressive reveal (ONLY on bullet lists, never numbered lists)
```markdown
- First point @fragment
- Second point @fragment +1s
- Third point @fragment +2s
```

**@transition:** — Slide transition: `none`, `fade`, `slide`, `convex`, `concave`, `zoom`

**@background:** — Color, gradient, or image path
```markdown
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**@image-prompt:** — AI image generation prompt (be specific about style, mood, composition)

**@vertical-slide:** — Create sub-slides navigated with DOWN arrow

**@duration:** / **@pause-after:** — Timing control (format: `5s` or `1500ms`)

**@notes:** — Speaker notes (press 'S' to view)

For the complete reference of all 21 directives, read `docs/FEATURES.md`.
For linting rules and error formats, read `docs/LINTING_SPEC.md`.

---

## Content Rules

**Apply these to EVERY slide. Check before showing to user.**

### Text Limits
- **Slide title:** 3-5 words ideal, 8 words absolute max
- **Bullet point:** 5-8 words ideal, 10 words absolute max
- **Bullets per slide:** 3-4 ideal, 5 absolute max
- **Body text:** 1-2 sentences ideal, 3 absolute max

### Forbidden Elements
- **NO TABLES** — Tables render poorly in RevealJS. Convert to bullet lists or split across slides.
- **NO LONG HEADERS** — Keep to 3-5 words
- **NO DENSE PARAGRAPHS** — Use bullets or split into multiple slides

### One Idea Per Slide
If a slide feels crowded, split it. 20 clear slides > 10 cramped ones.

### Audio Narration Pattern
2-4 sentences per slide, multi-line format:
```markdown
@audio: Opening sentence establishes context.
@audio: Detail sentence provides key information.
@audio: Closing sentence transitions or reinforces.
```

Timing guideline: 8-12 seconds per slide. Match fragment timing to narration flow.

### Code Samples
- Keep under 15 lines per slide
- Include explanatory comments
- Use realistic variable names
- Match the topic's language/framework
- Split long examples across multiple slides

### Asset Placeholders
- Use `@image-prompt:` for conceptual/visual slides (be specific about style and mood)
- Use `<!-- TODO: Add screenshot of X -->` for user-provided screenshots
- Use `@notes:` to suggest diagrams the user could create

---

## Common Mistakes

These are the top issues that cause linting failures:

1. **Fragments on numbered lists** — `1. Item @fragment` fails. Use `- Item @fragment` instead.
2. **Invalid duration format** — `5 seconds` fails. Use `5s` or `1500ms`.
3. **Invalid theme name** — `dark` fails. Use `black`. Check the 12 valid options.
4. **Pause markers outside @audio** — `Text [1s] here` fails. Pause markers only work inside `@audio:` lines.
5. **Missing required frontmatter** — Both `title` and `theme` are required.

The linter catches all of these with helpful error messages and typo suggestions. Run the build and read the output.

---

## Templates

Use these as starting points — copy structure and adapt to the user's topic:

- `assets/template-minimal.md` — 5 slides, basic structure
- `assets/template-comprehensive.md` — 11 slides, demonstrates most directives
- `assets/template-tutorial.md` — 15 slides, code-heavy instructional format

---

## File Naming

When creating presentations:
- Derive the directory name from the title: lowercase, hyphenated
- Example: "Docker Basics for Developers" → `tutorials/docker-basics/presentation.md`
- Always write to `tutorials/<name>/presentation.md`
