import { writeFile } from 'fs/promises';
import { env } from '../config/env.js';
import { logger } from '../core/logger.js';
import type { ElevenLabsTextToSpeechRequest } from './types.js';

/**
 * ElevenLabs API client for text-to-speech generation
 */
export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.ELEVENLABS_API_KEY;
  }

  /**
   * Generate speech from text and save to file
   */
  async generateSpeech(
    text: string,
    voiceId: string,
    outputPath: string,
    options?: {
      model?: string;
      stability?: number;
      similarityBoost?: number;
    }
  ): Promise<void> {
    const model = options?.model || env.ELEVENLABS_MODEL;
    const stability = options?.stability ?? env.ELEVENLABS_STABILITY;
    const similarityBoost = options?.similarityBoost ?? env.ELEVENLABS_SIMILARITY_BOOST;

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
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
      }

      // Get audio data as buffer
      const audioBuffer = await response.arrayBuffer();

      // Save to file
      await writeFile(outputPath, Buffer.from(audioBuffer));

      logger.debug(`Saved audio to ${outputPath} (${audioBuffer.byteLength} bytes)`);
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
  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      logger.error('Failed to fetch voices', error);
      throw error;
    }
  }
}
