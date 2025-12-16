---
title: "SATL: Shared AI Tooling Layer"
theme: white
voice: 4YYIPFl9wE5c4L2eu2Gb
preset: manual-presentation
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
  hash: true
customCSS: ./styles/custom.css
---

# SATL

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #1a1a2e 100%)
@pause-after: 2s

@audio: Welcome to SATL.
@audio: The Shared AI Tooling Layer.
@audio: One knowledge base. Every AI coding tool.

**Shared AI Tooling Layer**

---

# The Problem

@transition: fade
@duration: 12s

@audio: Today, teams face a significant challenge.
@audio: Every AI coding tool has its own configuration format.
@audio: Claude Code uses skills and commands.
@audio: Cursor uses M-D-C rules.
@audio: Copilot uses instructions and prompts.
@audio: Maintaining consistency across all three is a nightmare.

- Claude Code: skills, commands, hooks
- Cursor: .mdc rules, hooks
- Copilot: instructions, prompts, agents
- **Result:** Duplicated configs everywhere

---

# The Solution

@transition: convex
@background: #f8faff
@pause-after: 2s

@audio: SATL solves this elegantly.
@audio: Write your coding standards once.
@audio: Deploy everywhere.

**Write once, deploy everywhere**

- Single source of truth @fragment
- Platform-native experience @fragment
- Dynamic + Static delivery @fragment
- Fully extensible @fragment

---

# How SATL Works

@vertical-slide:

## The Architecture

@transition: fade
@background: #ffffff

@audio: Let's explore the architecture.
@audio: At the top sits your Knowledge Base in YAML format.
@audio: This defines your namespaces, guidance, commands, and agents.

@image-prompt: Clean architectural diagram showing a layered system. Top layer labeled "Knowledge Base" with document icons, middle layer labeled "SATL Core" with gear icons, bottom layer showing three boxes for "Claude", "Cursor", and "Copilot". Modern minimal style with blue gradient accents on white background.

@vertical-slide:

## The Flow

@transition: slide
@background: #f8faff

@audio: The flow is simple.
@audio: Define your standards in YAML.
@audio: Generate platform-native artifacts.
@audio: Install to your target project.
@audio: AI tools automatically receive guidance.

- **Define** - Write standards in YAML @fragment
- **Generate** - Create platform files @fragment
- **Install** - Deploy to project @fragment
- **Use** - AI receives guidance @fragment +1s

---

# Four Primitives

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: SATL uses four core primitives.
@audio: These model all AI coding guidance.

**The building blocks of SATL**

---

# Namespace

@vertical-slide:

## What is a Namespace?

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

@vertical-slide:

## Platform Delivery

@transition: slide
@background: #f8faff

@audio: Each platform receives namespaces differently.
@audio: Claude Code gets Skills.
@audio: Cursor gets M-D-C rule files.
@audio: Copilot gets instructions.

- **Claude Code:** `.claude/skills/`
- **Cursor:** `.cursor/rules/*.mdc`
- **Copilot:** `.github/instructions/`

---

# Guidance

@vertical-slide:

## What is Guidance?

@transition: fade
@background: #ffffff

@audio: Guidance contains your actual rules and patterns.
@audio: These are the coding standards your team follows.
@audio: Each rule has a type, severity, and content.

**Rules, patterns, and policies**

```yaml
- id: use-arrow-handlers
  type: pattern
  severity: warning
  content: |
    Use arrow functions
    instead of @action decorator
```

@vertical-slide:

## Example Rule

@transition: slide
@background: #f8faff

@audio: Here's a real example.
@audio: This rule enforces using G-T-S format for new components.
@audio: It triggers on JavaScript and TypeScript files.

```yaml
- id: use-gts-format
  name: Use GTS Format
  type: rule
  severity: error
  globs:
    - "frontend/**/*.js"
    - "frontend/**/*.ts"
```

---

# Command

@vertical-slide:

## What is a Command?

@transition: fade
@background: #ffffff

@audio: Commands are user-invoked workflows.
@audio: They provide consistent operations across tools.
@audio: Type slash commit and get conventional commits.

**User-invoked workflows**

- `/satl:commit` - Create commits
- `/satl:review-branch` - Review changes
- `/satl:get-context` - Get guidance

@vertical-slide:

## Platform Delivery

@transition: slide
@background: #f8faff

@audio: Commands map to each platform's native format.
@audio: Claude Code uses slash commands.
@audio: Copilot uses prompt files.
@audio: Cursor leverages M-C-P or rules.

- **Claude:** `.claude/commands/`
- **Copilot:** `.github/prompts/`
- **Cursor:** via MCP or rules

---

# Agent

@vertical-slide:

## What is an Agent?

@transition: fade
@background: #ffffff

@audio: Agents are AI personas for specific tasks.
@audio: Think specialized assistants with focused expertise.
@audio: A Playwright generator knows testing patterns.

**AI personas for specific tasks**

- Playwright test generator
- Security reviewer
- Code reviewer

@vertical-slide:

## Platform Delivery

@transition: slide
@background: #f8faff

@audio: Agents are documented in AGENTS dot M-D.
@audio: Copilot has dedicated agent files.
@audio: All platforms can reference agent definitions.

- **Shared:** `AGENTS.md`
- **Copilot:** `.github/agents/`
- **All:** MCP server queries

---

# Generated Files

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Let's see what gets generated.
@audio: Each platform receives native configuration.

**Platform-native artifacts**

---

# Claude Code Output

@transition: fade
@background: #ffffff

@audio: For Claude Code, SATL generates 17 files.
@audio: Skills provide domain guidance.
@audio: Commands enable workflows.
@audio: Hooks inject context automatically.

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

@audio: Cursor receives 10 files.
@audio: M-D-C rules with glob patterns.
@audio: Hooks for prompt augmentation.
@audio: M-C-P server configuration.

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

@audio: Copilot gets 13 files.
@audio: Instructions with apply-to patterns.
@audio: Prompt files for workflows.
@audio: Agent definitions for specialized tasks.

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

@transition: zoom
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
- `satl_list_task_types` @fragment
- `satl_list_agents` @fragment
- `satl_get_agent` @fragment

---

# How MCP Works

@transition: slide
@background: #f8faff

@audio: When you open a file, the AI tool queries SATL.
@audio: SATL resolves matching namespaces.
@audio: It merges guidance from core, frontend, and security.
@audio: The AI receives context-specific rules.

@image-prompt: Flow diagram showing an AI tool icon on the left sending a query arrow to an MCP Server box in the middle, which connects to a Knowledge Base cylinder on the right. Return arrow shows "merged guidance" flowing back. Clean minimal style with blue accents on white.

---

# Hooks

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Hooks provide automatic context injection.
@audio: They run at specific lifecycle events.

**Automatic context injection**

---

# Claude Code Hooks

@transition: fade
@background: #ffffff

@audio: Claude Code supports two hook events.
@audio: Session Start displays the SATL intro.
@audio: User Prompt Submit reminds about M-C-P tools.

- **SessionStart** @fragment
  - Display SATL introduction
  - List available MCP tools
- **UserPromptSubmit** @fragment +1s
  - Remind to use satl_get_guidance
  - Inject context prompts

---

# Cursor Hooks

@transition: slide
@background: #f8faff

@audio: Cursor uses before submit prompt hooks.
@audio: These inject SATL reminders before each query.
@audio: Copilot doesn't support hooks yet.

- **beforeSubmitPrompt**
  - Remind about SATL MCP tools
  - Inject guidance context

**Note:** Copilot has no hook support

---

# Installation

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Let's see the installation workflow.
@audio: It's designed to be simple and repeatable.

**Deploy to any project**

---

# Installation Steps

@transition: fade
@background: #ffffff

@audio: First, install dependencies and build.
@audio: Then generate artifacts for all platforms.
@audio: Finally, install to your target project.

```bash
# Build SATL
pnpm install
pnpm -r build
pnpm generate:all

# Install to project
export SATL_TARGET_DIR=/path/to/project
pnpm install:all
```

---

# What Gets Installed

@transition: slide
@background: #f8faff

@audio: The install script handles everything.
@audio: It copies platform-specific artifacts.
@audio: It resolves path placeholders.
@audio: It makes hooks executable.

- Copies platform artifacts @fragment
- Resolves path placeholders @fragment
- Makes hooks executable @fragment
- Creates environment config @fragment

---

# Demo Time

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #1a1a2e 100%)
@pause-after: 2s

@audio: Let's see SATL in action.
@audio: We'll demonstrate the end-to-end workflow.

**Live demonstration**

---

# Demo: Define Standards

@transition: fade
@background: #ffffff

@audio: First, we define our coding standards.
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

@transition: slide
@background: #f8faff

@audio: Next, we add guidance rules.
@audio: This enforces arrow functions for handlers.
@audio: The A-I will suggest this pattern.

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

# Demo: Generate & Install

@transition: fade
@background: #ffffff

@audio: Now we generate and install.
@audio: One command creates all platform artifacts.
@audio: Another deploys to our project.

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

@transition: convex
@background: #f8faff

@audio: Finally, the A-I receives our guidance.
@audio: When editing frontend code, it knows our patterns.
@audio: It suggests arrow functions automatically.

@image-prompt: Screenshot-style mockup of a code editor with an AI suggestion popup showing "Replace @action with arrow function" advice. Clean IDE interface with blue accent highlights. Modern tech aesthetic.

---

# Summary

@transition: zoom
@background: linear-gradient(135deg, #5678DE 0%, #8BA4E8 100%)
@pause-after: 1s

@audio: Let's recap what SATL provides.

**Key benefits**

---

# What SATL Solves

@transition: fade
@background: #ffffff

@audio: SATL eliminates duplicate configurations.
@audio: It ensures consistent coding standards.
@audio: It automates maintenance and deployment.
@audio: It provides real-time guidance via M-C-P.

- Duplicate configs across tools @fragment
- Inconsistent standards @fragment
- Manual maintenance burden @fragment
- No real-time guidance @fragment

---

# Key Benefits

@transition: slide
@background: #f8faff

@audio: With SATL, you get consistency.
@audio: You get maintainability.
@audio: You get flexibility and extensibility.
@audio: And your developers get a native experience.

- **Consistency** - Same standards everywhere @fragment
- **Maintainability** - Update once @fragment
- **Flexibility** - Static plus dynamic @fragment
- **Extensibility** - Add new platforms @fragment

---

# Next Steps

@transition: fade
@background: #ffffff

@audio: Ready to get started?
@audio: Explore the knowledge base YAML files.
@audio: Add your team's coding standards.
@audio: Generate and deploy.

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
