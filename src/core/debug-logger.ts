/**
 * Debug logging system for verbose operation tracking
 * Writes detailed logs to {outputDir}/debug.txt with timestamps
 */

import { appendFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Operation tracking for timing analysis
 */
interface Operation {
  name: string;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

/**
 * Debug logger that writes to file with operation tracking
 */
export class DebugLogger {
  private filePath: string;
  private operations: Map<string, Operation> = new Map();
  private initialized = false;

  constructor(outputDir: string) {
    this.filePath = join(outputDir, 'debug.txt');
  }

  /**
   * Initialize the debug log file
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const header = [
      '='.repeat(80),
      `Build Debug Log - ${new Date().toISOString()}`,
      '='.repeat(80),
      '',
    ].join('\n');

    await writeFile(this.filePath, header, 'utf-8');
    this.initialized = true;
  }

  /**
   * Write a log entry with timestamp
   */
  async log(level: string, message: string, metadata?: Record<string, any>): Promise<void> {
    await this.initialize();

    const timestamp = new Date().toISOString();
    let entry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      entry += `\n  ${JSON.stringify(metadata, null, 2).split('\n').join('\n  ')}`;
    }

    entry += '\n';

    await appendFile(this.filePath, entry, 'utf-8');
  }

  /**
   * Start tracking an operation
   */
  async startOperation(name: string, metadata?: Record<string, any>): Promise<void> {
    const operation: Operation = {
      name,
      startTime: Date.now(),
    };

    if (metadata) {
      operation.metadata = metadata;
    }

    this.operations.set(name, operation);

    await this.log('OPERATION', `Started: ${name}`, metadata);
  }

  /**
   * End tracking an operation and calculate duration
   */
  async endOperation(name: string, metadata?: Record<string, any>): Promise<number> {
    const operation = this.operations.get(name);
    if (!operation) {
      await this.log('WARN', `Attempted to end unknown operation: ${name}`);
      return 0;
    }

    operation.endTime = Date.now();
    const duration = operation.endTime - operation.startTime;

    const combinedMetadata = {
      ...operation.metadata,
      ...metadata,
      duration_ms: duration,
      duration_s: (duration / 1000).toFixed(2),
    };

    await this.log('OPERATION', `Completed: ${name}`, combinedMetadata);

    return duration;
  }

  /**
   * Log debug message
   */
  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log('DEBUG', message, metadata);
  }

  /**
   * Log info message
   */
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log('INFO', message, metadata);
  }

  /**
   * Log warning message
   */
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log('WARN', message, metadata);
  }

  /**
   * Log error message
   */
  async error(message: string, error?: Error | unknown, metadata?: Record<string, any>): Promise<void> {
    const errorMetadata: Record<string, any> = { ...metadata };

    if (error instanceof Error) {
      errorMetadata['error'] = error.message;
      errorMetadata['stack'] = error.stack;
    } else if (error) {
      errorMetadata['error'] = String(error);
    }

    await this.log('ERROR', message, errorMetadata);
  }

  /**
   * Write summary of all operations
   */
  async writeSummary(): Promise<void> {
    const summary = [
      '',
      '='.repeat(80),
      'OPERATIONS SUMMARY',
      '='.repeat(80),
      '',
    ];

    const completedOps = Array.from(this.operations.values()).filter(op => op.endTime);
    const totalDuration = completedOps.reduce((sum, op) => sum + ((op.endTime || 0) - op.startTime), 0);

    summary.push(`Total Operations: ${completedOps.length}`);
    summary.push(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    summary.push('');
    summary.push('Individual Operations:');

    for (const op of completedOps) {
      const duration = ((op.endTime || 0) - op.startTime) / 1000;
      summary.push(`  - ${op.name}: ${duration.toFixed(2)}s`);
    }

    summary.push('');
    summary.push('='.repeat(80));
    summary.push('');

    await appendFile(this.filePath, summary.join('\n'), 'utf-8');
  }

  /**
   * Get the debug log file path
   */
  getFilePath(): string {
    return this.filePath;
  }
}

/**
 * Create a new debug logger instance
 */
export function createDebugLogger(outputDir: string): DebugLogger {
  return new DebugLogger(outputDir);
}
