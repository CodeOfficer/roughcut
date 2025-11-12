#!/usr/bin/env tsx

import { ElevenLabsClient } from '../src/narration/elevenlabs.js';

async function main() {
  const client = new ElevenLabsClient();

  console.log('\nFetching available voices from ElevenLabs...\n');

  try {
    const voices = await client.getVoices();

    console.log(`Found ${voices.length} voices:\n`);

    voices.forEach((voice: any) => {
      console.log(`  Name: ${voice.name}`);
      console.log(`  ID: ${voice.voice_id}`);
      console.log(`  Category: ${voice.category || 'N/A'}`);
      console.log(`  Description: ${voice.description || 'N/A'}`);
      console.log('');
    });

    console.log('\n💡 To use a voice, set ELEVENLABS_VOICE_ID in .envrc to the voice ID');
    console.log('💡 Or use the voice: field in your presentation frontmatter\n');
  } catch (error) {
    console.error('Error fetching voices:', error);
    process.exit(1);
  }
}

main();
