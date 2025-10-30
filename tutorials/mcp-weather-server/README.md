# Test Tutorial: MCP Weather Server

This is the primary test tutorial for the genai-tutorial-factory system. It exercises all major features and serves as a reference implementation.

## Tutorial Details

- **Topic:** Building a Model Context Protocol server for weather data
- **Duration:** ~60 seconds
- **Segments:** 6
- **Difficulty:** Beginner
- **Technologies:** TypeScript, MCP SDK, Node.js

## Features Tested

### ✅ Script Parsing
- Multiple segments with different durations
- Mixed screenshot modes (manual + auto)
- Narration block extraction
- Metadata parsing

### ✅ Narration Generation
- 6 segments with varying lengths (7-15 seconds each)
- Natural conversational tone
- Technical terminology (ElevenLabs should handle "MCP", "TypeScript", etc.)

### ✅ Screenshot Capture

**Manual (2):**
- Intro slide (001)
- Conclusion slide (006)

**Automated (4):**
- Terminal commands (002, 003, 005)
- Code editor with TypeScript (004)

### ✅ Video Assembly
- Fade transitions between segments
- Audio/visual synchronization
- 1920x1080 @ 30fps output

## Directory Structure

```
mcp-weather-server/
├── README.md                    # This file
├── TEST_EXPECTATIONS.md         # What to expect at each step
├── MANUAL_SCREENSHOTS.md        # Specs for manual screenshots
├── config.json                  # Tutorial configuration
├── script.md                    # Complete tutorial script
├── audio/                       # Generated narration (after step 2)
│   ├── segment-001.mp3
│   ├── segment-002.mp3
│   ├── segment-003.mp3
│   ├── segment-004.mp3
│   ├── segment-005.mp3
│   └── segment-006.mp3
├── screenshots/                 # Screenshots (after step 3)
│   ├── 001-intro.png           (manual - create this first)
│   ├── 002-project-setup.png   (auto-generated)
│   ├── 003-install-deps.png    (auto-generated)
│   ├── 004-server-code.png     (auto-generated)
│   ├── 005-test-server.png     (auto-generated)
│   └── 006-conclusion.png      (manual - create this first)
└── output/                      # Final video (after step 4)
    └── tutorial.mp4
```

## Using This Test Tutorial

### Full Workflow Test
```bash
# 1. Create manual screenshots first (see MANUAL_SCREENSHOTS.md)

# 2. Run full workflow
npm run tutorial:full mcp-weather-server

# 3. Check output/tutorial.mp4
```

### Step-by-Step Testing

```bash
# Test narration generation only
npm run tutorial:narrate mcp-weather-server

# Test screenshot capture only
npm run tutorial:screenshots mcp-weather-server

# Test video assembly only
npm run tutorial:build mcp-weather-server
```

## Expected Results

See `TEST_EXPECTATIONS.md` for detailed expectations at each step.

**Quick Summary:**
- ✓ 6 audio files generated (~60s total)
- ✓ 6 screenshots captured (2 manual, 4 auto)
- ✓ 1 video file assembled (~12-15 MB)
- ✓ Clear console output at each step
- ✓ Proper error messages if assets missing

## Validation Checklist

After running the full workflow:

- [ ] Video plays without errors
- [ ] Audio is clear and synchronized
- [ ] All 6 segments are present
- [ ] Transitions are smooth
- [ ] Screenshots match narration
- [ ] Total duration is ~60 seconds
- [ ] File size is reasonable (10-20 MB)

## Known Limitations

This is a test tutorial, so:

1. **Auto screenshots are simulated:** Real Playwright automation will need terminal/editor simulation tools
2. **Code isn't functional:** The TypeScript example is simplified for demonstration
3. **Manual screenshots are placeholders:** Professional designs would be better for real tutorials

## Why This Tutorial?

This tutorial was chosen because it:

- ✅ **Relevant:** MCP servers are current and useful
- ✅ **Concise:** Short enough to test quickly
- ✅ **Comprehensive:** Uses all major features
- ✅ **Realistic:** Real-world use case
- ✅ **Testable:** Clear success criteria

## Next Steps

Once this tutorial works end-to-end:

1. Create variations testing edge cases
2. Add longer tutorials (10+ segments)
3. Test different voices and languages
4. Optimize performance
5. Improve error handling
6. Add more automation features
