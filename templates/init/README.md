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
   roughcut build -i presentation.md          # HTML only (fast, free)
   roughcut dev -i presentation.md             # Preview in browser
   roughcut build -i presentation.md --full    # Full build with audio + video
   ```

## Useful Commands

```bash
roughcut lint presentation.md    # Validate your markdown
roughcut doctor                  # Check prerequisites
roughcut voices                  # List available voices
```

## Learn More

- [Writing Guide](https://github.com/codeofficer/roughcut/blob/main/docs/TUTORIAL-WRITING-GUIDE.md)
- [Feature Reference](https://github.com/codeofficer/roughcut/blob/main/docs/FEATURES.md)
