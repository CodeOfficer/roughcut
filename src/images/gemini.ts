import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFile } from "fs/promises";
import { config } from "../config/config-manager.js";
import { logger } from "../core/logger.js";

/**
 * Gemini API client for image generation
 */
export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    const geminiConfig = config.requireGemini();
    const key = apiKey || geminiConfig.apiKey;
    this.client = new GoogleGenerativeAI(key);
    this.model = model || geminiConfig.model;
  }

  /**
   * Generate an image from a text prompt using Gemini Imagen
   *
   * Note: Imagen 3 requires Vertex AI, not the standard Google AI SDK.
   * For production, you need to:
   * 1. Enable Vertex AI API in your GCP project
   * 2. Set up authentication with service account
   * 3. Use @google-cloud/aiplatform SDK instead
   *
   * For now, this creates enhanced themed placeholder images.
   */
  async generateImage(
    prompt: string,
    outputPath: string,
    options?: {
      resolution?: string;
      aspectRatio?: string;
    },
  ): Promise<void> {
    logger.debug(
      `Generating themed placeholder image (Imagen requires Vertex AI setup)`,
    );
    logger.debug(`Prompt: ${prompt}`);

    try {
      // Create themed placeholder
      const placeholderImage = await this.createThemedPlaceholder(
        prompt,
        options?.resolution,
      );
      await writeFile(outputPath, placeholderImage);

      logger.debug(`Saved themed placeholder to ${outputPath}`);
      logger.warn(
        "Using enhanced placeholder - Vertex AI Imagen integration needed for production",
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to generate image: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create themed cartoon placeholder based on prompt analysis
   */
  private async createThemedPlaceholder(
    prompt: string,
    resolution?: string,
  ): Promise<Buffer> {
    const [width, height] = this.parseResolution(resolution);
    const lowerPrompt = prompt.toLowerCase();

    // Detect theme from prompt (check conclusion first since it's more specific)
    const isConclusion =
      lowerPrompt.includes("complete") ||
      lowerPrompt.includes("celebration") ||
      lowerPrompt.includes("congratulations");
    const isIntro =
      lowerPrompt.includes("tutorial") || lowerPrompt.includes("title");

    logger.debug(
      `Prompt analysis: isIntro=${isIntro}, isConclusion=${isConclusion}`,
    );
    logger.debug(`Prompt text: ${prompt.substring(0, 100)}...`);

    if (isConclusion) {
      logger.debug("Creating conclusion SVG");
      return this.createConclusionSVG(width, height, prompt);
    } else if (isIntro) {
      logger.debug("Creating intro SVG");
      return this.createIntroSVG(width, height, prompt);
    } else {
      logger.debug("Creating generic placeholder");
      return this.createPlaceholder(prompt, resolution);
    }
  }

  /**
   * Create intro/title card with cartoon sun and clouds
   */
  private createIntroSVG(
    width: number,
    height: number,
    _prompt: string,
  ): Buffer {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B19CD9;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- Sky background -->
  <rect width="100%" height="100%" fill="url(#skyGrad)"/>

  <!-- Sun character -->
  <g transform="translate(${width * 0.3}, ${height * 0.4})">
    <!-- Sun body -->
    <circle cx="0" cy="0" r="${Math.min(width, height) * 0.12}" fill="url(#sunGrad)"/>

    <!-- Sun rays -->
    <g stroke="#FFA500" stroke-width="${Math.min(width, height) * 0.01}" stroke-linecap="round">
      <line x1="${Math.min(width, height) * -0.16}" y1="0" x2="${Math.min(width, height) * -0.2}" y2="0"/>
      <line x1="${Math.min(width, height) * 0.16}" y1="0" x2="${Math.min(width, height) * 0.2}" y2="0"/>
      <line x1="0" y1="${Math.min(width, height) * -0.16}" x2="0" y2="${Math.min(width, height) * -0.2}"/>
      <line x1="0" y1="${Math.min(width, height) * 0.16}" x2="0" y2="${Math.min(width, height) * 0.2}"/>
      <line x1="${Math.min(width, height) * -0.113}" y1="${Math.min(width, height) * -0.113}" x2="${Math.min(width, height) * -0.141}" y2="${Math.min(width, height) * -0.141}"/>
      <line x1="${Math.min(width, height) * 0.113}" y1="${Math.min(width, height) * 0.113}" x2="${Math.min(width, height) * 0.141}" y2="${Math.min(width, height) * 0.141}"/>
      <line x1="${Math.min(width, height) * -0.113}" y1="${Math.min(width, height) * 0.113}" x2="${Math.min(width, height) * -0.141}" y2="${Math.min(width, height) * 0.141}"/>
      <line x1="${Math.min(width, height) * 0.113}" y1="${Math.min(width, height) * -0.113}" x2="${Math.min(width, height) * 0.141}" y2="${Math.min(width, height) * -0.141}"/>
    </g>

    <!-- Sunglasses -->
    <rect x="${Math.min(width, height) * -0.07}" y="${Math.min(width, height) * -0.03}" width="${Math.min(width, height) * 0.05}" height="${Math.min(width, height) * 0.03}" rx="${Math.min(width, height) * 0.01}" fill="#2C3E50"/>
    <rect x="${Math.min(width, height) * 0.02}" y="${Math.min(width, height) * -0.03}" width="${Math.min(width, height) * 0.05}" height="${Math.min(width, height) * 0.03}" rx="${Math.min(width, height) * 0.01}" fill="#2C3E50"/>
    <line x1="${Math.min(width, height) * -0.02}" y1="${Math.min(width, height) * -0.015}" x2="${Math.min(width, height) * 0.02}" y2="${Math.min(width, height) * -0.015}" stroke="#2C3E50" stroke-width="${Math.min(width, height) * 0.005}"/>

    <!-- Smile -->
    <path d="M ${Math.min(width, height) * -0.04} ${Math.min(width, height) * 0.02} Q 0 ${Math.min(width, height) * 0.05} ${Math.min(width, height) * 0.04} ${Math.min(width, height) * 0.02}" stroke="#8B4513" stroke-width="${Math.min(width, height) * 0.006}" fill="none" stroke-linecap="round"/>

    <!-- Programmer hat -->
    <ellipse cx="0" cy="${Math.min(width, height) * -0.13}" rx="${Math.min(width, height) * 0.1}" ry="${Math.min(width, height) * 0.02}" fill="#2C3E50"/>
    <rect x="${Math.min(width, height) * -0.08}" y="${Math.min(width, height) * -0.17}" width="${Math.min(width, height) * 0.16}" height="${Math.min(width, height) * 0.04}" fill="#34495E"/>
  </g>

  <!-- Cloud characters -->
  <g transform="translate(${width * 0.75}, ${height * 0.35})">
    <!-- Cloud body -->
    <ellipse cx="${Math.min(width, height) * -0.03}" cy="0" rx="${Math.min(width, height) * 0.05}" ry="${Math.min(width, height) * 0.04}" fill="white"/>
    <ellipse cx="${Math.min(width, height) * 0.02}" cy="${Math.min(width, height) * -0.01}" rx="${Math.min(width, height) * 0.045}" ry="${Math.min(width, height) * 0.035}" fill="white"/>
    <ellipse cx="${Math.min(width, height) * 0.05}" cy="0" rx="${Math.min(width, height) * 0.04}" ry="${Math.min(width, height) * 0.03}" fill="white"/>

    <!-- Happy eyes -->
    <circle cx="${Math.min(width, height) * -0.01}" cy="${Math.min(width, height) * -0.01}" r="${Math.min(width, height) * 0.008}" fill="#2C3E50"/>
    <circle cx="${Math.min(width, height) * 0.03}" cy="${Math.min(width, height) * -0.01}" r="${Math.min(width, height) * 0.008}" fill="#2C3E50"/>

    <!-- Smile -->
    <path d="M ${Math.min(width, height) * 0.0} ${Math.min(width, height) * 0.01} Q ${Math.min(width, height) * 0.01} ${Math.min(width, height) * 0.02} ${Math.min(width, height) * 0.02} ${Math.min(width, height) * 0.01}" stroke="#E74C3C" stroke-width="${Math.min(width, height) * 0.003}" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Laptop with code -->
  <g transform="translate(${width * 0.3}, ${height * 0.55})">
    <rect x="${Math.min(width, height) * -0.08}" y="0" width="${Math.min(width, height) * 0.16}" height="${Math.min(width, height) * 0.1}" rx="${Math.min(width, height) * 0.005}" fill="#2C3E50" stroke="#34495E" stroke-width="${Math.min(width, height) * 0.003}"/>
    <rect x="${Math.min(width, height) * -0.075}" y="${Math.min(width, height) * 0.01}" width="${Math.min(width, height) * 0.15}" height="${Math.min(width, height) * 0.07}" fill="#1ABC9C"/>
    <text x="0" y="${Math.min(width, height) * 0.05}" text-anchor="middle" font-family="monospace" font-size="${Math.min(width, height) * 0.015}" fill="white" font-weight="bold">&lt;/&gt;</text>
  </g>

  <!-- Title text -->
  <text x="${width / 2}" y="${height * 0.15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.05}" font-weight="bold" fill="#2C3E50">MCP Weather Server</text>
  <text x="${width / 2}" y="${height * 0.22}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}" fill="#34495E">Build Your First Tutorial</text>

  <!-- Placeholder note -->
  <text x="${width / 2}" y="${height * 0.9}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.015}" fill="rgba(0,0,0,0.3)" font-style="italic">Enhanced Placeholder - Vertex AI Imagen needed for production</text>
</svg>`;

    return Buffer.from(svg, "utf-8");
  }

  /**
   * Create conclusion/celebration card
   */
  private createConclusionSVG(
    width: number,
    height: number,
    _prompt: string,
  ): Buffer {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B19CD9;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="sunGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- Sky background -->
  <rect width="100%" height="100%" fill="url(#skyGrad2)"/>

  <!-- Confetti -->
  <circle cx="${width * 0.15}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.01}" fill="#E74C3C"/>
  <circle cx="${width * 0.85}" cy="${height * 0.25}" r="${Math.min(width, height) * 0.01}" fill="#3498DB"/>
  <circle cx="${width * 0.2}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.01}" fill="#F39C12"/>
  <circle cx="${width * 0.8}" cy="${height * 0.65}" r="${Math.min(width, height) * 0.01}" fill="#9B59B6"/>
  <rect x="${width * 0.3}" y="${height * 0.15}" width="${Math.min(width, height) * 0.015}" height="${Math.min(width, height) * 0.015}" fill="#E74C3C" transform="rotate(45)"/>
  <rect x="${width * 0.7}" y="${height * 0.75}" width="${Math.min(width, height) * 0.015}" height="${Math.min(width, height) * 0.015}" fill="#3498DB" transform="rotate(30)"/>

  <!-- Jumping sun character -->
  <g transform="translate(${width * 0.35}, ${height * 0.35})">
    <!-- Sun body -->
    <circle cx="0" cy="0" r="${Math.min(width, height) * 0.1}" fill="url(#sunGrad2)"/>

    <!-- Sun rays -->
    <g stroke="#FFA500" stroke-width="${Math.min(width, height) * 0.01}" stroke-linecap="round">
      <line x1="${Math.min(width, height) * -0.14}" y1="0" x2="${Math.min(width, height) * -0.18}" y2="0"/>
      <line x1="${Math.min(width, height) * 0.14}" y1="0" x2="${Math.min(width, height) * 0.18}" y2="0"/>
      <line x1="0" y1="${Math.min(width, height) * -0.14}" x2="0" y2="${Math.min(width, height) * -0.18}"/>
      <line x1="0" y1="${Math.min(width, height) * 0.14}" x2="0" y2="${Math.min(width, height) * 0.18}"/>
      <line x1="${Math.min(width, height) * -0.099}" y1="${Math.min(width, height) * -0.099}" x2="${Math.min(width, height) * -0.127}" y2="${Math.min(width, height) * -0.127}"/>
      <line x1="${Math.min(width, height) * 0.099}" y1="${Math.min(width, height) * 0.099}" x2="${Math.min(width, height) * 0.127}" y2="${Math.min(width, height) * 0.127}"/>
      <line x1="${Math.min(width, height) * -0.099}" y1="${Math.min(width, height) * 0.099}" x2="${Math.min(width, height) * -0.127}" y2="${Math.min(width, height) * 0.127}"/>
      <line x1="${Math.min(width, height) * 0.099}" y1="${Math.min(width, height) * -0.099}" x2="${Math.min(width, height) * 0.127}" y2="${Math.min(width, height) * -0.127}"/>
    </g>

    <!-- Happy eyes -->
    <circle cx="${Math.min(width, height) * -0.03}" cy="${Math.min(width, height) * -0.01}" r="${Math.min(width, height) * 0.012}" fill="#2C3E50"/>
    <circle cx="${Math.min(width, height) * 0.03}" cy="${Math.min(width, height) * -0.01}" r="${Math.min(width, height) * 0.012}" fill="#2C3E50"/>

    <!-- Big smile -->
    <path d="M ${Math.min(width, height) * -0.04} ${Math.min(width, height) * 0.02} Q 0 ${Math.min(width, height) * 0.06} ${Math.min(width, height) * 0.04} ${Math.min(width, height) * 0.02}" stroke="#8B4513" stroke-width="${Math.min(width, height) * 0.008}" fill="none" stroke-linecap="round"/>

    <!-- Raised arms -->
    <line x1="${Math.min(width, height) * -0.08}" y1="${Math.min(width, height) * 0.02}" x2="${Math.min(width, height) * -0.14}" y2="${Math.min(width, height) * -0.04}" stroke="#FFA500" stroke-width="${Math.min(width, height) * 0.015}" stroke-linecap="round"/>
    <line x1="${Math.min(width, height) * 0.08}" y1="${Math.min(width, height) * 0.02}" x2="${Math.min(width, height) * 0.14}" y2="${Math.min(width, height) * -0.04}" stroke="#FFA500" stroke-width="${Math.min(width, height) * 0.015}" stroke-linecap="round"/>
  </g>

  <!-- Rainbow -->
  <path d="M ${width * 0.55} ${height * 0.45} Q ${width * 0.65} ${height * 0.35} ${width * 0.75} ${height * 0.45}" stroke="#E74C3C" stroke-width="${Math.min(width, height) * 0.01}" fill="none" stroke-linecap="round"/>
  <path d="M ${width * 0.56} ${height * 0.46} Q ${width * 0.65} ${height * 0.37} ${width * 0.74} ${height * 0.46}" stroke="#F39C12" stroke-width="${Math.min(width, height) * 0.01}" fill="none" stroke-linecap="round"/>
  <path d="M ${width * 0.57} ${height * 0.47} Q ${width * 0.65} ${height * 0.39} ${width * 0.73} ${height * 0.47}" stroke="#F1C40F" stroke-width="${Math.min(width, height) * 0.01}" fill="none" stroke-linecap="round"/>
  <path d="M ${width * 0.58} ${height * 0.48} Q ${width * 0.65} ${height * 0.41} ${width * 0.72} ${height * 0.48}" stroke="#2ECC71" stroke-width="${Math.min(width, height) * 0.01}" fill="none" stroke-linecap="round"/>
  <path d="M ${width * 0.59} ${height * 0.49} Q ${width * 0.65} ${height * 0.43} ${width * 0.71} ${height * 0.49}" stroke="#3498DB" stroke-width="${Math.min(width, height) * 0.01}" fill="none" stroke-linecap="round"/>

  <!-- Trophy -->
  <g transform="translate(${width * 0.65}, ${height * 0.55})">
    <ellipse cx="0" cy="${Math.min(width, height) * -0.06}" rx="${Math.min(width, height) * 0.025}" ry="${Math.min(width, height) * 0.035}" fill="#F39C12"/>
    <rect x="${Math.min(width, height) * -0.015}" y="${Math.min(width, height) * -0.03}" width="${Math.min(width, height) * 0.03}" height="${Math.min(width, height) * 0.03}" fill="#F39C12"/>
    <rect x="${Math.min(width, height) * -0.025}" y="0" width="${Math.min(width, height) * 0.05}" height="${Math.min(width, height) * 0.01}" fill="#F39C12"/>
  </g>

  <!-- Title text -->
  <text x="${width / 2}" y="${height * 0.15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.06}" font-weight="bold" fill="#2C3E50">Tutorial Complete!</text>

  <!-- Checkboxes -->
  <g transform="translate(${width * 0.35}, ${height * 0.7})">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}" fill="#27AE60">✓ Project Created</text>
    <text x="0" y="${Math.min(width, height) * 0.04}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}" fill="#27AE60">✓ Dependencies Installed</text>
    <text x="0" y="${Math.min(width, height) * 0.08}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.025}" fill="#27AE60">✓ Server Tested</text>
  </g>

  <text x="${width / 2}" y="${height * 0.85}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.03}" font-weight="bold" fill="#E74C3C">You're a Weather Server Pro!</text>

  <!-- Placeholder note -->
  <text x="${width / 2}" y="${height * 0.92}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.015}" fill="rgba(0,0,0,0.3)" font-style="italic">Enhanced Placeholder - Vertex AI Imagen needed for production</text>
</svg>`;

    return Buffer.from(svg, "utf-8");
  }

  /**
   * Create basic placeholder (fallback)
   */
  private async createPlaceholder(
    prompt: string,
    resolution?: string,
  ): Promise<Buffer> {
    const [width, height] = this.parseResolution(resolution);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
    Placeholder Image
  </text>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="20" fill="white" opacity="0.8">
    ${this.truncateText(prompt, 80)}
  </text>
</svg>`;

    return Buffer.from(svg, "utf-8");
  }

  /**
   * Parse resolution string (e.g., "1920x1080") into [width, height]
   */
  private parseResolution(resolution?: string): [number, number] {
    const defaultResolution =
      resolution || config.get().geminiImageResolution || "1920x1080";
    const parts = defaultResolution.split("x").map(Number);
    const width = parts[0] || 1920;
    const height = parts[1] || 1080;
    return [width, height];
  }

  /**
   * Truncate text to max length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Use Gemini to enhance an image generation prompt
   */
  async enhancePrompt(originalPrompt: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });

      const enhancementPrompt = `You are an expert at writing prompts for image generation AI.
Enhance the following image prompt to be more detailed and effective for generating high-quality images.
Focus on: composition, lighting, style, colors, and technical details.

Original prompt: ${originalPrompt}

Enhanced prompt (respond with only the enhanced prompt, no additional text):`;

      const result = await model.generateContent(enhancementPrompt);
      const response = await result.response;
      const enhanced = response.text().trim();

      logger.debug(`Enhanced prompt: ${enhanced}`);
      return enhanced;
    } catch (error) {
      logger.warn("Failed to enhance prompt with Gemini, using original");
      return originalPrompt;
    }
  }
}
