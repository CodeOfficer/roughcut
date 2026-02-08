# SATL: Write Once, Deploy Everywhere

## Metadata
- **Audience:** Stakeholders, managers, and cross-functional partners
- **Style:** pitch
- **Suggested theme:** sky
- **Suggested length:** 10-14 slides
- **Tone:** Confident, outcome-focused, concise. Speak like you're presenting to leadership — no jargon, just outcomes and evidence.

## Section 1: The Problem
**Purpose:** Establish urgency by showing the hidden cost of fragmented AI tooling guidance.

### Slide: Every AI Tool Speaks Differently
- Teams use Claude Code, Cursor, and Copilot
- Each tool has its own config format
- Rules maintained separately per tool
- Changes require three updates minimum

**Narration:** Our engineering teams adopted multiple AI coding assistants — Claude Code, Cursor, and GitHub Copilot. The problem is that each tool stores its guidance differently: different file formats, different folder structures, different frontmatter. Every rule, every security check, every coding standard has to be written and maintained three separate times.

### Slide: Fragmentation Creates Real Risk
- Security rules silently drift between tools
- No audit trail for guidance changes
- Onboarding multiplied by tool count
- No single source of truth exists

**Narration:** This isn't just an inconvenience — it's a governance risk. When a security rule gets updated in one tool but not the others, you get silent drift. There's no way to audit who changed what, when, or whether the same standard applies everywhere. And every new team member has to learn three different systems.

## Section 2: The Solution
**Purpose:** Introduce SATL's core value proposition in one clear concept.

### Slide: SATL — One KB, Every Tool
- Shared AI Tooling Layer
- Write guidance once in Markdown
- Automatically generate tool-specific artifacts
- Git-native: PRs, reviews, audit trail

**Narration:** SATL — the Shared AI Tooling Layer — solves this by giving teams a single knowledge base. You write a rule once in plain Markdown with a YAML header, and SATL generates the correct artifact for each tool automatically. The whole system lives in git, so you get PRs, code review, and a full audit trail for free.

### Slide: How It Works in Thirty Seconds
- Author a KB item in Markdown plus YAML
- Run one CLI command to generate artifacts
- Adapters produce tool-specific outputs
- Deploy to Claude Code, Cursor, and Copilot

**Narration:** The workflow is simple. An author writes a knowledge base item — say, a security rule — in Markdown with a small YAML header. One CLI command triggers three adapters that each produce the right file format: .md for Claude, .mdc for Cursor, .instructions.md for Copilot. Same content, three native formats.

## Section 3: Architecture
**Purpose:** Build confidence that the system is well-designed and production-ready.

### Slide: Four Primitive Types Drive Everything
- Rules: always-on guidance loaded every session
- Commands: user-invoked prompt templates
- Agents: specialized AI sub-agents with tools
- Skills: multi-step workflow bundles

**Narration:** SATL organizes all guidance into four primitive types. Rules are loaded automatically into every AI session — think security checks and coding standards. Commands are templates users invoke on demand. Agents are specialized sub-agents with specific tools and models. Skills bundle multi-file workflows. These four types cover every way teams guide AI behavior.

### Slide: Scope Hierarchy Balances Governance and Autonomy
- Global scope: security and architecture standards
- Repo scope: project-specific conventions
- Team scope: shared team workflows
- User scope: personal customizations

**Narration:** Not all guidance applies everywhere. SATL's four-tier scope system lets security rules apply globally while repo-specific conventions stay local. Teams can share workflows within their group, and individuals can add personal customizations. More specific scopes override broader ones — so a team can refine a global rule without breaking it for everyone else.

### Slide: Three Adapters Generate Native Artifacts
- Claude Code: .claude/ directory artifacts
- Cursor: .cursor/ directory with .mdc format
- GitHub Copilot: .github/ instructions and prompts
- Same input, deterministic output every time

**Narration:** Each adapter understands its target tool's native format. Claude gets standard Markdown rules. Cursor gets its custom .mdc format with globs and auto-attach metadata. Copilot gets .instructions.md files with its own frontmatter. The generation is fully deterministic — same inputs always produce identical outputs, so there's no drift between runs.

## Section 4: Results and Impact
**Purpose:** Prove the system delivers measurable value with real numbers.

### Slide: What We've Built Today
- Thirty-four KB items ready to deploy
- Sixty-six artifacts generated across three tools
- Forty test files ensuring correctness
- Seven CLI commands for full lifecycle

**Narration:** SATL is fully operational today. We have thirty-four knowledge base items — including twenty-four security and architecture rules — that generate sixty-six tool-specific artifacts in a single command. The system is backed by forty test files, and the CLI covers the full lifecycle: install, update, uninstall, validate, doctor, list, and shell completion.

### Slide: Maintenance Burden Reduced by Three X
- One update propagates to all three tools
- Schema validation catches errors before deploy
- Git history provides complete audit trail
- No manual synchronization required

**Narration:** The core win is straightforward: what used to require three separate updates now takes one. Schema validation using Zod catches misconfigurations before they ever reach a tool. Git provides the audit trail — who wrote the rule, who reviewed it, when it was approved. Manual synchronization is eliminated entirely.

### Slide: Security and Governance Built In
- Twelve security rules enforced across all tools
- Three architecture standards applied globally
- CODEOWNERS controls who can modify rules
- Every change is peer-reviewed via PR

**Narration:** Security governance is where this really shines. Twelve security rules — covering SQL injection, XSS prevention, secrets handling, input validation, and more — are automatically deployed to every AI tool in your workflow. Combined with CODEOWNERS and PR-based review, you get consistent security enforcement with a full paper trail.

## Section 5: Competitive Advantage
**Purpose:** Show why this approach beats alternatives.

### Slide: Why Not Just Maintain Files Manually
- Manual sync breaks silently at scale
- No validation, no schema contracts
- Version history scattered across tools
- Cost grows linearly with tool adoption

**Narration:** The obvious alternative is to just maintain each tool's config files by hand. This works until it doesn't — and it breaks silently. There's no validation to catch mistakes, no schema contract ensuring consistency. As you add more tools or more teams, the maintenance cost grows linearly. SATL keeps it constant.

### Slide: Why Not a Cloud Platform
- SATL is git-native with zero vendor lock-in
- Works fully offline with local processing
- Existing PR workflows handle governance
- Open architecture supports future tools

**Narration:** Cloud-based alternatives introduce vendor lock-in and require external connectivity. SATL lives entirely in your git repo — no external dependencies, no API keys, no subscription fees. Your existing PR and review workflows handle governance. And when the next AI coding tool arrives, adding an adapter is the only change needed.

## Section 6: What's Next
**Purpose:** Show the roadmap to build excitement and signal strategic thinking.

### Slide: MCP Server Adds Semantic Search
- Local embeddings for KB search
- AI tools query guidance in real time
- Context-aware rule recommendations
- No regeneration needed for lookups

**Narration:** The MCP server — already functional — adds semantic search over the knowledge base using local embeddings. Instead of just loading rules statically, AI tools can query the KB in real time based on what the developer is working on. This means the right guidance surfaces at the right moment without any manual lookup.

### Slide: Roadmap for Next Quarter
- Import workflow: capture good prompts back into KB
- Promotion pipeline: user rules flow to global
- Three more primitive types planned
- Quality vetting with automated conflict detection

**Narration:** Looking ahead, we're building an import workflow that captures effective prompts from any tool back into the knowledge base. A promotion pipeline will let rules flow from user scope up through team and global with review gates. We have three more primitive types planned — hooks, MCP definitions, and settings — plus automated quality vetting to detect conflicts and duplicates before they reach production.

## Key Takeaways
- SATL eliminates knowledge fragmentation by providing a single source of truth for AI tool guidance across Claude Code, Cursor, and Copilot.
- Thirty-four KB items generate sixty-six native artifacts today, with schema validation and git-based governance built in.
- The scope hierarchy balances global security enforcement with team and individual autonomy.

## Next Steps
- Schedule a demo to see SATL generate artifacts live from a single knowledge base item
- Identify two to three teams to pilot SATL adoption and measure maintenance time savings
- Review the twelve security rules with your security team for organizational alignment
- Connect with the team to discuss roadmap priorities and integration with your tooling strategy
