---
title: "Comprehensive Template"
theme: dracula
voice: adam
resolution: 1920x1080
preset: manual-presentation
---

# Presentation Title

@transition: zoom
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@pause-after: 2s

@audio: Welcome to this presentation.
@audio: Today we'll explore key concepts in depth.

**A subtitle or tagline**

---

# Overview

@duration: 10s
@transition: fade

@audio: Here's what we'll cover today.
@audio: Each section builds on the previous one.

- Topic One @fragment
- Topic Two @fragment
- Topic Three @fragment
- Conclusion @fragment

---

# Section 1: Topic One

@background: #1a1a2e
@transition: fade

@audio: Let's start with the first topic.
@audio: This is a fundamental concept to understand.

**Key points:**

- Important point one
- Important point two
- Important point three

---

# With AI-Generated Image

@transition: fade
@image-prompt: Modern tech visualization with connected nodes and data flowing between them. Blue and purple gradient, professional aesthetic.
@duration: 12s

@audio: Visual aids help convey complex concepts.
@audio: This image was generated automatically using AI.

---

# Code Example

@transition: fade
@duration: 15s

@audio: Here's how you implement this in practice.
@audio: Notice the use of proper naming and error handling.

```python
def process_data(items: list) -> dict:
    """Process data and return results."""
    try:
        result = [item * 2 for item in items]
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

---

# Vertical Slide Groups

@transition: fade
@audio: Some topics require deeper exploration.
@audio: Use vertical slides for related content.

**Main concept overview**

@vertical-slide:

## Detail Level 1

@duration: 10s

@audio: First level of detail.

- Sub-point A
- Sub-point B

@vertical-slide:

## Detail Level 2

@duration: 10s

@audio: Second level of detail.

- Sub-point C
- Sub-point D

---

# Fragment Timing Control

@transition: fade
@duration: 12s

@audio: Fragments can have custom timing.
@audio: This syncs reveals with your narration perfectly.

**Advanced features:**

- Basic fragments @fragment
- Timed reveals @fragment +1s
- Build complex animations @fragment +2s
- Perfect synchronization @fragment +3s

---

# Multiple Backgrounds

@background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
@transition: convex

@audio: Backgrounds create visual interest and section breaks.

**Section Two begins here**

---

# Key Takeaways

@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)
@transition: fade
@pause-after: 2s

@audio: You now understand the core concepts.
@audio: Practice these techniques to build mastery.

**What you learned:**

- ✅ Core concept one
- ✅ Core concept two
- ✅ Core concept three
- ✅ How to apply these ideas

---

# Next Steps

@transition: fade
@duration: 8s

@audio: Ready to continue learning?
@audio: Here are some resources to explore next.

**Continue your journey:**

- 📚 Read the documentation
- 🏗️ Build a practice project
- 🤝 Join the community
- 🚀 Share your work

@notes: Point audience to specific resources and community channels
