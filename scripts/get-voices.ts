#!/usr/bin/env tsx

import { ElevenLabsClient } from '../src/narration/elevenlabs.js';
import { logger } from '../src/core/logger.js';

async function main() {
  try {
    logger.section('Fetching Available ElevenLabs Voices');

    const client = new ElevenLabsClient();
    const voices = await client.getVoices();

    logger.success(`Found ${voices.length} voices\n`);

    voices.slice(0, 10).forEach((voice: any) => {
      console.log(`Name: ${voice.name}`);
      console.log(`ID: ${voice.voice_id}`);
      console.log(`Category: ${voice.category || 'N/A'}`);
      console.log('---');
    });

    // Suggest first voice for ELEVENLABS_VOICE_ID
    if (voices.length > 0) {
      console.log(`\n💡 To use the first voice, update your .envrc:`);
      console.log(`export ELEVENLABS_VOICE_ID=${voices[0].voice_id}`);
    }

  } catch (error) {
    logger.error('Failed to fetch voices', error);
    process.exit(1);
  }
}

main();
