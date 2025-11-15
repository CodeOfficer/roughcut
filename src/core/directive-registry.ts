/**
 * Directive Registry - Source of truth for all valid @commands
 * Defines syntax, validation rules, and constraints for markdown directives
 */

/**
 * Context where directive can be used
 */
export enum DirectiveContext {
  FRONTMATTER = 'frontmatter',
  SLIDE = 'slide',
  INLINE = 'inline',
}

/**
 * Value type for directive validation
 */
export enum DirectiveValueType {
  STRING = 'string',
  DURATION = 'duration',
  COLOR = 'color',
  ENUM = 'enum',
  URL = 'url',
  PROMPT = 'prompt',
  VOICE_ID = 'voice_id',
  RESOLUTION = 'resolution',
  MULTILINE_TEXT = 'multiline_text',
  MULTILINE_LIST = 'multiline_list',
  INLINE_MARKER = 'inline_marker',
}

/**
 * Format specification for directive (single-line vs multi-line)
 */
export enum DirectiveFormat {
  SINGLE_LINE = 'single_line', // @directive: value
  MULTI_LINE = 'multi_line', // Multiple @directive: lines
  INLINE = 'inline', // @directive in content (e.g., @fragment)
}

/**
 * Directive definition
 */
export interface DirectiveDefinition {
  /** Directive name (without @) */
  name: string;

  /** Context where directive can be used */
  context: DirectiveContext;

  /** Format (single-line, multi-line, inline) */
  format: DirectiveFormat;

  /** Value type for validation */
  valueType: DirectiveValueType;

  /** Valid values (for enums) */
  validValues?: string[];

  /** Whether directive is required */
  required: boolean;

  /** Default value if not provided */
  defaultValue?: any;

  /** Description for documentation */
  description: string;

  /** Example usage */
  example: string;

  /** Additional validation notes */
  notes?: string;
}

/**
 * Registry of all valid directives
 */
export const DIRECTIVE_REGISTRY: DirectiveDefinition[] = [
  // ========================================================================
  // FRONTMATTER DIRECTIVES
  // ========================================================================
  {
    name: 'title',
    context: DirectiveContext.FRONTMATTER,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.STRING,
    required: true,
    description: 'Presentation title',
    example: 'title: "My Awesome Presentation"',
  },
  {
    name: 'theme',
    context: DirectiveContext.FRONTMATTER,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.ENUM,
    validValues: [
      'black',
      'white',
      'league',
      'beige',
      'sky',
      'night',
      'serif',
      'simple',
      'solarized',
      'blood',
      'moon',
      'dracula',
    ],
    required: true,
    description: 'RevealJS theme',
    example: 'theme: dracula',
  },
  {
    name: 'voice',
    context: DirectiveContext.FRONTMATTER,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.VOICE_ID,
    required: false,
    description: 'ElevenLabs voice ID for TTS narration',
    example: 'voice: adam',
    notes: 'Falls back to ELEVENLABS_VOICE_ID environment variable if not provided',
  },
  {
    name: 'resolution',
    context: DirectiveContext.FRONTMATTER,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.RESOLUTION,
    required: false,
    defaultValue: '1920x1080',
    description: 'Video output resolution',
    example: 'resolution: 1920x1080',
  },
  {
    name: 'preset',
    context: DirectiveContext.FRONTMATTER,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.ENUM,
    validValues: ['video-recording', 'manual-presentation', 'auto-demo', 'speaker-mode'],
    required: false,
    description: 'RevealJS configuration preset (Phase 2)',
    example: 'preset: manual-presentation',
    notes: 'Applies a preset configuration optimized for specific use cases. Can be overridden by config section.',
  },
  {
    name: 'config',
    context: DirectiveContext.FRONTMATTER,
    format: DirectiveFormat.MULTI_LINE,
    valueType: DirectiveValueType.STRING,
    required: false,
    description: 'RevealJS configuration overrides (nested YAML)',
    example: `config:
  controls: true
  progress: false
  slideNumber: 'c/t'`,
    notes: 'Phase 2: Supports 60+ RevealJS options. See docs/architecture/revealjs/CONFIGURATION.md',
  },

  // ========================================================================
  // SLIDE-LEVEL DIRECTIVES (Single-line)
  // ========================================================================
  {
    name: 'duration',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.DURATION,
    required: false,
    description: 'Expected slide duration in seconds or milliseconds',
    example: '@duration: 8s',
    notes: 'Supports formats: 5s, 500ms, 5.5s',
  },
  {
    name: 'pause-after',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.DURATION,
    required: false,
    defaultValue: '1s',
    description: 'Pause duration after audio ends before advancing to next slide',
    example: '@pause-after: 2s',
  },
  {
    name: 'transition',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.ENUM,
    validValues: ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'],
    required: false,
    description: 'RevealJS transition effect for this slide',
    example: '@transition: zoom',
  },
  {
    name: 'background',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.COLOR,
    required: false,
    description: 'Background color, gradient, or image URL for this slide',
    example: '@background: #1e1e1e',
    notes: 'Supports hex colors, rgb(), gradients, and image URLs',
  },
  {
    name: 'image-prompt',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.PROMPT,
    required: false,
    description: 'AI image generation prompt (uses Gemini)',
    example: '@image-prompt: A futuristic workspace with holographic displays',
    notes: 'Requires GEMINI_API_KEY environment variable',
  },
  {
    name: 'notes',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.SINGLE_LINE,
    valueType: DirectiveValueType.STRING,
    required: false,
    description: 'Speaker notes for this slide',
    example: '@notes: Remember to emphasize the key benefits here',
  },

  // ========================================================================
  // SLIDE-LEVEL DIRECTIVES (Multi-line)
  // ========================================================================
  {
    name: 'audio',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.MULTI_LINE,
    valueType: DirectiveValueType.MULTILINE_TEXT,
    required: false,
    description: 'Audio narration text with optional pause markers',
    example: '@audio: This is the first sentence.\n@audio: This is the second sentence [2s] with a pause.\n@audio: This is the third sentence.',
    notes: 'Multi-line format recommended for TTS caching. Pause markers: [1s], [2.5s], etc.',
  },
  {
    name: 'playwright',
    context: DirectiveContext.SLIDE,
    format: DirectiveFormat.MULTI_LINE,
    valueType: DirectiveValueType.MULTILINE_LIST,
    required: false,
    description: 'Browser automation instructions',
    example: '@playwright:\n- Action: Click button#submit\n- Wait 2s\n- Screenshot: form-submitted',
    notes: 'Supports three instruction types: Action, Wait, Screenshot',
  },

  // ========================================================================
  // INLINE DIRECTIVES
  // ========================================================================
  {
    name: 'fragment',
    context: DirectiveContext.INLINE,
    format: DirectiveFormat.INLINE,
    valueType: DirectiveValueType.INLINE_MARKER,
    required: false,
    description: 'Progressive disclosure marker for list items',
    example: '- Item one @fragment\n- Item two @fragment +2s',
    notes: 'Must be used on list items. Supports timing offset: @fragment +2s',
  },
];

/**
 * Validation functions for each value type
 */
export const VALUE_VALIDATORS: Record<
  DirectiveValueType,
  (value: string) => { valid: boolean; error?: string }
> = {
  [DirectiveValueType.STRING]: (value: string) => {
    if (value.trim().length === 0) {
      return { valid: false, error: 'Value cannot be empty' };
    }
    return { valid: true };
  },

  [DirectiveValueType.DURATION]: (value: string) => {
    const match = value.match(/^(\d+(?:\.\d+)?)(s|ms)$/);
    if (!match) {
      return {
        valid: false,
        error: 'Invalid duration format. Use "5s" or "500ms" (supports decimals like "2.5s")',
      };
    }
    return { valid: true };
  },

  [DirectiveValueType.COLOR]: (value: string) => {
    // Support hex colors, rgb/rgba, hsl/hsla, CSS named colors, gradients, and URLs
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    const rgbPattern = /^rgba?\([\d\s,./]+\)$/;
    const hslPattern = /^hsla?\([\d\s,./%]+\)$/;
    const gradientPattern = /^(linear|radial)-gradient\(/;
    const urlPattern = /^url\(|^https?:\/\//;

    if (
      hexPattern.test(value) ||
      rgbPattern.test(value) ||
      hslPattern.test(value) ||
      gradientPattern.test(value) ||
      urlPattern.test(value)
    ) {
      return { valid: true };
    }

    // CSS named colors (basic set)
    const namedColors = [
      'black',
      'white',
      'red',
      'green',
      'blue',
      'yellow',
      'cyan',
      'magenta',
      'gray',
      'orange',
      'purple',
      'pink',
      'brown',
      'transparent',
    ];
    if (namedColors.includes(value.toLowerCase())) {
      return { valid: true };
    }

    return {
      valid: false,
      error: 'Invalid color format. Use hex (#1e1e1e), rgb(r,g,b), CSS color name, gradient, or image URL',
    };
  },

  [DirectiveValueType.ENUM]: (_value: string) => {
    // Enum validation is handled separately with validValues array
    return { valid: true };
  },

  [DirectiveValueType.URL]: (value: string) => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format. Must be a valid http:// or https:// URL',
      };
    }
  },

  [DirectiveValueType.PROMPT]: (value: string) => {
    if (value.trim().length < 10) {
      return {
        valid: false,
        error: 'Image prompt must be at least 10 characters (be descriptive for better AI results)',
      };
    }
    return { valid: true };
  },

  [DirectiveValueType.VOICE_ID]: (value: string) => {
    // ElevenLabs voice IDs can be:
    // - Short names like "adam", "bella"
    // - Long IDs like "EXAVITQu4vr4xnSDxMaL"
    if (value.trim().length === 0) {
      return { valid: false, error: 'Voice ID cannot be empty' };
    }
    // Basic validation: alphanumeric
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      return {
        valid: false,
        error: 'Invalid voice ID format. Must be alphanumeric (can include - and _)',
      };
    }
    return { valid: true };
  },

  [DirectiveValueType.RESOLUTION]: (value: string) => {
    const match = value.match(/^(\d+)x(\d+)$/);
    if (!match || !match[1] || !match[2]) {
      return {
        valid: false,
        error: 'Invalid resolution format. Use "1920x1080" or similar',
      };
    }
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    if (width < 640 || height < 480) {
      return {
        valid: false,
        error: 'Resolution too small. Minimum is 640x480',
      };
    }
    return { valid: true };
  },

  [DirectiveValueType.MULTILINE_TEXT]: (value: string) => {
    if (value.trim().length === 0) {
      return { valid: false, error: 'Multi-line text cannot be empty' };
    }
    return { valid: true };
  },

  [DirectiveValueType.MULTILINE_LIST]: (value: string) => {
    if (value.trim().length === 0) {
      return { valid: false, error: 'Multi-line list cannot be empty' };
    }
    return { valid: true };
  },

  [DirectiveValueType.INLINE_MARKER]: (value: string) => {
    // @fragment can have optional timing: @fragment +2s
    if (value.trim().length === 0) {
      return { valid: true }; // Just "@fragment" with no timing
    }
    const match = value.match(/^\+(\d+(?:\.\d+)?)(s|ms)$/);
    if (!match) {
      return {
        valid: false,
        error: 'Invalid fragment timing. Use "@fragment" or "@fragment +2s"',
      };
    }
    return { valid: true };
  },
};

/**
 * Get directive definition by name
 */
export function getDirectiveDefinition(
  name: string,
  context: DirectiveContext
): DirectiveDefinition | undefined {
  return DIRECTIVE_REGISTRY.find((d) => d.name === name && d.context === context);
}

/**
 * Get all directives for a context
 */
export function getDirectivesForContext(context: DirectiveContext): DirectiveDefinition[] {
  return DIRECTIVE_REGISTRY.filter((d) => d.context === context);
}

/**
 * Get all required directives for a context
 */
export function getRequiredDirectives(context: DirectiveContext): DirectiveDefinition[] {
  return DIRECTIVE_REGISTRY.filter((d) => d.context === context && d.required);
}

/**
 * Validate a directive value
 */
export function validateDirectiveValue(
  directive: DirectiveDefinition,
  value: string
): { valid: boolean; error?: string } {
  // Check enum values first
  if (directive.valueType === DirectiveValueType.ENUM && directive.validValues) {
    if (!directive.validValues.includes(value)) {
      return {
        valid: false,
        error: `Invalid value "${value}". Valid options: ${directive.validValues.join(', ')}`,
      };
    }
    return { valid: true };
  }

  // Use value validator
  const validator = VALUE_VALIDATORS[directive.valueType];
  if (!validator) {
    return { valid: true }; // No validator defined, assume valid
  }

  return validator(value);
}

/**
 * Find similar directive names (for typo suggestions)
 * Uses Levenshtein distance
 */
export function findSimilarDirectives(name: string, context: DirectiveContext): string[] {
  const contextDirectives = getDirectivesForContext(context);

  // Calculate Levenshtein distance
  const distances = contextDirectives.map((d) => ({
    name: d.name,
    distance: levenshteinDistance(name.toLowerCase(), d.name.toLowerCase()),
  }));

  // Return directives with distance <= 2 (likely typos)
  return distances
    .filter((d) => d.distance <= 2 && d.distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .map((d) => d.name);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    const row = matrix[0];
    if (row) {
      row[j] = j;
    }
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        const prevRow = matrix[i - 1];
        const currentRow = matrix[i];
        const prevValue = prevRow?.[j - 1];
        if (prevRow && currentRow && typeof prevValue === 'number') {
          currentRow[j] = prevValue;
        }
      } else {
        const prevRow = matrix[i - 1];
        const currentRow = matrix[i];
        const subst = prevRow?.[j - 1];
        const insert = currentRow?.[j - 1];
        const del = prevRow?.[j];
        if (
          prevRow &&
          currentRow &&
          typeof subst === 'number' &&
          typeof insert === 'number' &&
          typeof del === 'number'
        ) {
          currentRow[j] = Math.min(
            subst + 1, // substitution
            insert + 1, // insertion
            del + 1 // deletion
          );
        }
      }
    }
  }

  const lastRow = matrix[b.length];
  const result = lastRow?.[a.length];
  return typeof result === 'number' ? result : 0;
}

/**
 * Validate pause marker syntax [Xs]
 */
export function validatePauseMarker(marker: string): { valid: boolean; error?: string } {
  const match = marker.match(/^\[(\d+(?:\.\d+)?)s\]$/);
  if (!match || !match[1]) {
    return {
      valid: false,
      error: 'Invalid pause marker format. Use [1s], [2s], [2.5s], etc.',
    };
  }
  const duration = parseFloat(match[1]);
  if (duration <= 0) {
    return {
      valid: false,
      error: 'Pause duration must be greater than 0',
    };
  }
  if (duration > 30) {
    return {
      valid: false,
      error: 'Pause duration too long (max 30 seconds). Consider splitting into separate slides.',
    };
  }
  return { valid: true };
}
