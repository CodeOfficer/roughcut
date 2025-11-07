#!/usr/bin/env node
/**
 * Demo script to test the complete reveal.js build pipeline
 */

import { createBuildCommand } from './dist/cli/commands/revealjs-build.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create build command
const buildCommand = createBuildCommand();

// Setup progress reporting
buildCommand.onProgress((progress) => {
  console.log(`[${progress.phase}] ${progress.percentage}% - ${progress.message}`);
});

// Run build
console.log('🚀 Starting reveal.js build pipeline...\n');

const result = await buildCommand.execute({
  input: path.join(__dirname, 'demo-presentation.md'),
  output: path.join(__dirname, 'demo-output'),
  video: true,
  bundle: true,
  skipAudio: false, // Set to true if you don't have ElevenLabs API key
  debug: false,
});

console.log('\n' + '='.repeat(60));

if (result.success) {
  console.log('✅ Build completed successfully!\n');
  console.log('📊 Statistics:');
  console.log(`   - Slides processed: ${result.stats?.slidesProcessed}`);
  console.log(`   - Audio files: ${result.stats?.audioFilesGenerated}`);
  console.log(`   - Total duration: ${result.stats?.totalDuration.toFixed(1)}s`);
  console.log(`   - Build time: ${result.durationSeconds?.toFixed(1)}s\n`);

  console.log('📁 Output files:');
  console.log(`   - HTML: ${result.htmlPath}`);
  if (result.videoPath) {
    console.log(`   - Video: ${result.videoPath}`);
    if (result.stats?.videoSize) {
      console.log(`   - Video size: ${(result.stats.videoSize / 1024 / 1024).toFixed(1)} MB`);
    }
  }

  console.log('\n🎉 Open the HTML file in a browser to view the presentation!');
  console.log(`   file://${result.htmlPath}`);
} else {
  console.log('❌ Build failed!\n');
  console.log(`Error: ${result.error}`);
  process.exit(1);
}
