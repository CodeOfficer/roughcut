import chalk from "chalk";

/**
 * Log levels in order of severity
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Map log levels to numeric values for comparison
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger class with support for different log levels and colored output
 */
class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  /**
   * Check if a log level should be displayed based on current configuration
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[this.level];
  }

  /**
   * Format a message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timePart = new Date().toISOString().split("T")[1];
    const timestamp = timePart ? timePart.split(".")[0] : "00:00:00";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Log a debug message (gray)
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.log(chalk.gray(this.formatMessage("debug", message)), ...args);
    }
  }

  /**
   * Log an info message (blue)
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.log(chalk.blue(this.formatMessage("info", message)), ...args);
    }
  }

  /**
   * Log a success message (green)
   */
  success(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.log(chalk.green(`✓ ${message}`), ...args);
    }
  }

  /**
   * Log a warning message (yellow)
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(chalk.yellow(this.formatMessage("warn", message)), ...args);
    }
  }

  /**
   * Log an error message (red)
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(chalk.red(this.formatMessage("error", message)), ...args);
      if (error instanceof Error) {
        console.error(chalk.red(error.stack || error.message));
      } else if (error) {
        console.error(chalk.red(String(error)));
      }
    }
  }

  /**
   * Log a step in a process (cyan)
   */
  step(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.log(chalk.cyan(`→ ${message}`), ...args);
    }
  }

  /**
   * Log section header (bold white)
   */
  section(message: string): void {
    if (this.shouldLog("info")) {
      console.log("\n" + chalk.bold.white(message));
    }
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

/**
 * Default logger instance configured from environment
 */
const defaultLevel = (process.env["LOG_LEVEL"] as LogLevel) || "info";
export const logger = new Logger(defaultLevel);

/**
 * Create a new logger instance with custom level
 */
export const createLogger = (level: LogLevel): Logger => {
  return new Logger(level);
};
