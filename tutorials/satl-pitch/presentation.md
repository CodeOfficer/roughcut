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

@audio: ... SATL — the Shared AI Tooling Layer.
@audio: Capture your organization's institutional knowledge and deploy it to every AI coding tool.

**Institutional knowledge for Claude Code, Cursor, and Copilot**

---

# Every Tool Speaks Differently

@transition: fade

@audio: Our engineering teams have adopted multiple AI coding assistants — Claude Code, Cursor, and GitHub Copilot.
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

# Guidance, Not Enforcement

@transition: fade

@audio: Before we go further — an important distinction. SATL is a guidance layer, not an enforcement layer.
@audio: AI models are non-deterministic by nature. We can't guarantee that an AI assistant will always follow a rule exactly as written — and no tool can.
@audio: What SATL does is ensure the right guidance is consistently available in every tool, every session. Our organization has separate tooling for enforcement and compliance. SATL makes sure the AI knows what good looks like.

- AI models are non-deterministic by nature @fragment
- No tool can guarantee perfect compliance @fragment +1s
- SATL ensures guidance is always present @fragment +2s
- Separate tooling handles enforcement @fragment +3s

---

# One Knowledge Base, Every Tool

@transition: convex
@background: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)

@audio: SATL — the Shared AI Tooling Layer — solves this by giving your organization a single place to record and maintain its institutional knowledge.
@audio: Security practices, coding standards, architectural decisions — captured once in plain Markdown and deployed to every tool automatically.
@audio: The whole system lives in git, so your institutional knowledge is versioned, reviewable, and never lost.

- Write guidance once in Markdown @fragment
- Auto-generate tool-specific artifacts @fragment +1s
- Git-native: PRs, reviews, audit trail @fragment +2s

---

# How It Works

@transition: fade

@audio: The workflow is simple. An author writes a knowledge base item — say, a security rule — in Markdown with a small YAML header.
@audio: Sensible defaults handle most frontmatter fields, but authors can provide adapter-specific overrides when a particular tool needs different metadata.
@audio: One CLI command triggers three adapters that each produce the right file format — same content, three native formats.

- Author a KB item in Markdown @fragment
- Defaults apply; adapter overrides when needed @fragment +1s
- One CLI command, three native outputs @fragment +2s
- Deploy to all three tools instantly @fragment +3s

---

# The SATL CLI

@transition: fade

@audio: The CLI is how developers interact with SATL day to day. It's designed around choice — you pick which tools you use, and SATL only generates what you need.
@audio: Global and repo-specific primitives install automatically — they're mandatory. But beyond that, users subscribe to the team and individual primitives that are useful to them.
@audio: Teams can develop and share primitives that are proven to help their members. Individual users can share useful primitives with colleagues without publishing them broadly. Every repo gets its own configuration, so artifacts are tailored to the project you're working in.

- Choose your tools — only generate what you use @fragment
- Global and repo primitives install automatically @fragment +1s
- Subscribe to team primitives that help your workflow @fragment +2s
- Share individual primitives with colleagues @fragment +3s

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
@audio: Global and repo primitives are mandatory — they can't be overridden. Team and user primitives layer on top, adding guidance without weakening what's enforced from above.

- **Global** — security and architecture standards @fragment
- **Repo** — project-specific conventions @fragment +1s
- **Team** — shared team workflows @fragment +2s
- **User** — personal customizations @fragment +3s

---

# Three Native Adapters

@transition: fade

@audio: Each adapter understands its target tool's native format.
@audio: Claude gets standard Markdown rules. Cursor gets its custom MDC format with globs and auto-attach metadata. Copilot gets instructions files with its own frontmatter.
@audio: Critically, generated artifacts live alongside each user's local configuration — no conflicts. The CLI tracks a manifest of what it generated, so SATL-managed files and user files coexist cleanly. It also saves your install selections as defaults for successive runs.

- **Claude Code** — .claude/ directory artifacts @fragment
- **Cursor** — .cursor/ with .mdc format @fragment +1s
- **Copilot** — .github/ instructions @fragment +2s
- No conflicts — manifest tracks generated files @fragment +3s

---

# What We've Built Today

@transition: convex
@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)

@audio: SATL is working today — early alpha, built in close collaboration with our security team.
@audio: We've prototyped the system with a dozen custom rules that generate native artifacts for all three tools in a single command.
@audio: The CLI, MCP server, adapters, and core libraries are all covered by a growing test suite.

- Early alpha — prototyped with security team @fragment
- A dozen rules generating native artifacts @fragment +1s
- CLI, MCP, adapters, and core all tested @fragment +2s
- Full lifecycle: install, update, validate, doctor @fragment +3s

---

# Three X Less Maintenance

@transition: fade

@audio: The core win is straightforward — what used to require three separate updates now takes one.
@audio: Today, users pull the SATL repo locally and run satl install to sync their rules. It's a manual step by design — we want real feedback before automating further.
@audio: Schema validation catches misconfigurations early, and git gives you the full audit trail for free.

- One update replaces three @fragment
- Local install — pull repo, run `satl install` @fragment +1s
- Schema validation catches errors early @fragment +2s
- Tighter integration planned as adoption grows @fragment +3s

---

# Security and Governance Built In

@transition: fade

@audio: Security governance is where this really shines.
@audio: We prototyped the initial rule set with our security team — covering areas like SQL injection, XSS prevention, and secrets handling.
@audio: Now that security can author rules directly, we'll continue refining and expanding this set of primitives together. CODEOWNERS and PR-based review keep everything governed.

- Initial security rules prototyped with security team @fragment
- Security team now authoring rules directly @fragment +1s
- CODEOWNERS controls rule modifications @fragment +2s
- Every change peer-reviewed via PR @fragment +3s

---

# Why Not Store Rules in Each Repo?

@transition: fade

@audio: The obvious alternative is to commit guidance directly into each repository. This works at first, but changes get tied to each repo's release cycle.
@audio: Updates are slow to iterate on — a single rule change means pull requests across every repo that uses it.
@audio: Worse, institutional knowledge gets fragmented and can be lost entirely when repos are archived or teams move on.

- Rule changes tied to each repo's lifecycle @fragment
- Slow iteration — PRs across every repo @fragment +1s
- Institutional knowledge fragments over time @fragment +2s
- Knowledge lost when repos are archived @fragment +3s

---

# A Dedicated Knowledge Base

@transition: fade

@audio: Having all primitives in their own repo is a fundamental design choice. This is where your institutional knowledge lives — not scattered across application repos where it gets stale, forgotten, or lost.
@audio: You can analyze and improve your organization's entire body of guidance in one place. The feedback loop is short — update once, reinstall everywhere — no application release cycles in the way.
@audio: When tools evolve — say Claude Code adds a new frontmatter field for agents — you handle it in a single knowledge-base migration rather than chasing changes across hundreds of repos.

- Analyze all guidance org-wide in one place @fragment
- Shorter feedback loop — no app release cycles @fragment +1s
- Share primitives across teams effortlessly @fragment +2s
- Tool changes handled in one migration @fragment +3s

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

# MCP Server: Queryable Knowledge

@transition: convex
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

@audio: The SATL MCP server makes your entire knowledge base queryable from inside any AI coding tool. Today it requires a manual MCP configuration pointing to the SATL repo, but once connected, any tool can search across all your primitives.
@audio: Your AI assistant can answer questions like — do any of our rules cover this? What primitives exist for this frontmatter field? Has another team already built a skill for this workflow?
@audio: Looking ahead, the MCP server could let you reference a locally created rule or skill and open a pull request upstream with the proper scoping — turning everyday discoveries into shared institutional knowledge.

- Any AI tool can query the full knowledge base @fragment
- "Do any rules cover this?" — answered instantly @fragment +1s
- Discover team skills and shared workflows @fragment +2s
- Future: PR upstream from local discoveries @fragment +3s

---

# What's Next

@transition: zoom
@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@pause-after: 3s

@audio: Looking ahead, we're exploring new primitive types beyond rules, commands, agents, and skills.
@audio: Hooks are tool-specific and not supported everywhere, but they're worth investigating. Tool settings — think settings dot json — could standardize editor configuration. And managed MCP configurations would let us define a default set of MCP servers available across the org.
@audio: Schedule a demo to see SATL generate artifacts live, and let's identify pilot teams to measure the impact.

- **Hooks** — tool-specific, not yet universal @fragment
- **Tool settings** — standardized editor config @fragment +1s
- **MCP configs** — default servers org-wide @fragment +2s
- **Schedule a demo today** @fragment +3s

@notes: Call to action — offer live demo, identify 2-3 pilot teams, review security rules with security team
