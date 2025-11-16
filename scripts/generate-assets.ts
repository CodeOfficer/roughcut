#!/usr/bin/env tsx
/**
 * Generate Placeholder Assets
 * Creates default background image and video for a tutorial
 *
 * Usage: TUTORIAL=<name> npm run generate-assets
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';
import chalk from 'chalk';

const TUTORIAL = process.env.TUTORIAL;

if (!TUTORIAL) {
  console.error(chalk.red('Error: TUTORIAL environment variable not set'));
  console.log(chalk.yellow('Usage: TUTORIAL=<name> npm run generate-assets'));
  console.log(chalk.yellow('Example: TUTORIAL=my-tutorial npm run generate-assets'));
  process.exit(1);
}

// Resolve tutorial directory
let tutorialDir: string;
const flatPath = path.join('tutorials', `${TUTORIAL}.md`);
const dirPath = path.join('tutorials', TUTORIAL);

if (fs.existsSync(flatPath)) {
  tutorialDir = path.join('tutorials');
  console.log(chalk.blue(`Found flat tutorial: ${flatPath}`));
} else if (fs.existsSync(dirPath)) {
  tutorialDir = dirPath;
  console.log(chalk.blue(`Found directory tutorial: ${dirPath}`));
} else {
  console.error(chalk.red(`Error: Tutorial "${TUTORIAL}" not found`));
  console.log(chalk.yellow(`Checked:`));
  console.log(chalk.yellow(`  - ${flatPath}`));
  console.log(chalk.yellow(`  - ${dirPath}/presentation.md`));
  process.exit(1);
}

console.log(chalk.green(`\n✓ Generating placeholder assets for: ${TUTORIAL}\n`));

// Asset paths
const imagePath = path.join(tutorialDir, 'background-image.png');
const videoPath = path.join(tutorialDir, 'background-video.mp4');

/**
 * Generate placeholder background image (1920x1080)
 */
async function generatePlaceholderImage(): Promise<void> {
  console.log(chalk.cyan('Generating background-image.png...'));

  // Create a blue gradient background with text
  const width = 1920;
  const height = 1080;

  // Create gradient using SVG
  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, sans-serif"
        font-size="120"
        font-weight="bold"
        fill="white"
        opacity="0.8">
        Placeholder Image
      </text>
      <text
        x="50%"
        y="60%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, sans-serif"
        font-size="48"
        fill="white"
        opacity="0.6">
        ${width}x${height}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(imagePath);

  const stats = fs.statSync(imagePath);
  console.log(chalk.green(`✓ Generated: ${imagePath} (${Math.round(stats.size / 1024)}KB)`));
}

/**
 * Generate placeholder background video (5 seconds, 1920x1080)
 */
function generatePlaceholderVideo(): void {
  console.log(chalk.cyan('Generating background-video.mp4...'));

  // Check if ffmpeg is available
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch {
    console.error(chalk.red('Error: ffmpeg not found. Please install ffmpeg to generate videos.'));
    console.log(chalk.yellow('macOS: brew install ffmpeg'));
    console.log(chalk.yellow('Linux: apt-get install ffmpeg'));
    process.exit(1);
  }

  // Generate a 5-second video with blue gradient and text
  // Using lavfi (libavfilter) to generate video entirely with ffmpeg
  const ffmpegCommand = `ffmpeg -y -f lavfi -i "color=c=#667eea:s=1920x1080:d=5,format=yuv420p" \
    -vf "drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='Placeholder Video':fontcolor=white:fontsize=120:x=(w-text_w)/2:y=(h-text_h)/2:alpha=0.8,\
         drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='1920x1080':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2+100:alpha=0.6" \
    -c:v libx264 -pix_fmt yuv420p -t 5 "${videoPath}"`;

  try {
    execSync(ffmpegCommand, { stdio: 'ignore' });
    const stats = fs.statSync(videoPath);
    console.log(chalk.green(`✓ Generated: ${videoPath} (${Math.round(stats.size / 1024)}KB)`));
  } catch (error) {
    console.error(chalk.red('Error generating video with text overlay.'));
    console.log(chalk.yellow('Falling back to simple solid color video...'));

    // Fallback: simple solid color video without text
    const fallbackCommand = `ffmpeg -y -f lavfi -i "color=c=#667eea:s=1920x1080:d=5,format=yuv420p" \
      -c:v libx264 -pix_fmt yuv420p -t 5 "${videoPath}"`;

    try {
      execSync(fallbackCommand, { stdio: 'ignore' });
      const stats = fs.statSync(videoPath);
      console.log(chalk.green(`✓ Generated: ${videoPath} (${Math.round(stats.size / 1024)}KB)`));
    } catch (fallbackError) {
      console.error(chalk.red('Error: Failed to generate video'));
      throw fallbackError;
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Generate image
    await generatePlaceholderImage();

    // Generate video
    generatePlaceholderVideo();

    console.log(chalk.green(`\n✓ Successfully generated placeholder assets for ${TUTORIAL}`));
    console.log(chalk.blue(`\nAssets created:`));
    console.log(chalk.gray(`  - ${imagePath}`));
    console.log(chalk.gray(`  - ${videoPath}`));
    console.log(chalk.blue(`\nYou can now use these in your presentation:`));
    console.log(chalk.gray(`  @background: ./background-image.png`));
    console.log(chalk.gray(`  @background-video: ./background-video.mp4`));
  } catch (error) {
    console.error(chalk.red('\n✗ Error generating assets:'));
    console.error(error);
    process.exit(1);
  }
}

main();
