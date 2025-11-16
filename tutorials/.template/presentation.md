---
title: "Your Tutorial Title"
description: "Brief description of what this tutorial covers"
theme: black
voice: adam
resolution: 1920x1080
---

# Introduction

@duration: 5s
@pause-after: 2s
@background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
@transition: fade

Brief introduction to your topic

@audio: Welcome to this tutorial. In this guide, you'll learn about...

@image-prompt: A professional tutorial title slide with the topic name in large bold text. Include relevant icons or imagery. Clean, modern design with good contrast.

---

# Main Content

@duration: 10s
@pause-after: 2s
@background-color: #2c3e50
@transition: slide

## Key Concepts

- First concept @fragment
- Second concept @fragment
- Third concept @fragment

@audio: Let's dive into the main content. [1s] Here are the key concepts you need to understand.

@notes: Additional context or technical details for the presenter

---

# Example with Automation

@duration: 8s
@pause-after: 2s

Demonstrating the feature in action

@audio: Now let's see this in action. Watch as we demonstrate the key functionality.

@playwright: {
  "type": "action",
  "actions": [
    {
      "action": "goto",
      "url": "https://example.com",
      "waitUntil": "networkidle"
    },
    {
      "action": "click",
      "selector": "button.demo"
    }
  ]
}

---

# Conclusion

@duration: 5s
@pause-after: 2s
@background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)

## Summary

You've learned how to...

@audio: That's it! You now understand the key concepts and are ready to apply them in your own projects.

@image-prompt: A completion slide with "Tutorial Complete!" text and a summary. Positive, celebratory design with a checkmark or success icon.
