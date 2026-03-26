/**
 * Markdown Linting Engine
 * Validates markdown presentations against directive registry before build
 */

import path from "path";
import fs from "fs";
import {
  DirectiveContext,
  DirectiveFormat,
  getDirectiveDefinition,
  getRequiredDirectives,
  validateDirectiveValue,
  findSimilarDirectives,
  validatePauseMarker,
  DIRECTIVE_REGISTRY,
} from "./directive-registry.js";
import {
  LintingResult,
  LintingError,
  ErrorSeverity,
  ErrorCategory,
  ErrorFactories,
} from "./linting-errors.js";
import { validateConfig } from "../validation/config-validator.js";
import type { RevealJSConfig } from "./revealjs-config-schema.js";

/**
 * Markdown linting engine
 */
export class MarkdownLinter {
  /**
   * Lint a markdown file
   */
  lint(markdown: string, filePath: string): LintingResult {
    const result = new LintingResult(filePath);
    const lines = markdown.split("\n");

    // Parse and validate frontmatter
    const frontmatterEnd = this.validateFrontmatter(lines, result);
    if (frontmatterEnd === -1) {
      // Fatal error - no frontmatter
      return result;
    }

    // Split into slides and validate each
    this.validateSlides(lines, frontmatterEnd, result);

    return result;
  }

  /**
   * Validate frontmatter block
   * Returns line number where frontmatter ends, or -1 if missing
   */
  private validateFrontmatter(lines: string[], result: LintingResult): number {
    // Check for opening ---
    const firstLine = lines[0];
    if (lines.length === 0 || !firstLine || firstLine.trim() !== "---") {
      result.addError(ErrorFactories.missingFrontmatter(1));
      return -1;
    }

    // Find closing ---
    let endLine = -1;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim() === "---") {
        endLine = i;
        break;
      }
    }

    if (endLine === -1) {
      result.addError(
        ErrorFactories.invalidFrontmatterFormat(1, 'Missing closing "---"'),
      );
      return -1;
    }

    // Parse frontmatter fields
    const frontmatterLines = lines.slice(1, endLine);
    const foundFields = new Set<string>();
    let inConfigSection = false;
    let inCustomStylesSection = false;

    for (let i = 0; i < frontmatterLines.length; i++) {
      const line = frontmatterLines[i];
      if (!line) continue;

      const lineNumber = i + 2; // +1 for array index, +1 for opening ---

      // Skip empty lines and comments (except in customStyles section where blank lines are valid CSS)
      if (line.trim().length === 0 || line.trim().startsWith("#")) {
        continue;
      }

      // Check if this is a customStyles section start (customStyles: |)
      if (line.match(/^customStyles:\s*\|?\s*$/)) {
        inCustomStylesSection = true;
        foundFields.add("customStyles");
        continue;
      }

      // Skip indented lines under customStyles section (multiline CSS content)
      if (inCustomStylesSection && line.match(/^\s+/)) {
        continue;
      }

      // If we hit a non-indented line after customStyles section, exit it
      if (inCustomStylesSection && !line.match(/^\s+/)) {
        inCustomStylesSection = false;
      }

      // Check if this is a config section start
      if (line.match(/^config:\s*$/)) {
        inConfigSection = true;
        foundFields.add("config");

        // Phase 2: Validate config options
        const configOptions = this.parseConfigSection(frontmatterLines, i);
        if (Object.keys(configOptions).length > 0) {
          const configValidation = validateConfig(configOptions);
          if (!configValidation.valid) {
            // Add validation errors
            for (const error of configValidation.errors) {
              // Build options object, only including defined fields (exactOptionalPropertyTypes)
              const errorOptions: {
                currentValue?: string;
                expectedValue?: string;
                suggestions?: string[];
                example?: string;
              } = {};

              if (error.value !== undefined) {
                errorOptions.currentValue = String(error.value);
              }
              if (error.expected) {
                errorOptions.expectedValue = error.expected;
              }
              if (error.suggestion) {
                errorOptions.suggestions = [error.suggestion];
              }
              if (error.example) {
                errorOptions.example = error.example;
              }

              result.addError(
                new LintingError(
                  ErrorSeverity.ERROR,
                  ErrorCategory.FRONTMATTER,
                  error.message,
                  lineNumber,
                  errorOptions,
                ),
              );
            }
          }
        }
        continue;
      }

      // Skip indented lines under config section (already validated above)
      if (inConfigSection && line.match(/^\s+/)) {
        continue;
      }

      // If we hit a non-indented line after config section, exit config section
      if (inConfigSection && !line.match(/^\s+/)) {
        inConfigSection = false;
      }

      // Parse field: value
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (!match || !match[1] || !match[2]) {
        result.addError(
          new LintingError(
            ErrorSeverity.ERROR,
            ErrorCategory.FRONTMATTER,
            "Invalid frontmatter line format",
            lineNumber,
            {
              currentValue: line,
              expectedValue: "field: value",
              example: 'title: "My Presentation"',
            },
          ),
        );
        continue;
      }

      const fieldName = match[1];
      const fieldValue = match[2].replace(/^["']|["']$/g, "").trim(); // Remove quotes

      // Check if field is known
      const directive = getDirectiveDefinition(
        fieldName,
        DirectiveContext.FRONTMATTER,
      );

      if (!directive) {
        // Unknown frontmatter field
        const similar = findSimilarDirectives(
          fieldName,
          DirectiveContext.FRONTMATTER,
        );
        result.addError(
          ErrorFactories.unknownDirective(fieldName, lineNumber, similar),
        );
        continue;
      }

      // Validate value
      const validation = validateDirectiveValue(directive, fieldValue);
      if (!validation.valid && validation.error) {
        result.addError(
          ErrorFactories.invalidValue(
            fieldName,
            fieldValue,
            lineNumber,
            validation.error,
            directive,
          ),
        );
      }

      // Validate asset file existence for customCSS
      if (fieldName === "customCSS") {
        this.validateAssetFile(fieldName, fieldValue, lineNumber, result);
      }

      foundFields.add(fieldName);
    }

    // Check for required fields
    const requiredDirectives = getRequiredDirectives(
      DirectiveContext.FRONTMATTER,
    );
    for (const directive of requiredDirectives) {
      if (!foundFields.has(directive.name)) {
        result.addError(
          ErrorFactories.missingRequiredFrontmatter(
            directive.name,
            1,
            directive,
          ),
        );
      }
    }

    return endLine;
  }

  /**
   * Parse config section from frontmatter
   * Extracts indented key-value pairs under "config:" section
   */
  private parseConfigSection(
    frontmatterLines: (string | undefined)[],
    configLineIndex: number,
  ): Partial<RevealJSConfig> {
    const config: Partial<RevealJSConfig> = {};

    // Parse all indented lines after "config:"
    for (let i = configLineIndex + 1; i < frontmatterLines.length; i++) {
      const line = frontmatterLines[i];
      if (!line) continue;

      // Stop when we hit a non-indented line
      if (!line.match(/^\s+/)) {
        break;
      }

      // Parse key: value
      const [key, ...valueParts] = line.trim().split(":");
      if (key && valueParts.length > 0) {
        let value: string | boolean | number = valueParts
          .join(":")
          .trim()
          .replace(/^["']|["']$/g, "");

        // Parse boolean values
        if (value === "true") value = true;
        else if (value === "false") value = false;
        // Parse numbers
        else if (!isNaN(Number(value)) && value !== "") value = Number(value);
        // Parse null
        else if (value === "null") value = null as unknown as string;

        (config as Record<string, string | boolean | number>)[key.trim()] =
          value;
      }
    }

    return config;
  }

  /**
   * Validate all slides
   */
  private validateSlides(
    lines: string[],
    startLine: number,
    result: LintingResult,
  ): void {
    // Split content into slides (separated by ---)
    const slideStarts: number[] = [startLine + 1]; // First slide starts after frontmatter

    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim() === "---") {
        slideStarts.push(i + 1);
      }
    }

    // Validate each slide
    for (let i = 0; i < slideStarts.length; i++) {
      const slideStartLine = slideStarts[i];
      const nextSlideStart = slideStarts[i + 1];
      if (slideStartLine === undefined) continue;

      const slideEndLine =
        nextSlideStart !== undefined ? nextSlideStart - 2 : lines.length;
      const slideLines = lines.slice(slideStartLine, slideEndLine + 1);

      this.validateSlide(slideLines, slideStartLine, i + 1, result);
    }
  }

  /**
   * Validate a single slide
   */
  private validateSlide(
    lines: string[],
    startLineNumber: number,
    slideNumber: number,
    result: LintingResult,
  ): void {
    const foundDirectives = new Set<string>();
    let hasContent = false;
    let inAudioBlock = false;
    let audioBlockStartLine = -1;
    let audioBlockLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const lineNumber = startLineNumber + i;

      // Skip empty lines
      if (line.trim().length === 0) {
        continue;
      }

      // Check for directives
      const directiveMatch = line.match(/^@([\w-]+):\s*(.*)$/);

      if (
        directiveMatch &&
        directiveMatch[1] &&
        directiveMatch[2] !== undefined
      ) {
        const directiveName = directiveMatch[1];
        const directiveValue = directiveMatch[2].trim();

        // Special handling for @audio (multi-line)
        if (directiveName === "audio") {
          inAudioBlock = true;
          if (audioBlockStartLine === -1) {
            audioBlockStartLine = lineNumber;
          }
          audioBlockLines.push(directiveValue);
          foundDirectives.add(directiveName);
          continue;
        }

        // Special handling for @playwright: (multi-line list on subsequent lines)
        if (directiveName === "playwright") {
          // Collect list items from subsequent lines
          const playwrightLines: string[] = [];
          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j];
            if (nextLine && nextLine.trim().startsWith("- ")) {
              playwrightLines.push(nextLine.trim());
              j++;
            } else {
              break;
            }
          }
          if (playwrightLines.length === 0) {
            const playwrightDef = getDirectiveDefinition(
              directiveName,
              DirectiveContext.SLIDE,
            )!;
            result.addError(
              ErrorFactories.invalidValue(
                directiveName,
                "",
                lineNumber,
                "Multi-line list cannot be empty",
                playwrightDef,
              ),
            );
          }
          // Skip the list item lines we already consumed
          i = j - 1;
          foundDirectives.add(directiveName);
          continue;
        }

        // End audio block if we hit another directive
        if (inAudioBlock) {
          this.validateAudioBlock(audioBlockLines, audioBlockStartLine, result);
          inAudioBlock = false;
          audioBlockStartLine = -1;
          audioBlockLines = [];
        }

        // Check if directive is known
        const directive = getDirectiveDefinition(
          directiveName,
          DirectiveContext.SLIDE,
        );

        if (!directive) {
          const similar = findSimilarDirectives(
            directiveName,
            DirectiveContext.SLIDE,
          );
          result.addError(
            ErrorFactories.unknownDirective(directiveName, lineNumber, similar),
          );
          continue;
        }

        // Validate single-line directive has value (Phase 3: skip for MARKER directives)
        if (
          directive.format === DirectiveFormat.SINGLE_LINE &&
          directiveValue.length === 0
        ) {
          // Phase 3: MARKER directives (like @vertical-slide:) should have no value
          if (directive.valueType !== "marker") {
            result.addError(
              ErrorFactories.invalidSyntax(
                directiveName,
                lineNumber,
                `@${directiveName}: value`,
                directive.example,
              ),
            );
            continue;
          }
        }

        // Validate value
        const validation = validateDirectiveValue(directive, directiveValue);
        if (!validation.valid && validation.error) {
          result.addError(
            ErrorFactories.invalidValue(
              directiveName,
              directiveValue,
              lineNumber,
              validation.error,
              directive,
            ),
          );
        }

        // Validate asset file existence for specific directives
        this.validateAssetFile(
          directiveName,
          directiveValue,
          lineNumber,
          result,
        );

        foundDirectives.add(directiveName);
      } else {
        // End audio block if we hit non-directive content
        if (inAudioBlock) {
          this.validateAudioBlock(audioBlockLines, audioBlockStartLine, result);
          inAudioBlock = false;
          audioBlockStartLine = -1;
          audioBlockLines = [];
        }

        // Check for pause markers outside @audio blocks
        const pauseMarkers = line.match(/\[(\d+(?:\.\d+)?)s\]/g);
        if (pauseMarkers) {
          for (const marker of pauseMarkers) {
            result.addError(
              ErrorFactories.pauseMarkerOutsideAudio(marker, lineNumber),
            );
          }
        }

        // Check for inline @fragment directives
        if (line.includes("@fragment")) {
          // Must be on list items
          if (!line.trim().match(/^[-*+]\s+.*@fragment/)) {
            result.addError(
              new LintingError(
                ErrorSeverity.ERROR,
                ErrorCategory.INVALID_SYNTAX,
                "@fragment can only be used on list items",
                lineNumber,
                {
                  currentValue: line.trim(),
                  example: "- Item text @fragment",
                },
              ),
            );
          }
        }

        // This line has actual content
        hasContent = true;
      }
    }

    // Validate final audio block if still open
    if (inAudioBlock) {
      this.validateAudioBlock(audioBlockLines, audioBlockStartLine, result);
    }

    // Check if slide has content
    if (!hasContent) {
      result.addError(ErrorFactories.emptySlide(slideNumber, startLineNumber));
    }
  }

  /**
   * Validate asset file existence for directives that reference local files
   */
  private validateAssetFile(
    directiveName: string,
    directiveValue: string,
    lineNumber: number,
    result: LintingResult,
  ): void {
    // Directives that reference local asset files
    const assetDirectives = [
      "background",
      "background-video",
      "customCSS",
      "image-prompt",
    ];

    // Only validate if this is an asset directive and value looks like a local path
    if (!assetDirectives.includes(directiveName)) {
      return;
    }

    // Skip validation for:
    // - URLs (http://, https://)
    // - Colors (hex, rgb, etc.)
    // - Gradients
    // - AI-generated images (@image-prompt:)
    if (
      directiveValue.startsWith("http://") ||
      directiveValue.startsWith("https://") ||
      directiveValue.startsWith("#") ||
      directiveValue.startsWith("rgb") ||
      directiveValue.startsWith("hsl") ||
      directiveValue.includes("gradient") ||
      directiveName === "image-prompt"
    ) {
      return;
    }

    // Check if this looks like a local file path
    if (!directiveValue.startsWith("./") && !directiveValue.startsWith("../")) {
      return;
    }

    // Resolve the file path relative to the markdown file
    const markdownDir = path.dirname(result.filePath);
    const assetPath = path.resolve(markdownDir, directiveValue);

    // Check if file exists
    if (!fs.existsSync(assetPath)) {
      result.addError(
        new LintingError(
          ErrorSeverity.WARNING,
          ErrorCategory.INVALID_VALUE,
          `Asset file not found: ${directiveValue}`,
          lineNumber,
          {
            currentValue: directiveValue,
            example: "Run: TUTORIAL=<name> npm run generate-assets",
            suggestions: ["Check the file path", "Generate placeholder assets"],
          },
        ),
      );
    }
  }

  /**
   * Validate @audio block
   */
  private validateAudioBlock(
    lines: string[],
    startLineNumber: number,
    result: LintingResult,
  ): void {
    // Combine all lines
    const fullText = lines.join(" ").trim();

    if (fullText.length === 0) {
      result.addError(ErrorFactories.emptyAudioBlock(startLineNumber));
      return;
    }

    // Check for any bracket patterns that might be pause markers
    // Match any [...] pattern to validate
    const allBrackets = fullText.match(/\[[^\]]+\]/g);
    if (allBrackets) {
      for (const bracket of allBrackets) {
        // Only validate if it looks like a pause marker (contains digits)
        if (/\d/.test(bracket)) {
          const validation = validatePauseMarker(bracket);
          if (!validation.valid && validation.error) {
            result.addError(
              ErrorFactories.invalidPauseMarker(
                bracket,
                startLineNumber,
                validation.error,
              ),
            );
          }
        }
      }
    }
  }
}

/**
 * Create a new markdown linter
 */
export function createMarkdownLinter(): MarkdownLinter {
  return new MarkdownLinter();
}

/**
 * Convenience function to lint a markdown file
 */
export function lintMarkdown(
  markdown: string,
  filePath: string,
): LintingResult {
  const linter = createMarkdownLinter();
  return linter.lint(markdown, filePath);
}

/**
 * Get a summary of all supported directives (for documentation)
 */
export function getDirectiveSummary(): string {
  const lines: string[] = [];

  lines.push("# Supported Directives");
  lines.push("");

  // Group by context
  const contexts = [
    DirectiveContext.FRONTMATTER,
    DirectiveContext.SLIDE,
    DirectiveContext.INLINE,
  ];

  for (const context of contexts) {
    const directives = DIRECTIVE_REGISTRY.filter((d) => d.context === context);

    lines.push(`## ${context.toUpperCase()}`);
    lines.push("");

    for (const directive of directives) {
      const requiredBadge = directive.required ? " (REQUIRED)" : "";
      lines.push(`### @${directive.name}${requiredBadge}`);
      lines.push("");
      lines.push(`**Description:** ${directive.description}`);
      lines.push("");
      lines.push(`**Format:** ${directive.format}`);
      lines.push("");
      lines.push(`**Example:**`);
      lines.push("```");
      lines.push(directive.example);
      lines.push("```");
      lines.push("");

      if (directive.notes) {
        lines.push(`**Notes:** ${directive.notes}`);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}
