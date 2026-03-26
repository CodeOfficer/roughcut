/**
 * Tests for ConfigManager — layered config resolution
 *
 * Covers: defaults, env var merging, CLI flag overrides,
 * lazy API key validation, YAML parsing, reset behavior
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { config } from "../config-manager.js";

describe("ConfigManager", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    config.reset();
    // Clear relevant env vars so tests start clean
    delete process.env["LOG_LEVEL"];
    delete process.env["ELEVENLABS_API_KEY"];
    delete process.env["ELEVENLABS_VOICE_ID"];
    delete process.env["ELEVENLABS_MODEL"];
    delete process.env["ELEVENLABS_STABILITY"];
    delete process.env["ELEVENLABS_SIMILARITY_BOOST"];
    delete process.env["GEMINI_API_KEY"];
    delete process.env["GEMINI_MODEL"];
    delete process.env["GEMINI_IMAGE_RESOLUTION"];
    delete process.env["FFMPEG_PATH"];
    delete process.env["OUTPUT_DIR"];
    delete process.env["TEMP_DIR"];
    delete process.env["NODE_ENV"];
  });

  afterEach(() => {
    config.reset();
    // Restore original env
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  // ==========================================================================
  // DEFAULTS
  // ==========================================================================

  describe("Built-in defaults", () => {
    it("should return sensible defaults when no config sources exist", () => {
      const cfg = config.load();

      expect(cfg.logLevel).toBe("info");
      expect(cfg.nodeEnv).toBe("development");
      expect(cfg.ffmpegPath).toBe("ffmpeg");
      expect(cfg.elevenLabsVoiceId).toBe("adam");
      expect(cfg.elevenLabsModel).toBe("eleven_monolingual_v1");
      expect(cfg.elevenLabsStability).toBe(0.75);
      expect(cfg.elevenLabsSimilarityBoost).toBe(0.75);
      expect(cfg.geminiModel).toBe("gemini-2.0-flash-exp");
      expect(cfg.geminiImageResolution).toBe("1920x1080");
    });

    it("should NOT have API keys set by default", () => {
      const cfg = config.load();

      expect(cfg.elevenLabsApiKey).toBeUndefined();
      expect(cfg.geminiApiKey).toBeUndefined();
    });
  });

  // ==========================================================================
  // ENVIRONMENT VARIABLES
  // ==========================================================================

  describe("Environment variable resolution", () => {
    it("should read ELEVENLABS_API_KEY from env", () => {
      process.env["ELEVENLABS_API_KEY"] = "el-key-123";

      const cfg = config.load();
      expect(cfg.elevenLabsApiKey).toBe("el-key-123");
    });

    it("should read GEMINI_API_KEY from env", () => {
      process.env["GEMINI_API_KEY"] = "gem-key-456";

      const cfg = config.load();
      expect(cfg.geminiApiKey).toBe("gem-key-456");
    });

    it("should read LOG_LEVEL from env", () => {
      process.env["LOG_LEVEL"] = "debug";

      const cfg = config.load();
      expect(cfg.logLevel).toBe("debug");
    });

    it("should read FFMPEG_PATH from env", () => {
      process.env["FFMPEG_PATH"] = "/opt/homebrew/bin/ffmpeg";

      const cfg = config.load();
      expect(cfg.ffmpegPath).toBe("/opt/homebrew/bin/ffmpeg");
    });

    it("should parse numeric ELEVENLABS_STABILITY", () => {
      process.env["ELEVENLABS_STABILITY"] = "0.5";

      const cfg = config.load();
      expect(cfg.elevenLabsStability).toBe(0.5);
    });

    it("should read NODE_ENV from env", () => {
      process.env["NODE_ENV"] = "production";

      const cfg = config.load();
      expect(cfg.nodeEnv).toBe("production");
    });

    it("should read all ElevenLabs settings from env", () => {
      process.env["ELEVENLABS_VOICE_ID"] = "brian";
      process.env["ELEVENLABS_MODEL"] = "eleven_turbo_v2";
      process.env["ELEVENLABS_SIMILARITY_BOOST"] = "0.9";

      const cfg = config.load();
      expect(cfg.elevenLabsVoiceId).toBe("brian");
      expect(cfg.elevenLabsModel).toBe("eleven_turbo_v2");
      expect(cfg.elevenLabsSimilarityBoost).toBe(0.9);
    });

    it("should read Gemini settings from env", () => {
      process.env["GEMINI_MODEL"] = "gemini-pro";
      process.env["GEMINI_IMAGE_RESOLUTION"] = "1280x720";

      const cfg = config.load();
      expect(cfg.geminiModel).toBe("gemini-pro");
      expect(cfg.geminiImageResolution).toBe("1280x720");
    });
  });

  // ==========================================================================
  // CLI FLAG OVERRIDES
  // ==========================================================================

  describe("CLI flag overrides", () => {
    it("should override logLevel via CLI flags", () => {
      process.env["LOG_LEVEL"] = "info";

      const cfg = config.load({ logLevel: "debug" });
      expect(cfg.logLevel).toBe("debug");
    });

    it("should override voice via CLI flags", () => {
      const cfg = config.load({ voice: "rachel" });
      expect(cfg.elevenLabsVoiceId).toBe("rachel");
    });

    it("should override apiKey via CLI flags", () => {
      const cfg = config.load({ apiKey: "cli-key-789" });
      expect(cfg.elevenLabsApiKey).toBe("cli-key-789");
    });

    it("should give CLI flags highest priority over env", () => {
      process.env["ELEVENLABS_API_KEY"] = "env-key";

      const cfg = config.load({ apiKey: "cli-key" });
      expect(cfg.elevenLabsApiKey).toBe("cli-key");
    });
  });

  // ==========================================================================
  // LAZY API KEY VALIDATION
  // ==========================================================================

  describe("requireElevenLabs()", () => {
    it("should throw when API key is not set", () => {
      config.load();

      expect(() => config.requireElevenLabs()).toThrow(
        "ElevenLabs API key is required",
      );
    });

    it("should return config when API key IS set", () => {
      process.env["ELEVENLABS_API_KEY"] = "real-key-123";
      config.load();

      const elConfig = config.requireElevenLabs();
      expect(elConfig.apiKey).toBe("real-key-123");
      expect(elConfig.voiceId).toBe("adam");
      expect(elConfig.model).toBe("eleven_monolingual_v1");
      expect(elConfig.stability).toBe(0.75);
      expect(elConfig.similarityBoost).toBe(0.75);
    });

    it("should reflect env overrides in returned config", () => {
      process.env["ELEVENLABS_API_KEY"] = "key";
      process.env["ELEVENLABS_VOICE_ID"] = "custom-voice";
      process.env["ELEVENLABS_STABILITY"] = "0.3";
      config.load();

      const elConfig = config.requireElevenLabs();
      expect(elConfig.voiceId).toBe("custom-voice");
      expect(elConfig.stability).toBe(0.3);
    });
  });

  describe("requireGemini()", () => {
    it("should throw when API key is not set", () => {
      config.load();

      expect(() => config.requireGemini()).toThrow(
        "Gemini API key is required",
      );
    });

    it("should return config when API key IS set", () => {
      process.env["GEMINI_API_KEY"] = "gem-key";
      config.load();

      const gemConfig = config.requireGemini();
      expect(gemConfig.apiKey).toBe("gem-key");
      expect(gemConfig.model).toBe("gemini-2.0-flash-exp");
      expect(gemConfig.imageResolution).toBe("1920x1080");
    });
  });

  // ==========================================================================
  // GET() AUTO-LOAD BEHAVIOR
  // ==========================================================================

  describe("get()", () => {
    it("should auto-load if load() was never called", () => {
      // get() should not throw even without explicit load()
      const cfg = config.get();
      expect(cfg).toBeDefined();
      expect(cfg.logLevel).toBe("info");
    });

    it("should return same config on repeated calls", () => {
      config.load();
      const cfg1 = config.get();
      const cfg2 = config.get();
      expect(cfg1).toBe(cfg2);
    });
  });

  // ==========================================================================
  // RESET
  // ==========================================================================

  describe("reset()", () => {
    it("should clear loaded config", () => {
      process.env["ELEVENLABS_API_KEY"] = "first-key";
      config.load();
      expect(config.get().elevenLabsApiKey).toBe("first-key");

      config.reset();
      delete process.env["ELEVENLABS_API_KEY"];

      config.load();
      expect(config.get().elevenLabsApiKey).toBeUndefined();
    });
  });

  // ==========================================================================
  // SIMPLE YAML PARSING
  // ==========================================================================

  describe("YAML config file parsing", () => {
    // We test the parser indirectly through the full load path.
    // The project config is found by walking up from projectDir.
    // For unit testing, we use a temp dir with a .roughcutrc.yml.

    it("should load .roughcutrc.yml from project directory", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-config-test-"),
      );

      try {
        // Write a config file
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          'elevenlabs_api_key: "yaml-key-123"\nlog_level: debug\nelevenlabs_stability: 0.4\n',
        );

        const cfg = config.load({}, tmpDir);

        expect(cfg.elevenLabsApiKey).toBe("yaml-key-123");
        expect(cfg.logLevel).toBe("debug");
        expect(cfg.elevenLabsStability).toBe(0.4);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should give env vars priority over .roughcutrc.yml", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-config-test-"),
      );

      try {
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          'elevenlabs_api_key: "yaml-key"\n',
        );

        process.env["ELEVENLABS_API_KEY"] = "env-key";
        const cfg = config.load({}, tmpDir);

        // Env takes priority over file
        expect(cfg.elevenLabsApiKey).toBe("env-key");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should handle missing .roughcutrc.yml gracefully", () => {
      // Non-existent directory — should not throw
      const cfg = config.load({}, "/tmp/nonexistent-roughcut-test-dir-xyz");
      expect(cfg).toBeDefined();
      expect(cfg.logLevel).toBe("info");
    });

    it("should skip comment lines and empty lines in YAML", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-config-test-"),
      );

      try {
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          "# This is a comment\n\nlog_level: warn\n# Another comment\n",
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.logLevel).toBe("warn");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should handle quoted and unquoted YAML values", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-config-test-"),
      );

      try {
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          'elevenlabs_voice_id: "brian"\ngemini_model: gemini-pro\n',
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.elevenLabsVoiceId).toBe("brian");
        expect(cfg.geminiModel).toBe("gemini-pro");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ==========================================================================
  // PRIORITY ORDER: CLI > ENV > FILE > DEFAULTS
  // ==========================================================================

  describe("Full priority chain", () => {
    it("should resolve CLI > env > file > defaults", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-config-test-"),
      );

      try {
        // File sets voice to "file-voice"
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          'elevenlabs_voice_id: "file-voice"\nlog_level: warn\n',
        );

        // Env sets voice to "env-voice"
        process.env["ELEVENLABS_VOICE_ID"] = "env-voice";

        // CLI sets voice to "cli-voice"
        const cfg = config.load({ voice: "cli-voice" }, tmpDir);

        // CLI wins
        expect(cfg.elevenLabsVoiceId).toBe("cli-voice");
        // Env wins over file for log_level (env not set, so file wins)
        expect(cfg.logLevel).toBe("warn");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ==========================================================================
  // WORKSPACE DISCOVERY
  // ==========================================================================

  describe("Workspace discovery", () => {
    it("should find workspace root when .roughcut/ exists", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-ws-test-"),
      );

      try {
        // Create workspace structure
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });

        config.load({}, tmpDir);
        expect(config.getWorkspaceRoot()).toBe(tmpDir);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should find workspace root from a subdirectory", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-ws-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        const subDir = path.join(tmpDir, "my-talk");
        fs.mkdirSync(subDir, { recursive: true });

        config.load({}, subDir);
        expect(config.getWorkspaceRoot()).toBe(tmpDir);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should return null when no workspace exists", () => {
      config.load({}, "/tmp/nonexistent-roughcut-test-dir-xyz");
      expect(config.getWorkspaceRoot()).toBeNull();
    });

    it("should reset workspace root on reset()", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-ws-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });

        config.load({}, tmpDir);
        expect(config.getWorkspaceRoot()).toBe(tmpDir);

        config.reset();
        expect(config.getWorkspaceRoot()).toBeNull();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ==========================================================================
  // .ENV FILE PARSING
  // ==========================================================================

  describe(".env file parsing", () => {
    it("should load API keys from workspace .env file", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-env-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".env"),
          "ELEVENLABS_API_KEY=env-file-key-123\nGEMINI_API_KEY=gem-env-key-456\n",
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.elevenLabsApiKey).toBe("env-file-key-123");
        expect(cfg.geminiApiKey).toBe("gem-env-key-456");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should handle quoted values in .env", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-env-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".env"),
          "ELEVENLABS_API_KEY=\"quoted-key\"\nGEMINI_API_KEY='single-quoted'\n",
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.elevenLabsApiKey).toBe("quoted-key");
        expect(cfg.geminiApiKey).toBe("single-quoted");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should skip comments and empty lines in .env", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-env-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".env"),
          "# Comment line\n\nELEVENLABS_API_KEY=my-key\n# Another comment\n",
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.elevenLabsApiKey).toBe("my-key");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should give shell env vars priority over .env file", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-env-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".env"),
          "ELEVENLABS_API_KEY=env-file-key\n",
        );

        process.env["ELEVENLABS_API_KEY"] = "shell-env-key";
        const cfg = config.load({}, tmpDir);

        // Shell env wins over .env file
        expect(cfg.elevenLabsApiKey).toBe("shell-env-key");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should give .env file priority over workspace config.yml", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-env-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".roughcut", "config.yml"),
          "elevenlabs_voice_id: config-voice\n",
        );
        fs.writeFileSync(
          path.join(tmpDir, ".env"),
          "ELEVENLABS_VOICE_ID=env-voice\n",
        );

        const cfg = config.load({}, tmpDir);
        // .env file wins over workspace config.yml
        expect(cfg.elevenLabsVoiceId).toBe("env-voice");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should handle missing .env file gracefully", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-env-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        // No .env file — should not throw
        const cfg = config.load({}, tmpDir);
        expect(cfg).toBeDefined();
        expect(cfg.logLevel).toBe("info");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ==========================================================================
  // WORKSPACE CONFIG.YML
  // ==========================================================================

  describe("Workspace .roughcut/config.yml", () => {
    it("should load preferences from workspace config.yml", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-ws-cfg-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".roughcut", "config.yml"),
          "elevenlabs_voice_id: brian\nlog_level: debug\n",
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.elevenLabsVoiceId).toBe("brian");
        expect(cfg.logLevel).toBe("debug");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should give legacy .roughcutrc.yml priority over workspace config.yml", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-ws-cfg-test-"),
      );

      try {
        fs.mkdirSync(path.join(tmpDir, ".roughcut"), { recursive: true });
        fs.writeFileSync(
          path.join(tmpDir, ".roughcut", "config.yml"),
          "elevenlabs_voice_id: ws-voice\n",
        );
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          "elevenlabs_voice_id: legacy-voice\n",
        );

        const cfg = config.load({}, tmpDir);
        // Legacy .roughcutrc.yml wins over workspace config.yml
        expect(cfg.elevenLabsVoiceId).toBe("legacy-voice");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  // ==========================================================================
  // BACKWARD COMPATIBILITY
  // ==========================================================================

  describe("Backward compatibility", () => {
    it("should work without a workspace (legacy .roughcutrc.yml only)", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "roughcut-compat-test-"),
      );

      try {
        // No .roughcut/ directory — old-style project
        fs.writeFileSync(
          path.join(tmpDir, ".roughcutrc.yml"),
          'elevenlabs_api_key: "legacy-key"\nlog_level: warn\n',
        );

        const cfg = config.load({}, tmpDir);
        expect(cfg.elevenLabsApiKey).toBe("legacy-key");
        expect(cfg.logLevel).toBe("warn");
        expect(config.getWorkspaceRoot()).toBeNull();
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
