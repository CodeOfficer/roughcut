/**
 * Manual test script for HTML generation
 * Run with: npx tsx src/presentation/__manual-test__/test-generation.ts
 */

import { RevealMarkdownParser } from '../../core/revealjs-parser.js';
import { RevealHTMLGenerator } from '../revealjs-generator.js';
import * as path from 'path';
import * as fs from 'fs/promises';

const testMarkdown = `---
title: "Manual Test Presentation"
theme: dracula
voice: adam
resolution: 1920x1080
---

# Welcome to Test Presentation
@duration: 5s
@pause-after: 2s
@transition: fade
@background: #1e1e1e

This is the first slide with some content.

@audio: Welcome to this test presentation. [1s] Let's explore the features together.

---

# Features
@duration: 8s
@pause-after: 1s
@transition: zoom

- Feature 1 @fragment
- Feature 2 @fragment
- Feature 3 @fragment

@audio: Here are the key features we'll cover. [2s] Each one is important.

@notes: Remember to mention the integration benefits.

---

# Code Example
@duration: 10s
@pause-after: 2s

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

@audio: Let's look at a simple code example. [2s] This demonstrates the syntax.

---

# Thank You
@duration: 3s
@pause-after: 1s
@background: #2c3e50

Questions?

@audio: Thank you for watching!
`;

async function runManualTest() {
  console.log('🧪 Manual Test: HTML Generation\n');

  try {
    // Step 1: Parse markdown
    console.log('1. Parsing markdown...');
    const parser = new RevealMarkdownParser();
    const presentation = parser.parse(testMarkdown);
    console.log(`   ✓ Parsed ${presentation.slides.length} slides`);
    console.log(`   ✓ Title: ${presentation.title}`);
    console.log(`   ✓ Theme: ${presentation.theme}`);

    // Step 2: Generate HTML
    console.log('\n2. Generating HTML...');
    const generator = new RevealHTMLGenerator();
    const outputDir = path.join(process.cwd(), 'temp-test-output');
    const outputPath = path.join(outputDir, 'index.html');

    await generator.generate(presentation, outputPath);
    console.log(`   ✓ HTML generated at: ${outputPath}`);

    // Step 3: Verify file exists
    console.log('\n3. Verifying output...');
    const stats = await fs.stat(outputPath);
    console.log(`   ✓ File size: ${stats.size} bytes`);

    // Step 4: Read and analyze HTML
    const html = await fs.readFile(outputPath, 'utf-8');

    console.log('\n4. Checking HTML structure...');
    const checks = [
      { name: 'DOCTYPE', test: html.includes('<!DOCTYPE html>') },
      { name: 'Title', test: html.includes('Manual Test Presentation') },
      { name: 'Reveal.js CSS', test: html.includes('dist/reveal.css') },
      { name: 'Theme CSS', test: html.includes('theme/dracula.css') },
      { name: 'Reveal.js script', test: html.includes('dist/reveal.js') },
      { name: 'Markdown plugin', test: html.includes('plugin/markdown/markdown.js') },
      { name: 'Highlight plugin', test: html.includes('plugin/highlight/highlight.js') },
      { name: 'Notes plugin', test: html.includes('plugin/notes/notes.js') },
      { name: 'Initialize call', test: html.includes('Reveal.initialize') },
      { name: 'Slide sections', test: (html.match(/<section/g) || []).length === 4 },
      { name: 'Data attributes', test: html.includes('data-markdown') },
      { name: 'Transitions', test: html.includes('data-transition="fade"') && html.includes('data-transition="zoom"') },
      { name: 'Backgrounds', test: html.includes('data-background-color="#1e1e1e"') && html.includes('data-background-color="#2c3e50"') },
      { name: 'Speaker notes', test: html.includes('<aside class="notes">') },
      { name: 'Code blocks', test: html.includes('```javascript') },
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      if (check.test) {
        console.log(`   ✓ ${check.name}`);
        passed++;
      } else {
        console.log(`   ✗ ${check.name}`);
        failed++;
      }
    }

    // Summary
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log('\n✅ Manual test PASSED!');
      console.log(`\n🌐 Open the HTML file in a browser to view:`);
      console.log(`   file://${outputPath}`);
    } else {
      console.log('\n❌ Manual test FAILED!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error during manual test:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runManualTest();
