/**
 * Build summary generator for user-friendly build reports
 * Creates {outputDir}/build-summary.txt with readable overview
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Stage timing information
 */
export interface StageTiming {
  name: string;
  durationMs: number;
  metadata?: Record<string, any>;
}

/**
 * Build summary data
 */
export interface BuildSummaryData {
  /** Total build duration in milliseconds */
  totalDurationMs: number;

  /** Success or failure */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Stage timings */
  stages: StageTiming[];

  /** Number of slides processed */
  slidesProcessed: number;

  /** Presentation duration in seconds */
  presentationDuration?: number;

  /** Audio cache statistics */
  audioCacheHits?: number;
  audioCacheMisses?: number;

  /** Video output size in bytes */
  videoSizeBytes?: number;

  /** HTML output path */
  htmlPath?: string;

  /** Video output path */
  videoPath?: string;
}

/**
 * Build summary generator
 */
export class BuildSummaryGenerator {
  /**
   * Generate and write build summary
   */
  async generate(outputDir: string, data: BuildSummaryData): Promise<void> {
    const summary = this.formatSummary(data);
    const summaryPath = join(outputDir, 'build-summary.txt');
    await writeFile(summaryPath, summary, 'utf-8');
  }

  /**
   * Format build summary as human-readable text
   */
  private formatSummary(data: BuildSummaryData): string {
    const lines: string[] = [];

    // Header
    lines.push('='.repeat(80));
    lines.push('BUILD SUMMARY');
    lines.push('='.repeat(80));
    lines.push('');

    // Status
    const totalSeconds = data.totalDurationMs / 1000;
    lines.push(`Build Time: ${totalSeconds.toFixed(2)}s`);
    lines.push(`Status: ${data.success ? '✓ Success' : '✗ Failed'}`);

    if (data.error) {
      lines.push(`Error: ${data.error}`);
    }

    lines.push('');

    // Stage breakdown
    if (data.stages.length > 0) {
      lines.push('Stage Breakdown:');

      // Calculate percentages
      const stagesWithPercent = data.stages.map(stage => ({
        ...stage,
        percent: (stage.durationMs / data.totalDurationMs) * 100,
      }));

      // Find slowest stage
      const slowest = stagesWithPercent.reduce((max, stage) =>
        stage.durationMs > max.durationMs ? stage : max
      );

      for (const stage of stagesWithPercent) {
        const seconds = (stage.durationMs / 1000).toFixed(2);
        const percent = stage.percent.toFixed(1);
        const isSlowest = stage.name === slowest.name && stage.durationMs > 1000;

        let line = `  ${this.formatStageName(stage.name)}: ${seconds}s (${percent.padStart(5)}%)`;

        // Add metadata if available
        if (stage.metadata) {
          const meta = this.formatMetadata(stage.metadata);
          if (meta) {
            line += ` - ${meta}`;
          }
        }

        // Mark slowest stage
        if (isSlowest) {
          line += ' ← SLOWEST';
        }

        lines.push(line);
      }

      lines.push('');
    }

    // Presentation info
    lines.push(`Slides: ${data.slidesProcessed} total`);
    if (data.presentationDuration) {
      lines.push(`Presentation Duration: ${data.presentationDuration.toFixed(2)}s`);
    }

    // Cache statistics
    if (data.audioCacheHits !== undefined || data.audioCacheMisses !== undefined) {
      const hits = data.audioCacheHits || 0;
      const misses = data.audioCacheMisses || 0;
      const total = hits + misses;
      const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) : '0.0';

      lines.push('');
      lines.push(`Audio Cache: ${hits} hits, ${misses} misses (${hitRate}% hit rate)`);
      if (hits > 0) {
        lines.push(`  💰 Saved ${hits} TTS API call${hits > 1 ? 's' : ''}`);
      }
    }

    // Output info
    if (data.videoSizeBytes) {
      const sizeMB = (data.videoSizeBytes / (1024 * 1024)).toFixed(2);
      lines.push('');
      lines.push(`Video: ${sizeMB} MB`);
    }

    // Helpful tips
    const tips = this.generateTips(data);
    if (tips.length > 0) {
      lines.push('');
      lines.push('Tips:');
      for (const tip of tips) {
        lines.push(`  💡 ${tip}`);
      }
    }

    lines.push('');
    lines.push('='.repeat(80));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Format stage name for display
   */
  private formatStageName(name: string): string {
    const names: Record<string, string> = {
      parse_markdown: 'Parsing',
      generate_images: 'Images',
      generate_audio: 'Audio',
      load_existing_audio: 'Audio (cached)',
      generate_html: 'HTML',
      build_timeline: 'Timeline',
      record_video: 'Video Recording',
      assemble_video: 'Video Assembly',
    };

    return (names[name] || name).padEnd(16);
  }

  /**
   * Format stage metadata for display
   */
  private formatMetadata(metadata: Record<string, any>): string | null {
    const parts: string[] = [];

    if (metadata['slides_with_audio'] !== undefined) {
      parts.push(`${metadata['slides_with_audio']} slides`);
    }

    if (metadata['count'] !== undefined) {
      parts.push(`${metadata['count']} images`);
    }

    if (metadata['cached'] !== undefined && metadata['generated'] !== undefined) {
      parts.push(`${metadata['cached']} cached, ${metadata['generated']} generated`);
    }

    return parts.length > 0 ? parts.join(', ') : null;
  }

  /**
   * Generate helpful tips based on build profile
   */
  private generateTips(data: BuildSummaryData): string[] {
    const tips: string[] = [];

    // Find stages taking > 10% of time
    const slowStages = data.stages
      .map(stage => ({
        ...stage,
        percent: (stage.durationMs / data.totalDurationMs) * 100,
      }))
      .filter(stage => stage.percent > 10 && stage.durationMs > 1000);

    for (const stage of slowStages) {
      if (stage.name === 'record_video') {
        tips.push('Video recording took most of the time. Use --no-video for faster iteration.');
      } else if (stage.name === 'generate_audio') {
        tips.push('Audio generation is slow. Results are cached for next build.');
      } else if (stage.name === 'generate_images') {
        tips.push('Image generation is slow. Use --skip-images to iterate faster.');
      }
    }

    // Cache recommendations
    if (data.audioCacheMisses && data.audioCacheMisses > 0 && !data.audioCacheHits) {
      tips.push('First build generated fresh audio. Next build will be faster with cache.');
    }

    return tips;
  }
}

/**
 * Create a new build summary generator
 */
export function createBuildSummaryGenerator(): BuildSummaryGenerator {
  return new BuildSummaryGenerator();
}
