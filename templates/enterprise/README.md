# Enterprise Template

## Who Is This For?

Teams building production systems where security, compliance, and reliability are
non-negotiable. Financial services, healthcare, government, and any organization
where a breach or outage has serious consequences.

## What's Included

### Stacks
- **TypeScript** — Strict type safety across the entire codebase
- **Node.js** — Backend services and APIs
- **React** — Frontend with accessibility baked in

### Roles
- **Backend** — API design, data modeling, service architecture
- **Security** — Threat modeling, auth, encryption, input validation

### Principles
- **Security-First** — Every change evaluated for attack surface
- **DDD (Domain-Driven Design)** — Bounded contexts, ubiquitous language, aggregate roots
- **Clean Code** — Maintainable by large teams over long timelines
- **Accessibility** — WCAG compliance, inclusive design

### Workflows
- **Git** — Protected branches, signed commits, linear history
- **CI/CD** — Multi-stage pipelines with security gates
- **Testing** — Unit, integration, E2E, contract, and security tests
- **Deployment** — Blue-green, canary releases, rollback procedures
- **Code Review** — Mandatory reviews, security checklists, approval gates

## Usage

```bash
npx niyam init --template enterprise
```

This scaffolds a `.niyam/` config with strict rules appropriate for regulated environments.

## Example Projects

- Banking and financial platforms
- Healthcare data systems (HIPAA-compliant)
- Government portals and citizen services
- Enterprise SaaS with SOC 2 requirements
- Multi-tenant platforms handling sensitive data

## Philosophy

Move deliberately. Every change goes through gates — type checking, linting,
security scanning, automated tests, and human review. DDD keeps the domain logic
clean and isolated from infrastructure concerns. Security is not a phase; it's
a property of every line of code.
