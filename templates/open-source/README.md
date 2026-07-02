# Open Source Template

## Who Is This For?

Maintainers and contributors building open source projects that welcome community
participation. If your project accepts PRs from strangers, needs clear contribution
guidelines, and must stay accessible to all users — this is your template.

## What's Included

### Stacks
- **TypeScript** — Clear contracts, self-documenting APIs, IDE support for contributors

### Role
- **Full-Stack** — Libraries, CLIs, frameworks, or full applications

### Principles
- **Clean Code** — Contributors need to understand the codebase quickly
- **TDD** — Tests are documentation; they show how the API is meant to be used
- **Accessibility** — Inclusive by default, WCAG-compliant outputs

### Workflows
- **Git** — Conventional commits, semantic versioning, changelog generation
- **CI/CD** — Automated checks on every PR, publish on release tags
- **Testing** — Comprehensive test suites that validate contributor changes
- **Code Review** — Constructive feedback, maintainer checklists, contributor guidance

## Usage

```bash
npx niyam init --template open-source
```

This scaffolds a `.niyam/` config optimized for community collaboration and
contribution quality.

## Example Projects

- npm/PyPI/crates.io libraries and packages
- CLI tools and developer utilities
- UI component libraries
- Frameworks and meta-frameworks
- Documentation sites and learning platforms

## Philosophy

Open source lives or dies by contributor experience. Code must be readable by
newcomers. Tests must be comprehensive so maintainers can merge with confidence.
CI must catch issues before review to reduce maintainer burden. Accessibility
ensures the software serves everyone, not just the majority. TDD doubles as
living documentation — new contributors read tests to understand intent.
