"use client";

import { motion } from "framer-motion";
import { Component as AuroraBackground } from "@/components/ui/aurora-background";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Typewriter } from "@/components/ui/typewriter";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { TextShimmer } from "@/components/ui/shimmer-text";
import {
  Terminal,
  Layers,
  Zap,
  Shield,
  Code2,
  GitBranch,
  Palette,
  Server,
  Smartphone,
  Database,
  Lock,
  Gauge,
  Accessibility,
  Workflow,
  Package,
  Copy,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <StacksGrid />
      <HowItWorks />
      <CLISection />
      <MCPSection />
      <TemplatesSection />
      <CTASection />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-sm font-bold">न</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Niyam</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="/rules" className="hover:text-white transition-colors">Browse Rules</a>
          <a href="/registry" className="hover:text-white transition-colors">Registry</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stacks" className="hover:text-white transition-colors">Stacks</a>
          <a href="#cli" className="hover:text-white transition-colors">CLI</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
        </div>
        <a
          href="https://github.com/Sidopolis/niyam"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
        >
          Get Started
        </a>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 min-h-screen flex items-center justify-center">
      <AuroraBackground className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
          <Badge text="v0.1 just shipped. 50 rule modules, live MCP server." href="https://github.com/Sidopolis/niyam" />
          <h1 className="mt-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl md:text-7xl font-bold tracking-tight text-transparent leading-tight">
            Stop dumping 500 lines
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text">
              into every prompt.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Your AI agent doesn&apos;t need your entire rulebook when editing a{" "}
            <span className="text-cyan-300 font-medium">
              <Typewriter
                words={["React component", "Python endpoint", "Dockerfile", "Go service", "Rust module", "test file"]}
                speed={80}
                delayBetweenWords={1500}
              />
            </span>
            <br />
            Niyam serves only the rules that matter for the file you&apos;re touching, and leaves out everything else.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <CopyCommand text="npx niyam init" />
            <a
              href="#features"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
            >
              Browse Rules →
            </a>
          </div>
        </motion.div>
    </section>
  );
}

function CopyCommand({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="group flex items-center gap-3 rounded-lg bg-zinc-900 border border-white/10 px-5 py-3 font-mono text-sm text-zinc-300 hover:border-white/20 transition-all"
    >
      <Terminal className="h-4 w-4 text-zinc-500" />
      <span>{text}</span>
      <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition-colors" />
      {copied && (
        <span className="text-emerald-400 text-xs">Copied!</span>
      )}
    </button>
  );
}

function StatsBar() {
  const stats = [
    { label: "Stacks", value: "23" },
    { label: "Roles", value: "12" },
    { label: "Principles", value: "6" },
    { label: "Workflows", value: "5" },
    { label: "Tools", value: "8" },
  ];
  return (
    <section className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 md:gap-16 px-6 py-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Layers,
      title: "Pick what you need",
      desc: "There are 23 stacks, 12 roles, and 6 engineering principles you can combine however makes sense for your project. The generated config only includes what you picked, so your agent's context stays focused on what actually matters.",
    },
    {
      icon: Zap,
      title: "Knows your stack already",
      desc: "Point it at your repo and it reads package.json, Cargo.toml, go.mod, or whatever config files you have. It figures out your tech stack before you tell it anything.",
    },
    {
      icon: Terminal,
      title: "Set up in one command",
      desc: "Run npx niyam init inside any project. It scans the repo, asks you a few questions about how you like to work, and writes the config. The whole thing takes about 30 seconds.",
    },
    {
      icon: Code2,
      title: "Generates for any tool you use",
      desc: "Same config file produces output for Kiro, Cursor, Claude Code, Copilot, Windsurf, Codex, Aider, or Gemini. Switch tools without redoing your rules.",
    },
    {
      icon: Shield,
      title: "Rules change based on what file you're editing",
      desc: "The MCP server watches which file you have open. Working on auth.ts? You get security rules. Editing a React component? Accessibility and frontend rules show up instead, without you having to switch anything manually.",
    },
    {
      icon: GitBranch,
      title: "Easy to add your own rules",
      desc: "Everything is MIT licensed. Each rule module is just a markdown file and a meta.json in a folder. If your framework or workflow is missing, adding it takes about 10 minutes and one pull request.",
    },
  ];

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            What it actually does
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Six things that make Niyam different from dumping a giant markdown file into your repo.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <SpotlightCard className="h-full rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
                <f.icon className="h-8 w-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StacksGrid() {
  const stacks = [
    { name: "React", icon: "⚛️" },
    { name: "Next.js", icon: "▲" },
    { name: "Python", icon: "🐍" },
    { name: "Go", icon: "🐹" },
    { name: "Rust", icon: "🦀" },
    { name: "Flutter", icon: "💙" },
    { name: "TypeScript", icon: "🔷" },
    { name: "Tailwind", icon: "🎨" },
    { name: "Vue", icon: "💚" },
    { name: "Svelte", icon: "🔥" },
    { name: "Angular", icon: "🅰️" },
    { name: "Node.js", icon: "💚" },
    { name: "Django", icon: "🐎" },
    { name: "FastAPI", icon: "⚡" },
    { name: "Laravel", icon: "🔴" },
  ];

  return (
    <section id="stacks" className="px-6 py-24 border-t border-white/5">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">23 stacks and counting</h2>
          <p className="mt-4 text-zinc-400">Every stack has 100+ lines of rules written for the latest version, with real patterns and anti-patterns that actually come up in production code.</p>
        </motion.div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {stacks.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-zinc-900/30 p-4 hover:border-white/15 hover:bg-zinc-800/40 transition-all cursor-pointer"
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs text-zinc-400">{s.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Scan", desc: "It looks through your project and identifies which technologies and frameworks you're working with" },
    { num: "02", title: "Pick", desc: "You tell it your role, which coding principles matter to you, and how you like your workflows" },
    { num: "03", title: "Compose", desc: "It combines only the rules you selected into one clean file, nothing extra gets included" },
    { num: "04", title: "Write", desc: "Outputs in whichever format your editor expects, whether that's AGENTS.md, .cursorrules, or CLAUDE.md" },
  ];

  return (
    <section className="px-6 py-24 border-t border-white/5">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-cyan-500/20 to-transparent border border-cyan-500/20 text-cyan-400 font-mono text-sm font-bold">
                {s.num}
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-zinc-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CLISection() {
  return (
    <section id="cli" className="px-6 py-24 border-t border-white/5">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">The CLI in action</h2>
          <p className="mt-4 text-zinc-400">This is what it looks like when you run it inside a Next.js project with TypeScript and Tailwind.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden"
        >
          <BorderBeam size={250} duration={12} colorFrom="#06b6d4" colorTo="#3b82f6" delay={0} />
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-zinc-500 font-mono">terminal</span>
          </div>
          <pre className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
            <code className="text-zinc-300">
{`$ npx niyam init

  ┌─────────────────────────────────────┐
  │         नियम · Niyam               │
  │   Modular AI rules that compose.    │
  └─────────────────────────────────────┘

`}<span className="text-cyan-400">✓</span>{` Detected stacks: `}<span className="text-cyan-300">react, typescript, tailwind, nextjs</span>{`

`}<span className="text-cyan-400">?</span>{` Select roles: `}<span className="text-zinc-500">fullstack, frontend</span>{`
`}<span className="text-cyan-400">?</span>{` Select principles: `}<span className="text-zinc-500">clean-code, tdd, performance</span>{`
`}<span className="text-cyan-400">?</span>{` Select workflows: `}<span className="text-zinc-500">git, testing, ci-cd</span>{`
`}<span className="text-cyan-400">?</span>{` Generate for: `}<span className="text-zinc-500">kiro</span>{`

`}<span className="text-emerald-400">✓</span>{` Config saved: .niyam/config.json
`}<span className="text-emerald-400">✓</span>{` Rules generated: AGENTS.md (87 lines)

  Regenerate: npx niyam generate
  Add more:   npx niyam add security-first`}
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}

function TemplatesSection() {
  const templates = [
    {
      name: "Startup SaaS",
      desc: "For teams shipping a React + Node product who want TDD and clean code without overthinking the setup",
      cmd: "npx niyam init --template startup-saas",
      color: "from-orange-500/20 to-transparent",
    },
    {
      name: "Enterprise",
      desc: "Security-first with DDD patterns, strict CI gates, and full code review workflows built in",
      cmd: "npx niyam init --template enterprise",
      color: "from-blue-500/20 to-transparent",
    },
    {
      name: "Solo Dev",
      desc: "Full-stack rules with minimal ceremony, for when you're building alone and need speed over process",
      cmd: "npx niyam init --template solo-dev",
      color: "from-purple-500/20 to-transparent",
    },
    {
      name: "Open Source",
      desc: "Accessibility, thorough testing, and contribution-friendly workflows that help your community ship quality PRs",
      cmd: "npx niyam init --template open-source",
      color: "from-emerald-500/20 to-transparent",
    },
  ];

  return (
    <section id="templates" className="px-6 py-24 border-t border-white/5">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Templates if you don&apos;t want to configure</h2>
          <p className="mt-4 text-zinc-400">These are pre-configured rule bundles for common project types, so you can get started without thinking about which modules to pick.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/5 bg-zinc-900/30 p-6 hover:border-white/10 transition-all"
            >
              <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${t.color} mb-4`} />
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-zinc-400 mt-1 mb-4">{t.desc}</p>
              <code className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-3 py-1.5 rounded-lg">
                {t.cmd}
              </code>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MCPSection() {
  const examples = [
    { file: "src/components/Button.tsx", rules: "react, typescript, frontend, accessibility, clean-code" },
    { file: "src/api/auth.ts", rules: "typescript, backend, security-first, clean-code" },
    { file: "Dockerfile", rules: "docker, devops" },
    { file: "prisma/schema.prisma", rules: "prisma, backend" },
    { file: "src/__tests__/user.test.ts", rules: "typescript, testing, tdd, clean-code" },
    { file: "src/app/page.tsx", rules: "react, typescript, nextjs, frontend, clean-code" },
  ];

  return (
    <section className="px-6 py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-cyan-950/10">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-sm text-cyan-400 mb-4">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            This is what makes it different
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Live MCP Server</h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
            Most rule tools generate a static file and call it done. Niyam also runs as an MCP server that
            watches which file your agent is working on and serves only the relevant rules for that specific context.
          </p>
        </motion.div>

        <div className="relative rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden">
          <BorderBeam size={200} duration={10} colorFrom="#06b6d4" colorTo="#8b5cf6" delay={2} />
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-cyan-500/60" />
            <span className="text-xs text-zinc-500 font-mono">niyam mcp — context resolver</span>
          </div>
          <div className="p-6 space-y-3">
            {examples.map((ex, i) => (
              <motion.div
                key={ex.file}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center gap-2 font-mono text-sm"
              >
                <span className="text-zinc-500 shrink-0">{ex.file}</span>
                <span className="text-zinc-700 hidden sm:inline">→</span>
                <span className="text-cyan-300/80 text-xs">{ex.rules}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
            <h4 className="font-semibold text-sm mb-1">Remembers your corrections</h4>
            <p className="text-xs text-zinc-500">Tell it &quot;we use pnpm here, not npm&quot; once, and it stores that as a project learning for every future session.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
            <h4 className="font-semibold text-sm mb-1">No config file needed</h4>
            <p className="text-xs text-zinc-500">It resolves which rules to serve by looking at the file extension and directory path. Works out of the box.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
            <h4 className="font-semibold text-sm mb-1">Connects to any MCP-compatible tool</h4>
            <p className="text-xs text-zinc-500">Kiro, Cursor, Claude Code, and Copilot all support MCP servers natively, so there&apos;s nothing extra to install.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-32 border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          <TextShimmer className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent" duration={3}>
            नियम
          </TextShimmer>
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          /nee-yum/ — your agent gets the context it needs, scoped to whatever it&apos;s working on.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <CopyCommand text="npx niyam init" />
          <a
            href="https://github.com/Sidopolis/niyam"
            className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
          >
            ★ Star on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-8">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="font-semibold text-zinc-300">Niyam</span>
          <span>·</span>
          <span>MIT License</span>
          <span>·</span>
          <span>Made in India 🇮🇳</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <a href="https://github.com/Sidopolis/niyam" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
}
