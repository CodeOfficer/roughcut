/**
 * Layered configuration manager for roughcut CLI
 *
 * Resolution order (highest priority first):
 * 1. CLI flags
 * 2. Environment variables
 * 3. Project config (.roughcutrc.yml found by walking up from input dir)
 * 4. User config (~/.config/roughcut/config.yml)
 * 5. Built-in defaults
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { homedir } from 'os';
import type { LogLevel } from '../core/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface ResolvedConfig {
  logLevel: LogLevel;
  nodeEnv: string;

  // ElevenLabs (optional — only required when audio pipeline runs)
  elevenLabsApiKey?: string;
  elevenLabsVoiceId: string;
  elevenLabsModel: string;
  elevenLabsStability: number;
  elevenLabsSimilarityBoost: number;

  // Gemini (optional — only required when image pipeline runs)
  geminiApiKey?: string;
  geminiModel: string;
  geminiImageResolution: string;

  // Paths
  ffmpegPath: string;
  outputDir: string;
  tempDir: string;
}

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  imageResolution: string;
}

interface RawFileConfig {
  log_level?: string;
  elevenlabs_api_key?: string;
  elevenlabs_voice_id?: string;
  elevenlabs_model?: string;
  elevenlabs_stability?: number;
  elevenlabs_similarity_boost?: number;
  gemini_api_key?: string;
  gemini_model?: string;
  gemini_image_resolution?: string;
  ffmpeg_path?: string;
  output_dir?: string;
  temp_dir?: string;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULTS: ResolvedConfig = {
  logLevel: 'info',
  nodeEnv: 'development',
  elevenLabsVoiceId: 'adam',
  elevenLabsModel: 'eleven_monolingual_v1',
  elevenLabsStability: 0.75,
  elevenLabsSimilarityBoost: 0.75,
  geminiModel: 'gemini-2.0-flash-exp',
  geminiImageResolution: '1920x1080',
  ffmpegPath: 'ffmpeg',
  outputDir: './tutorials',
  tempDir: './tmp',
};

// ============================================================================
// CONFIG MANAGER
// ============================================================================

class ConfigManager {
  private config: ResolvedConfig | null = null;

  /**
   * Load config from all sources. Call once at CLI startup.
   */
  load(cliOptions?: Record<string, unknown>, projectDir?: string): ResolvedConfig {
    // Layer 5: Built-in defaults
    const resolved: ResolvedConfig = { ...DEFAULTS };

    // Layer 4: User config (~/.config/roughcut/config.yml)
    const userConfig = this.loadUserConfig();
    this.mergeFileConfig(resolved, userConfig);

    // Layer 3: Project config (.roughcutrc.yml walking up from projectDir)
    if (projectDir) {
      const projectConfig = this.findProjectConfig(projectDir);
      this.mergeFileConfig(resolved, projectConfig);
    }

    // Layer 2: Environment variables
    this.mergeEnvVars(resolved);

    // Layer 1: CLI flags (highest priority)
    if (cliOptions) {
      this.mergeCliFlags(resolved, cliOptions);
    }

    this.config = resolved;
    return resolved;
  }

  /**
   * Get the loaded config. Throws if load() hasn't been called.
   */
  get(): ResolvedConfig {
    if (!this.config) {
      // Auto-load from env if not explicitly loaded (backwards compat for tests)
      this.load();
    }
    return this.config!;
  }

  /**
   * Require ElevenLabs config. Throws if API key is missing.
   * Call this lazily — only when the audio pipeline actually needs it.
   */
  requireElevenLabs(): ElevenLabsConfig {
    const cfg = this.get();
    if (!cfg.elevenLabsApiKey) {
      throw new Error(
        'ElevenLabs API key is required for audio generation.\n' +
        'Set ELEVENLABS_API_KEY in your environment, .roughcutrc.yml, or ~/.config/roughcut/config.yml\n' +
        'Get a key at https://elevenlabs.io/app/settings/api-keys'
      );
    }
    return {
      apiKey: cfg.elevenLabsApiKey,
      voiceId: cfg.elevenLabsVoiceId,
      model: cfg.elevenLabsModel,
      stability: cfg.elevenLabsStability,
      similarityBoost: cfg.elevenLabsSimilarityBoost,
    };
  }

  /**
   * Require Gemini config. Throws if API key is missing.
   * Call this lazily — only when the image pipeline actually needs it.
   */
  requireGemini(): GeminiConfig {
    const cfg = this.get();
    if (!cfg.geminiApiKey) {
      throw new Error(
        'Gemini API key is required for image generation.\n' +
        'Set GEMINI_API_KEY in your environment, .roughcutrc.yml, or ~/.config/roughcut/config.yml\n' +
        'Get a key at https://aistudio.google.com/app/apikey'
      );
    }
    return {
      apiKey: cfg.geminiApiKey,
      model: cfg.geminiModel,
      imageResolution: cfg.geminiImageResolution,
    };
  }

  /**
   * Reset config (useful for testing)
   */
  reset(): void {
    this.config = null;
  }

  // ==========================================================================
  // FILE CONFIG LOADING
  // ==========================================================================

  private loadUserConfig(): RawFileConfig {
    const configPath = join(homedir(), '.config', 'roughcut', 'config.yml');
    return this.loadYamlFile(configPath);
  }

  private findProjectConfig(startDir: string): RawFileConfig {
    let dir = resolve(startDir);
    const root = dirname(dir) === dir ? dir : '/'; // filesystem root

    while (true) {
      const configPath = join(dir, '.roughcutrc.yml');
      const config = this.loadYamlFile(configPath);
      if (Object.keys(config).length > 0) {
        return config;
      }

      const parent = dirname(dir);
      if (parent === dir || dir === root) break;
      dir = parent;
    }

    return {};
  }

  private loadYamlFile(filePath: string): RawFileConfig {
    if (!existsSync(filePath)) return {};

    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.parseSimpleYaml(content);
    } catch {
      return {};
    }
  }

  /**
   * Simple YAML parser for flat key-value configs.
   * Handles the subset we need without requiring js-yaml dependency.
   */
  private parseSimpleYaml(content: string): RawFileConfig {
    const result: Record<string, string | number> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.slice(0, colonIndex).trim();
      let value: string | number = trimmed.slice(colonIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse numbers
      if (/^\d+(\.\d+)?$/.test(value as string)) {
        value = parseFloat(value as string);
      }

      result[key] = value;
    }
    return result as unknown as RawFileConfig;
  }

  // ==========================================================================
  // CONFIG MERGING
  // ==========================================================================

  private mergeFileConfig(target: ResolvedConfig, source: RawFileConfig): void {
    if (source.log_level) target.logLevel = source.log_level as LogLevel;
    if (source.elevenlabs_api_key) target.elevenLabsApiKey = source.elevenlabs_api_key;
    if (source.elevenlabs_voice_id) target.elevenLabsVoiceId = source.elevenlabs_voice_id;
    if (source.elevenlabs_model) target.elevenLabsModel = source.elevenlabs_model;
    if (source.elevenlabs_stability !== undefined) target.elevenLabsStability = source.elevenlabs_stability;
    if (source.elevenlabs_similarity_boost !== undefined) target.elevenLabsSimilarityBoost = source.elevenlabs_similarity_boost;
    if (source.gemini_api_key) target.geminiApiKey = source.gemini_api_key;
    if (source.gemini_model) target.geminiModel = source.gemini_model;
    if (source.gemini_image_resolution) target.geminiImageResolution = source.gemini_image_resolution;
    if (source.ffmpeg_path) target.ffmpegPath = source.ffmpeg_path;
    if (source.output_dir) target.outputDir = source.output_dir;
    if (source.temp_dir) target.tempDir = source.temp_dir;
  }

  private mergeEnvVars(target: ResolvedConfig): void {
    const e = process.env;
    if (e['LOG_LEVEL']) target.logLevel = e['LOG_LEVEL'] as LogLevel;
    if (e['NODE_ENV']) target.nodeEnv = e['NODE_ENV'];
    if (e['ELEVENLABS_API_KEY']) target.elevenLabsApiKey = e['ELEVENLABS_API_KEY'];
    if (e['ELEVENLABS_VOICE_ID']) target.elevenLabsVoiceId = e['ELEVENLABS_VOICE_ID'];
    if (e['ELEVENLABS_MODEL']) target.elevenLabsModel = e['ELEVENLABS_MODEL'];
    if (e['ELEVENLABS_STABILITY']) target.elevenLabsStability = parseFloat(e['ELEVENLABS_STABILITY']);
    if (e['ELEVENLABS_SIMILARITY_BOOST']) target.elevenLabsSimilarityBoost = parseFloat(e['ELEVENLABS_SIMILARITY_BOOST']);
    if (e['GEMINI_API_KEY']) target.geminiApiKey = e['GEMINI_API_KEY'];
    if (e['GEMINI_MODEL']) target.geminiModel = e['GEMINI_MODEL'];
    if (e['GEMINI_IMAGE_RESOLUTION']) target.geminiImageResolution = e['GEMINI_IMAGE_RESOLUTION'];
    if (e['FFMPEG_PATH']) target.ffmpegPath = e['FFMPEG_PATH'];
    if (e['OUTPUT_DIR']) target.outputDir = e['OUTPUT_DIR'];
    if (e['TEMP_DIR']) target.tempDir = e['TEMP_DIR'];
  }

  private mergeCliFlags(target: ResolvedConfig, flags: Record<string, unknown>): void {
    if (flags['logLevel']) target.logLevel = flags['logLevel'] as LogLevel;
    if (flags['voice']) target.elevenLabsVoiceId = flags['voice'] as string;
    if (flags['apiKey']) target.elevenLabsApiKey = flags['apiKey'] as string;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const config = new ConfigManager();
