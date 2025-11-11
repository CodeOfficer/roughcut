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
 * Character-level alignment data from ElevenLabs
 */
export interface CharacterAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

/**
 * ElevenLabs API response with timestamps
 */
export interface AudioWithTimestampsResponse {
  audio_base64: string;
  alignment?: CharacterAlignment;
  normalized_alignment?: CharacterAlignment;
}

/**
 * Result of speech generation
 */
export interface SpeechGenerationResult {
  filePath: string;
  durationSeconds: number;
  sizeBytes: number;
  alignment?: CharacterAlignment;
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
