---
title: "SATL: Shared AI Tooling Layer"
theme: white
voice: 4YYIPFl9wE5c4L2eu2Gb
resolution: 1920x1080
preset: manual-presentation
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  hash: true
  transition: fade
  transitionSpeed: default
customCSS: ./styles/custom.css
---

# SATL

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #1a1a2e 100%)
@pause-after: 2s

@audio: Welcome to SATL.
@audio: The Shared AI Tooling Layer.
@audio: One knowledge base. [1s] Every AI coding tool.

@notes: Opening slide — pause for effect before advancing.

**Shared AI Tooling Layer**

*One knowledge base. Every AI coding tool.*

---

# The Problem

@transition: fade
@duration: 15s
@background: #ffffff

@audio: Today, teams face a significant challenge.
@audio: Every AI coding tool has its own configuration format.
@audio: Claude Code uses skills and commands.
@audio: Cursor uses M-D-C rules.
@audio: Copilot uses instructions and prompts.
@audio: Maintaining consistency across all three is a nightmare.

@notes: Emphasize the pain — three different config formats for the same intent.

**Every AI tool speaks a different language**

- Claude Code: skills, commands, hooks @fragment
- Cursor: .mdc rules, hooks @fragment +1s
- Copilot: instructions, prompts, agents @fragment +2s
- **Result:** Duplicated configs everywhere @fragment +3s

---

# The Cost

@transition: fade
@background: #f8faff

@audio: The cost of fragmentation is real.
@audio: Teams spend hours maintaining parallel configurations.
@audio: Standards drift between tools.
@audio: New developers get inconsistent guidance.

@notes: This is the "why should I care" slide.

- Hours spent on parallel configs @fragment
- Standards drift between tools @fragment +1s
- Inconsistent developer experience @fragment +2s
- No single source of truth @fragment +3s

---

# The Solution

@transition: convex
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 2s

@audio: SATL solves this elegantly.
@audio: Write your coding standards once.
@audio: Deploy everywhere.

@notes: Key message — write once, deploy everywhere. Let it land.

**Write once, deploy everywhere**

- Single source of truth @fragment
- Platform-native experience @fragment +1s
- Dynamic and static delivery @fragment +2s
- Fully extensible @fragment +3s

---

# How SATL Works

@transition: convex
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Let's explore how SATL works under the hood.

**Architecture deep-dive**

---

# The Architecture

@transition: fade
@background: #ffffff

@audio: At the top sits your Knowledge Base in YAML format.
@audio: This defines your namespaces, guidance, commands, and agents.
@audio: The SATL core transforms these into platform-native artifacts.

@image-prompt: Clean architectural diagram showing a layered system. Top layer labeled "Knowledge Base" with document icons, middle layer labeled "SATL Core" with gear icons, bottom layer showing three boxes for "Claude", "Cursor", and "Copilot". Modern minimal style with blue gradient accents on white background.

@notes: Walk through each layer top-to-bottom.

---

# The Flow

@vertical-slide:

## Step 1: Define

@transition: fade
@background: #ffffff

@audio: First, define your standards in YAML.
@audio: One file per namespace, one file per set of rules.

```yaml
# knowledge-base/frontend/namespace.yaml
id: frontend
name: Frontend
globs:
  - "frontend/**"
  - "**/*.gts"
  - "**/*.hbs"
```

@vertical-slide:

## Step 2: Generate

@transition: fade
@background: #f8faff

@audio: Then generate platform-native artifacts.
@audio: One command creates files for all three tools.

```bash
pnpm generate:all
# Creates:
#   artifacts/claude/
#   artifacts/cursor/
#   artifacts/copilot/
```

@vertical-slide:

## Step 3: Install

@transition: fade
@background: #ffffff

@audio: Install to your target project.
@audio: Path placeholders get resolved automatically.
@audio: Hooks become executable.

```bash
export SATL_TARGET_DIR=/path/to/project
pnpm install:all
```

@vertical-slide:

## Step 4: Use

@transition: fade
@background: #f8faff
@pause-after: 2s

@audio: Now your AI tools automatically receive guidance.
@audio: Every tool speaks the same standards. [1s] Natively.

@notes: This is the payoff — everything just works.

- AI receives context-specific rules @fragment
- Consistent across all tools @fragment +1s
- Zero manual sync needed @fragment +2s

---

# Four Primitives

@transition: convex
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: SATL models all AI coding guidance with four primitives.

**The building blocks**

---

# Namespace

@transition: fade
@background: #ffffff

@audio: A Namespace defines a domain with file globs.
@audio: It groups related code by pattern matching.
@audio: For example, frontend code in G-T-S files.

**Domain grouping with file globs**

```yaml
id: frontend
name: Frontend
globs:
  - "frontend/**"
  - "**/*.gts"
  - "**/*.hbs"
```

- **Claude Code:** `.claude/skills/` @fragment
- **Cursor:** `.cursor/rules/*.mdc` @fragment +1s
- **Copilot:** `.github/instructions/` @fragment +2s

---

# Guidance

@transition: fade
@background: #f8faff

@audio: Guidance contains your actual rules and patterns.
@audio: Each rule has a type, severity, and content.
@audio: The AI enforces these automatically.

@notes: Show both the rule definition and the platform-native output.

**Rules, patterns, and policies**

```yaml
- id: use-arrow-handlers
  type: pattern
  severity: warning
  content: |
    Use arrow functions
    instead of @action decorator
```

---

# Command

@transition: fade
@background: #ffffff

@audio: Commands are user-invoked workflows.
@audio: Type slash commit and get conventional commits.
@audio: Same workflow, every tool.

**User-invoked workflows**

- `/satl:commit` — Create commits @fragment
- `/satl:review-branch` — Review changes @fragment +1s
- `/satl:get-context` — Get guidance @fragment +2s

---

# Agent

@transition: fade
@background: #f8faff

@audio: Agents are AI personas for specific tasks.
@audio: Think specialized assistants with focused expertise.

**AI personas for specific tasks**

- Playwright test generator @fragment
- Security reviewer @fragment +1s
- Code reviewer @fragment +2s

---

# Generated Output

@transition: convex
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Let's see what gets generated for each platform.

**Platform-native artifacts**

---

# Claude Code Output

@transition: fade
@background: #ffffff
@duration: 10s

@audio: For Claude Code, SATL generates skills, commands, hooks, and M-C-P config.
@audio: Everything maps to Claude's native format.

@notes: 17 files total across skills, commands, hooks, and MCP.

```
artifacts/claude/
├── .claude/
│   ├── skills/      # 4 skill folders
│   ├── commands/    # 5 slash commands
│   └── hooks/       # 2 hook scripts
├── .mcp.json        # MCP config
└── CLAUDE.md        # Project context
```

---

# Cursor Output

@transition: fade
@background: #f8faff

@audio: Cursor receives M-D-C rules with glob patterns.
@audio: Plus hooks and M-C-P server configuration.

```
artifacts/cursor/
├── .cursor/
│   ├── rules/     # 5 .mdc files
│   ├── hooks/     # 1 hook script
│   └── mcp.json   # MCP config
└── .cursorignore
```

---

# Copilot Output

@transition: fade
@background: #ffffff

@audio: Copilot gets instructions, prompt files, and agent definitions.
@audio: All using GitHub's native format.

```
artifacts/copilot/
├── .github/
│   ├── instructions/  # 4 files
│   ├── prompts/       # 5 files
│   └── agents/        # 1 agent
└── .vscode/mcp.json
```

---

# MCP Server

@transition: convex
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Now let's talk about dynamic queries.
@audio: The M-C-P server enables real-time guidance.

**Real-time guidance queries**

---

# MCP Tools

@transition: fade
@background: #ffffff

@audio: The M-C-P server provides four tools.
@audio: Get guidance for any file path.
@audio: List task types and agents.
@audio: Retrieve detailed agent configurations.

- `satl_get_guidance` @fragment
- `satl_list_task_types` @fragment +1s
- `satl_list_agents` @fragment +1s
- `satl_get_agent` @fragment +2s

---

# How MCP Works

@transition: fade
@background: #f8faff

@audio: When you open a file, the AI tool queries SATL.
@audio: SATL resolves matching namespaces and merges guidance.
@audio: The AI receives context-specific rules instantly.

@image-prompt: Flow diagram showing an AI tool icon on the left sending a query arrow to an MCP Server box in the middle, which connects to a Knowledge Base cylinder on the right. Return arrow shows "merged guidance" flowing back. Clean minimal style with blue accents on white.

@notes: Emphasize the real-time nature — no build step needed for MCP queries.

---

# Hooks

@transition: fade
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Hooks provide automatic context injection.
@audio: They run at specific lifecycle events.

**Automatic context injection**

---

# Hook Events

@transition: fade
@background: #ffffff

@audio: Claude Code supports Session Start and User Prompt Submit hooks.
@audio: Cursor uses before-submit prompt hooks.
@audio: These inject SATL context automatically.

@notes: Copilot has no hook support yet — mention this if asked.

- **SessionStart** — Display SATL intro @fragment
- **UserPromptSubmit** — Inject guidance reminders @fragment +1s
- **beforeSubmitPrompt** — Cursor equivalent @fragment +2s

---

# Background Video Demo

@transition: fade
@background-video: ./assets/loop.mp4
@background-video-loop: true
@background-video-muted: true

@audio: SATL also supports rich media.
@audio: This slide demonstrates a background video.
@audio: Video loops silently behind the content.

@notes: This slide tests @background-video, @background-video-loop, and @background-video-muted directives.

**Rich media backgrounds**

*Video loops behind slide content*

---

# Live Demo

@transition: fade
@background: linear-gradient(135deg, #5678DE 0%, #1a1a2e 100%)
@pause-after: 2s

@audio: Let's see SATL in action.
@audio: We'll walk through the end-to-end workflow.

**End-to-end demonstration**

---

# Demo: Define Standards

@transition: fade
@background: #ffffff

@audio: First, we define our coding standards in YAML.
@audio: This YAML defines the frontend namespace.
@audio: It applies to all G-T-S and H-B-S files.

```yaml
# knowledge-base/frontend/namespace.yaml
id: frontend
name: Frontend
globs:
  - "frontend/**"
  - "**/*.gts"
  - "**/*.hbs"
```

---

# Demo: Add Guidance

@transition: fade
@background: #f8faff

@audio: Next, we add guidance rules.
@audio: This enforces arrow functions for event handlers.
@audio: The AI will suggest this pattern when editing matching files.

```yaml
- id: use-arrow-handlers
  name: Use Arrow Handlers
  type: pattern
  severity: warning
  content: |
    Replace @action methods
    with arrow functions
```

---

# Demo: Generate and Install

@transition: fade
@background: #ffffff

@audio: Now we generate and install.
@audio: One command creates all platform artifacts.
@audio: Another deploys to your project.

```bash
# Generate for all platforms
pnpm generate:all

# Install to target
pnpm install:claude
pnpm install:cursor
pnpm install:copilot
```

---

# Demo: AI Receives Guidance

@transition: fade
@background: #f8faff

@audio: Finally, the AI receives our guidance.
@audio: When editing frontend code, it knows our patterns.
@audio: It suggests arrow functions automatically.

@image-prompt: Screenshot-style mockup of a code editor with an AI suggestion popup showing "Replace @action with arrow function" advice. Clean IDE interface with blue accent highlights. Modern tech aesthetic.

@notes: This is the "aha" moment — standards flow from YAML to the AI automatically.

---

# Playwright Automation

@transition: fade
@background: #ffffff

@audio: For advanced demos, SATL presentations support browser automation.
@audio: Playwright directives can drive live interactions.

@playwright:
- Wait: 1s
- Screenshot: playwright-demo

@notes: This slide tests the @playwright directive. In production, you'd add clicks, typing, and screenshots.

**Browser automation for live demos**

---

# Summary

@transition: fade
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Let's recap what SATL provides.

**Key takeaways**

---

# What SATL Solves

@transition: fade
@background: #ffffff

@audio: SATL eliminates duplicate configurations.
@audio: It ensures consistent coding standards across every AI tool.
@audio: It automates maintenance and deployment.
@audio: And it provides real-time guidance via M-C-P.

- Duplicate configs across tools @fragment
- Inconsistent standards @fragment +1s
- Manual maintenance burden @fragment +2s
- No real-time guidance @fragment +3s

---

# Key Benefits

@transition: fade
@background: #f8faff

@audio: With SATL, you get consistency, maintainability, flexibility, and extensibility.
@audio: Your developers get a native experience in every tool.

- **Consistency** — Same standards everywhere @fragment
- **Maintainability** — Update once, deploy everywhere @fragment +1s
- **Flexibility** — Static plus dynamic delivery @fragment +2s
- **Extensibility** — Add new platforms easily @fragment +3s

---

# Next Steps

@transition: fade
@background: #ffffff
@pause-after: 2s

@audio: Ready to get started?
@audio: Explore the knowledge base YAML files.
@audio: Add your team's coding standards.
@audio: Generate and deploy. [1s] It's that simple.

@notes: Direct people to the repo and docs.

- Explore knowledge-base YAML
- Add your team's standards
- Run `pnpm generate:all`
- Deploy to your projects

---

# Thank You

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #1a1a2e 100%)
@pause-after: 3s

@audio: Thank you for your attention.
@audio: SATL makes AI coding assistants work the way your team works.
@audio: Questions?

**SATL: Shared AI Tooling Layer**

*Making AI coding assistants work the way your team works*
