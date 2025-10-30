/**
 * Narration-specific types for ElevenLabs integration
 */

/**
 * Configuration for generating speech
 */
export interface SpeechGenerationOptions {
  text: string;
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  outputPath: string;
}

/**
 * Result of speech generation
 */
export interface SpeechGenerationResult {
  filePath: string;
  durationSeconds: number;
  sizeBytes: number;
}

/**
 * ElevenLabs API voice settings
 */
export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

/**
 * ElevenLabs API request payload
 */
export interface ElevenLabsTextToSpeechRequest {
  text: string;
  model_id: string;
  voice_settings: VoiceSettings;
}
