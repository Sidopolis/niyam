# Contributing to Niyam

We love contributions! Whether it's a new stack, role, principle, or a bug fix — you're welcome.

## Adding a New Rule Module

1. Pick the right category: `stacks/`, `roles/`, `principles/`, or `workflows/`
2. Create a new directory with a kebab-case name: e.g., `stacks/remix/`
3. Add two files:

### `rules.md`
The actual agent rules. 100-200 lines. Follow existing structure:
- Clear sections (Core Principles, Patterns, Anti-Patterns, Testing, Security)
- Actionable directives (not vague advice)
- Version-specific (specify the version you're targeting)

### `meta.json`
```json
{
  "name": "Display Name",
  "description": "One-line description",
  "tags": ["tag1", "tag2"],
  "version": "1.0.0",
  "detectedBy": ["filename-or-pattern"]
}
```

## Guidelines

- **Be specific.** "Use React.memo for expensive renders" beats "optimize performance"
- **Be current.** Target the latest stable version of the tech
- **No fluff.** Every line should be something an AI agent can act on
- **Test it.** Run `node cli/src/index.js list` to verify your rule shows up

## Pull Request Process

1. Fork and clone
2. Create a branch: `git checkout -b add-remix-stack`
3. Add your rules
4. Test locally: `node cli/src/index.js search "your-rule-name"`
5. Submit PR with a clear description

## Code of Conduct

Be respectful. We're building tools to help everyone code better.
