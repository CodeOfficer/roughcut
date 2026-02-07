# Cross-Project Presentation Content Export

Generate structured presentation content from any Claude Code project, formatted for consumption by the GenAI Tutorial Factory's `/presentation-generator` skill.

## Usage

1. Open the target project in Claude Code
2. Copy the **Prompt Template** below
3. Replace `{{AUDIENCE_BLOCK}}` with one of the three **Audience Profiles**
4. Paste into the conversation and let the project generate content about itself
5. Copy the structured markdown output
6. In genai-tutorial-factory, run `/presentation-generator` and paste the output as input
7. The skill consumes it in Phase 0 (topic discovery) and guides you through design and generation

Repeat steps 2-7 for each audience.

---

## Prompt Template

````
You are generating structured presentation content about this project. You know this project best — use your understanding of its architecture, purpose, value, and codebase to select the most important and interesting material.

## Your Task

Produce a structured markdown document that someone will use as input to a presentation generator. The output must follow the exact format specified below. Do not generate slides or presentation syntax — generate **content organized into sections and slides** with narration notes.

## Audience

{{AUDIENCE_BLOCK}}

## Content Selection Criteria

Choose content that is:
- **High-signal** — the audience would lose something important by not knowing this
- **Demonstrable** — can be shown with a code snippet, architecture pattern, or concrete example
- **Connected** — each section builds on or relates to the previous one
- **Current** — reflects the project's actual state, not aspirational or outdated features

Exclude:
- Setup/installation steps (these belong in docs, not presentations)
- Exhaustive feature lists — pick the 4-6 most impactful
- Internal implementation details the audience doesn't need

## Output Format

Produce this exact structure:

```markdown
# [Presentation Title]

## Metadata
- **Audience:** [Technical Team / Stakeholders / New Team Members]
- **Style:** [tutorial / pitch / overview]
- **Suggested theme:** [dracula / sky / simple]
- **Suggested length:** [range] slides
- **Tone:** [description of narration voice and style]

## Section 1: [Section Name]
**Purpose:** What this section accomplishes for this audience.

### Slide: [Title]
- Bullet point (5-10 words each)
- Another bullet point
- Another bullet point

**Narration:** 2-4 sentences of what the speaker should say. Write in the speaker's voice, not as stage directions.

**Code example** (if applicable):
\```language
// Real code from this project, max 15 lines
// Include comments explaining key parts
\```

### Slide: [Title]
...

## Section 2: [Section Name]
...

## Key Takeaways
- Takeaway 1 (one sentence)
- Takeaway 2
- Takeaway 3

## Next Steps
What the audience should do after watching. 2-4 concrete actions.
```

## Constraints (Critical)

These constraints match the presentation generator's validation rules. Violating them means the content will need manual trimming before it can be used.

- **Slide titles:** 3-8 words
- **Bullet points:** 5-10 words each
- **Bullets per slide:** 3-5 maximum
- **Body text:** 1-2 sentences maximum per slide
- **Code examples:** 15 lines maximum per slide
- **Narration:** 2-4 sentences per slide (target 8-12 seconds of speech)
- **No tables** — convert to bullet lists
- **No numbered lists** — use unordered bullets only (-, *, +)

## Quality Rules

1. **Use real code** — extract actual snippets from the codebase, not pseudo-code. Simplify if needed but keep it authentic.
2. **One idea per slide** — if a slide feels crowded, split it into two.
3. **Narration adds context** — narration should explain *why* something matters, not just repeat the bullets.
4. **Progressive complexity** — start simple, build toward more advanced concepts within each section.
5. **Concrete over abstract** — prefer "reduces build time from 45s to 12s" over "improves performance."
6. **Code examples need comments** — every code block should have 1-3 inline comments explaining what's happening.

Now analyze this project and generate the presentation content.
````

---

## Audience Profiles

### Technical Team

Swap this block into `{{AUDIENCE_BLOCK}}`:

```
**Target:** Technical team members who will work with this codebase
**Style:** Tutorial
**Suggested theme:** dracula
**Suggested length:** 15-20 slides
**Tone:** Direct, precise, peer-to-peer. No hype, no sales language. Speak as a senior engineer explaining to another senior engineer.
**Code examples:** 4-6 examples, progressing from basic patterns to advanced usage
**Focus areas:**
- Architecture and key design decisions (why it's built this way)
- Core APIs and integration patterns (how to use it)
- Data flow and state management (how it works internally)
- Extension points and customization (how to modify it)
- Common pitfalls and debugging approaches (what to watch out for)
```

### Stakeholders

Swap this block into `{{AUDIENCE_BLOCK}}`:

```
**Target:** Stakeholders, managers, and cross-functional partners
**Style:** Pitch
**Suggested theme:** sky
**Suggested length:** 10-14 slides
**Tone:** Confident, outcome-focused, concise. Quantify impact where possible. Avoid jargon — if a technical term is necessary, define it in one clause.
**Code examples:** 0 (none — use diagrams descriptions and metrics instead)
**Focus areas:**
- The problem this project solves (pain point, cost, risk)
- How it works at a high level (the 30-second explanation)
- Measurable outcomes and value delivered (metrics, time saved, risk reduced)
- Current status and what's next (roadmap, milestones)
- How it compares to alternatives (why this approach)
```

### Onboarding (New Team Members)

Swap this block into `{{AUDIENCE_BLOCK}}`:

```
**Target:** New team members getting oriented with the project
**Style:** Overview
**Suggested theme:** simple
**Suggested length:** 12-15 slides
**Tone:** Friendly, encouraging, progressive. Assume intelligence but no project-specific context. Build confidence — each slide should make the viewer feel more capable.
**Code examples:** 1-2 basic examples only (the "hello world" of this project)
**Focus areas:**
- What this project is and why it exists (the big picture)
- Key concepts and vocabulary (the mental model)
- Project structure and where things live (navigating the codebase)
- The most common workflow (their first task, end to end)
- Where to find help and what to explore next (resources, people, docs)
```

---

## Quick Reference

| | Technical | Stakeholder | Onboarding |
|---|---|---|---|
| **Style** | Tutorial | Pitch | Overview |
| **Theme** | dracula | sky | simple |
| **Length** | 15-20 slides | 10-14 slides | 12-15 slides |
| **Tone** | Peer-to-peer, precise | Outcome-focused, concise | Friendly, progressive |
| **Code** | 4-6 examples | None | 1-2 basic |
| **Focus** | Architecture, APIs, patterns | Problem, value, outcomes | Concepts, structure, first task |
