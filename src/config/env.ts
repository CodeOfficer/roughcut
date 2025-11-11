import { z } from 'zod';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the root directory of the project
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// Load environment variables from .envrc and .envrc.local
dotenv.config({ path: join(rootDir, '.envrc') });
dotenv.config({ path: join(rootDir, '.envrc.local'), override: true });

/**
 * Environment variable schema with validation rules and defaults
 */
const envSchema = z.object({
  // API Keys
  ELEVENLABS_API_KEY: z
    .string()
    .min(1, 'ElevenLabs API key is required. Get one at https://elevenlabs.io/app/settings/api-keys'),

  GEMINI_API_KEY: z
    .string()
    .min(1, 'Gemini API key is required. Get one at https://aistudio.google.com/app/apikey'),

  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .describe('Optional: Required only for AI-powered script generation'),

  // ElevenLabs Configuration
  ELEVENLABS_VOICE_ID: z
    .string()
    .default('adam')
    .describe('Voice ID for narration'),

  ELEVENLABS_MODEL: z
    .string()
    .default('eleven_monolingual_v1')
    .refine(
      (val) => ['eleven_monolingual_v1', 'eleven_multilingual_v2', 'eleven_turbo_v2'].includes(val),
      'Invalid ElevenLabs model'
    ),

  ELEVENLABS_STABILITY: z
    .string()
    .default('0.75')
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(1)),

  ELEVENLABS_SIMILARITY_BOOST: z
    .string()
    .default('0.75')
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(1)),

  // Gemini Configuration
  GEMINI_MODEL: z
    .string()
    .default('gemini-2.0-flash-exp')
    .describe('Model to use for image generation'),

  GEMINI_IMAGE_RESOLUTION: z
    .string()
    .regex(/^\d+x\d+$/, 'Image resolution must be in format WIDTHxHEIGHT (e.g., 1920x1080)')
    .default('1920x1080')
    .describe('Default image resolution for generated images'),

  // Output Configuration
  OUTPUT_DIR: z
    .string()
    .default('./tutorials')
    .describe('Directory where tutorial projects are stored'),

  TEMP_DIR: z
    .string()
    .default('./tmp')
    .describe('Temporary directory for intermediate files'),

  // Tool Paths
  FFMPEG_PATH: z
    .string()
    .default('/usr/local/bin/ffmpeg')
    .describe('Path to FFmpeg binary'),

  PLAYWRIGHT_BROWSERS_PATH: z
    .string()
    .default(join(rootDir, 'browsers'))
    .describe('Path where Playwright browsers are installed'),

  // Development Settings
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Environment mode'),

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info')
    .describe('Logging verbosity level'),
});

/**
 * Parse and validate environment variables
 * Exits process with error message if validation fails
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('\n❌ Environment Configuration Error\n');
      console.error('The following environment variables are invalid or missing:\n');

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });

      console.error('\n💡 To fix this:');
      console.error('  1. Copy .envrc.example to .envrc: cp .envrc.example .envrc');
      console.error('  2. Edit .envrc and add your configuration values');
      console.error('  3. See .envrc.example for detailed documentation\n');
    } else {
      console.error('\n❌ Unexpected error parsing environment variables:', error);
    }

    process.exit(1);
  }
};

/**
 * Validated and typed environment configuration
 * Import this in your modules to access environment variables
 *
 * @example
 * import { env } from './config/env.js';
 * console.log(env.ELEVENLABS_API_KEY);
 */
export const env = parseEnv();

/**
 * TypeScript type for the environment configuration
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Helper function to check if a value is defined
 */
export const isDefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

/**
 * Get a configuration value with a runtime check
 * Useful for optional values that should error if accessed when not set
 */
export const getRequired = <K extends keyof Env>(key: K): NonNullable<Env[K]> => {
  const value = env[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `Configuration error: ${key} is required but not set. Check your .envrc file.`
    );
  }
  return value as NonNullable<Env[K]>;
};
