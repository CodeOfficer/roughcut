/**
 * Lint command — validate presentation markdown
 */

import { Command } from "commander";
import * as fs from "fs/promises";
import * as path from "path";
import { lintMarkdown } from "../../core/linter.js";
import { logger } from "../../core/logger.js";

export function createLintCommand(): Command {
  const cmd = new Command("lint");

  cmd
    .description("Validate presentation markdown format")
    .argument("[path]", "Path to markdown file")
    .action(async (filePath?: string) => {
      try {
        // Auto-detect presentation.md if no path specified
        if (!filePath) {
          const defaultPath = path.join(process.cwd(), "presentation.md");
          try {
            await fs.access(defaultPath);
            filePath = defaultPath;
          } catch {
            logger.error(
              "No input file specified and no presentation.md found in current directory.",
            );
            process.exit(1);
          }
        }
        await runLint(filePath);
      } catch (error) {
        logger.error("Lint failed", error);
        process.exit(1);
      }
    });

  return cmd;
}

async function runLint(filePath: string): Promise<void> {
  const markdown = await fs.readFile(filePath, "utf-8");
  const result = lintMarkdown(markdown, filePath);

  console.log(result.toString());

  if (!result.passed) {
    process.exit(1);
  }

  if (result.warnings.length === 0) {
    logger.success("No issues found");
  }
}
