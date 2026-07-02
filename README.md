<p align="center">
  <img src="assets/logo.svg" alt="Niyam" width="120" />
</p>

<h1 align="center">नियम · Niyam</h1>

<p align="center">
  <strong>Modular AI agent rules that compose, not bloat.</strong>
</p>

<p align="center">
  <a href="https://niyam.dev">Website</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#browse-rules">Browse Rules</a> ·
  <a href="#cli">CLI</a> ·
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/niyam?style=flat-square&color=1a1a2e" alt="npm version" />
  <img src="https://img.shields.io/github/stars/niyam-rules/niyam?style=flat-square&color=1a1a2e" alt="stars" />
  <img src="https://img.shields.io/badge/license-MIT-1a1a2e?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/rules-150%2B-1a1a2e?style=flat-square" alt="rules" />
</p>

---

## The Problem

Static `AGENTS.md` files dump 500+ lines of context into every prompt. ETH Zurich proved this **reduces** task success by 3% and **increases costs by 20%+**. Agents perform worse with bloated context than with none.

**Niyam fixes this.**

Instead of one massive file, Niyam gives you **modular, composable rule blocks** that you pick, combine, and scope to only what matters for your current project and task.

---

## What is Niyam?

**नियम** (Sanskrit) — *rules, discipline, principles.*

A comprehensive collection of AI agent rules organized into:

| Category | What it covers |
|----------|---------------|
| **Stacks** | Tech-specific rules (React, Next.js, Python, Go, Rust, Flutter, Vue, Angular, etc.) |
| **Roles** | Domain expertise (Frontend, Backend, DevOps, Security, Mobile, Data, UI/UX) |
| **Principles** | Engineering philosophy (Clean Code, TDD, DDD, Security-First, Performance, Accessibility) |
| **Workflows** | Process rules (Git, CI/CD, Testing, Deployment, Code Review) |
| **Templates** | Pre-built combos (Startup SaaS, Enterprise, Solo Dev, Open Source) |

Each rule is a focused, independent module. Compose only what you need.

---

## Quick Start

```bash
# Interactive setup — scans your project, suggests rules
npx niyam init

# Or pick a template directly
npx niyam init --template startup-saas

# Add specific rules
npx niyam add react typescript tdd

# Generate for a specific tool
npx niyam generate --tool kiro
npx niyam generate --tool cursor
npx niyam generate --tool claude-code
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Your Project                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  npx niyam init                                         │
│    │                                                    │
│    ├── Scans package.json, Cargo.toml, go.mod, etc.    │
│    ├── Detects your stack automatically                 │
│    ├── Asks: What role? What principles?                │
│    └── Generates scoped, minimal config                 │
│                                                         │
│  Output:                                                │
│    .niyam/                                              │
│    ├── config.json      # Your selections               │
│    ├── AGENTS.md        # Composed output (minimal)     │
│    ├── .cursorrules     # If using Cursor               │
│    └── CLAUDE.md        # If using Claude Code          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key insight:** Niyam generates the **minimum effective context** — not a dump of everything. Rules are scoped by directory, file type, and task domain.

---

## Browse Rules

### Stacks

| Stack | Description | File |
|-------|-------------|------|
| React | Components, hooks, state, performance, patterns | [`stacks/react/`](stacks/react/) |
| Next.js | App Router, RSC, data fetching, caching, ISR | [`stacks/nextjs/`](stacks/nextjs/) |
| Python | Type hints, async, packaging, virtual envs | [`stacks/python/`](stacks/python/) |
| Go | Idioms, error handling, concurrency, modules | [`stacks/go/`](stacks/go/) |
| Rust | Ownership, lifetimes, error handling, async | [`stacks/rust/`](stacks/rust/) |
| Flutter | Widgets, state management, platform channels | [`stacks/flutter/`](stacks/flutter/) |
| Svelte | Runes, SvelteKit, reactivity, transitions | [`stacks/svelte/`](stacks/svelte/) |
| Vue | Composition API, Pinia, Nuxt, reactivity | [`stacks/vue/`](stacks/vue/) |
| Angular | Signals, standalone, RxJS, dependency injection | [`stacks/angular/`](stacks/angular/) |
| Node.js | Streams, clustering, native modules, ESM | [`stacks/node/`](stacks/node/) |
| TypeScript | Strict mode, generics, utility types, patterns | [`stacks/typescript/`](stacks/typescript/) |
| Tailwind | Utility patterns, custom config, dark mode | [`stacks/tailwind/`](stacks/tailwind/) |
| Django | ORM, views, middleware, DRF, signals | [`stacks/django/`](stacks/django/) |
| FastAPI | Async routes, Pydantic, dependencies, middleware | [`stacks/fastapi/`](stacks/fastapi/) |
| Laravel | Eloquent, Blade, middleware, queues, testing | [`stacks/laravel/`](stacks/laravel/) |

### Roles

| Role | Description | File |
|------|-------------|------|
| Frontend Dev | Components, accessibility, performance, responsive | [`roles/frontend/`](roles/frontend/) |
| Backend Dev | APIs, databases, scalability, auth, caching | [`roles/backend/`](roles/backend/) |
| Full-Stack | End-to-end, integration, system design | [`roles/fullstack/`](roles/fullstack/) |
| DevOps | CI/CD, infrastructure, monitoring, automation | [`roles/devops/`](roles/devops/) |
| Mobile Dev | Cross-platform, native APIs, offline, performance | [`roles/mobile/`](roles/mobile/) |
| Security | Threat modeling, auth, encryption, OWASP | [`roles/security/`](roles/security/) |
| Data Engineer | Pipelines, models, ETL, data quality | [`roles/data/`](roles/data/) |
| UI/UX | Design systems, flows, usability, prototyping | [`roles/ui-ux/`](roles/ui-ux/) |

### Principles

| Principle | Inspired By | File |
|-----------|------------|------|
| Clean Code | Robert C. Martin | [`principles/clean-code/`](principles/clean-code/) |
| TDD | Kent Beck | [`principles/tdd/`](principles/tdd/) |
| DDD | Eric Evans | [`principles/ddd/`](principles/ddd/) |
| Security-First | OWASP, Zero Trust | [`principles/security-first/`](principles/security-first/) |
| Performance | Brendan Gregg, Web Vitals | [`principles/performance/`](principles/performance/) |
| Accessibility | WCAG 2.2, WAI-ARIA | [`principles/accessibility/`](principles/accessibility/) |

### Workflows

| Workflow | Covers | File |
|----------|--------|------|
| Git | Commits, branches, PRs, conventional commits | [`workflows/git/`](workflows/git/) |
| CI/CD | Pipelines, automation, environments, rollback | [`workflows/ci-cd/`](workflows/ci-cd/) |
| Testing | Unit, integration, E2E, snapshot, coverage | [`workflows/testing/`](workflows/testing/) |
| Deployment | Blue-green, canary, containers, serverless | [`workflows/deployment/`](workflows/deployment/) |
| Code Review | Standards, checklists, automation, feedback | [`workflows/code-review/`](workflows/code-review/) |

### Templates (Pre-built Combos)

| Template | What you get | Command |
|----------|-------------|---------|
| Startup SaaS | React + Node + TDD + Speed-first | `npx niyam init --template startup-saas` |
| Enterprise | TypeScript + Security-First + DDD + CI/CD | `npx niyam init --template enterprise` |
| Solo Dev | Full-Stack + Clean Code + Fast shipping | `npx niyam init --template solo-dev` |
| Open Source | Testing + Git workflows + Accessibility | `npx niyam init --template open-source` |

---

## CLI

### Installation

```bash
npm install -g niyam
# or use directly
npx niyam
```

### Commands

| Command | Description |
|---------|-------------|
| `niyam init` | Interactive setup — scan project, pick rules, generate config |
| `niyam add <rules...>` | Add specific rule modules |
| `niyam remove <rules...>` | Remove rule modules |
| `niyam list` | List all available rules |
| `niyam generate` | Regenerate output files from current config |
| `niyam preview` | Preview composed output before writing |
| `niyam update` | Update rules to latest version |
| `niyam search <query>` | Search rules by keyword |

### Supported Tools

| Tool | Output Format |
|------|--------------|
| Kiro CLI | `AGENTS.md` |
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` / `.cursor/rules/` |
| GitHub Copilot | `AGENTS.md` |
| Windsurf | `.windsurfrules` |
| Codex | `AGENTS.md` |
| Aider | `.aider.md` |
| Gemini CLI | `GEMINI.md` |

---

## Philosophy

### Why modular?

The ETH Zurich study (Feb 2026) showed static context files:
- ❌ Reduce success rates by ~3%
- ❌ Increase inference costs by 20%+
- ❌ Force models to process irrelevant context

Niyam's approach:
- ✅ Only relevant rules for your stack/task
- ✅ Scoped by directory (frontend rules for frontend dirs)
- ✅ Minimal effective context — maximum signal, minimum noise
- ✅ Compose like building blocks — add/remove as needed

### Design principles

1. **Modular over monolithic** — Each rule file is independent and composable.
2. **Scoped over global** — Rules activate based on context, not always-on.
3. **Opinionated but optional** — Strong defaults, easy to customize.
4. **Tool-agnostic** — Works with every AI coding tool.
5. **Community-driven** — Open to contributions of new stacks, roles, and patterns.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding a new stack/role/principle:
1. Create a directory under the appropriate category
2. Add a `rules.md` with the actual rules content
3. Add a `meta.json` with metadata (name, description, tags)
4. Submit a PR

---

## Roadmap

- [x] Core rule collection (stacks, roles, principles, workflows)
- [x] CLI tool with project detection
- [ ] Website with rule browser and live preview
- [ ] VS Code extension
- [ ] Rule analytics (which rules help most)
- [ ] Community marketplace for custom rule packs
- [ ] MCP server integration

---

## License

MIT © [Niyam Contributors](https://github.com/niyam-rules/niyam)

---

<p align="center">
  <strong>नियम</strong> — The discipline your AI agent needs.
</p>
