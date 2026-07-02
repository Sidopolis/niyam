# Startup SaaS Template

## Who Is This For?

Early-stage startups and small teams building SaaS products who need to ship fast
without sacrificing code quality. If you're iterating daily, pushing features weekly,
and can't afford tech debt slowing you down — this is your template.

## What's Included

### Stacks
- **React** — Component-driven UI
- **Next.js** — Full-stack framework with SSR/SSG
- **TypeScript** — Type safety without the ceremony
- **Tailwind CSS** — Utility-first styling for rapid UI
- **Node.js** — Backend runtime

### Role
- **Full-Stack** — One developer, end-to-end ownership

### Principles
- **Clean Code** — Readable, maintainable, intention-revealing code
- **TDD** — Test-driven development for confidence in every deploy
- **Performance** — Fast load times, optimized bundles, efficient queries

### Workflows
- **Git** — Conventional commits, feature branches, clean history
- **CI/CD** — Automated builds, tests, and deployments on every push
- **Testing** — Unit, integration, and E2E coverage

## Usage

```bash
npx niyam init --template startup-saas
```

This scaffolds a `.niyam/` config in your project with all the rules composed together.

## Example Projects

- B2B SaaS dashboards
- Developer tools and platforms
- Subscription-based web apps
- Internal tools shipped to customers
- MVP products validating market fit

## Philosophy

Speed is a feature. This template optimizes for shipping cadence while keeping
quality guardrails tight enough that you don't accumulate crippling debt. TDD
ensures regressions don't pile up. Performance rules keep the product snappy.
Clean code principles mean your future self (or first hire) can onboard fast.
