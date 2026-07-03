export const COPY = {
  installCommand: "npx niyam init",
  nav: {
    docs: "Docs",
    ribbon: "First open-source package manager for AI agent rules.",
    ribbonCta: "Get started",
  },
  hero: {
    path: "~/your-project",
    headline: "Your agent only needs the rules that matter right now",
    subheadline: "Niyam is a CLI and MCP server that composes modular rule files for AI coding agents. It watches which file you're editing and serves only the relevant context, instead of dumping 500 lines into every prompt.",
    primaryCta: "npx niyam init",
    secondaryCta: "Read the docs",
    copiedLabel: "Copied",
  },
  features: {
    eyebrow: "What you get",
    heading: "50 rule modules across 6 categories",
    cards: [
      { title: "Stacks", count: "23", desc: "React, Next.js, Python, Go, Rust, Flutter, Docker, AWS, and 15 more" },
      { title: "Roles", count: "12", desc: "Frontend, Backend, DevOps, Security, Architect, AI Engineer, and others" },
      { title: "Principles", count: "6", desc: "Clean Code, TDD, DDD, Security-First, Performance, Accessibility" },
      { title: "Workflows", count: "5", desc: "Git, CI/CD, Testing, Deployment, Code Review" },
      { title: "Anti-patterns", count: "2", desc: "Common mistakes and AI-generated code smells to catch early" },
      { title: "Languages", count: "2", desc: "JavaScript and SQL specific rules beyond framework guidance" },
    ],
  },
  mcp: {
    eyebrow: "Live context",
    heading: "Rules change with the file you open",
    lead: "The MCP server resolves rules based on file extension, directory path, and project config. It also stores corrections you make so they carry over to future sessions.",
    examples: [
      { file: "src/components/Button.tsx", rules: "react, typescript, frontend, accessibility" },
      { file: "src/api/auth.ts", rules: "typescript, backend, security-first" },
      { file: "Dockerfile", rules: "docker, devops" },
      { file: "prisma/schema.prisma", rules: "prisma, backend" },
      { file: "tests/user.test.ts", rules: "typescript, testing, tdd" },
    ],
  },
  install: {
    eyebrow: "Get started",
    heading: "One command to set up",
    steps: [
      { label: "Scan", detail: "Reads your project config files and identifies the stack" },
      { label: "Pick", detail: "You choose which roles, principles, and workflows to include" },
      { label: "Compose", detail: "Merges only selected rules into a focused output file" },
      { label: "Write", detail: "Generates AGENTS.md, .cursorrules, or CLAUDE.md based on your tool" },
    ],
  },
  cli: {
    eyebrow: "Commands",
    heading: "The CLI",
    commands: [
      { cmd: "niyam init", desc: "Interactive project setup" },
      { cmd: "niyam add <rules>", desc: "Subscribe to rule modules" },
      { cmd: "niyam generate", desc: "Regenerate output from config" },
      { cmd: "niyam update", desc: "Pull latest rule versions" },
      { cmd: "niyam search <query>", desc: "Find rules by keyword" },
      { cmd: "niyam publish", desc: "Package your rules for the registry" },
    ],
  },
  footer: {
    brand: "Niyam",
    tagline: "Built in India",
    copyright: `\u00A9 ${new Date().getFullYear()} Niyam Contributors`,
  },
};
