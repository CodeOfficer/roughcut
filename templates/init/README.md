# {{PROJECT_NAME}}

A [roughcut](https://github.com/codeofficer/roughcut) workspace.

## Getting Started

1. **Add your API keys** (optional — only needed for audio/image generation):

   ```bash
   # Edit .env and uncomment the keys you need
   ```

2. **Create a presentation:**

   ```bash
   roughcut create my-talk
   cd my-talk
   ```

3. **Build and preview:**

   ```bash
   roughcut build                    # HTML only (fast, free)
   roughcut dev                      # Preview in browser
   roughcut build --full             # Full build with audio + video
   ```

## Useful Commands

```bash
roughcut lint                       # Validate your markdown
roughcut doctor                     # Check prerequisites
roughcut voices                     # List available voices
```

## Learn More

- [Authoring Guide](./AUTHORING.md) — how to write presentations (start here)
- [Feature Reference](https://github.com/codeofficer/roughcut/blob/main/docs/FEATURES.md) — all 21 directives
- [Writing Best Practices](https://github.com/codeofficer/roughcut/blob/main/docs/TUTORIAL-WRITING-GUIDE.md) — content guidelines
