# Contributing to roughcut

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
git clone https://github.com/codeofficer/roughcut.git
cd roughcut
npm install
npm run build
npm test
```

### Prerequisites

- **Node.js >= 20** — `node --version`
- **ffmpeg** — `brew install ffmpeg` (macOS) / `apt install ffmpeg` (Linux)
- **Playwright browsers** — `npx playwright install chromium`

### Optional (for full pipeline)

- **ElevenLabs API key** — for audio narration
- **Gemini API key** — for AI image generation

## Project Structure

```
src/
  cli/           # CLI commands (build, dev, init, lint, doctor, voices)
  config/        # ConfigManager — layered config resolution
  core/          # Parser, linter, types, logger
  images/        # Gemini AI image generation
  narration/     # ElevenLabs TTS + caching
  presentation/  # RevealJS HTML generation, Playwright control
  validation/    # Config validation
  video/         # Timeline, recording, FFmpeg assembly
examples/        # Example presentations (minimal, comprehensive)
templates/       # Init scaffolding templates
docs/            # Feature docs, linting spec, architecture
```

## Making Changes

1. **Create a branch** from `main`
2. **Write code** — follow existing patterns and conventions
3. **Add tests** — all new code needs test coverage
4. **Run checks:**
   ```bash
   npm run build        # TypeScript compilation
   npm test             # All tests pass
   npm run type-check   # Strict type checking
   npm run format       # Prettier formatting
   ```
5. **Commit** using conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
6. **Open a PR** targeting `main`

## Testing

Tests are co-located with source code in `__tests__/` directories:

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm test -- src/config/     # Run specific tests
```

### Test conventions

- Mock external dependencies (API calls, filesystem when appropriate)
- Use `vitest` for all tests
- Integration tests can invoke the CLI via `execSync('node dist/cli/index.js ...')`
- Tests should not require real API keys (use `vitest.config.ts` test env vars)

## Architecture

The build pipeline processes markdown through stages:

```
markdown → Lint → Parse → Images → Audio → HTML → Timeline → Record → Assemble
```

Key design decisions:
- **Lazy API validation** — API keys are only required when the stage that needs them runs
- **ConfigManager** — 5-layer config resolution: CLI flags > env vars > project config > user config > defaults
- **Fingerprint caching** — Audio is cached by content hash, so unchanged slides reuse existing audio

## Code Style

- Strict TypeScript (`noUnusedLocals`, `noUncheckedIndexedAccess`, etc.)
- Prettier for formatting
- ESLint for linting
- No `any` types unless unavoidable (external API responses)

## Reporting Issues

- Use [GitHub Issues](https://github.com/codeofficer/roughcut/issues)
- Include: roughcut version, Node version, OS, steps to reproduce
- For crashes: include the full error output

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
