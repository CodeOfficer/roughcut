/**
 * RevealJS Configuration Validation
 *
 * Validates user-provided config against the RevealJS schema
 * Provides helpful error messages with suggestions for typos
 *
 * Phase 2 of RevealJS Best Practices Migration
 */

import type { RevealJSConfig } from "../core/revealjs-config-schema.js";
import { isValidPreset } from "../core/revealjs-config-schema.js";

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error with context and suggestions
 */
export interface ValidationError {
  field: string;
  value: unknown;
  message: string;
  expected?: string | undefined;
  suggestion?: string | undefined;
  example?: string | undefined;
}

/**
 * Valid values for enum-type config options
 */
const VALID_VALUES: Record<string, string[]> = {
  controls: ["true", "false", "speaker-only"],
  controlsLayout: ["bottom-right", "edges"],
  controlsBackArrows: ["faded", "hidden", "visible"],
  showSlideNumber: ["all", "print", "speaker"],
  slideNumber: ["false", "true", "h.v", "h/v", "c", "c/t"],
  keyboardCondition: ["null", "focused"],
  navigationMode: ["default", "linear", "grid"],
  transition: ["none", "fade", "slide", "convex", "concave", "zoom"],
  transitionSpeed: ["default", "fast", "slow"],
  backgroundTransition: ["none", "fade", "slide", "convex", "concave", "zoom"],
};

/**
 * Type validators for different config option types
 */
const TYPE_VALIDATORS: Record<
  string,
  (value: unknown) => { valid: boolean; message?: string }
> = {
  boolean: (value) => {
    if (typeof value === "boolean") {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected boolean (true/false), got ${typeof value}`,
    };
  },

  number: (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected number, got ${typeof value}`,
    };
  },

  string: (value) => {
    if (typeof value === "string") {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected string, got ${typeof value}`,
    };
  },

  "boolean | string": (value) => {
    if (typeof value === "boolean" || typeof value === "string") {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected boolean or string, got ${typeof value}`,
    };
  },

  "boolean | null": (value) => {
    if (typeof value === "boolean" || value === null) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected boolean or null, got ${typeof value}`,
    };
  },

  "number | null": (value) => {
    if ((typeof value === "number" && !isNaN(value)) || value === null) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected number or null, got ${typeof value}`,
    };
  },

  "number | false": (value) => {
    if ((typeof value === "number" && !isNaN(value)) || value === false) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Expected number or false, got ${typeof value}`,
    };
  },
};

/**
 * Field-specific validation rules
 */
const FIELD_VALIDATORS: Record<
  string,
  {
    type: string;
    validator?: (value: unknown) => ValidationResult;
    example?: string;
  }
> = {
  // Display & Controls
  controls: {
    type: "boolean | string",
    example: 'true, false, or "speaker-only"',
  },
  controlsTutorial: { type: "boolean", example: "true" },
  controlsLayout: { type: "string", example: '"bottom-right" or "edges"' },
  controlsBackArrows: {
    type: "string",
    example: '"faded", "hidden", or "visible"',
  },
  progress: { type: "boolean", example: "true" },
  slideNumber: {
    type: "boolean | string",
    example: 'false, true, "h.v", "h/v", "c", "c/t"',
  },
  showSlideNumber: { type: "string", example: '"all", "print", or "speaker"' },

  // Navigation & Keyboard
  hashOneBasedIndex: { type: "boolean", example: "false" },
  hash: { type: "boolean", example: "true" },
  respondToHashChanges: { type: "boolean", example: "true" },
  jumpToSlide: { type: "boolean", example: "true" },
  history: { type: "boolean", example: "true" },
  keyboard: { type: "boolean", example: "true" },
  keyboardCondition: { type: "null | string", example: 'null or "focused"' },
  disableLayout: { type: "boolean", example: "false" },
  overview: { type: "boolean", example: "true" },
  center: { type: "boolean", example: "true" },
  touch: { type: "boolean", example: "true" },
  loop: { type: "boolean", example: "false" },
  rtl: { type: "boolean", example: "false" },
  navigationMode: { type: "string", example: '"default", "linear", or "grid"' },
  shuffle: { type: "boolean", example: "false" },

  // Fragments
  fragments: { type: "boolean", example: "true" },
  fragmentInURL: { type: "boolean", example: "true" },

  // Embedded & Help
  embedded: { type: "boolean", example: "false" },
  help: { type: "boolean", example: "true" },
  pause: { type: "boolean", example: "true" },
  showNotes: { type: "boolean", example: "false" },

  // Media & Iframes
  autoPlayMedia: { type: "boolean | null", example: "null, true, or false" },
  preloadIframes: { type: "boolean | null", example: "null, true, or false" },

  // Auto-Animate
  autoAnimate: { type: "boolean", example: "true" },
  autoAnimateEasing: { type: "string", example: '"ease"' },
  autoAnimateDuration: { type: "number", example: "1.0" },
  autoAnimateUnmatched: { type: "boolean", example: "true" },

  // Auto-Slide (Timing)
  autoSlide: { type: "number | false", example: "0, 5000, or false" },
  autoSlideStoppable: { type: "boolean", example: "true" },
  defaultTiming: { type: "number | null", example: "null or 120" },

  // Mouse & Interaction
  mouseWheel: { type: "boolean", example: "false" },
  previewLinks: { type: "boolean", example: "false" },
  postMessage: { type: "boolean", example: "true" },
  postMessageEvents: { type: "boolean", example: "false" },
  focusBodyOnPageVisibilityChange: { type: "boolean", example: "true" },

  // Transitions
  transition: {
    type: "string",
    example: '"none", "fade", "slide", "convex", "concave", "zoom"',
  },
  transitionSpeed: { type: "string", example: '"default", "fast", or "slow"' },
  backgroundTransition: {
    type: "string",
    example: '"none", "fade", "slide", "convex", "concave", "zoom"',
  },

  // PDF Export
  pdfMaxPagesPerSlide: { type: "number", example: "Number.POSITIVE_INFINITY" },
  pdfSeparateFragments: { type: "boolean", example: "true" },
  pdfPageHeightOffset: { type: "number", example: "-1" },

  // Viewport & Performance
  viewDistance: { type: "number", example: "3" },
  mobileViewDistance: { type: "number", example: "2" },
  display: { type: "string", example: '"block"' },

  // Cursor
  hideInactiveCursor: { type: "boolean", example: "true" },
  hideCursorTime: { type: "number", example: "5000" },

  // Presentation Size
  width: { type: "number", example: "960" },
  height: { type: "number", example: "700" },
  margin: { type: "number", example: "0.04" },
  minScale: { type: "number", example: "0.2" },
  maxScale: { type: "number", example: "2.0" },
};

/**
 * Calculate Levenshtein distance for typo suggestions
 */
function levenshteinDistance(a: string, b: string): number {
  // Initialize matrix with proper dimensions
  const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0),
  );

  // Initialize first column
  for (let i = 0; i <= b.length; i++) {
    matrix[i]![0] = i;
  }

  // Initialize first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const rowAbove = matrix[i - 1]!;
      const currentRow = matrix[i]!;
      const cellAboveLeft = rowAbove[j - 1]!;
      const cellLeft = currentRow[j - 1]!;
      const cellAbove = rowAbove[j]!;

      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        currentRow[j] = cellAboveLeft;
      } else {
        currentRow[j] = Math.min(
          cellAboveLeft + 1,
          cellLeft + 1,
          cellAbove + 1,
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}

/**
 * Find closest match for a typo
 */
function findClosestMatch(
  input: string,
  validOptions: string[],
): string | undefined {
  let minDistance = Infinity;
  let closestMatch: string | undefined;

  for (const option of validOptions) {
    const distance = levenshteinDistance(
      input.toLowerCase(),
      option.toLowerCase(),
    );
    if (distance < minDistance && distance <= 3) {
      minDistance = distance;
      closestMatch = option;
    }
  }

  return closestMatch;
}

/**
 * Validate a single config field
 */
function validateField(field: string, value: unknown): ValidationError | null {
  const validator = FIELD_VALIDATORS[field];

  if (!validator) {
    // Unknown field - suggest closest match
    const validFields = Object.keys(FIELD_VALIDATORS);
    const suggestion = findClosestMatch(field, validFields);

    const error: ValidationError = {
      field,
      value,
      message: `Unknown config option: "${field}"`,
    };

    if (suggestion) {
      error.suggestion = `Did you mean "${suggestion}"?`;
      const suggestedExample = FIELD_VALIDATORS[suggestion]?.example;
      if (suggestedExample) {
        error.example = suggestedExample;
      }
    }

    return error;
  }

  // Type validation
  const baseType = validator.type.split(" | ")[0];
  const typeValidator =
    TYPE_VALIDATORS[validator.type] ||
    (baseType ? TYPE_VALIDATORS[baseType] : undefined);

  if (typeValidator) {
    const typeResult = typeValidator(value);
    if (!typeResult.valid) {
      const error: ValidationError = {
        field,
        value,
        message: typeResult.message!,
        expected: validator.type,
      };

      if (validator.example) {
        error.example = validator.example;
      }

      return error;
    }
  }

  // Enum validation (for string fields with fixed values)
  if (VALID_VALUES[field]) {
    const stringValue = String(value);
    if (!VALID_VALUES[field].includes(stringValue)) {
      const suggestion = findClosestMatch(stringValue, VALID_VALUES[field]);

      const error: ValidationError = {
        field,
        value,
        message: `Invalid value for ${field}`,
        expected: VALID_VALUES[field].join(", "),
      };

      if (suggestion) {
        error.suggestion = `Did you mean "${suggestion}"?`;
      }

      if (validator.example) {
        error.example = validator.example;
      }

      return error;
    }
  }

  // Custom validator if provided
  if (validator.validator) {
    const customResult = validator.validator(value);
    if (!customResult.valid && customResult.errors.length > 0) {
      const error = customResult.errors[0];
      return error || null;
    }
  }

  return null;
}

/**
 * Validate preset name
 */
export function validatePreset(preset: string): ValidationResult {
  if (!isValidPreset(preset)) {
    const validPresets = [
      "video-recording",
      "manual-presentation",
      "auto-demo",
      "speaker-mode",
    ];
    const suggestion = findClosestMatch(preset, validPresets);

    const error: ValidationError = {
      field: "preset",
      value: preset,
      message: `Unknown preset: "${preset}"`,
      expected: validPresets.join(", "),
      example:
        '"video-recording", "manual-presentation", "auto-demo", or "speaker-mode"',
    };

    if (suggestion) {
      error.suggestion = `Did you mean "${suggestion}"?`;
    }

    return {
      valid: false,
      errors: [error],
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Validate complete config object
 */
export function validateConfig(
  config: Partial<RevealJSConfig>,
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, value] of Object.entries(config)) {
    const error = validateField(field, value);
    if (error) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(
    "================================================================================",
  );
  lines.push("CONFIGURATION VALIDATION ERRORS");
  lines.push(
    "================================================================================",
  );
  lines.push("");
  lines.push(`Found ${errors.length} error(s):`);
  lines.push("");

  for (const error of errors) {
    lines.push(`[ERROR] config.${error.field}`);
    lines.push(`  ${error.message}`);
    if (error.value !== undefined) {
      lines.push(`  Current: ${JSON.stringify(error.value)}`);
    }
    if (error.expected) {
      lines.push(`  Expected: ${error.expected}`);
    }
    if (error.suggestion) {
      lines.push(`  ${error.suggestion}`);
    }
    if (error.example) {
      lines.push(`  Example: ${error.example}`);
    }
    lines.push("");
  }

  lines.push(
    "================================================================================",
  );
  lines.push("");
  lines.push(
    "See docs/architecture/revealjs/CONFIGURATION.md for complete reference.",
  );
  lines.push("");

  return lines.join("\n");
}
