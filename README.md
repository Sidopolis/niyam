<p align="center">
  <img src="assets/logo.svg" alt="Niyam" width="120" />
</p>

<h1 align="center">नियम · Niyam</h1>

<p align="center">
  A package manager for AI agent rules.
</p>

<p align="center">
  <a href="https://niyam.dev">Website</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#browse-rules">Browse Rules</a> ·
  <a href="#cli">CLI</a> ·
  <a href="#mcp-server">MCP Server</a> ·
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/niyam?style=flat-square&color=1a1a2e" alt="npm version" />
  <img src="https://img.shields.io/github/stars/Sidopolis/niyam?style=flat-square&color=1a1a2e" alt="stars" />
  <img src="https://img.shields.io/badge/license-MIT-1a1a2e?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/modules-50-1a1a2e?style=flat-square" alt="modules" />
</p>

---

## What is this?

Niyam is a collection of 50 modular rule files for AI coding agents (Kiro, Cursor, Claude Code, Copilot, etc.), with a CLI that composes them into the right format for your tool, and an MCP server that serves rules dynamically based on what file you're editing.

The name comes from Sanskrit (नियम) and means "rules" or "principles."

### Why not just write one big AGENTS.md?

An ETH Zurich study from February 2026 tested 138 repositories and found that large static context files reduce agent task success by about 3% while increasing inference costs by over 20%. The problem is that agents waste tokens processing rules that have nothing to do with the current task.

Niyam solves this by letting you pick only what's relevant. The CLI composes your selections into a focused output, and the MCP server goes a step further by serving different rules based on which file you're actually working on.

---

## Quick Start

```bash
# Interactive setup that scans your project and asks what you want
npx niyam init

# Use a pre-configured template instead
npx niyam init --template startup-saas

# Add individual rule modules to an existing config
npx niyam add react typescript tdd

# Generate output for a specific tool
npx niyam generate --tool cursor
```

---

## What's included

| Category | Count | Examples |
|----------|-------|---------|
| Stacks | 23 | React, Next.js, Python, Go, Rust, Flutter, Vue, Angular, Docker, AWS, Prisma, Supabase |
| Roles | 12 | Frontend, Backend, DevOps, Security, Mobile, Architect, AI Engineer, QA, Technical Writer |
| Principles | 6 | Clean Code, TDD, DDD, Security-First, Performance, Accessibility |
| Workflows | 5 | Git, CI/CD, Testing, Deployment, Code Review |
| Anti-patterns | 2 | Common mistakes, AI-generated code smells |
| Languages | 2 | JavaScript, SQL |

Every rule module is a markdown file with 100-200 lines of specific, version-targeted guidance. Not generic advice.

---

## CLI

```bash
npm install -g niyam
# or run directly with npx
```

| Command | What it does |
|---------|-------------|
| `niyam init` | Scans your project, asks your preferences, writes the config |
| `niyam add <rules>` | Subscribes to additional rule modules |
| `niyam remove <rules>` | Removes rule modules from your config |
| `niyam list` | Shows all 50 available modules with descriptions |
| `niyam search <query>` | Finds rules matching a keyword |
| `niyam generate` | Regenerates output from your current config |
| `niyam preview` | Shows what the composed output looks like without writing it |
| `niyam update` | Pulls latest versions of your subscribed rules from the registry |
| `niyam publish` | Packages a custom rule module for submission to the registry |

The CLI has zero external dependencies. It auto-detects your stack by reading package.json, Cargo.toml, go.mod, pyproject.toml, Dockerfile, and other config files.

### Supported output formats

| Tool | Output file |
|------|------------|
| Kiro CLI | `AGENTS.md` |
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| GitHub Copilot | `AGENTS.md` |
| Windsurf | `.windsurfrules` |
| Codex | `AGENTS.md` |
| Aider | `.aider.md` |
| Gemini CLI | `GEMINI.md` |

---

## MCP Server

The MCP server is what makes Niyam different from static file generators. It runs alongside your editor and serves rules based on which file you're currently editing.

```
src/components/Button.tsx  →  react, typescript, frontend, accessibility, clean-code
src/api/auth.ts            →  typescript, backend, security-first, clean-code
Dockerfile                 →  docker, devops
prisma/schema.prisma       →  prisma, backend
src/__tests__/user.test.ts →  typescript, testing, tdd, clean-code
```

It also remembers project-specific corrections. If you tell it "we use pnpm here, not npm," it stores that and includes it in future sessions.

### Setup

```json
{
  "mcpServers": {
    "niyam": {
      "command": "node",
      "args": ["path/to/niyam/mcp/src/index.js"]
    }
  }
}
```

### Available tools

| Tool | Purpose |
|------|---------|
| `get_rules` | Returns rules relevant to the file you're editing |
| `get_checklist` | Returns a verification checklist for the current context |
| `get_context` | Returns everything (rules + learnings + checklist) in one call |
| `add_learning` | Saves a project-specific correction for future sessions |
| `get_learnings` | Shows all stored corrections |
| `remove_learning` | Deletes an outdated correction |

---

## Registry

Niyam has a built-in registry system. Rule modules have versions, and you can update them when new patterns emerge or frameworks release new versions.

```bash
# Check for updates to your subscribed rules
npx niyam update

# Publish your own rule module
npx niyam publish stacks/my-framework
```

The registry uses version pinning (`.niyam/lock.json`) so updates are predictable and you can roll back if something breaks.

---

## Templates

If you don't want to pick individual modules, use a template:

| Template | What's in it | Command |
|----------|-------------|---------|
| Startup SaaS | React, Node, TypeScript, Tailwind, TDD, performance | `npx niyam init --template startup-saas` |
| Enterprise | TypeScript, Security-First, DDD, strict CI/CD, code review | `npx niyam init --template enterprise` |
| Solo Dev | Full-stack, clean code, minimal process overhead | `npx niyam init --template solo-dev` |
| Open Source | Accessibility, testing, git workflows, community-friendly | `npx niyam init --template open-source` |

---

## How the composed output is structured

When you run `niyam generate`, the output looks like this:

```markdown
<!-- Generated by Niyam v0.1.0 -->
<!-- Modules: react, typescript, frontend, clean-code, git -->
<!-- Regenerate: npx niyam generate -->

# Project Rules (Niyam)

## Active Modules
- Stacks: react, typescript
- Roles: frontend
- Principles: clean-code
- Workflows: git

---

## Principles
[clean-code rules here]

---

## Tech Stack
[react rules here]
[typescript rules here]

---

## Role Guidelines
[frontend rules here]

---

## Workflows
[git rules here]
```

The output is ordered intentionally: principles first (universal), then stack-specific, then role-specific, then workflows. Only the modules you subscribed to appear.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

The short version: each rule module is one folder with a `rules.md` and a `meta.json`. If you want to add support for a framework or workflow that's missing, fork the repo, add the folder, and open a PR. It usually takes about 10 minutes.

---

## Project structure

```
niyam/
├── stacks/           23 tech-specific rule modules
├── roles/            12 role-based rule modules
├── principles/        6 engineering principle modules
├── workflows/         5 process and workflow modules
├── anti-patterns/     2 what-not-to-do modules
├── languages/         2 language-specific modules
├── templates/         4 pre-configured combos
├── examples/          3 example project configs with generated output
├── cli/              CLI source (zero deps, Node.js only)
├── mcp/              MCP server source (@modelcontextprotocol/sdk)
├── web/              Website (Next.js 16 + 21st.dev components)
├── tests/            22 tests (Node.js native test runner)
└── .github/          CI/CD + issue templates
```

---

## Roadmap

- [x] 50 rule modules across 6 categories
- [x] CLI with init, add, remove, list, search, generate, preview, publish, update
- [x] MCP server with context-aware rule delivery and project memory
- [x] Website with interactive rule browser and registry page
- [x] Registry system with version pinning
- [x] Tests (22 passing) and CI/CD
- [ ] Publish to npm
- [ ] Deploy website to Vercel
- [ ] VS Code extension for one-click rule browsing
- [ ] Rule analytics (track which modules improve agent output)
- [ ] Community-submitted rule packs

---

## License

MIT

---

<p align="center">
  Built in India 🇮🇳
</p>
