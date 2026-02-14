# Publishing roughcut

This guide covers first-time setup, releasing new versions to npm, setting up Homebrew distribution, and the versioning strategy.

## First-Time Setup

### GitHub Repo Rename

1. GitHub → repo **Settings** → **General** → change repository name to `roughcut`
2. GitHub auto-redirects the old URL — existing links keep working
3. Update your local remote:
   ```bash
   git remote set-url origin https://github.com/soxhub/roughcut.git
   ```

### npm First Publish

```bash
npm login
npm run build && npm test
npm publish --access public
```

Then set up CI automation:

1. Create an automation token: `npm token create`
2. Add to GitHub → **Settings** → **Secrets and variables** → **Actions** → `NPM_TOKEN`
3. Future releases: `npm version patch && git push --tags` — CI handles the rest

## Versioning

roughcut uses [Semantic Versioning](https://semver.org/):

| Bump | When | Example |
|------|------|---------|
| **patch** (3.0.0 → 3.0.1) | Bug fixes, documentation | Fix audio caching bug |
| **minor** (3.0.0 → 3.1.0) | New features, backwards-compatible | Add `@code-highlight` directive |
| **major** (3.0.0 → 4.0.0) | Breaking changes | Change markdown format, remove directive |

## Publishing to npm

### First-time setup

1. Create an npm account at [npmjs.com](https://www.npmjs.com/signup)
2. Log in locally:
   ```bash
   npm login
   ```
3. Add `NPM_TOKEN` to your GitHub repo secrets (Settings → Secrets → Actions):
   ```
   npm token create --read-only=false
   ```

### Release process

1. **Update version and changelog:**
   ```bash
   # Bump version in package.json (choose patch/minor/major)
   npm version patch   # 3.0.0 → 3.0.1
   npm version minor   # 3.0.0 → 3.1.0
   npm version major   # 3.0.0 → 4.0.0
   ```
   `npm version` automatically:
   - Updates `package.json` version
   - Creates a git commit
   - Creates a `v3.0.1` git tag

2. **Update CHANGELOG.md** with the new version entry (before or after the `npm version` commit).

3. **Push the tag:**
   ```bash
   git push origin main --tags
   ```

4. **CI takes over.** The `release.yml` workflow triggers on `v*` tags and:
   - Runs the full test suite
   - Publishes to npm with provenance
   - Creates a GitHub Release with auto-generated notes

### Manual publish (if CI isn't set up yet)

```bash
npm run build
npm test
npm publish --access public
```

### Verify the release

```bash
# Check npm
npm view roughcut version

# Test global install
npm install -g roughcut
roughcut --version
roughcut doctor

# Test npx (zero-install)
npx roughcut --version
```

## Homebrew distribution

### Setting up the tap

1. **Create a new GitHub repo:** `soxhub/homebrew-roughcut`

2. **Add the formula** at `Formula/roughcut.rb`:
   ```ruby
   class Roughcut < Formula
     desc "Generate RevealJS presentations and videos from markdown"
     homepage "https://github.com/soxhub/roughcut"
     url "https://registry.npmjs.org/roughcut/-/roughcut-3.0.0.tgz"
     sha256 "REPLACE_WITH_ACTUAL_SHA256"
     license "MIT"

     depends_on "node@20"
     depends_on "ffmpeg"

     def install
       system "npm", "install", *std_npm_args
       bin.install_symlink Dir["#{libexec}/bin/*"]
     end

     test do
       assert_match version.to_s, shell_output("#{bin}/roughcut --version")
     end
   end
   ```

3. **Get the SHA256** for the npm tarball:
   ```bash
   curl -sL "https://registry.npmjs.org/roughcut/-/roughcut-3.0.0.tgz" | shasum -a 256
   ```

### Updating the formula after a release

After each npm publish:

```bash
# Get the new tarball SHA
curl -sL "https://registry.npmjs.org/roughcut/-/roughcut-3.1.0.tgz" | shasum -a 256

# Update Formula/roughcut.rb with new version + SHA
# Commit and push to homebrew-roughcut repo
```

Consider automating this with a GitHub Action in the main repo that triggers after a successful npm publish.

### Users install via

```bash
brew tap soxhub/roughcut
brew install roughcut
```

## Pre-release checklist

Before every release:

- [ ] All tests pass: `npm run build && npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Format is clean: `npx prettier --check "src/**/*.ts"`
- [ ] Type check passes: `npm run type-check`
- [ ] CHANGELOG.md updated with new version entry
- [ ] `roughcut doctor` passes on a clean machine
- [ ] Examples build: `roughcut build -i examples/hello-world/presentation.md`

## Troubleshooting

### npm publish fails with 403
- Check that `NPM_TOKEN` secret is set in GitHub repo settings
- Verify the token hasn't expired: `npm whoami`
- Ensure the package name `roughcut` isn't already taken (it's available as of Feb 2026)

### Homebrew formula fails
- Verify the tarball URL is accessible: `curl -I https://registry.npmjs.org/roughcut/-/roughcut-3.0.0.tgz`
- Ensure SHA256 matches: recompute with `shasum -a 256`
- Test locally: `brew install --build-from-source ./Formula/roughcut.rb`

### Version mismatch
- `package.json` version must match the git tag (without the `v` prefix)
- `src/cli/index.ts` reads version from package.json at runtime — no manual sync needed
