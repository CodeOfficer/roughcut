import { writeFile } from "fs/promises";
import { config } from "../config/config-manager.js";
import { logger } from "../core/logger.js";
import type {
  ElevenLabsTextToSpeechRequest,
  AudioWithTimestampsResponse,
  CharacterAlignment,
} from "./types.js";

/**
 * Voice metadata from ElevenLabs API
 */
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
}

/**
 * ElevenLabs API client for text-to-speech generation
 */
export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = "https://api.elevenlabs.io/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.requireElevenLabs().apiKey;
  }

  /**
   * Generate speech from text and save to file (with timestamps)
   */
  async generateSpeech(
    text: string,
    voiceId: string,
    outputPath: string,
    options?: {
      model?: string;
      stability?: number;
      similarityBoost?: number;
    },
  ): Promise<{
    alignment?: CharacterAlignment;
    normalizedAlignment?: CharacterAlignment;
    durationSeconds: number;
  }> {
    const elevenLabsConfig = config.requireElevenLabs();
    const model = options?.model || elevenLabsConfig.model;
    const stability = options?.stability ?? elevenLabsConfig.stability;
    const similarityBoost =
      options?.similarityBoost ?? elevenLabsConfig.similarityBoost;

    logger.debug(`Generating speech with voice ${voiceId}, model ${model}`);

    const requestBody: ElevenLabsTextToSpeechRequest = {
      text,
      model_id: model,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}/with-timestamps`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "xi-api-key": this.apiKey,
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs API error (${response.status}): ${errorText}`,
        );
      }

      // Parse JSON response with timestamps
      const data = (await response.json()) as AudioWithTimestampsResponse;

      // Decode base64 audio
      const audioBuffer = Buffer.from(data.audio_base64, "base64");

      // Save to file
      await writeFile(outputPath, audioBuffer);

      // Calculate duration from alignment data
      const durationSeconds =
        data.alignment?.character_end_times_seconds?.slice(-1)[0] || 0;

      logger.debug(
        `Saved audio to ${outputPath} (${audioBuffer.byteLength} bytes, ${durationSeconds.toFixed(2)}s)`,
      );

      const result: {
        alignment?: CharacterAlignment;
        normalizedAlignment?: CharacterAlignment;
        durationSeconds: number;
      } = {
        durationSeconds,
      };

      if (data.alignment) {
        result.alignment = data.alignment;
      }

      if (data.normalized_alignment) {
        result.normalizedAlignment = data.normalized_alignment;
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to generate speech: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = (await response.json()) as { voices?: ElevenLabsVoice[] };
      return data.voices || [];
    } catch (error) {
      logger.error("Failed to fetch voices", error);
      throw error;
    }
  }
}
