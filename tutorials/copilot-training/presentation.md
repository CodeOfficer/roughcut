---
title: "Advanced GitHub Copilot"
theme: dracula
preset: manual-presentation
---

# Advanced GitHub Copilot

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@pause-after: 2s

@audio: Welcome to Advanced GitHub Copilot techniques for enterprise developers.
@audio: Today we'll explore practical features you can start using immediately.
@audio: This training is based on insights from Rob, a former Microsoft developer.

**Enterprise Developer Training**

---

# What You'll Learn

@duration: 10s

@audio: In the next fifteen minutes, you'll learn five key areas.
@audio: Advanced prompting, VS Code customization, security reviews, team collaboration, and model management.

- 🎯 **Advanced prompting techniques** @fragment
- ⚙️ **VS Code customization** @fragment
- 🔒 **Security code reviews** @fragment
- 👥 **Team collaboration** @fragment
- 🤖 **AI model management** @fragment

---

# Meta-Prompting Strategy

@duration: 12s

@audio: Meta-prompting instructs Copilot to think about its own thinking process.
@audio: This leads to more structured and comprehensive responses.
@audio: Use it for complex architectural decisions.

**Technique: Ask Copilot to explain its reasoning**

```
"Before implementing this feature, outline:
1. Three possible approaches
2. Pros and cons of each
3. Your recommended approach and why"
```

@notes: Demonstrate this live with a real example from the codebase

---

# Prompt Chaining

@duration: 12s

@audio: Prompt chaining connects multiple prompts together.
@audio: The output of one prompt becomes input for the next.
@audio: This enables complex multi-step problem solving.

**Example workflow:**

- Step 1: "Analyze this function's complexity" @fragment
- Step 2: "Based on that analysis, suggest refactoring" @fragment +1s
- Step 3: "Generate unit tests for the refactored code" @fragment +1s

@notes: Show example of chaining prompts to refactor a complex function

---

# Saved Prompts Library

@duration: 11s
@image-prompt: Screenshot-style visualization of a organized library with labeled folders containing reusable prompt templates, modern UI design with purple and blue accents

@audio: Save your best prompts for reuse across projects.
@audio: Build a personal library of proven patterns.
@audio: This ensures consistency and saves time.

**Build your library:**

- Code review prompts
- Refactoring patterns
- Security analysis queries
- Documentation generators

---

# Context Management

@duration: 13s

@audio: Control what information Copilot sees with explicit versus implicit context.
@audio: Explicit context is what you deliberately provide.
@audio: Implicit context comes from your workspace automatically.

**Two types of context:**

- **Explicit** - Files you @-mention @fragment
- **Implicit** - Open files and workspace @fragment
- **Best practice** - Be explicit for precision @fragment

```
// Explicit context
@workspace /src/auth "How does authentication work?"
```

---

# Slash Commands & Variables

@duration: 12s

@audio: Slash commands provide shortcuts to common operations.
@audio: Variables inject dynamic content into your prompts.
@audio: These features speed up repetitive tasks significantly.

**Powerful shortcuts:**

- `/explain` - Explain selected code @fragment
- `/fix` - Fix issues in code @fragment
- `/tests` - Generate test cases @fragment
- `#file`, `#selection`, `#editor` - Context variables @fragment

@notes: Demo /explain on a complex function and /tests for a component

---

# Security Personas

@duration: 13s
@image-prompt: Abstract representation of AI security analysis showing a shield icon with code scanning rays, cybersecurity aesthetic with blue and purple tones

@audio: Create specialized security personas for code reviews.
@audio: Each persona focuses on a specific security domain.
@audio: This provides comprehensive security coverage.

**Security review types:**

- Web application security (XSS, CSRF, injection)
- Infrastructure security (secrets, permissions)
- Data protection (PII, encryption)
- API security (authentication, rate limiting)

---

# Categorization System

@duration: 12s

@audio: Categorize security findings by severity for clear prioritization.
@audio: Critical issues need immediate attention.
@audio: Warnings should be addressed soon, and info items are improvements.

**Three severity levels:**

- 🔴 **Critical** - Immediate security risk @fragment
- 🟡 **Warning** - Should fix in next release @fragment
- 🔵 **Info** - Best practice improvements @fragment

```
// Critical: SQL injection vulnerability
// Warning: Missing input validation
// Info: Consider using prepared statements
```

---

# Stored Prompts in Repos

@duration: 12s

@audio: Store team prompts directly in your repository.
@audio: Use the dot github directory for version control.
@audio: This keeps prompts synchronized with your code.

**Repository structure:**

```
.github/
  copilot/
    prompts/
      code-review.md
      security-check.md
      refactoring.md
    policies/
      style-guide.md
```

@notes: Show example of .github/copilot structure in a real repo

---

# Team Standardization

@duration: 11s

@audio: Establish team-wide standards for AI-assisted development.
@audio: Share prompt libraries and security policies.
@audio: This ensures consistency across your entire team.

**Standardization strategies:**

- Shared prompt templates @fragment
- Common security policies @fragment
- Code review guidelines @fragment
- Documentation standards @fragment

---

# AI Model Management

@duration: 12s

@audio: Switch between different AI models based on your task.
@audio: Use Claude Sonnet for complex reasoning and Gemini for code generation.
@audio: You can even run prompts in parallel for comprehensive analysis.

**Multi-model strategy:**

- **Claude Sonnet** - Complex reasoning, architecture @fragment
- **Gemini** - Fast code generation @fragment
- **Parallel execution** - Compare multiple approaches @fragment

@notes: Demo switching models in VS Code settings

---

# Key Takeaways

@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@transition: zoom
@pause-after: 2s

@audio: You now have practical techniques to enhance your Copilot workflow.
@audio: Start with saved prompts and security personas today.
@audio: Gradually adopt team standardization and multi-model strategies.

**Start using today:**

- ✅ Save your best prompts
- ✅ Set up security personas
- ✅ Use slash commands and variables
- ✅ Store team prompts in repos
- ✅ Experiment with different models

@notes: Open for questions. Encourage experimentation and sharing learnings with the team.
