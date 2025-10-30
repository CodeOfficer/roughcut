import { copyFile, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../../core/logger.js';
import { getTutorialPaths, getTemplateDir } from '../../utils/paths.js';
import { exists, ensureDir } from '../../utils/fs.js';

/**
 * Create a new tutorial project
 */
export async function createTutorial(tutorialName: string): Promise<void> {
  logger.section(`Creating Tutorial: ${tutorialName}`);

  const paths = getTutorialPaths(tutorialName);

  try {
    // Check if tutorial already exists
    if (await exists(paths.root)) {
      throw new Error(`Tutorial "${tutorialName}" already exists at ${paths.root}`);
    }

    // Create directory structure
    logger.step('Creating directory structure');
    await ensureDir(paths.root);
    await ensureDir(paths.audio);
    await ensureDir(paths.screenshots);
    await ensureDir(paths.output);

    // Check for template directory
    const templateDir = getTemplateDir();
    const hasTemplate = await exists(templateDir);

    if (hasTemplate) {
      // Copy template files
      logger.step('Copying template files');

      const templateScript = join(templateDir, 'script.md');
      const templateConfig = join(templateDir, 'config.json');

      if (await exists(templateScript)) {
        await copyFile(templateScript, paths.script);
      } else {
        await createDefaultScript(tutorialName, paths.script);
      }

      if (await exists(templateConfig)) {
        // Copy and customize config
        const configContent = await readFile(templateConfig, 'utf-8');
        const config = JSON.parse(configContent);
        config.title = tutorialName.split('-').map(w =>
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        await writeFile(paths.config, JSON.stringify(config, null, 2));
      } else {
        await createDefaultConfig(tutorialName, paths.config);
      }
    } else {
      // Create default files
      logger.step('Creating default files');
      await createDefaultScript(tutorialName, paths.script);
      await createDefaultConfig(tutorialName, paths.config);
    }

    logger.success(`Tutorial created successfully!`);
    logger.info(`\nNext steps:`);
    logger.info(`  1. Edit your script: ${paths.script}`);
    logger.info(`  2. Generate narration: npm run tutorial:narrate ${tutorialName}`);
    logger.info(`  3. Capture screenshots: npm run tutorial:screenshots ${tutorialName}`);
    logger.info(`  4. Build video: npm run tutorial:build ${tutorialName}`);
  } catch (error) {
    logger.error('Failed to create tutorial', error);
    throw error;
  }
}

/**
 * Create default script.md file
 */
async function createDefaultScript(tutorialName: string, filePath: string): Promise<void> {
  const title = tutorialName.split('-').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');

  const content = `# ${title}

## Segment 1: Introduction
> Duration: 8s
> Screenshot: static

[NARRATION]
Welcome to this tutorial on ${title.toLowerCase()}. Today you'll learn...
[/NARRATION]

[IMAGE_PROMPT]
A professional tech tutorial title slide with gradient background (blue to purple).
Center text "${title}" in large bold modern sans-serif font.
Clean, modern, high contrast design suitable for a video thumbnail.
[/IMAGE_PROMPT]

---

## Segment 2: Getting Started
> Duration: 12s
> Screenshot: auto

[NARRATION]
Let's get started by...
[/NARRATION]

[PLAYWRIGHT_INSTRUCTIONS]
Show: Terminal window
Action: Type "echo 'Hello World'"
Wait: 2s
[/PLAYWRIGHT_INSTRUCTIONS]

---

## Segment 3: Conclusion
> Duration: 7s
> Screenshot: static

[NARRATION]
Congratulations! You've completed this tutorial. Keep learning and happy coding!
[/NARRATION]

[IMAGE_PROMPT]
A celebration completion slide with gradient background.
Large text "Tutorial Complete!" at the top.
Below show "Happy Coding!" in friendly font.
Professional, clean design with positive energy.
[/IMAGE_PROMPT]
`;

  await writeFile(filePath, content);
}

/**
 * Create default config.json file
 */
async function createDefaultConfig(tutorialName: string, filePath: string): Promise<void> {
  const title = tutorialName.split('-').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');

  const config = {
    title,
    description: `A tutorial about ${title.toLowerCase()}`,
    voice: 'adam',
    videoSettings: {
      resolution: '1920x1080',
      fps: 30,
      transition: 'fade',
      transitionDuration: 0.5,
    },
  };

  await writeFile(filePath, JSON.stringify(config, null, 2));
}
