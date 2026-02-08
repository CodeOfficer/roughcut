---
title: "SATL: Write Once, Deploy Everywhere"
theme: sky
voice: IKne3meq5aSn9XLyUdCD
resolution: 1920x1080
preset: manual-presentation
config:
  controls: true
  progress: true
  slideNumber: "c/t"
customStyles: |
  .reveal section[data-background-gradient] h1,
  .reveal section[data-background-gradient] h2,
  .reveal section[data-background-gradient] p,
  .reveal section[data-background-gradient] strong,
  .reveal section[data-background-gradient] em {
    color: #ffffff !important;
  }
  .reveal section[data-background-gradient] li {
    color: #ffffff !important;
  }
---

# SATL: Write Once, Deploy Everywhere

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@pause-after: 2s

@audio: SATL — the Shared AI Tooling Layer.
@audio: Write your AI guidance once, and deploy it everywhere.

**Unified guidance for Claude Code, Cursor, and Copilot**

---

# Every Tool Speaks Differently

@transition: fade

@audio: Our engineering teams adopted multiple AI coding assistants — Claude Code, Cursor, and GitHub Copilot.
@audio: The problem is that each tool stores its guidance differently — different file formats, different folder structures, different frontmatter.
@audio: Every rule and every coding standard has to be written and maintained three separate times.

- Teams use Claude Code, Cursor, Copilot @fragment
- Each tool has its own config format @fragment +1s
- Rules maintained separately per tool @fragment +2s
- Changes require three updates minimum @fragment +3s

---

# Fragmentation Creates Real Risk

@transition: fade

@audio: This isn't just an inconvenience — it's a governance risk.
@audio: When a security rule gets updated in one tool but not the others, you get silent drift.
@audio: There's no way to audit who changed what, when, or whether the same standard applies everywhere.

- Security rules drift silently between tools @fragment
- No audit trail for guidance changes @fragment +1s
- Onboarding multiplied by tool count @fragment +2s
- No single source of truth exists @fragment +3s

---

# One Knowledge Base, Every Tool

@transition: convex
@background: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)

@audio: SATL — the Shared AI Tooling Layer — solves this by giving teams a single knowledge base.
@audio: You write a rule once in plain Markdown with a YAML header, and SATL generates the correct artifact for each tool automatically.
@audio: The whole system lives in git, so you get pull requests, code review, and a full audit trail for free.

- Write guidance once in Markdown @fragment
- Auto-generate tool-specific artifacts @fragment +1s
- Git-native: PRs, reviews, audit trail @fragment +2s

---

# How It Works

@transition: fade

@audio: The workflow is simple. An author writes a knowledge base item — say, a security rule — in Markdown with a small YAML header.
@audio: One CLI command triggers three adapters that each produce the right file format.
@audio: Same content, three native formats — delivered automatically.

- Author a KB item in Markdown @fragment
- Run one CLI command to generate @fragment +1s
- Adapters produce native outputs @fragment +2s
- Deploy to all three tools instantly @fragment +3s

---

# Four Primitive Types

@transition: convex
@background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)

@audio: SATL organizes all guidance into four primitive types.
@audio: Rules are loaded automatically into every AI session — think security checks and coding standards. Commands are templates users invoke on demand.
@audio: Agents are specialized sub-agents with specific tools and models. Skills bundle multi-file workflows. These four types cover every way teams guide AI behavior.

- **Rules** — always-on session guidance @fragment
- **Commands** — user-invoked templates @fragment +1s
- **Agents** — specialized AI sub-agents @fragment +2s
- **Skills** — multi-step workflow bundles @fragment +3s

---

# Scope Hierarchy

@transition: fade

@audio: Not all guidance applies everywhere. SATL's four-tier scope system lets security rules apply globally while repo-specific conventions stay local.
@audio: Teams can share workflows within their group, and individuals can add personal customizations.
@audio: More specific scopes override broader ones — so a team can refine a global rule without breaking it for everyone else.

- **Global** — security and architecture standards @fragment
- **Repo** — project-specific conventions @fragment +1s
- **Team** — shared team workflows @fragment +2s
- **User** — personal customizations @fragment +3s

---

# Three Native Adapters

@transition: fade

@audio: Each adapter understands its target tool's native format.
@audio: Claude gets standard Markdown rules. Cursor gets its custom MDC format with globs and auto-attach metadata. Copilot gets instructions files with its own frontmatter.
@audio: The generation is fully deterministic — same inputs always produce identical outputs, so there's no drift between runs.

- **Claude Code** — .claude/ directory artifacts @fragment
- **Cursor** — .cursor/ with .mdc format @fragment +1s
- **Copilot** — .github/ instructions @fragment +2s
- Same input, deterministic output @fragment +3s

---

# What We've Built Today

@transition: convex
@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)

@audio: SATL is fully operational today.
@audio: We have thirty-four knowledge base items — including twenty-four security and architecture rules — that generate sixty-six tool-specific artifacts in a single command.
@audio: The system is backed by forty test files, and the CLI covers the full lifecycle: install, update, uninstall, validate, doctor, list, and shell completion.

- **34** KB items ready to deploy @fragment
- **66** artifacts across three tools @fragment +1s
- **40** test files ensuring correctness @fragment +2s
- **7** CLI commands for full lifecycle @fragment +3s

---

# Three X Less Maintenance

@transition: fade

@audio: The core win is straightforward — what used to require three separate updates now takes one.
@audio: Schema validation using Zod catches misconfigurations before they ever reach a tool.
@audio: Git provides the audit trail — who wrote the rule, who reviewed it, when it was approved. Manual synchronization is eliminated entirely.

- One update propagates to all tools @fragment
- Schema validation catches errors early @fragment +1s
- Git history provides full audit trail @fragment +2s
- Zero manual synchronization needed @fragment +3s

---

# Security and Governance Built In

@transition: fade

@audio: Security governance is where this really shines.
@audio: Twelve security rules — covering SQL injection, XSS prevention, secrets handling, and input validation — are automatically deployed to every AI tool in your workflow.
@audio: Combined with CODEOWNERS and PR-based review, you get consistent security enforcement with a full paper trail.

- 12 security rules enforced everywhere @fragment
- 3 architecture standards applied globally @fragment +1s
- CODEOWNERS controls rule modifications @fragment +2s
- Every change peer-reviewed via PR @fragment +3s

---

# Why Not Maintain Manually?

@transition: fade

@audio: The obvious alternative is to just maintain each tool's config files by hand. This works until it doesn't — and it breaks silently.
@audio: There's no validation to catch mistakes, no schema contract ensuring consistency.
@audio: As you add more tools or more teams, the maintenance cost grows linearly. SATL keeps it constant.

- Manual sync breaks silently at scale @fragment
- No validation or schema contracts @fragment +1s
- Version history scattered across tools @fragment +2s
- Cost grows with each new tool @fragment +3s

---

# Why Not a Cloud Platform?

@transition: fade

@audio: Cloud-based alternatives introduce vendor lock-in and require external connectivity.
@audio: SATL lives entirely in your git repo — no external dependencies, no API keys, no subscription fees.
@audio: Your existing PR and review workflows handle governance. And when the next AI coding tool arrives, adding an adapter is the only change needed.

- Git-native with zero vendor lock-in @fragment
- Works fully offline with local processing @fragment +1s
- Existing PR workflows handle governance @fragment +2s
- Open architecture supports future tools @fragment +3s

---

# What's Next

@transition: zoom
@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@pause-after: 3s

@audio: Looking ahead, we're building an import workflow that captures effective prompts from any tool back into the knowledge base.
@audio: A promotion pipeline will let rules flow from user scope up through team and global with review gates at every step.
@audio: Schedule a demo to see SATL generate artifacts live, and let's identify pilot teams to measure the impact.

- MCP server adds semantic search @fragment
- Import workflow captures good prompts @fragment +1s
- Promotion pipeline: user to global @fragment +2s
- **Schedule a demo today** @fragment +3s

@notes: Call to action — offer live demo, identify 2-3 pilot teams, review security rules with security team
