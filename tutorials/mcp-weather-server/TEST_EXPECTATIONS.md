# Test Tutorial: Expected Outputs and Validation

This document outlines what we expect to happen at each step when processing the MCP Weather Server tutorial.

## Tutorial Overview

**Name:** mcp-weather-server
**Duration:** ~62 seconds (estimated)
**Segments:** 6
**Static Images (Gemini):** 2 (intro, conclusion)
**Auto Screenshots (Playwright):** 4 (terminal and code editor)

---

## Step 1: Parse Script

**Command:** Parser module reads `script.md`

**Expected Output:**
```typescript
{
  title: "Building Your First MCP Weather Server",
  description: "Learn how to create a Model Context Protocol server...",
  segments: [
    {
      id: "segment-001",
      title: "Introduction",
      duration: 8,
      narration: "Welcome! In this tutorial, you'll learn...",
      screenshot: {
        mode: "static",
        geminiPrompt: "A professional tech tutorial title slide...",
        filepath: undefined
      }
    },
    // ... 5 more segments
  ]
}
```

**Validation:**
- ✓ 6 segments parsed
- ✓ All narration blocks extracted
- ✓ Screenshot modes correctly identified (2 static, 4 auto)
- ✓ Gemini prompts extracted for static images
- ✓ Playwright instructions extracted for auto screenshots
- ✓ Durations sum to ~62 seconds
- ✓ Segment IDs generated sequentially

---

## Step 2: Generate Narration

**Command:** `npm run tutorial:narrate mcp-weather-server`

**Expected Output:**

**Console:**
```
✓ Parsed 6 segments from script
→ Generating narration for segment 1/6: Introduction
✓ Generated segment-001.mp3 (actual: 7.8s)
→ Generating narration for segment 2/6: Project Setup
✓ Generated segment-002.mp3 (actual: 11.5s)
→ Generating narration for segment 3/6: Install Dependencies
✓ Generated segment-003.mp3 (actual: 9.7s)
→ Generating narration for segment 4/6: Create Server Code
✓ Generated segment-004.mp3 (actual: 14.2s)
→ Generating narration for segment 5/6: Test the Server
✓ Generated segment-005.mp3 (actual: 9.9s)
→ Generating narration for segment 6/6: Conclusion
✓ Generated segment-006.mp3 (actual: 6.8s)

✓ All narration generated successfully
✓ Total duration: 59.9 seconds
✓ Saved to tutorials/mcp-weather-server/audio/
✓ Updated config.json with audio metadata
```

**Files Created:**
```
tutorials/mcp-weather-server/audio/
├── segment-001.mp3  (~8s)
├── segment-002.mp3  (~12s)
├── segment-003.mp3  (~10s)
├── segment-004.mp3  (~14s)
├── segment-005.mp3  (~10s)
└── segment-006.mp3  (~7s)
```

**config.json Updated:**
```json
{
  "segments": [
    {
      "id": "segment-001",
      "audioPath": "audio/segment-001.mp3",
      "duration": 7.8
    },
    // ... etc
  ]
}
```

**Validation:**
- ✓ 6 audio files created
- ✓ All MP3 files are valid and playable
- ✓ Actual durations close to expected (±20%)
- ✓ config.json contains audio metadata
- ✓ No ElevenLabs API errors

---

## Step 3: Generate Images & Capture Screenshots

**Command:** `npm run tutorial:screenshots mcp-weather-server`

### Static Images via Gemini (Segments 1 & 6)

**Expected:**
```
→ Generating static images with Gemini...

→ Segment 1: Introduction
  ✓ Extracted prompt: "A professional tech tutorial title slide..."
  ✓ Calling Gemini API for image generation
  ✓ Image generated successfully
  ✓ Downloaded and saved: screenshots/001-intro.png

→ Segment 6: Conclusion
  ✓ Extracted prompt: "A celebration completion slide..."
  ✓ Calling Gemini API for image generation
  ✓ Image generated successfully
  ✓ Downloaded and saved: screenshots/006-conclusion.png

✓ Generated 2 static images
```

### Auto Screenshots via Playwright (Segments 2, 3, 4, 5)

**Expected:**
```
→ Capturing auto screenshots with Playwright...

→ Segment 2: Project Setup
  ✓ Launched browser
  ✓ Opened terminal simulation
  ✓ Executed: mkdir weather-mcp-server && cd weather-mcp-server
  ✓ Executed: npm init -y
  ✓ Captured: screenshots/002-project-setup.png

→ Segment 3: Install Dependencies
  ✓ Executed: npm install @modelcontextprotocol/sdk typescript
  ✓ Captured: screenshots/003-install-deps.png

→ Segment 4: Create Server Code
  ✓ Opened VS Code simulation
  ✓ Created file: src/index.ts
  ✓ Typed code content
  ✓ Captured: screenshots/004-server-code.png

→ Segment 5: Test the Server
  ✓ Switched to terminal
  ✓ Executed: npx tsc && node dist/index.js
  ✓ Showed output
  ✓ Captured: screenshots/005-test-server.png

✓ Captured 4 auto screenshots
✓ All visuals generated successfully
✓ Saved to tutorials/mcp-weather-server/screenshots/
✓ Updated config.json with image metadata
```

**Files Created:**
```
tutorials/mcp-weather-server/screenshots/
├── 001-intro.png           (1920x1080, Gemini generated)
├── 002-project-setup.png   (1920x1080, Playwright captured)
├── 003-install-deps.png    (1920x1080, Playwright captured)
├── 004-server-code.png     (1920x1080, Playwright captured)
├── 005-test-server.png     (1920x1080, Playwright captured)
└── 006-conclusion.png      (1920x1080, Gemini generated)
```

**config.json Updated:**
```json
{
  "segments": [
    {
      "id": "segment-001",
      "audioPath": "audio/segment-001.mp3",
      "screenshotPath": "screenshots/001-intro.png",
      "duration": 7.8
    },
    // ... etc
  ]
}
```

**Validation:**
- ✓ 6 screenshot files exist
- ✓ All images are 1920x1080 PNG format
- ✓ File sizes reasonable (100KB - 2MB each)
- ✓ Images are not corrupted
- ✓ config.json contains screenshot paths

---

## Step 4: Build Video

**Command:** `npm run tutorial:build mcp-weather-server`

**Expected Output:**

**Console:**
```
→ Validating assets...
✓ Found 6 audio files
✓ Found 6 screenshot files
✓ All assets present and valid

→ Generating video timeline...
  Segment 1: 0.0s - 7.8s   (intro)
  Segment 2: 8.3s - 19.8s  (project-setup) [0.5s fade]
  Segment 3: 20.3s - 30.0s (install-deps) [0.5s fade]
  Segment 4: 30.5s - 44.7s (server-code) [0.5s fade]
  Segment 5: 45.2s - 55.1s (test-server) [0.5s fade]
  Segment 6: 55.6s - 62.4s (conclusion) [0.5s fade]
✓ Total duration: 62.4s

→ Assembling video with FFmpeg...
  [====================] 100% (62.4s / 62.4s)

✓ Video created successfully!
  Location: tutorials/mcp-weather-server/output/tutorial.mp4
  Duration: 62.4s
  Size: 12.3 MB
  Resolution: 1920x1080
  FPS: 30
```

**Files Created:**
```
tutorials/mcp-weather-server/output/
└── tutorial.mp4  (12-15 MB, 62s, 1920x1080, 30fps)
```

**Validation:**
- ✓ Video file exists and is playable
- ✓ Duration matches expected (~62 seconds)
- ✓ Resolution is 1920x1080
- ✓ Audio is clear and synchronized
- ✓ Transitions are smooth (0.5s fades)
- ✓ All 6 segments are present
- ✓ No audio/video desync issues

---

## Manual Testing Checklist

After building the video, manually verify:

### Audio Quality
- [ ] Narration is clear and understandable
- [ ] Volume is consistent across segments
- [ ] No clipping or distortion
- [ ] Adam voice sounds natural
- [ ] Speech pace is appropriate

### Visual Quality
- [ ] All screenshots are visible and clear
- [ ] No artifacts or compression issues
- [ ] Text in screenshots is readable
- [ ] Transitions are smooth, not jarring
- [ ] Intro and conclusion slides look good

### Synchronization
- [ ] Audio matches the visuals shown
- [ ] Timing feels natural (not too rushed/slow)
- [ ] Transitions happen at appropriate moments
- [ ] No awkward pauses or gaps

### Content Accuracy
- [ ] Narration matches the script
- [ ] Screenshots demonstrate what's being described
- [ ] Code examples are correct
- [ ] Technical information is accurate

---

## Edge Cases to Test

### 1. Gemini API Failure
**Action:** Use invalid Gemini API key and run `tutorial:screenshots`
**Expected:** Clear error message about API authentication failure with retry instructions

### 2. Invalid Audio File
**Action:** Corrupt one audio file and run `tutorial:build`
**Expected:** Validation error before FFmpeg runs

### 3. Mismatched Segment Count
**Action:** Add a 7th audio file and run `tutorial:build`
**Expected:** Warning about extra assets

### 4. Very Long Narration
**Action:** Modify segment to have 100 words
**Expected:** ElevenLabs generates longer audio, timeline adjusts

### 5. Special Characters in Narration
**Action:** Add quotes, apostrophes, emoji to narration
**Expected:** Proper text-to-speech handling

---

## Performance Benchmarks

**Target Times (on typical development machine):**

| Step | Expected Duration |
|------|------------------|
| Parse Script | < 1 second |
| Generate Narration (6 segments) | 10-30 seconds |
| Generate Images (2 Gemini + 4 Playwright) | 20-60 seconds |
| Build Video (62s output) | 30-90 seconds |
| **Total Workflow** | **1-3 minutes** |

---

## Success Criteria

The test tutorial is successful when:

1. ✅ All commands run without errors
2. ✅ Generated video plays correctly
3. ✅ Audio and visuals are synchronized
4. ✅ Content matches the script
5. ✅ File sizes are reasonable
6. ✅ Process is repeatable (can rebuild)
7. ✅ Error messages are helpful when issues occur

---

## Next Steps After Testing

Once this test tutorial works end-to-end:

1. Create 2-3 more diverse test cases
2. Test different voices and settings
3. Stress test with longer tutorials (10+ segments)
4. Test edge cases and error handling
5. Optimize performance bottlenecks
6. Add progress indicators and better UX
