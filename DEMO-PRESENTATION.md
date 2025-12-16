# SATL: Shared AI Tooling Layer

## Executive Summary

**SATL (Shared AI Tooling Layer)** is a centralized knowledge repository that provides consistent AI coding guidance across all major AI-assisted development tools. Instead of maintaining separate configurations for Claude Code, Cursor, and GitHub Copilot, teams define their coding standards once in SATL and automatically generate platform-native artifacts for each tool.

**Key Value Proposition:**
- **Write once, deploy everywhere** - Single source of truth for coding standards
- **Platform-native experience** - Each AI tool receives guidance in its preferred format
- **Dynamic + Static** - MCP server for real-time queries, generated files for offline access
- **Extensible** - Add new platforms without changing the knowledge base

---

## How SATL Works

### The Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KNOWLEDGE BASE (YAML)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Namespace  │  │  Guidance   │  │  Command    │  │   Agent     │    │
│  │  (domains)  │  │  (rules)    │  │ (workflows) │  │ (personas)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SATL CORE                                     │
│              Schemas • Loader • Namespace Resolver                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ MCP Server  │ │  Adapters   │ │   Install   │
            │  (runtime)  │ │ (generate)  │ │  (deploy)   │
            └─────────────┘ └─────────────┘ └─────────────┘
                    │               │               │
                    ▼               ▼               ▼
            ┌─────────────────────────────────────────────┐
            │              TARGET PROJECT                 │
            │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
            │  │ Claude  │  │ Cursor  │  │ Copilot │     │
            │  │ Code    │  │         │  │         │     │
            │  └─────────┘  └─────────┘  └─────────┘     │
            └─────────────────────────────────────────────┘
```

### The Flow

1. **Define** - Write coding standards in YAML (knowledge-base/)
2. **Generate** - Run adapters to create platform-native files (artifacts/)
3. **Install** - Copy artifacts to target project
4. **Use** - AI tools automatically receive guidance when coding

---

## The Four Primitives

SATL uses four core primitives to model all AI coding guidance:

### Primitive Overview

| Primitive | Purpose | Example |
|-----------|---------|---------|
| **Namespace** | Domain grouping with file globs | "Frontend code lives in `frontend/**/*.gts`" |
| **Guidance** | Rules, patterns, policies | "Use arrow functions instead of @action decorator" |
| **Command** | User-invoked workflows | `/commit` - create conventional commit |
| **Agent** | AI personas for specific tasks | "Playwright test generator" |

### How Each Primitive is Delivered

```
┌────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│ Primitive  │ Claude Code         │ Cursor              │ Copilot             │
├────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ Namespace  │ Skills              │ .mdc rule files     │ .instructions.md    │
│            │ .claude/skills/     │ .cursor/rules/      │ .github/instructions│
├────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ Guidance   │ Embedded in Skills  │ Embedded in .mdc    │ Embedded in         │
│            │ + MCP dynamic query │ + MCP dynamic query │ instructions        │
├────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ Command    │ Slash commands      │ (via MCP/rules)     │ Prompt files        │
│            │ .claude/commands/   │                     │ .github/prompts/    │
├────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ Agent      │ Referenced in       │ Referenced in       │ Agent files         │
│            │ AGENTS.md           │ AGENTS.md           │ .github/agents/     │
├────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ MCP Server │ .mcp.json           │ .cursor/mcp.json    │ .vscode/mcp.json    │
│            │ Real-time queries   │ Real-time queries   │ Real-time queries   │
├────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ Hooks      │ .claude/hooks/      │ .cursor/hooks/      │ Not supported       │
│            │ SessionStart,       │ beforeSubmitPrompt  │                     │
│            │ UserPromptSubmit    │                     │                     │
└────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

### Execution Model

| Primitive | Trigger | Execution |
|-----------|---------|-----------|
| **Namespace** | File path match via globs | Automatic - AI tool loads relevant guidance |
| **Guidance** | Included in namespace or MCP query | Automatic - embedded in context |
| **Command** | User types `/command-name` | User-initiated workflow |
| **Agent** | User selects or references agent | User-initiated persona switch |
| **Hooks** | Lifecycle events (session start, prompt submit) | Automatic - injects context |

---

## Generated File Mapping

When you run `pnpm generate:all`, SATL creates the following artifacts:

### Claude Code (17 files)

```
artifacts/claude/
├── .claude/
│   ├── skills/
│   │   ├── satl-core/
│   │   │   └── SKILL.md              # Core coding standards
│   │   ├── satl-docs/
│   │   │   └── SKILL.md              # Documentation standards
│   │   ├── satl-frontend/
│   │   │   ├── SKILL.md              # Frontend/Ember guidance
│   │   │   └── references/
│   │   │       └── patterns.md       # Pattern examples
│   │   └── satl-security/
│   │       └── SKILL.md              # Security policies
│   ├── commands/
│   │   └── satl/
│   │       ├── get-context.md        # /satl:get-context
│   │       ├── explain-pattern.md    # /satl:explain-pattern
│   │       ├── list-patterns.md      # /satl:list-patterns
│   │       ├── commit.md             # /satl:commit
│   │       └── review-branch.md      # /satl:review-branch
│   ├── hooks/
│   │   ├── session-start.sh          # Runs at session start
│   │   └── user-prompt.sh            # Runs on each prompt
│   ├── settings.json                 # Permissions + hooks config
│   └── settings.local.json.example   # Template for local overrides
├── .mcp.json                         # MCP server configuration
├── CLAUDE.md                         # Project context file
└── .satl-manifest.json               # Generation metadata
```

### Cursor (10 files)

```
artifacts/cursor/
├── .cursor/
│   ├── rules/
│   │   ├── satl-index.mdc            # Index rule (always loaded)
│   │   ├── satl-core.mdc             # Core standards
│   │   ├── satl-docs.mdc             # Documentation standards
│   │   ├── satl-frontend.mdc         # Frontend guidance (glob-triggered)
│   │   └── satl-security.mdc         # Security policies
│   ├── hooks/
│   │   └── before-submit.sh          # Runs before each prompt
│   ├── hooks.json                    # Hooks configuration
│   └── mcp.json                      # MCP server configuration
├── .cursorignore                     # Files to ignore
└── .satl-manifest.json               # Generation metadata
```

### Copilot (13 files)

```
artifacts/copilot/
├── .github/
│   ├── copilot-instructions.md       # Global instructions
│   ├── instructions/
│   │   ├── satl-core.instructions.md
│   │   ├── satl-docs.instructions.md
│   │   ├── satl-frontend.instructions.md
│   │   └── satl-security.instructions.md
│   ├── prompts/
│   │   ├── satl-get-context.prompt.md
│   │   ├── satl-explain-pattern.prompt.md
│   │   ├── satl-list-patterns.prompt.md
│   │   ├── satl-commit.prompt.md
│   │   └── satl-review-branch.prompt.md
│   └── agents/
│       └── satl-playwright-generator.agent.md
├── .vscode/
│   └── mcp.json                      # MCP server configuration
└── .satl-manifest.json               # Generation metadata
```

### Shared

```
artifacts/
└── AGENTS.md                         # Shared agent documentation
```

---

## Example: Frontend Guidance

### Knowledge Base Definition

```yaml
# knowledge-base/frontend/namespace.yaml
id: frontend
name: Frontend
description: Ember.js and Glimmer component guidance
globs:
  - "frontend/**"
  - "**/*.gts"
  - "**/*.gjs"
  - "**/*.hbs"
```

```yaml
# knowledge-base/frontend/guidance.yaml
guidance:
  - id: use-gts-format
    name: Use GTS Format
    type: rule
    severity: error
    description: Use .gts single-file component format for new components
    globs:
      - "frontend/**/*.js"
      - "frontend/**/*.ts"
    content: |
      Always use the .gts (Glimmer TypeScript) format for new components.
      This provides better TypeScript integration and co-located templates.

  - id: use-arrow-handlers
    name: Use Arrow Handlers
    type: pattern
    severity: warning
    description: Use arrow functions instead of @action decorator
    detection:
      pattern: "@action"
    content: |
      Replace @action decorated methods with arrow function properties.

      // Before (legacy)
      @action
      handleClick() { ... }

      // After (modern)
      handleClick = () => { ... }
```

### Generated Output

**Claude Code Skill** (`.claude/skills/satl-frontend/SKILL.md`):
```markdown
# satl-frontend

Frontend guidance for Ember.js and Glimmer components.

## When This Applies
Files matching: `frontend/**`, `**/*.gts`, `**/*.gjs`, `**/*.hbs`

## Rules

### use-gts-format (error)
Use .gts single-file component format for new components...

### use-arrow-handlers (warning)
Use arrow functions instead of @action decorator...
```

**Cursor Rule** (`.cursor/rules/satl-frontend.mdc`):
```markdown
---
description: Frontend guidance for Ember.js and Glimmer components
globs: ["frontend/**","**/*.gts","**/*.gjs","**/*.hbs"]
alwaysApply: false
---

# Frontend Guidance

## use-gts-format (error)
Use .gts single-file component format...

## use-arrow-handlers (warning)
Use arrow functions instead of @action...
```

**Copilot Instruction** (`.github/instructions/satl-frontend.instructions.md`):
```markdown
---
applyTo: 'frontend/**,**/*.gts,**/*.gjs,**/*.hbs'
---

# Frontend Guidance

## use-gts-format (error)
Use .gts single-file component format...

## use-arrow-handlers (warning)
Use arrow functions instead of @action...
```

---

## MCP Server: Dynamic Queries

The MCP (Model Context Protocol) server provides real-time guidance queries:

### Available Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `satl_get_guidance` | Get guidance for a file path | `satl_get_guidance("frontend/app/components/Button.gts")` |
| `satl_list_task_types` | List available task types | `satl_list_task_types()` |
| `satl_list_agents` | List available AI agents | `satl_list_agents("frontend")` |
| `satl_get_agent` | Get agent details | `satl_get_agent("playwright-generator")` |

### How It Works

```
┌──────────────┐     MCP Protocol      ┌──────────────┐
│   AI Tool    │ ◄──────────────────► │  SATL MCP    │
│ (Claude/     │   satl_get_guidance   │   Server     │
│  Cursor)     │   ("Button.gts")      │              │
└──────────────┘                       └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Knowledge    │
                                       │ Base (YAML)  │
                                       └──────────────┘
                                              │
                                              ▼
                                       Returns merged guidance
                                       from: core + frontend + security
```

---

## Hooks: Automatic Context Injection

Hooks run at specific lifecycle events to inject SATL context automatically.

### Claude Code Hooks

| Event | Hook Script | Purpose |
|-------|-------------|---------|
| `SessionStart` | `session-start.sh` | Display SATL intro, list MCP tools |
| `UserPromptSubmit` | `user-prompt.sh` | Remind to use `satl_get_guidance` |

**Configuration** (`.claude/settings.json`):
```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
      }]
    }],
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/user-prompt.sh\""
      }]
    }]
  }
}
```

### Cursor Hooks

| Event | Hook Script | Purpose |
|-------|-------------|---------|
| `beforeSubmitPrompt` | `before-submit.sh` | Remind about SATL MCP tools |

**Configuration** (`.cursor/hooks.json`):
```json
{
  "version": 1,
  "hooks": {
    "beforeSubmitPrompt": [{
      "command": "./.cursor/hooks/before-submit.sh"
    }]
  }
}
```

### Copilot

Copilot does not support hooks. Guidance is delivered entirely through static `.instructions.md` and `.prompt.md` files.

---

## Command Examples

### `/satl:commit` (Claude Code)

```
User: /satl:commit

Claude: [Runs git status, git diff, stages files]

        chore(frontend): update button component styles
```

### `/satl:review-branch` (Claude Code)

```
User: /satl:review-branch

Claude: **Commits:** 3
        - abc1234 feat(todo): add priority filter
        - def5678 fix(api): handle empty response
        - ghi9012 test: add todo filter tests

        **Files:** 5 frontend, 2 backend, 3 tests

        **TL;DR:** Adds priority filtering to todos with API fix and tests.
```

---

## Installation Workflow

### For Developers

```bash
# In the SATL repository
pnpm install              # Install dependencies
pnpm -r build             # Build all packages
pnpm generate:all         # Generate artifacts for all platforms

# Install to a target project
export SATL_TARGET_DIR=/path/to/project
pnpm install:all          # Install all platforms
# or
pnpm install:claude       # Claude Code only
pnpm install:cursor       # Cursor only
pnpm install:copilot      # Copilot only
```

### What Gets Installed

The install script:
1. Copies platform-specific artifacts to the target project
2. Replaces `${SATL_REPO_PATH}` placeholders with absolute paths
3. Makes hook scripts executable
4. Creates `.envrc` for environment variable management

---

## Summary

### SATL Solves These Problems

| Problem | SATL Solution |
|---------|---------------|
| Duplicate configs across AI tools | Single knowledge base, multiple outputs |
| Inconsistent coding standards | Centralized rules, consistent delivery |
| Manual config maintenance | Automated generation and installation |
| No real-time guidance | MCP server for dynamic queries |
| Tool-specific learning curve | Platform-native formats (skills, rules, instructions) |

### Key Benefits

1. **Consistency** - Same standards across all AI tools
2. **Maintainability** - Update once, regenerate everywhere
3. **Flexibility** - Static files + dynamic MCP server
4. **Extensibility** - Add new platforms via adapters
5. **Developer Experience** - Native formats for each tool

### Next Steps

1. **Explore** - Review the knowledge-base YAML files
2. **Customize** - Add your team's coding standards
3. **Generate** - Run `pnpm generate:all`
4. **Install** - Deploy to your projects
5. **Iterate** - Refine guidance based on usage

---

*SATL - Making AI coding assistants work the way your team works.*
