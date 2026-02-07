#!/usr/bin/env node
/**
 * PreToolUse hook to enforce conversation context in git commits.
 *
 * This hook intercepts Bash tool usage and checks if the command contains 'git commit'.
 * If it does, and the skill is installed, it blocks commits that don't include conversation context.
 *
 * Environment variables:
 *   SKIP_COMMIT_HOOK=1 - Disable the hook (useful for git operations like rebase)
 *
 * Exit codes:
 *   0 - Allow the tool call
 *   2 - Block the tool call (with error message via stderr)
 */

import { stdin, stdout, stderr, exit } from "node:process";
import { existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";

// Configuration: Skill name and marker text
const COMMIT_CONTEXT_SKILL = "commit-context-summary";
const CONTEXT_MARKER = "Conversation Context:";
const LOG_FILE = "/tmp/claude-hook-check-git-commit.log";

// Logging utility
function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [HOOK] ${message}\n`;
  try {
    appendFileSync(LOG_FILE, logLine, "utf-8");
  } catch (err) {
    // Silently fail if we can't write to log
  }
}

async function main() {
  try {
    log("Hook started");

    // Check if hook is disabled via environment variable
    if (process.env.SKIP_COMMIT_HOOK === "1") {
      log("✓ SKIP: Hook disabled via SKIP_COMMIT_HOOK=1");
      exit(0);
    }

    // Read the hook input from stdin
    let inputData = "";
    for await (const chunk of stdin) {
      inputData += chunk;
    }

    log(`Raw input received: ${inputData.substring(0, 200)}...`);

    const hookInput = JSON.parse(inputData);
    const toolName = hookInput.tool_name || "";
    const toolInput = hookInput.tool_input || {};
    const command = toolInput.command || "";
    const cwd = hookInput.cwd || process.cwd();

    log(`Tool: ${toolName}, CWD: ${cwd}`);
    log(`Command preview: ${command.substring(0, 100)}...`);

    // Check if this is a Bash tool call with a git commit command
    // Use a more precise pattern to avoid false positives (e.g., grep "git commit")
    // Match: git commit as actual command (after whitespace/operators, not inside quotes)
    const gitCommitPattern = /(^|[;&|]\s*|\s)git\s+commit(\s|$)/;
    const isGitCommit = toolName === "Bash" && gitCommitPattern.test(command);

    if (isGitCommit) {
      log("✓ Detected git commit command in Bash tool");

      // Check if the commit context skill is installed
      const skillPath = join(
        cwd,
        `.claude/skills/${COMMIT_CONTEXT_SKILL}/SKILL.md`,
      );
      log(`Checking for skill at: ${skillPath}`);
      const skillExists = existsSync(skillPath);
      log(`Skill exists: ${skillExists}`);

      if (skillExists) {
        // Check if commit message already includes conversation context
        // Use regex with multiline flag to ensure marker is at start of a line
        // (prevents false positives when marker text appears in prose)
        const contextPattern = new RegExp(`^${CONTEXT_MARKER}`, "m");
        const hasContext = contextPattern.test(command);
        log(`Pattern match for "${CONTEXT_MARKER}": ${hasContext}`);

        if (hasContext) {
          // Allow - commit already has context (added by skill or user)
          log("✓ ALLOW: Commit has conversation context marker");
          exit(0);
        }

        // Block - missing conversation context
        log("✗ BLOCK: Commit missing conversation context marker");
        const errorMsg =
          "❌ Git commit blocked: Missing conversation context.\n\n" +
          `Please use the ${COMMIT_CONTEXT_SKILL} skill first to add ` +
          "conversation context to your commit message.\n\n" +
          "The skill will help you document how this work came about.";

        stderr.write(errorMsg);
        log("Exiting with code 2 (block)");
        exit(2);
      }
      // Skill not installed - allow commit without enforcement
      log("✓ ALLOW: Skill not installed, no enforcement");
    } else {
      log(
        `No git commit detected (tool: ${toolName}, has "git commit": ${command.includes("git commit")})`,
      );
    }

    // No git commit detected - allow silently
    log("✓ ALLOW: Exiting with code 0 (allow)");
    exit(0);
  } catch (error) {
    // If something goes wrong, log it but don't block the tool call
    log(`✗ ERROR: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    stderr.write(`Hook error (non-blocking): ${error.message}\n`);
    log("Exiting with code 0 (allow despite error)");
    exit(0);
  }
}

main();
