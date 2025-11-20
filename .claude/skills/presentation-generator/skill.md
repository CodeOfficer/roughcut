---
name: presentation-generator
description: Transform notes, outlines, or conversational descriptions into complete RevealJS presentations using GenAI Tutorial Factory's custom markdown format with 20 specialized directives. This skill should be used when the user wants to create a presentation or tutorial, has rough notes they want to turn into slides, or asks to generate presentation content on a topic. Triggers include requests like "create a presentation about X", "turn these notes into slides", "generate a tutorial on Y", or "make a slideshow about Z".
---

# Presentation Generator

## Overview

This skill transforms raw notes, bullet points, outlines, or conversational descriptions into complete, professionally-structured RevealJS presentations that follow the GenAI Tutorial Factory's custom markdown format.

**What this skill produces:**
- Complete `presentation.md` files with proper frontmatter
- Audio narration in multi-line format for TTS caching
- Realistic code samples for technical topics
- AI image generation prompts (`@image-prompt`)
- TODO markers for user-provided screenshots
- Diagram suggestions with descriptions
- Progressive disclosure using fragments
- Proper timing and pacing

**What makes this skill special:**
The GenAI Tutorial Factory uses a **custom markdown format** with 20 specialized directives (not standard markdown or RevealJS syntax). This skill is an expert in this custom format and ensures all generated presentations pass linting validation and build successfully.

## Workflow

**HIGH-LEVEL PROCESS:**
1. **Analyze** user input and propose structure
2. **Generate** presentation.md file (all at once or section-by-section)
3. **BUILD** the HTML presentation with `TUTORIAL=<name> npm run tutorial:html`
4. **Fix** any linting errors and rebuild until it passes
5. **Deliver** the working presentation to the user

**⚠️ CRITICAL:** You MUST build the HTML (step 3) before the user can view the presentation. Always run the build command after generating the markdown file.

### Phase 1: Input Analysis & Understanding

Accept input in any of these formats:

**Format 1: Raw notes/bullets**
```
Notes on Docker:
- Containerization platform
- Packages apps with dependencies
- Runs consistently everywhere
- Architecture: client-server
- Basic commands: pull, run, stop
```

**Format 2: Conversational description**
```
"Create a tutorial on building Claude agents. Cover how agents use tools,
how to define skills, MCP servers for integration, and include examples
like code review and testing."
```

**Format 3: Structured outline**
```
# Docker Tutorial Outline
## Introduction
- What is Docker
- Why use containers
## Architecture
- Docker daemon
- Docker client
- Container lifecycle
## Getting Started
- Installation
- First container
- Basic commands
```

**Action: Detect format and extract:**
1. Topic/title
2. Key concepts/sections
3. Target audience (infer from tone/complexity)
4. Desired style (tutorial vs conceptual vs demo)
5. Technical depth level

### Phase 2: Generate Outline

Create presentation structure following best practices:

**Structure guidelines:**
- **Title slide** (1 slide)
- **Introduction/Overview** (1-2 slides) - Hook + context
- **Main content sections** (3-7 slides per major topic)
  - Each section covers one major concept
  - Use vertical slides for deep-dives on complex topics
- **Conclusion/Summary** (1 slide) - Key takeaways

**Present outline to user:**
```
## Proposed Structure (15 slides)

**Section 1: Introduction** (2 slides)
1. Title slide - "Getting Started with Docker"
2. What is Docker? - Overview and benefits

**Section 2: Docker Architecture** (4 slides)
3. System overview
4. Docker daemon (vertical slide group)
   4a. └─ Client-server communication
   4b. └─ Container management
5. Image layers

**Section 3: Hands-On** (5 slides)
6. Installation
7. Your first container
8. Basic commands
9. Port mapping
10. Volume mounting

**Section 4: Best Practices** (3 slides)
11. Dockerfile structure
12. Image optimization
13. Security considerations

**Section 5: Conclusion** (1 slide)
14. Key takeaways

Does this structure work? Any sections to add/remove/modify?
```

**Wait for user approval/feedback before proceeding.**

### Phase 3: Generate Content Section-by-Section

For each section, generate slides following the custom markdown format.

**CRITICAL FORMATTING RULES (Apply to EVERY slide):**
1. ✅ **Headers:** 3-5 words (8 word absolute maximum)
2. ✅ **Bullets:** 3-4 per slide (5 maximum), 5-8 words each (10 maximum)
3. ✅ **NO TABLES** - Always use bullet lists or split across slides
4. ✅ **One idea per slide** - Split crowded content into multiple slides
5. ✅ **DO NOT use customStyles** - The linter doesn't support multiline YAML (the `|` pipe syntax)

**Iterative refinement:**
1. Generate 3-5 slides for a section
2. **Self-check:** Verify each slide meets formatting rules above
3. Show to user for review
4. User approves or requests changes
5. Apply feedback and continue
6. Move to next section

This ensures quality and alignment with user expectations without generating everything upfront.

## Custom Markdown Format

### Required Frontmatter

Every presentation MUST start with YAML frontmatter:

```yaml
---
title: "Presentation Title"              # REQUIRED
theme: dracula                           # REQUIRED (see valid themes below)
voice: adam                              # Optional: ElevenLabs voice ID
resolution: 1920x1080                    # Optional: video resolution
preset: manual-presentation              # Optional: config preset
config:                                  # Optional: RevealJS config
  controls: true
  progress: true
  slideNumber: 'c/t'
customCSS: ./styles/custom.css           # Optional: external CSS file
customStyles: |                          # Optional: inline CSS
  .reveal h1 { color: #ff0; }
---
```

**Valid themes (12 options):**
`black`, `white`, `league`, `beige`, `sky`, `night`, `serif`, `simple`, `solarized`, `blood`, `moon`, `dracula`

**Valid presets (4 options):**
- `video-recording` - For final video output (no controls)
- `manual-presentation` - For live presenting (full controls)
- `auto-demo` - For auto-advance demos
- `speaker-mode` - For speaker view with notes

**Default choices for skill:**
- Theme: `dracula` (code-friendly) or `sky` (professional)
- Preset: `manual-presentation` (good for iteration)

**IMPORTANT:** Do NOT use `customStyles` in frontmatter. The linter currently doesn't support multiline YAML syntax (`|` pipe). If custom CSS is needed, use `customCSS: ./styles/custom.css` and create an external file instead.

### The 20 Directives

#### Frontmatter Directives (8)
Defined in YAML frontmatter (shown above):
1. `title` - REQUIRED
2. `theme` - REQUIRED
3. `voice` - Optional
4. `resolution` - Optional
5. `preset` - Optional
6. `config` - Optional
7. `customCSS` - Optional
8. `customStyles` - Optional

#### Slide-Level Directives (11)

1. **`@audio:`** - Narration text (multi-line format RECOMMENDED)
```markdown
@audio: First sentence establishes context.
@audio: Second sentence provides detail.
@audio: Third sentence adds nuance.
```

Benefits of multi-line:
- One sentence per line (readable)
- Better git diffs
- Automatic 1s pauses between lines
- Granular TTS caching (only regenerate changed lines)

Pause markers within audio:
```markdown
@audio: Welcome to the tutorial. [1s] Today we'll cover three topics.
```

2. **`@duration:`** - Slide display time if no audio
```markdown
@duration: 5s
@duration: 2.5s
@duration: 1500ms
```
Format: Must end with `s` (seconds) or `ms` (milliseconds). Supports decimals.

3. **`@pause-after:`** - Pause after audio/content before advancing
```markdown
@pause-after: 2s
```
Default: 1s

4. **`@transition:`** - Transition effect for this slide
```markdown
@transition: fade
```
Valid options: `none`, `fade`, `slide`, `convex`, `concave`, `zoom`

5. **`@background:`** - Slide background (color/gradient/image)
```markdown
@background: #1a1a2e
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@background: ./screenshot.png
```

6. **`@image-prompt:`** - AI image generation with Gemini
```markdown
@image-prompt: A futuristic holographic interface displaying code and data visualizations, cyberpunk aesthetic with neon blues and purples
```
**Tips for good prompts:**
- Be specific about style and mood
- Mention key visual elements
- Specify composition (wide shot, close-up, etc.)
- Use descriptive adjectives
- Consider "modern tech illustration style with blue/purple gradient" for technical topics

7. **`@notes:`** - Speaker notes (press 'S' to view)
```markdown
@notes: Remember to emphasize this point. Mention the example from last week.
```

8. **`@playwright:`** - Browser automation instructions (advanced)
```markdown
@playwright: Click the "Start" button and wait for animation
```

9. **`@vertical-slide:`** - Create vertical slide groups (2D navigation)
```markdown
# Main Topic

Overview content

@vertical-slide:

## Sub-topic A

Details...

@vertical-slide:

## Sub-topic B

More details...
```
Navigation: RIGHT arrow = next horizontal slide, DOWN arrow = next vertical slide

10. **`@background-video:`** - Video background
```markdown
@background-video: ./demo-video.mp4
```

11. **`@background-video-loop:`** / **`@background-video-muted:`** - Video controls
```markdown
@background-video: ./demo.mp4
@background-video-loop: true
@background-video-muted: true
```

#### Inline Directive (1)

12. **`@fragment`** - Progressive reveal for list items

**CRITICAL RULE:** Only works on BULLET lists (-, *, +), NOT numbered lists!

```markdown
# Progressive Reveal

- First point @fragment
- Second point @fragment
- Third point @fragment +1s    # Reveal 1 second after previous
- Fourth point @fragment +2s   # Reveal 2 seconds after previous
```

**WRONG - Don't do this:**
```markdown
1. First item @fragment         # ❌ LINTING ERROR - fragments don't work on numbered lists
2. Second item @fragment        # ❌ LINTING ERROR
```

## Content Generation Guidelines

### Slide Structure Best Practices

**CRITICAL TEXT LIMITS (MUST FOLLOW):**
- **Slide title:** 3-5 words ideal, 8 words ABSOLUTE MAX
- **Bullet point:** 5-8 words ideal, 10 words ABSOLUTE MAX
- **Bullets per slide:** 3-4 items ideal, 5 items ABSOLUTE MAX
- **Body paragraph:** 1-2 sentences ideal, 3 sentences ABSOLUTE MAX

**Forbidden elements:**
- ❌ **NO TABLES** - Tables don't render well in RevealJS. Always convert to bullet lists or split across multiple slides
- ❌ **NO LONG HEADERS** - Headers should be 3-5 words maximum
- ❌ **NO DENSE PARAGRAPHS** - If you need more than 3 sentences, use bullets or split into multiple slides

**One idea per slide principle:**
If a slide feels crowded, split it into multiple slides. It's better to have 20 clear slides than 10 cramped ones.

**Examples of good vs bad:**

❌ **BAD - Too much content:**
```markdown
# Initiative Status Summary and Next Steps

| Initiative | Status | Next Action |
|------------|--------|-------------|
| Claude | Contract finalized | Begin Phase 1 rollout |
| Cursor | Pilot pending | Cancel existing plan |
```

✅ **GOOD - Clear and concise:**
```markdown
# Summary

**Claude:**
- Status: Contract finalized
- Next: Phase 1 rollout

---

# Summary (continued)

**Cursor:**
- Status: Pilot pending
- Next: Cancel existing plan
```

### Audio Narration Patterns

**Basic pattern (2-4 sentences per slide):**
```markdown
@audio: Opening sentence establishes context.
@audio: Second sentence provides key detail.
@audio: Third sentence adds depth or nuance.
@audio: Final sentence transitions or reinforces.
```

**With fragment reveals:**
```markdown
@audio: Let's explore these concepts step by step.
@audio: First comes the foundation.
@audio: Then we build the implementation.
@audio: Finally we see the results.

- Foundation @fragment
- Implementation @fragment +1s
- Results @fragment +2s
```

**Timing guideline:**
- 8-12 seconds per slide (adjust based on content density)
- Match fragment timing to narration flow
- Add pause markers `[1s]` for emphasis or dramatic effect

### Code Sample Generation

When generating code for technical topics:

**1. Keep it concise (<15 lines)**
```python
# Good - focused example
def greet(name: str) -> str:
    """Return a personalized greeting."""
    return f"Hello, {name}!"

# Usage
message = greet("Alice")
print(message)  # Output: Hello, Alice!
```

**2. Include explanatory comments**
```python
# Initialize the Docker client
client = docker.from_env()

# Pull the nginx image (if not already present)
image = client.images.pull('nginx:latest')

# Run container with port mapping
container = client.containers.run(
    'nginx:latest',
    ports={'80/tcp': 8080},  # Map container port 80 to host 8080
    detach=True              # Run in background
)
```

**3. Use realistic variable names and structure**
```javascript
// ❌ Bad: unclear names
const x = document.querySelector('.btn');
x.addEventListener('click', () => { doStuff(); });

// ✅ Good: clear, descriptive names
const submitButton = document.querySelector('.submit-btn');
submitButton.addEventListener('click', () => {
  validateAndSubmitForm();
});
```

**4. Match the topic's language/framework**
- Docker tutorial → Bash/Python with docker commands
- Web development → JavaScript/HTML
- Data science → Python with pandas/numpy
- Cloud → CLI commands with explanations

### Asset Placeholder Generation

#### AI Image Prompts (@image-prompt)

Generate for:
- Conceptual slides (architecture, workflows, processes)
- Section dividers (visual breaks between topics)
- Abstract concepts (cloud computing, AI, security)
- Title/conclusion slides (engaging visuals)

**Good image prompt structure:**
```markdown
@image-prompt: [SUBJECT] [doing/showing WHAT] [in SETTING/STYLE]. [MOOD/AESTHETIC].
```

**Examples:**
```markdown
# Cloud Architecture
@image-prompt: Diagram showing cloud infrastructure with servers, load balancers, and databases connected by network lines. Modern tech illustration style with blue/purple gradient, clean and professional.

# Security Concepts
@image-prompt: Shield icon with binary code flowing around it, representing cybersecurity. Dark background with neon blue and green accents, tech-focused aesthetic.

# Conclusion
@image-prompt: Success celebration with checkmarks and stars, representing completion and achievement. Bright, energetic colors with yellow and orange gradient.
```

#### Screenshot TODOs

Add comments for slides that need user-provided screenshots:

```markdown
# User Interface Overview

<!-- TODO: Add screenshot of the main dashboard showing navigation panel and data grid -->
![Dashboard Screenshot](./screenshots/dashboard.png)

@notes: Walk through each section of the interface from left to right
```

#### Diagram Suggestions

Use `@notes:` to suggest diagrams:

```markdown
# System Architecture

@notes: Suggested diagram - Architecture showing request flow through load balancer, application servers, and database with caching layer. Include arrows showing data flow and labels for each component.

**Key components:**
- Load balancer distributes traffic
- Application servers process requests
- Redis cache reduces database load
- PostgreSQL stores persistent data
```

## Validation & Quality Checks

Before returning generated markdown, verify:

### Required Elements
- ✅ Frontmatter has `title` and `theme`
- ✅ **DO NOT include `customStyles`** - The linter doesn't support multiline YAML
- ✅ All directives use correct syntax
- ✅ Theme is one of the 12 valid options
- ✅ Transitions are one of 6 valid options
- ✅ Duration/pause formats end with `s` or `ms`
- ✅ Fragments ONLY on bullet lists (never numbered lists)
- ✅ Audio narration present for all main content slides
- ✅ Asset references use relative paths (./filename.ext)

### Content Quality
- ✅ 5-7 slides per major topic
- ✅ **CRITICAL:** Max 5 bullets per slide (prefer 3-4)
- ✅ **CRITICAL:** Max 10 words per bullet (prefer 5-8)
- ✅ **CRITICAL:** Slide titles are 3-5 words (8 max)
- ✅ **CRITICAL:** NO TABLES - use bullet lists instead
- ✅ One idea per slide
- ✅ Clear progression from intro to conclusion
- ✅ Proper timing and pacing

### Common Errors to Avoid

**1. Fragments on numbered lists**
```markdown
# ❌ WRONG
1. First item @fragment     # Linting error!
2. Second item @fragment    # Linting error!

# ✅ CORRECT
- First item @fragment
- Second item @fragment
```

**2. Invalid duration format**
```markdown
# ❌ WRONG
@duration: 5 seconds
@duration: 5
@duration: five seconds

# ✅ CORRECT
@duration: 5s
@duration: 2.5s
@duration: 1500ms
```

**3. Invalid theme**
```markdown
# ❌ WRONG
theme: dark
theme: Dark
theme: custom

# ✅ CORRECT
theme: black
theme: dracula
theme: sky
```

**4. Pause markers outside @audio:**
```markdown
# ❌ WRONG
This text has a pause [1s] in it.

# ✅ CORRECT
@audio: This narration has a pause [1s] in it.
```

**5. Too much content per slide**
```markdown
# ❌ WRONG - Way too much text
- This bullet point goes on and on explaining multiple concepts and sub-topics in extensive detail that should really be split across several slides
```

**6. Using tables (forbidden)**
```markdown
# ❌ WRONG - Tables don't render well
| Initiative | Status | Next Action |
|------------|--------|-------------|
| Claude | Contract finalized | Begin Phase 1 rollout |
| Cursor | Pilot pending | Cancel existing plan |

# ✅ CORRECT - Use bullets or multiple slides
**Claude:**
- Status: Contract finalized
- Next: Phase 1 rollout

**Cursor:**
- Status: Pilot pending
- Next: Cancel existing plan
```

**7. Headers that are too long**
```markdown
# ❌ WRONG - Header is way too long
# LENS PRO: CURRENT STATUS

# ❌ WRONG - Still too long
# Summary & Next Steps

# ✅ CORRECT - Short and clear
# Lens Pro Status

# ✅ CORRECT - Even shorter
# Next Steps
```

## Example Transformations

### Example 1: Technical Tutorial

**User Input:**
```
Create a tutorial on Docker basics for developers. Cover:
- What Docker is
- Why use containers
- Installation
- Running first container
- Basic commands
```

**Generated Output:**
```yaml
---
title: "Docker Basics for Developers"
theme: dracula
preset: manual-presentation
---

# Docker Basics for Developers

@transition: zoom
@background: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)
@pause-after: 2s

@audio: Welcome to Docker Basics for Developers.
@audio: In the next few minutes, you'll learn everything you need to get started with containers.

**From zero to running containers**

---

# What is Docker?

@duration: 10s
@pause-after: 2s

@audio: Docker is a containerization platform.
@audio: It packages your application with all its dependencies into a container.
@audio: This ensures your app runs consistently across any environment.

- 📦 **Containerization platform** @fragment
- 🔧 **Packages apps + dependencies** @fragment
- ✅ **Runs consistently everywhere** @fragment
- 🚀 **Lightweight and fast** @fragment

---

# Why Use Containers?

@duration: 12s
@transition: fade

@audio: Containers solve the classic works on my machine problem.
@audio: They eliminate environment inconsistencies and streamline deployment.

**Benefits:**

- No more "works on my machine" issues
- Consistent dev, test, and production environments
- Fast startup times (seconds, not minutes)
- Efficient resource usage

---

# Docker Architecture

@image-prompt: Diagram showing Docker architecture with client, daemon, and containers. Include labeled boxes for Docker Client, Docker Daemon (dockerd), and Container instances. Modern tech illustration style with blue/purple gradient.

@duration: 12s

@audio: Docker uses a client-server architecture.
@audio: The Docker client talks to the Docker daemon.
@audio: The daemon handles building, running, and managing your containers.

---

# Installation

@vertical-slide:

## macOS Installation

```bash
# Install using Homebrew
brew install --cask docker

# Or download Docker Desktop from docker.com
# Follow the installation wizard
```

@audio: On macOS, install Docker using Homebrew.
@audio: Or download Docker Desktop from docker dot com.

@vertical-slide:

## Linux Installation

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
```

@audio: On Linux, use the official installation script.
@audio: Then verify with docker dash dash version.

---

# Your First Container

@duration: 15s
@pause-after: 3s

@audio: Let's run your first container using nginx.
@audio: First, we pull the image from Docker Hub.
@audio: Then we run it, mapping port eighty to your local machine.

```bash
# Pull the nginx image
docker pull nginx

# Run the container
docker run -d -p 8080:80 nginx

# Visit http://localhost:8080 in your browser!
```

<!-- TODO: Add screenshot of nginx welcome page in browser -->
![Nginx Running](./screenshots/nginx-browser.png)

---

# Basic Commands

@duration: 12s

@audio: Here are the essential commands you'll use every day.
@audio: List containers, stop them, view logs, and clean up.

**Essential commands:**

- `docker ps` - List running containers @fragment
- `docker ps -a` - List all containers @fragment
- `docker stop <id>` - Stop a container @fragment +1s
- `docker logs <id>` - View container logs @fragment +1s
- `docker rm <id>` - Remove a container @fragment +2s

---

# Key Takeaways

@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@transition: zoom
@pause-after: 2s

@audio: You now understand Docker basics.
@audio: Start with official images and practice with simple examples.
@audio: The more you experiment, the more comfortable you'll become.

**What you learned:**

- ✅ Docker packages apps + dependencies
- ✅ Containers ensure consistency
- ✅ Basic commands to run and manage containers
- ✅ Ready to start containerizing your apps

---

# Next Steps

@duration: 8s

@audio: Ready to dive deeper?
@audio: Explore Dockerfiles, compose multi-container apps, and learn best practices.

**Continue learning:**

- 📚 Create Dockerfiles for your apps
- 🏗️ Use Docker Compose for multi-container setups
- 🔒 Learn security best practices
- ☁️ Deploy containers to production

@notes: Point students to official Docker documentation and interactive tutorials at docker.com/get-started
```

### Example 2: Conceptual Presentation

**User Input:**
```
I need a presentation explaining microservices architecture.
Cover what they are, benefits, challenges, and when to use them.
```

**Generated Output:**
```yaml
---
title: "Understanding Microservices Architecture"
theme: sky
preset: manual-presentation
---

# Understanding Microservices Architecture

@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@transition: fade
@pause-after: 2s

@audio: Today we'll explore microservices architecture.
@audio: We'll cover what it is, its benefits and challenges, and when you should use it.

**From monoliths to microservices**

---

# What are Microservices?

@duration: 12s
@image-prompt: Abstract visualization of microservices showing multiple small interconnected service boxes communicating with each other. Modern tech aesthetic with network lines connecting colorful service nodes.

@audio: Microservices are an architectural style.
@audio: Applications are built as a collection of small, independent services.
@audio: Each service runs its own process and communicates via well-defined APIs.

---

# Microservices vs Monolith

@duration: 14s
@transition: convex

@audio: Traditional applications are built as monoliths - single, unified codebases.
@audio: Microservices break this apart into smaller, focused services.

**Monolith:**
- Single codebase
- Deployed as one unit
- Shared database
- Tightly coupled

**Microservices:**
- Multiple services @fragment
- Independently deployable @fragment
- Service-specific databases @fragment
- Loosely coupled @fragment

---

# Benefits

@duration: 15s

@audio: Microservices offer several key advantages.
@audio: Each service can be developed, deployed, and scaled independently.
@audio: Teams can work autonomously, choosing the best tech for each service.

- **Scalability** - Scale services independently @fragment
- **Flexibility** - Use different technologies per service @fragment
- **Resilience** - Failures isolated to individual services @fragment
- **Team Autonomy** - Small teams own complete services @fragment
- **Faster Deployment** - Deploy services independently @fragment

---

# Challenges

@duration: 16s
@transition: fade

@audio: But microservices come with significant challenges.
@audio: Distributed systems are complex, requiring sophisticated infrastructure.
@audio: You'll need to handle service discovery, load balancing, and monitoring.

**Technical complexity:**

- Distributed system complexity
- Network latency and failures
- Data consistency across services
- Service discovery and communication
- Monitoring and debugging

---

# When to Use Microservices

@vertical-slide:

## Good Fit ✅

@duration: 12s

@audio: Microservices work well for large, complex applications.
@audio: Especially when multiple teams need to work independently.

- Large, complex applications
- Multiple development teams
- Need independent scaling
- Different tech requirements per feature
- High availability requirements

@vertical-slide:

## Not a Good Fit ❌

@duration: 12s

@audio: For small applications or small teams, microservices add unnecessary complexity.
@audio: Start with a monolith and evolve to microservices when needed.

- Small applications
- Small teams (< 10 developers)
- Simple business domain
- Limited DevOps capacity
- Early-stage startups

---

# Key Considerations

@image-prompt: Decision tree diagram showing factors to consider when choosing microservices vs monolith architecture. Modern infographic style with yes/no paths.

@duration: 14s

@audio: Before adopting microservices, evaluate your team's capabilities.
@audio: You'll need strong DevOps practices, monitoring tools, and a clear domain model.

**Prerequisites:**

- Strong DevOps culture
- Container orchestration (Kubernetes, etc.)
- Comprehensive monitoring/logging
- Well-defined service boundaries
- API gateway and service mesh

@notes: Emphasize that microservices are not a silver bullet - they solve specific problems but introduce new ones

---

# Key Takeaways

@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@transition: zoom
@pause-after: 2s

@audio: Microservices are powerful but complex.
@audio: Evaluate your needs carefully before adopting this architecture.
@audio: Start simple and evolve your architecture as your needs grow.

**Remember:**

- ✅ Microservices enable scale and flexibility
- ⚠️ They add significant complexity
- 🎯 Use them when benefits outweigh costs
- 📈 Start simple, evolve gradually
```

## Resources

### references/

This skill includes comprehensive reference documentation:

**`references/directive-reference.md`**
- Complete list of all 20 directives
- Detailed syntax and validation rules
- Common errors and how to avoid them
- Quick reference for all valid values (themes, transitions, presets)

**`references/linting-rules.md`**
- All validation rules explained
- Error message examples with solutions
- Levenshtein distance typo detection
- Best practices for passing linting

Load these references when:
- User asks specific questions about directive syntax
- Generating complex presentations with many directives
- Debugging validation errors
- Need to verify allowed values for enums

### assets/

**`assets/template-minimal.md`**
- Minimal starter template (5 slides)
- Basic structure demonstration
- Good for quick, simple presentations

**`assets/template-comprehensive.md`**
- Full-featured template (15 slides)
- Demonstrates all major directives
- Good for complex, feature-rich presentations

**`assets/template-tutorial.md`**
- Tutorial/instructional format
- Code-heavy with examples
- Good for technical how-to content

Use these templates as starting points when generating presentations. Copy structure and adapt to user's specific topic.

## Tips for Success

1. **Always start with outline approval** - Don't generate full content before user sees structure
2. **Use multi-line audio format** - Better for caching and readability
3. **Match technical depth to audience** - Infer from input tone/complexity
4. **Generate realistic code** - Include comments, proper naming, runnable examples
5. **Add visual elements** - Use @image-prompt for key conceptual slides
6. **Follow the one-idea-per-slide principle** - Split crowded slides
7. **Validate before returning** - Check all directive syntax and values
8. **Provide testing instructions** - Tell user to run `TUTORIAL=name npm run dev`

## Common Questions

**Q: What if user wants more slides after generation?**
A: Ask where to insert new slides, generate them following existing style, show for approval.

**Q: What if linting fails on generated output?**
A: This shouldn't happen if following guidelines, but if it does: read error, fix syntax, regenerate that section.

**Q: How to handle complex code examples?**
A: Keep <15 lines per slide. Split long examples across multiple slides with explanatory text.

**Q: What if user provides Obsidian links [[like-this]]?**
A: Ask user to paste relevant content from linked notes, or reference them in @notes as external resources.

**Q: Should I generate actual presentation.md file?**
A: Yes, write complete file to `tutorials/<name>/presentation.md` where `<name>` is derived from title (lowercase, hyphenated).

## CRITICAL: Always Build After Generation

**MANDATORY STEP:** After writing the `presentation.md` file, you MUST build the HTML presentation so the user can view it. The user cannot view the presentation until you build it.

**Always run this command after generating a presentation:**

```bash
TUTORIAL=<name> npm run tutorial:html
```

This command:
1. ✅ Validates the markdown passes linting (catches errors immediately)
2. ✅ Generates the HTML presentation
3. ✅ Does NOT cost API credits (no AI image/audio generation)
4. ✅ Allows user to preview the presentation immediately

**If linting fails:**
1. Read the error messages carefully
2. Fix the syntax errors in the presentation.md
3. Run the build command again
4. Repeat until it passes

**Common linting errors to watch for:**
- Using `customStyles` with multiline YAML (`|` pipe) - NOT SUPPORTED
- Fragments on numbered lists - Only works on bullet lists
- Invalid duration format - Must end with `s` or `ms`
- Invalid theme name - Must be one of 12 valid themes
- Missing required frontmatter fields - `title` and `theme` are required

## Next Steps After Generation

Once the HTML build succeeds, tell the user:

```bash
# 1. Review generated presentation in dev mode
TUTORIAL=<name> npm run dev

# 2. Iterate on content if needed
# Edit presentation.md, refresh browser

# 3. Test auto-advance
TUTORIAL=<name> npm run dev:auto

# 4. Generate final output (costs API credits!)
TUTORIAL=<name> npm run tutorial:full
```
