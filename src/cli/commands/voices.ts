/**
 * Voices command — list available ElevenLabs voices
 */

import { Command } from 'commander';
import { ElevenLabsClient } from '../../narration/elevenlabs.js';
import { logger } from '../../core/logger.js';

export function createVoicesCommand(): Command {
  const cmd = new Command('voices');

  cmd
    .description('List available ElevenLabs voices')
    .action(async () => {
      try {
        await runVoices();
      } catch (error) {
        if (error instanceof Error && error.message.includes('API key')) {
          console.error('\nElevenLabs API key is required to list voices.');
          console.error('Set ELEVENLABS_API_KEY in your environment or .roughcutrc.yml\n');
        } else {
          logger.error('Failed to fetch voices', error);
        }
        process.exit(1);
      }
    });

  return cmd;
}

async function runVoices(): Promise<void> {
  const client = new ElevenLabsClient();

  console.log('\nFetching available voices from ElevenLabs...\n');

  const voices = await client.getVoices();

  // Group voices by category
  const categories = new Map<string, any[]>();
  for (const voice of voices) {
    const cat = voice.category || 'other';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(voice);
  }

  console.log(`Found ${voices.length} voices:\n`);

  for (const [category, categoryVoices] of categories) {
    console.log(`${'='.repeat(70)}`);
    console.log(`${category.toUpperCase()} (${categoryVoices.length})`);
    console.log('='.repeat(70));

    for (const voice of categoryVoices) {
      console.log(`\n  ${voice.name}`);
      console.log(`     ID: ${voice.voice_id}`);
      if (voice.description) {
        const desc = voice.description.length > 65
          ? voice.description.substring(0, 62) + '...'
          : voice.description;
        console.log(`     ${desc}`);
      }
    }
    console.log('');
  }

  console.log('Usage:');
  console.log('  In .roughcutrc.yml:   elevenlabs_voice_id: "<voice_id>"');
  console.log('  In presentation.md:   voice: <voice_id>');
  console.log('');
}
