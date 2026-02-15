#!/usr/bin/env node

import * as path from "path";
import { Command } from "commander";
import { config } from "../config/config-manager.js";
import { logger } from "../core/logger.js";
import { createBuildCommand, type BuildOptions } from "./commands/index.js";
import { createDevCommand } from "./commands/dev.js";
import { createInitCommand } from "./commands/init.js";
import { createCreateCommand } from "./commands/create.js";
import { createLintCommand } from "./commands/lint.js";
import { createDoctorCommand } from "./commands/doctor.js";
import { createVoicesCommand } from "./commands/voices.js";

/**
 * Main CLI program
 */
const program = new Command();

program
  .name("roughcut")
  .description("Generate RevealJS presentations and videos from markdown")
  .version("3.0.0");

/**
 * Load config before any command runs.
 * Uses the input file's directory for project config discovery.
 */
program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.opts();
  const inputPath = opts["input"] as string | undefined;
  const projectDir = inputPath
    ? path.dirname(path.resolve(inputPath))
    : process.cwd();
  config.load(opts, projectDir);
  logger.setLevel(config.get().logLevel);
});

/**
 * Build reveal.js presentation
 */
program
  .command("build")
  .description("Build reveal.js presentation from markdown")
  .option("-i, --input <path>", "Input markdown file")
  .option(
    "-o, --output <path>",
    "Output directory (default: .build/ next to input)",
  )
  .option("--full", "Full build: generate audio, images, and video")
  .option("--skip-audio", "Reuse cached audio files (with --full)")
  .option("--skip-images", "Reuse cached images (with --full)")
  .option("--log-level <level>", "Log level (debug, info, warn, error)")
  .action(async (options: BuildOptions) => {
    try {
      // Auto-detect presentation.md if no input specified
      if (!options.input) {
        const defaultPath = path.join(process.cwd(), "presentation.md");
        try {
          await import("fs/promises").then((fs) => fs.access(defaultPath));
          options.input = defaultPath;
        } catch {
          logger.error(
            "No input file specified and no presentation.md found in current directory.",
          );
          process.exit(1);
        }
      }

      // When --full is NOT set, default to HTML-only build
      if (!options.full) {
        options.video = false;
        options.skipAudio = true;
        options.skipImages = true;
      }

      // Default output to .build/ next to input file
      if (!options.output) {
        options.output = path.join(
          path.dirname(path.resolve(options.input)),
          ".build",
        );
      }

      const command = createBuildCommand();

      // Report progress
      command.onProgress((progress) => {
        logger.info(
          `[${progress.phase}] ${progress.message} (${progress.percentage.toFixed(0)}%)`,
        );
      });

      // Execute build
      const result = await command.execute(options);

      if (result.success) {
        logger.info("Build completed successfully!");
        logger.info(`HTML: ${result.htmlPath}`);
        if (result.videoPath) {
          logger.info(`Video: ${result.videoPath}`);
        }
        if (result.stats) {
          logger.info(`Slides: ${result.stats.slidesProcessed}`);
          logger.info(`Duration: ${result.stats.totalDuration.toFixed(2)}s`);
        }
        process.exit(0);
      } else {
        logger.error("Build failed:", result.error);
        process.exit(1);
      }
    } catch (error) {
      logger.error("Command failed", error);
      process.exit(1);
    }
  });

/**
 * Dev mode - interactive presentation testing
 */
program.addCommand(createDevCommand());

/**
 * Additional commands
 */
program.addCommand(createInitCommand());
program.addCommand(createCreateCommand());
program.addCommand(createLintCommand());
program.addCommand(createDoctorCommand());
program.addCommand(createVoicesCommand());

// Parse command line arguments
program.parse();
