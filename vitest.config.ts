import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      ELEVENLABS_API_KEY: 'test-key',
      GEMINI_API_KEY: 'test-key',
    },
  },
});
