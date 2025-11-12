#!/usr/bin/env tsx

import { ElevenLabsClient } from '../src/narration/elevenlabs.js';

async function main() {
  const client = new ElevenLabsClient();

  console.log('\n🎤 Fetching available voices from ElevenLabs...\n');

  try {
    const voices = await client.getVoices();

    // Group voices by category
    const premade = voices.filter((v: any) => v.category === 'premade');
    const professional = voices.filter((v: any) => v.category === 'professional');
    const cloned = voices.filter((v: any) => v.category === 'cloned');
    const generated = voices.filter((v: any) => v.category === 'generated');

    console.log(`Found ${voices.length} voices total:\n`);

    // Print in table format
    const printVoices = (voices: any[], category: string) => {
      if (voices.length === 0) return;

      console.log(`\n${'='.repeat(80)}`);
      console.log(`${category.toUpperCase()} VOICES (${voices.length})`);
      console.log('='.repeat(80));

      voices.forEach((voice: any) => {
        console.log(`\n  📢 ${voice.name}`);
        console.log(`     ID: ${voice.voice_id}`);
        if (voice.description) {
          const desc = voice.description.length > 70
            ? voice.description.substring(0, 67) + '...'
            : voice.description;
          console.log(`     ${desc}`);
        }
      });
    };

    printVoices(premade, 'Premade');
    printVoices(professional, 'Professional');
    printVoices(generated, 'Generated');
    printVoices(cloned, 'Cloned/Custom');

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Usage:');
    console.log('   • In .envrc: export ELEVENLABS_VOICE_ID=<voice_id>');
    console.log('   • In presentation: voice: <voice_id>');
    console.log('\n📖 Example:');
    console.log('   voice: nPczCjzI2devNBz1zQrb  # Brian - great for narrations\n');
  } catch (error) {
    console.error('\n❌ Error fetching voices:', error);
    console.error('\n💡 Make sure ELEVENLABS_API_KEY is set in your .envrc file\n');
    process.exit(1);
  }
}

main();
