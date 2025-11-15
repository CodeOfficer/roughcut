# RevealJS Best Practices Migration Plan

**Status**: 🚀 **Active** - Phase 1 starting
**Created**: 2025-11-15
**Last Updated**: 2025-11-15

---

## Executive Summary

This document outlines a comprehensive migration plan to align our GenAI Tutorial Factory with RevealJS best practices while maintaining 100% backward compatibility with existing presentations. The migration is structured in 4 phases over an estimated 4-week timeline.

**Key Goals**:
- ✅ Align with RevealJS conventions (fix fragment indices, DOM structure)
- ✅ Expose advanced configuration options to users
- ✅ Add high-value features (vertical slides, speaker view, video backgrounds)
- ✅ Improve accessibility and documentation
- ✅ Maintain all existing functionality (Playwright, ElevenLabs, manual/auto/mp4 modes)

---

## Assessment Summary

### RevealJS Documentation Analysis

**Documentation Set**: `revealjs-docs/`
- **Files**: 34 comprehensive markdown files (85% complete)
- **Coverage**: All core features documented
  - Initialization, markup structure, configuration (50+ options)
  - API methods, events, lifecycle hooks
  - Fragments, backgrounds, transitions, themes
  - Plugins (Markdown, Highlight, Math, Notes, Zoom, Search)
  - Advanced features (vertical slides, speaker view, PDF export)

**Key Patterns Identified**:
- Required DOM structure: `.reveal > .slides > section`
- Global `Reveal` object for single presentations
- Promise-based initialization: `Reveal.initialize().then(...)`
- Event-driven architecture: `slidechanged`, `fragmentshown`, `ready`
- Fragment indices are 0-based (not 1-based)
- Data attributes control per-slide behavior
- Plugin system for extensibility

---

### Current Implementation Analysis

**Files Analyzed**:
- `src/presentation/revealjs-generator.ts` - HTML generation
- `src/presentation/audio-sync-orchestrator.ts` - Timing and audio control
- `src/presentation/playwright-controller.ts` - Browser automation
- `src/core/types.ts` - Configuration and types

**Strengths** ✅:
1. **Timestamp-based audio sync** - Eliminates timing drift by recording actual playback timing
2. **Fragment timing integration** - Schedules fragment reveals during audio playback
3. **Dev mode** - Manual and auto modes with HTTP server for fast iteration
4. **TTS cache** - Intelligent caching with voice parameter tracking
5. **Comprehensive linting** - 52 test cases covering all validation rules
6. **Clean architecture** - Type-safe TypeScript with clear separation of concerns
7. **Excellent test coverage** - 283 passing tests

**Gaps & Opportunities** 🔶:

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Fragment indices start at 1 (should be 0) | Low | Low | High |
| Limited config exposure | Medium | Medium | High |
| No vertical slides (2D navigation) | Medium | Medium | Medium |
| No speaker view/notes mode | Medium | Medium | Medium |
| No custom CSS per presentation | Low | Low | Medium |
| Only built-in themes | Low | Medium | Low |
| No video backgrounds | Low | Medium | Medium |
| Auto-animate not demonstrated | Low | Low | Low |
| No Math plugin for equations | Low | Low | Low |
| No PDF export capability | Low | Medium | Low |
| Hardcoded font sizes | Low | Low | High |
| Limited accessibility features | Low | Low | Medium |

---

## Migration Goals

### 1. RevealJS Convention Alignment
- Fix fragment indices to be 0-based (matching RevealJS)
- Ensure DOM structure matches RevealJS requirements exactly
- Use standard RevealJS patterns and idioms
- Follow RevealJS naming conventions

### 2. Configuration Enhancement
- Expose core config options (controls, progress, slideNumber, center)
- Add per-presentation config overrides via frontmatter
- Create config presets for common use cases
- Validate config options with helpful error messages

### 3. Advanced Features
- **Vertical slides** - 2D navigation with `@vertical-slide:` directive
- **Video backgrounds** - `@background-video:` directive
- **Speaker view** - Enable speaker notes view mode
- **Custom CSS** - Per-presentation CSS injection
- **Math plugin** - LaTeX equations with `@math:` directive

### 4. Accessibility & Documentation
- Add visible slide numbers (configurable)
- Document keyboard shortcuts
- Create comprehensive feature documentation
- Add advanced examples showcasing all features

### 5. Backward Compatibility
- **Critical**: All existing presentations must work unchanged
- No breaking changes to directive syntax
- Maintain existing build commands and workflows
- Preserve audio/video sync accuracy

---

## Phased Implementation

### Phase 1: Foundational Fixes 🎯 **(Current Phase)**

**Timeline**: Week 1
**Risk Level**: Low
**Value**: High alignment with RevealJS

#### Tasks:

1. **Fix Fragment Indices** (`src/presentation/revealjs-generator.ts`)
   - Change `data-fragment-index` from 1-based to 0-based
   - Update fragment timing calculations in timeline builder
   - Test: Verify fragments reveal in correct order

2. **Expose Core Config Options** (`src/core/types.ts`, `src/parser/frontmatter-parser.ts`)
   - Add `config` section to frontmatter schema
   - Support: `controls`, `progress`, `slideNumber`, `center`, `overview`
   - Pass config to RevealJS initialization

3. **Theme-Responsive Font Sizing** (`src/presentation/revealjs-generator.ts`)
   - Replace hardcoded font sizes with CSS variables
   - Use theme defaults, allow per-slide overrides
   - Test: Verify fonts look good with all themes

4. **DOM Structure Validation**
   - Review generated HTML against RevealJS docs
   - Fix any remaining structure issues
   - Add automated tests for DOM structure

5. **Accessibility: Keyboard Shortcuts Documentation**
   - Create `docs/KEYBOARD_SHORTCUTS.md`
   - Document all available shortcuts
   - Add to generated presentations (help overlay)

**Deliverables**:
- ✅ Fragment indices fixed (0-based)
- ✅ Core config options exposed
- ✅ Theme-responsive fonts
- ✅ DOM structure validated
- ✅ Keyboard shortcuts documented
- ✅ All existing tests passing
- ✅ Regression testing complete

---

### Phase 2: Configuration Enhancement

**Timeline**: Week 2
**Risk Level**: Low
**Value**: Flexibility and user control

#### Tasks:

1. **Create Config Schema** (`src/core/revealjs-config-schema.ts`)
   ```typescript
   interface RevealJSConfig {
     controls?: boolean | 'speaker-only';
     progress?: boolean;
     slideNumber?: boolean | 'h.v' | 'h/v' | 'c' | 'c/t';
     hash?: boolean;
     history?: boolean;
     keyboard?: boolean;
     overview?: boolean;
     center?: boolean;
     touch?: boolean;
     loop?: boolean;
     rtl?: boolean;
     navigationMode?: 'default' | 'linear' | 'grid';
     transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
     transitionSpeed?: 'default' | 'fast' | 'slow';
     backgroundTransition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
     viewDistance?: number;
     mobileViewDistance?: number;
     // ... 50+ total options
   }
   ```

2. **Config Validation** (`src/validation/config-validator.ts`)
   - Validate config values against schema
   - Provide helpful error messages with examples
   - Suggest corrections for typos (Levenshtein distance)

3. **Config Presets** (`src/config/presets.ts`)
   ```typescript
   const PRESETS = {
     'video-recording': {
       controls: false,
       progress: false,
       embedded: true,
       viewDistance: 999
     },
     'manual-presentation': {
       controls: true,
       progress: true,
       slideNumber: 'c/t',
       keyboard: true
     },
     'auto-demo': {
       controls: false,
       progress: true,
       autoSlide: 0
     }
   };
   ```

4. **Frontmatter Config Support**
   ```yaml
   ---
   title: My Presentation
   theme: black
   preset: manual-presentation
   config:
     slideNumber: 'c/t'
     center: false
     transition: fade
   ---
   ```

5. **Update Linting System** (`src/validation/linting.ts`)
   - Add config option validation
   - Validate preset names
   - Check for deprecated config options

**Deliverables**:
- ✅ Complete config schema (50+ options)
- ✅ Config validation with helpful errors
- ✅ Config presets for common use cases
- ✅ Frontmatter config support
- ✅ Linting updated for config
- ✅ Documentation: `docs/architecture/revealjs/CONFIGURATION.md`

---

### Phase 3: Advanced Features

**Timeline**: Week 3
**Risk Level**: Medium
**Value**: High (major new capabilities)

#### Tasks:

1. **Vertical Slides** (`@vertical-slide:` directive)

   **Markdown Syntax**:
   ```markdown
   # Main Topic
   @audio: This is the main topic

   @vertical-slide:
   ## Detail 1
   @audio: Here's the first detail

   @vertical-slide:
   ## Detail 2
   @audio: And the second detail
   ```

   **Generated HTML**:
   ```html
   <section>
     <section>
       <h1>Main Topic</h1>
     </section>
     <section>
       <h2>Detail 1</h2>
     </section>
     <section>
       <h2>Detail 2</h2>
     </section>
   </section>
   ```

   **Implementation**:
   - Parser: Detect `@vertical-slide:` and group sections
   - Generator: Create nested `<section>` elements
   - Timeline: Handle 2D navigation timing
   - Orchestrator: Support `Reveal.up()` / `Reveal.down()`
   - Linting: Validate vertical slide structure

2. **Video Backgrounds** (`@background-video:` directive)

   **Markdown Syntax**:
   ```markdown
   # Slide Title
   @background-video: ./assets/background.mp4
   @background-video-loop: true
   @background-video-muted: true
   @audio: Narration over video background
   ```

   **Generated HTML**:
   ```html
   <section
     data-background-video="assets/background.mp4"
     data-background-video-loop="true"
     data-background-video-muted="true">
     <h1>Slide Title</h1>
   </section>
   ```

   **Implementation**:
   - Parser: Add directive definitions for video backgrounds
   - Generator: Add `data-background-video-*` attributes
   - Linting: Validate video file paths and options
   - Documentation: Add examples with background videos

3. **Speaker View Mode**

   **CLI Command**:
   ```bash
   npm run dev:speaker  # Opens speaker view in separate window
   ```

   **Implementation**:
   - Dev command: Add `speaker` mode
   - HTTP server: Serve speaker view HTML
   - RevealJS: Enable speaker notes plugin
   - Controller: Sync main and speaker windows
   - Documentation: Speaker view usage guide

4. **Custom CSS Injection**

   **Frontmatter**:
   ```yaml
   ---
   title: My Presentation
   theme: black
   customCSS: ./styles/custom.css
   ---
   ```

   **Or Inline**:
   ```yaml
   ---
   title: My Presentation
   theme: black
   customStyles: |
     .custom-highlight { color: #ff0; }
     .special-slide { background: linear-gradient(...); }
   ---
   ```

   **Implementation**:
   - Parser: Support `customCSS` and `customStyles` in frontmatter
   - Generator: Inject `<link>` or `<style>` tags
   - Asset copying: Copy custom CSS files to output
   - Linting: Validate CSS file paths

5. **Math Plugin** (`@math:` directive)

   **Markdown Syntax**:
   ```markdown
   # Mathematical Concepts

   @math: inline
   The equation $E = mc^2$ is famous

   @math: display
   $$
   \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
   $$
   ```

   **Implementation**:
   - Parser: Add `@math:` directive (inline/display)
   - Generator: Include Math plugin, wrap in proper delimiters
   - HTML: Load KaTeX or MathJax plugin
   - Documentation: Math syntax guide

6. **Auto-Animate Showcase**

   **Create Demo**: `tutorials/auto-animate-demo/`
   - Element morphing examples
   - Smooth transitions between states
   - Code example transitions
   - Documentation of `@auto-animate:` directive

**Deliverables**:
- ✅ Vertical slides working with up/down navigation
- ✅ Video backgrounds playing correctly
- ✅ Speaker view mode functional
- ✅ Custom CSS injection working
- ✅ Math plugin rendering equations
- ✅ Auto-animate examples created
- ✅ Tutorial: `tutorials/advanced-demo/`
- ✅ Documentation: `docs/architecture/revealjs/ADVANCED_FEATURES.md`

---

### Phase 4: Polish & Export

**Timeline**: Week 4
**Risk Level**: Low
**Value**: Professional finish

#### Tasks:

1. **Custom Theme Creation Workflow**
   - CLI: `npm run create-theme <name>`
   - Template: Generate theme CSS scaffold
   - Documentation: Theme creation guide
   - Examples: Custom theme examples

2. **PDF Export**
   - CLI: `npm run export:pdf <tutorial>`
   - Uses RevealJS print-pdf query parameter
   - Playwright: Automated PDF generation
   - Documentation: Export guide

3. **Plugin Selection Per Presentation**
   ```yaml
   ---
   title: My Presentation
   plugins:
     - markdown
     - highlight
     - math
     - zoom
     - search
   ---
   ```

4. **Performance Optimizations**
   - Lazy loading for images
   - Preload hints for audio files
   - Async plugin loading
   - Bundle size optimization

5. **Enhanced Accessibility**
   - ARIA labels for navigation
   - Screen reader optimizations
   - High contrast mode support
   - Keyboard navigation improvements

**Deliverables**:
- ✅ Theme creation workflow
- ✅ PDF export capability
- ✅ Plugin selection per presentation
- ✅ Performance optimizations
- ✅ Enhanced accessibility
- ✅ Complete documentation update

---

## Technical Implementation Details

### 1. Fragment Indices Fix

**File**: `src/presentation/revealjs-generator.ts`

**Current Code**:
```typescript
fragments.forEach((fragment, index) => {
  // ❌ WRONG: 1-based indexing
  const fragmentIndex = index + 1;
  return `<!-- .element: class="fragment ${fragment.effect}" data-fragment-index="${fragmentIndex}" -->`;
});
```

**Fixed Code**:
```typescript
fragments.forEach((fragment, index) => {
  // ✅ CORRECT: 0-based indexing (RevealJS convention)
  return `<!-- .element: class="fragment ${fragment.effect}" data-fragment-index="${index}" -->`;
});
```

**Impact**: Low risk, high alignment. Fragments will still reveal in the same order, just with correct indices.

**Testing**:
1. Build existing presentations
2. Inspect generated HTML (DevTools)
3. Verify `data-fragment-index` starts at 0
4. Confirm fragments reveal correctly

---

### 2. Configuration Schema

**New File**: `src/core/revealjs-config-schema.ts`

```typescript
/**
 * Complete RevealJS configuration options
 * Based on: revealjs-docs/docs/19-config-options.md
 */
export interface RevealJSConfig {
  // Display
  controls?: boolean | 'speaker-only';
  controlsTutorial?: boolean;
  controlsLayout?: 'bottom-right' | 'edges';
  controlsBackArrows?: 'faded' | 'hidden' | 'visible';
  progress?: boolean;
  slideNumber?: boolean | 'h.v' | 'h/v' | 'c' | 'c/t';
  showSlideNumber?: 'all' | 'print' | 'speaker';

  // Navigation
  hash?: boolean;
  hashOneBasedIndex?: boolean;
  history?: boolean;
  keyboard?: boolean;
  keyboardCondition?: null | 'focused';
  disableLayout?: boolean;
  overview?: boolean;
  center?: boolean;
  touch?: boolean;
  loop?: boolean;
  rtl?: boolean;
  navigationMode?: 'default' | 'linear' | 'grid';
  shuffle?: boolean;

  // Fragments
  fragments?: boolean;
  fragmentInURL?: boolean;

  // Transitions
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
  transitionSpeed?: 'default' | 'fast' | 'slow';
  backgroundTransition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';

  // Presentation Size
  width?: number;
  height?: number;
  margin?: number;
  minScale?: number;
  maxScale?: number;

  // Media
  autoPlayMedia?: boolean | null;
  preloadIframes?: boolean | null;

  // Auto-Slide (mostly controlled by our audio timing)
  autoSlide?: number;
  autoSlideStoppable?: boolean;
  autoSlideMethod?: null | (() => void);

  // Appearance
  hideAddressBar?: boolean;

  // Performance
  viewDistance?: number;
  mobileViewDistance?: number;

  // Embedded
  embedded?: boolean;

  // Parallax
  parallaxBackgroundImage?: string;
  parallaxBackgroundSize?: string;
  parallaxBackgroundHorizontal?: number;
  parallaxBackgroundVertical?: number;

  // Scroll view (5.0+)
  scrollView?: boolean;
  scrollLayout?: 'full' | 'compact';
  scrollSnap?: boolean;
  scrollProgress?: boolean;
  scrollActivationWidth?: number;
}

/**
 * Default configuration for different modes
 */
export const CONFIG_PRESETS: Record<string, Partial<RevealJSConfig>> = {
  'video-recording': {
    controls: false,
    progress: false,
    slideNumber: false,
    embedded: true,
    viewDistance: 999, // Pre-render all slides
    keyboard: false,
    touch: false,
    overview: false
  },

  'manual-presentation': {
    controls: true,
    progress: true,
    slideNumber: 'c/t',
    keyboard: true,
    overview: true,
    center: true,
    touch: true
  },

  'auto-demo': {
    controls: false,
    progress: true,
    slideNumber: false,
    keyboard: false,
    overview: false,
    center: true
  },

  'speaker-mode': {
    controls: true,
    progress: true,
    slideNumber: 'c/t',
    keyboard: true,
    overview: true,
    showSlideNumber: 'speaker'
  }
};

/**
 * Merge user config with preset and defaults
 */
export function resolveConfig(
  userConfig?: Partial<RevealJSConfig>,
  preset?: string
): RevealJSConfig {
  const presetConfig = preset ? CONFIG_PRESETS[preset] : {};

  return {
    // Defaults (from our current DEFAULT_REVEAL_CONFIG)
    autoSlide: 0,
    hash: true,
    history: true,
    fragments: true,
    fragmentInURL: false,
    transition: 'slide',
    transitionSpeed: 'default',
    autoPlayMedia: false,

    // Apply preset
    ...presetConfig,

    // Apply user config (highest priority)
    ...userConfig
  };
}
```

---

### 3. Frontmatter Extensions

**File**: `src/parser/frontmatter-parser.ts`

**Current Schema**:
```typescript
interface Frontmatter {
  title: string;
  theme: string;
  voiceId?: string;
  resolution?: string;
}
```

**Extended Schema**:
```typescript
interface Frontmatter {
  title: string;
  theme: string;
  voiceId?: string;
  resolution?: string;

  // NEW: RevealJS configuration
  preset?: 'video-recording' | 'manual-presentation' | 'auto-demo' | 'speaker-mode';
  config?: Partial<RevealJSConfig>;

  // NEW: Custom styling
  customCSS?: string; // Path to external CSS file
  customStyles?: string; // Inline CSS

  // NEW: Plugin selection
  plugins?: Array<'markdown' | 'highlight' | 'math' | 'notes' | 'zoom' | 'search'>;
}
```

**Example Usage**:
```yaml
---
title: Advanced Presentation
theme: black
preset: manual-presentation
config:
  slideNumber: 'c/t'
  center: false
  transition: fade
  transitionSpeed: fast
customCSS: ./styles/custom.css
plugins:
  - markdown
  - highlight
  - math
---
```

---

### 4. Vertical Slides Implementation

**Parser Changes** (`src/parser/markdown-parser.ts`):

```typescript
interface Slide {
  // ... existing fields
  isVertical?: boolean; // NEW: Mark as vertical slide
  verticalGroup?: number; // NEW: Which horizontal group it belongs to
}

function parseSlides(markdown: string): Slide[] {
  const slides: Slide[] = [];
  let currentVerticalGroup = -1;
  let isInVerticalGroup = false;

  // ... parse slide content

  if (directiveContent.includes('@vertical-slide:')) {
    // Start or continue vertical group
    if (!isInVerticalGroup) {
      currentVerticalGroup++;
      isInVerticalGroup = true;
    }

    slide.isVertical = true;
    slide.verticalGroup = currentVerticalGroup;
  } else {
    // Horizontal slide
    isInVerticalGroup = false;
    slide.isVertical = false;
  }

  slides.push(slide);
}
```

**Generator Changes** (`src/presentation/revealjs-generator.ts`):

```typescript
function generateSlideSections(slides: Slide[]): string {
  const grouped = groupSlidesByVertical(slides);

  return grouped.map(group => {
    if (group.length === 1 && !group[0].isVertical) {
      // Simple horizontal slide
      return `<section id="${group[0].id}" ...>${group[0].content}</section>`;
    } else {
      // Vertical slide group (nested sections)
      return `
        <section>
          ${group.map(slide => `
            <section id="${slide.id}" ...>
              ${slide.content}
            </section>
          `).join('\n')}
        </section>
      `;
    }
  }).join('\n');
}

function groupSlidesByVertical(slides: Slide[]): Slide[][] {
  const groups: Slide[][] = [];
  let currentGroup: Slide[] = [];

  slides.forEach(slide => {
    if (slide.isVertical) {
      currentGroup.push(slide);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      groups.push([slide]);
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
```

**Orchestrator Changes** (`src/presentation/audio-sync-orchestrator.ts`):

```typescript
async navigateToSlide(slide: Slide) {
  const indices = this.getSlideIndices(slide);

  // Support 2D navigation (h, v)
  await this.controller.evaluate((h, v) => {
    Reveal.slide(h, v);
  }, indices.h, indices.v);

  await this.controller.waitForSelector('.present');
}

function getSlideIndices(slide: Slide): { h: number; v: number } {
  if (!slide.isVertical) {
    // Horizontal slide: v=0
    return { h: slide.indexH, v: 0 };
  } else {
    // Vertical slide: find h from group, v from position in group
    const group = this.slides.filter(s => s.verticalGroup === slide.verticalGroup);
    const h = Math.min(...group.map(s => s.indexH));
    const v = group.indexOf(slide);
    return { h, v };
  }
}
```

---

### 5. Video Backgrounds Implementation

**Directive Definitions** (`src/validation/directive-registry.ts`):

```typescript
export const DIRECTIVE_REGISTRY: DirectiveDefinition[] = [
  // ... existing directives

  {
    name: '@background-video',
    description: 'Video background for slide',
    syntax: '@background-video: <path>',
    valueType: 'string',
    validator: (value: string) => {
      // Validate video file path
      const validExtensions = ['.mp4', '.webm', '.ogg'];
      const hasValidExtension = validExtensions.some(ext => value.endsWith(ext));

      if (!hasValidExtension) {
        return {
          valid: false,
          error: `Video must be .mp4, .webm, or .ogg (got: ${value})`
        };
      }

      return { valid: true };
    },
    examples: [
      '@background-video: ./assets/background.mp4',
      '@background-video: https://example.com/video.webm'
    ]
  },

  {
    name: '@background-video-loop',
    description: 'Loop video background',
    syntax: '@background-video-loop: <true|false>',
    valueType: 'boolean',
    validator: validateBoolean,
    examples: ['@background-video-loop: true']
  },

  {
    name: '@background-video-muted',
    description: 'Mute video background',
    syntax: '@background-video-muted: <true|false>',
    valueType: 'boolean',
    validator: validateBoolean,
    examples: ['@background-video-muted: true']
  }
];
```

**Generator Changes** (`src/presentation/revealjs-generator.ts`):

```typescript
function generateSlideAttributes(slide: Slide): string {
  const attrs: string[] = [];

  // ... existing attributes (transition, background-color, etc.)

  // Video background
  if (slide.backgroundVideo) {
    attrs.push(`data-background-video="${slide.backgroundVideo}"`);

    if (slide.backgroundVideoLoop !== undefined) {
      attrs.push(`data-background-video-loop="${slide.backgroundVideoLoop}"`);
    }

    if (slide.backgroundVideoMuted !== undefined) {
      attrs.push(`data-background-video-muted="${slide.backgroundVideoMuted}"`);
    }
  }

  return attrs.join(' ');
}
```

---

## Testing Strategy

### Regression Testing

**Critical**: All existing presentations must work unchanged.

```bash
# Run all existing tests
npm test

# Build existing tutorials
TUTORIAL=simple-demo npm run build:full
TUTORIAL=full-demo npm run build:full

# Verify outputs
- Check audio/video sync (timestamp accuracy)
- Check fragment timing (reveal at correct times)
- Check final MP4 quality
- Check interactive HTML works

# Dev modes
TUTORIAL=simple-demo npm run dev
TUTORIAL=simple-demo npm run dev:auto
```

**Test Checklist**:
- [ ] All 283 tests pass
- [ ] simple-demo builds successfully
- [ ] full-demo builds successfully
- [ ] Audio/video sync perfect (no drift)
- [ ] Fragment timing accurate (within 30ms)
- [ ] Dev mode works (manual + auto)
- [ ] Build modes work (fast/full/html)
- [ ] TTS cache hits work correctly

---

### New Feature Testing

#### Phase 1: Foundational Fixes

**Fragment Indices (0-based)**:
```bash
# Build and inspect
TUTORIAL=simple-demo npm run build:html

# Check generated HTML
cat tutorials/simple-demo/output/presentation/index.html | grep "data-fragment-index"

# Expected: data-fragment-index="0", "1", "2", ...
# NOT: data-fragment-index="1", "2", "3", ...
```

**Config Options**:
```yaml
# Test frontmatter
---
title: Config Test
theme: black
config:
  controls: true
  progress: true
  slideNumber: 'c/t'
---
```

```bash
# Build and check browser console
TUTORIAL=config-test npm run dev

# In browser DevTools console:
Reveal.getConfig()
# Verify: controls: true, progress: true, slideNumber: "c/t"
```

**Theme-Responsive Fonts**:
- Build with different themes
- Verify fonts scale appropriately
- Check h1, h2, h3, p sizing

---

#### Phase 2: Configuration

**Config Presets**:
```yaml
---
title: Preset Test
preset: manual-presentation
---
```

```javascript
// Expected config:
{
  controls: true,
  progress: true,
  slideNumber: 'c/t',
  keyboard: true,
  overview: true,
  center: true,
  touch: true
}
```

**Config Validation**:
```yaml
# Invalid config (should error)
---
title: Invalid Test
config:
  transition: invalid-value  # ❌ Not a valid transition
  slideNumber: 999            # ❌ Not a valid format
---
```

Expected: Helpful error message with valid options.

---

#### Phase 3: Advanced Features

**Vertical Slides**:
```markdown
# Main Topic
@audio: Main topic audio

@vertical-slide:
## Detail 1
@audio: Detail 1 audio

@vertical-slide:
## Detail 2
@audio: Detail 2 audio
```

Test:
1. Build presentation
2. Navigate with arrow keys
3. Press DOWN arrow → should go to Detail 1
4. Press DOWN arrow → should go to Detail 2
5. Press RIGHT arrow → should go to next horizontal slide
6. Check `Reveal.getIndices()` → verify h and v values

**Video Backgrounds**:
```markdown
# Video Slide
@background-video: ./assets/test-video.mp4
@background-video-loop: true
@background-video-muted: true
@audio: Narration text
```

Test:
1. Build presentation
2. Navigate to video slide
3. Verify video plays in background
4. Verify video loops
5. Verify video is muted
6. Verify narration audio plays separately

**Speaker View**:
```bash
# Launch speaker view
TUTORIAL=full-demo npm run dev:speaker
```

Test:
1. Verify two windows open (main + speaker)
2. Navigate in main window → speaker window follows
3. Navigate in speaker window → main window follows
4. Check speaker notes display
5. Check next slide preview
6. Check timer functionality

---

### Performance Testing

**Benchmarks**:
```bash
# Build time comparison (before vs after)
time TUTORIAL=simple-demo npm run build:full
time TUTORIAL=full-demo npm run build:full

# Expected: No significant regression (<5%)

# Memory usage (Playwright)
# Monitor with Activity Monitor / Task Manager during build

# Asset sizes
ls -lh tutorials/*/output/presentation/
# Verify CSS/JS not significantly larger
```

---

## Documentation Updates

### New Documentation Files

1. **`docs/architecture/revealjs/MIGRATION-TO-BEST-PRACTICES.md`** (this file)
   - Complete migration plan
   - Phased approach
   - Technical details
   - Testing strategy

2. **`docs/architecture/revealjs/CONFIGURATION.md`**
   - Complete config reference
   - All 50+ options documented
   - Preset explanations
   - Per-mode config recommendations

3. **`docs/architecture/revealjs/ADVANCED_FEATURES.md`**
   - Vertical slides guide
   - Video backgrounds guide
   - Speaker view guide
   - Custom CSS guide
   - Math plugin guide

4. **`docs/KEYBOARD_SHORTCUTS.md`**
   - Complete keyboard reference
   - Navigation shortcuts
   - Feature shortcuts (overview, speaker view, fullscreen)
   - Custom shortcuts

5. **`docs/MARKDOWN_FORMAT.md`** (update)
   - Add new directives:
     - `@vertical-slide:`
     - `@background-video:`
     - `@background-video-loop:`
     - `@background-video-muted:`
     - `@math:`
   - Update frontmatter examples with `config`, `preset`, `customCSS`

6. **`docs/LINTING_SPEC.md`** (update)
   - Add validation for new directives
   - Add config validation rules
   - Add examples of new linting errors

---

### Updated Documentation Files

**`CLAUDE.md`**:
- Remove references to old implementation plan
- Add reference to MIGRATION-TO-BEST-PRACTICES.md
- Update "Current Status" section
- Add "Next Session - Start Here" for Phase 1

**`docs/architecture/revealjs/DECISIONS.md`**:
- Decision 8: Migration to RevealJS best practices
- Decision 9: Fragment indices changed to 0-based
- Decision 10: Configuration system overhaul
- Decision 11: Vertical slides support added
- Decision 12: Video backgrounds support added

**`README.md`**:
- Add new features to feature list
- Update examples showing vertical slides
- Update configuration section
- Add speaker view usage

---

### Tutorial Examples

**New Tutorials**:

1. **`tutorials/advanced-demo/`**
   - Showcase ALL new features
   - Vertical slides example
   - Video backgrounds example
   - Custom CSS example
   - Math equations example
   - Auto-animate example

2. **`tutorials/config-demo/`**
   - Show different config presets
   - Demonstrate config options
   - Compare before/after

3. **`tutorials/vertical-slides-demo/`**
   - Deep dive into 2D navigation
   - Complex vertical slide structures
   - Best practices

---

## Rollout Timeline

### Week 1: Foundation (Phase 1) 🎯

**Day 1-2**:
- [ ] Create migration plan document (this file)
- [ ] Update CLAUDE.md
- [ ] Fix fragment indices (0-based)
- [ ] Update tests

**Day 3-4**:
- [ ] Add core config options to frontmatter schema
- [ ] Implement config parsing and passing to RevealJS
- [ ] Test config options work correctly
- [ ] Replace hardcoded fonts with CSS variables

**Day 5**:
- [ ] Validate DOM structure against RevealJS docs
- [ ] Create keyboard shortcuts documentation
- [ ] Run regression tests
- [ ] Commit: "Phase 1 complete: Foundational fixes"

---

### Week 2: Configuration (Phase 2)

**Day 1-2**:
- [ ] Create complete config schema (50+ options)
- [ ] Implement config validation
- [ ] Add helpful error messages

**Day 3-4**:
- [ ] Create config presets
- [ ] Implement preset selection in frontmatter
- [ ] Update linting system

**Day 5**:
- [ ] Write CONFIGURATION.md documentation
- [ ] Create config-demo tutorial
- [ ] Test all config options
- [ ] Commit: "Phase 2 complete: Configuration enhancement"

---

### Week 3: Advanced Features (Phase 3)

**Day 1-2**:
- [ ] Implement vertical slides (`@vertical-slide:`)
- [ ] Update parser, generator, orchestrator
- [ ] Test 2D navigation thoroughly

**Day 3**:
- [ ] Implement video backgrounds (`@background-video:`)
- [ ] Test video playback and options
- [ ] Implement custom CSS injection

**Day 4**:
- [ ] Implement speaker view mode
- [ ] Test window synchronization
- [ ] Implement Math plugin (`@math:`)

**Day 5**:
- [ ] Create advanced-demo tutorial
- [ ] Write ADVANCED_FEATURES.md documentation
- [ ] Test all new features
- [ ] Commit: "Phase 3 complete: Advanced features"

---

### Week 4: Polish (Phase 4)

**Day 1-2**:
- [ ] Theme creation workflow
- [ ] PDF export capability
- [ ] Plugin selection per presentation

**Day 3**:
- [ ] Performance optimizations
- [ ] Accessibility enhancements
- [ ] Bundle size analysis

**Day 4-5**:
- [ ] Complete all documentation
- [ ] Update README with new features
- [ ] Final testing and validation
- [ ] Commit: "Phase 4 complete: Polish and export"
- [ ] Commit: "Migration complete: RevealJS best practices aligned"

---

## Success Criteria

### Phase 1 Success

✅ **Fragment Indices**: All presentations use 0-based indices
✅ **Config Options**: Core options exposed and working
✅ **Fonts**: Theme-responsive sizing implemented
✅ **DOM Structure**: Validated against RevealJS docs
✅ **Documentation**: Keyboard shortcuts documented
✅ **Tests**: All 283 tests passing
✅ **Regression**: Existing presentations unchanged

---

### Phase 2 Success

✅ **Config Schema**: Complete schema with 50+ options
✅ **Validation**: Helpful error messages for invalid config
✅ **Presets**: 4 presets working (video-recording, manual-presentation, auto-demo, speaker-mode)
✅ **Frontmatter**: Config section working in YAML
✅ **Linting**: Config validation integrated
✅ **Documentation**: CONFIGURATION.md complete

---

### Phase 3 Success

✅ **Vertical Slides**: 2D navigation working with up/down arrows
✅ **Video Backgrounds**: Video playback working, all options functional
✅ **Speaker View**: Two-window sync working perfectly
✅ **Custom CSS**: External and inline CSS working
✅ **Math Plugin**: LaTeX equations rendering correctly
✅ **Auto-Animate**: Examples created and documented
✅ **Tutorial**: advanced-demo showcasing all features
✅ **Documentation**: ADVANCED_FEATURES.md complete

---

### Phase 4 Success

✅ **Theme Creation**: Workflow documented and tested
✅ **PDF Export**: Automated export working
✅ **Plugin Selection**: Per-presentation plugin config working
✅ **Performance**: No regression, optimizations applied
✅ **Accessibility**: Enhanced features implemented
✅ **Documentation**: All docs complete and current
✅ **README**: Updated with new features

---

### Overall Success

✅ **No Breaking Changes**: All existing presentations work unchanged
✅ **RevealJS Alignment**: All conventions followed correctly
✅ **Feature Parity**: Major RevealJS features exposed
✅ **Documentation**: Comprehensive and current
✅ **Tests**: 100% pass rate with new coverage
✅ **User Experience**: New features easy to discover and use
✅ **Audio/Video Sync**: Still perfect (timestamp-based approach intact)
✅ **Build Performance**: No significant regression (<5%)

---

## Risk Mitigation

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing presentations | Low | High | Comprehensive regression testing, backward compatibility focus |
| Audio sync regression | Low | Critical | Preserve timestamp-based approach, extensive testing |
| Fragment timing issues | Medium | Medium | Test fragment reveals thoroughly, validate timing calculations |
| Config option conflicts | Medium | Low | Clear precedence order, validation with helpful errors |
| Performance degradation | Low | Medium | Benchmark before/after, optimize as needed |
| Documentation becomes stale | Medium | Low | Update docs alongside code, automated checks |

---

### Rollback Plan

If critical issues arise during any phase:

1. **Git branches**: Each phase in separate branch
2. **Feature flags**: Can disable new features via config
3. **Rollback commits**: Tagged with version numbers
4. **Testing gates**: Must pass all tests before merge

**Critical Failures Only** (audio sync breaks, existing presentations fail):
```bash
# Revert to last stable commit
git revert <commit-hash>

# Or checkout previous version
git checkout <previous-tag>
```

---

## Appendix

### A. Reference Documents

- **RevealJS Documentation**: `revealjs-docs/docs/*.md`
- **Current Decisions**: `docs/architecture/revealjs/DECISIONS.md`
- **Implementation Plan (OLD)**: `docs/architecture/revealjs/IMPLEMENTATION_PLAN.md`
- **Markdown Format**: `docs/MARKDOWN_FORMAT.md`
- **Linting Spec**: `docs/LINTING_SPEC.md`

---

### B. Key Files to Modify

| File | Changes | Phase |
|------|---------|-------|
| `src/presentation/revealjs-generator.ts` | Fragment indices, config, vertical slides, video backgrounds | 1, 2, 3 |
| `src/core/types.ts` | Extended interfaces, config types | 1, 2, 3 |
| `src/parser/frontmatter-parser.ts` | Config parsing, new frontmatter fields | 2, 3 |
| `src/parser/markdown-parser.ts` | Vertical slide detection, new directives | 3 |
| `src/validation/directive-registry.ts` | New directive definitions | 3 |
| `src/validation/linting.ts` | Config validation, new directive validation | 2, 3 |
| `src/presentation/audio-sync-orchestrator.ts` | 2D navigation support | 3 |
| `src/cli/commands/dev.ts` | Speaker view mode | 3 |
| `src/core/revealjs-config-schema.ts` | **NEW**: Config schema and presets | 2 |
| `src/config/presets.ts` | **NEW**: Config preset definitions | 2 |
| `src/validation/config-validator.ts` | **NEW**: Config validation | 2 |

---

### C. Testing Checklist

**Phase 1 Testing**:
- [ ] npm test → all pass
- [ ] Fragment indices are 0-based (inspect HTML)
- [ ] Config options work (check Reveal.getConfig())
- [ ] Fonts responsive (test all themes)
- [ ] simple-demo builds
- [ ] full-demo builds
- [ ] Audio/video sync perfect
- [ ] Fragment timing accurate

**Phase 2 Testing**:
- [ ] Config schema complete (50+ options)
- [ ] Config validation working
- [ ] Helpful error messages
- [ ] All 4 presets working
- [ ] Frontmatter config parsing
- [ ] Linting updated
- [ ] CONFIGURATION.md complete

**Phase 3 Testing**:
- [ ] Vertical slides: up/down navigation
- [ ] Vertical slides: Reveal.getIndices() correct
- [ ] Video backgrounds: playback works
- [ ] Video backgrounds: all options functional
- [ ] Speaker view: two windows sync
- [ ] Speaker view: notes display
- [ ] Custom CSS: external file loads
- [ ] Custom CSS: inline styles work
- [ ] Math plugin: equations render
- [ ] Auto-animate: examples work
- [ ] advanced-demo tutorial complete
- [ ] ADVANCED_FEATURES.md complete

**Phase 4 Testing**:
- [ ] Theme creation workflow
- [ ] PDF export functional
- [ ] Plugin selection works
- [ ] Performance benchmarks
- [ ] Accessibility features
- [ ] All documentation current

---

### D. Communication & Commits

**Commit Message Format**:
```
<type>(<phase>): <description>

[Optional body explaining changes]

Phase: <phase-number>
Testing: <testing-notes>
Breaking: <yes/no>
```

**Examples**:
```
fix(phase1): change fragment indices to 0-based

Updated revealjs-generator.ts to use 0-based indexing for fragments,
matching RevealJS convention.

Phase: 1
Testing: Verified HTML output, fragments reveal correctly
Breaking: no
```

```
feat(phase3): add vertical slides support

Implemented @vertical-slide: directive with 2D navigation.
Parser detects vertical groups, generator creates nested sections,
orchestrator handles up/down navigation.

Phase: 3
Testing: Test tutorial created, up/down arrows work correctly
Breaking: no
```

**Milestone Commits**:
- "Phase 1 complete: Foundational fixes"
- "Phase 2 complete: Configuration enhancement"
- "Phase 3 complete: Advanced features"
- "Phase 4 complete: Polish and export"
- "Migration complete: RevealJS best practices aligned"

---

### E. Questions & Answers

**Q: Will this break existing presentations?**
A: No. All changes are backward compatible. Existing presentations will work unchanged.

**Q: What about audio/video sync? Will it still be perfect?**
A: Yes. The timestamp-based approach is preserved. We're not touching the core sync logic.

**Q: How long will this take?**
A: Estimated 4 weeks (can be compressed). Phase 1 is highest priority (1 week).

**Q: Can we skip Phase 4?**
A: Yes. Phases 1-3 deliver the most value. Phase 4 is polish and can be deferred.

**Q: What if we discover issues mid-migration?**
A: Each phase is in a separate branch. We can pause, fix issues, and resume. Rollback plan is documented.

---

## Conclusion

This migration plan provides a clear, phased approach to align GenAI Tutorial Factory with RevealJS best practices while maintaining 100% backward compatibility. The plan prioritizes high-value, low-risk changes first (Phase 1), followed by configuration enhancement (Phase 2), advanced features (Phase 3), and polish (Phase 4).

**Key Principles**:
- ✅ Backward compatibility maintained
- ✅ Phased approach reduces risk
- ✅ Comprehensive testing at each phase
- ✅ Clear rollback plan
- ✅ Documentation updated alongside code

**Next Steps**:
1. Create this migration plan document ✅
2. Update CLAUDE.md to reference new plan
3. Create Phase 1 todos
4. Begin Phase 1 implementation

---

**Document Version**: 1.0
**Status**: 🚀 Active - Ready to begin Phase 1
**Last Updated**: 2025-11-15
