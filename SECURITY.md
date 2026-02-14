# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 3.x     | Yes                |
| < 3.0   | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainers or use [GitHub Security Advisories](https://github.com/codeofficer/roughcut/security/advisories/new)
3. Include: description, steps to reproduce, potential impact
4. You should receive a response within 48 hours

## Scope

roughcut processes markdown files and generates HTML/video output. Security concerns include:

- **Arbitrary code execution** via markdown directives or Playwright automation
- **API key exposure** in logs, config files, or generated output
- **Path traversal** in file resolution or asset copying
- **Dependency vulnerabilities** in npm packages

## Best Practices for Users

- Never commit API keys to version control
- Use `.roughcutrc.yml` (gitignored) or environment variables for secrets
- Review generated HTML before hosting publicly
- Keep roughcut and its dependencies up to date
