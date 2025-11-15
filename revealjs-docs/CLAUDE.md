# 🤖 Resume: RevealJS Documentation Extraction

## Quick Start for New Session

You are continuing a documentation extraction project. **Start here:**

### 1. Read the Plan & Status
```
📁 docs/00-EXTRACTION-GUIDE.md  ← Read this FIRST (complete process guide)
📁 docs/00-STATUS.md            ← Current progress (10/40 files done)
📋 Todo List                     ← Check todos (32 tasks remaining)
```

### 2. Current State
- **Progress**: 10 of ~40 files completed (25%)
- **Next task**: Extract `07-markdown.md` from `/en/markdown.html`
- **Location**: Working in `/Users/rjones/auditboard/revealjs-docs/revealjs.com/`

### 3. What You're Doing
Extracting reveal.js documentation from HTML files into LLM-friendly markdown files for a markdown-driven presentation builder that uses:
- RevealJS for presentations
- ElevenLabs TTS for narration
- Playwright for video recording
- Custom `@directive:` syntax

### 4. Critical Requirement
**Document EXACT DOM structure** - The user's HTML generator must follow RevealJS structure precisely.

### 5. Completed Examples
Look at these for reference:
- `docs/04-initialization.md` - DOM structure requirements
- `docs/13-fragments.md` - Directive mapping example
- `docs/22-auto-slide.md` - Timing documentation example
- `docs/08-backgrounds.md` - Attribute reference example

### 6. Resume Work
```bash
# 1. Check todo list
/todos

# 2. Read next HTML file (markdown.html)
Read: /Users/rjones/auditboard/revealjs-docs/revealjs.com/en/markdown.html

# 3. Follow template in 00-EXTRACTION-GUIDE.md

# 4. Create markdown file with DOM structure emphasis

# 5. Update todos, repeat
```

---

## File Locations

- **Source HTML**: `./en/*.html` (41 files)
- **Output Docs**: `./docs/*.md` (10 completed, 31 remaining)
- **Guides**: `./docs/00-*.md`

## Key Files to Reference

| File | Purpose |
|------|---------|
| `docs/00-EXTRACTION-GUIDE.md` | Complete extraction process, templates |
| `docs/00-STATUS.md` | Progress tracking, what's done/remaining |
| Todo List | Detailed task descriptions with file paths |

## Quality Checklist (for each file)

- [ ] YAML front matter with category & directives
- [ ] **Exact DOM structure examples**
- [ ] Attribute reference tables
- [ ] Code examples preserved
- [ ] Project-specific integration notes at end
- [ ] Timing/duration info for video sync
- [ ] Validation requirements

## Important Notes

1. **Emphasize DOM structure** - User said: "it will be important to capture the dom structure that reveal wants"
2. **No information loss** - Extract ALL technical details
3. **Follow established patterns** - See completed files for examples
4. **Update todos** - Mark tasks complete as you go

---

**Ready to continue?** Read `docs/00-EXTRACTION-GUIDE.md` first, then check the todo list! 🚀
