"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Copy, Check, Tag, ChevronDown, Terminal, ArrowLeft } from "lucide-react";
import { rules, categories, type Rule } from "./data";
import Link from "next/link";

const categoryColors: Record<Rule["category"], string> = {
  stacks: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  roles: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  principles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  workflows: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "anti-patterns": "bg-red-500/10 text-red-400 border-red-500/20",
  languages: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function RulesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesCategory = activeCategory === "all" || rule.category === activeCategory;
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.tags.some((tag) => tag.includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">न</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Niyam</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Browse Rules
            </h1>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              50 modular rule sets across stacks, roles, principles, workflows, and more.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-xl mx-auto mb-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rules by name, description, or tag..."
              className="w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "bg-zinc-900/50 text-zinc-400 border border-white/5 hover:border-white/15 hover:text-zinc-200"
                }`}
              >
                {cat.label}
                <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
              </button>
            ))}
          </motion.div>

          {/* Results Count */}
          <div className="text-sm text-zinc-500 mb-4">
            {filteredRules.length} rule{filteredRules.length !== 1 ? "s" : ""} found
          </div>

          {/* Rules Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredRules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  isSelected={selectedRule === rule.id}
                  onSelect={() =>
                    setSelectedRule(selectedRule === rule.id ? null : rule.id)
                  }
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredRules.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-zinc-500 text-lg">No rules match your search.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

function RuleCard({
  rule,
  isSelected,
  onSelect,
}: {
  rule: Rule;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`npx niyam add ${rule.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={`rounded-xl border bg-zinc-900/50 p-5 cursor-pointer transition-all ${
        isSelected
          ? "border-cyan-500/30 bg-zinc-900/80 ring-1 ring-cyan-500/10"
          : "border-white/5 hover:border-white/15"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-white">{rule.name}</h3>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${categoryColors[rule.category]}`}
        >
          {rule.category}
        </span>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed mb-4">{rule.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {rule.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-500"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
        {rule.tags.length > 4 && (
          <span className="text-xs text-zinc-600">+{rule.tags.length - 4}</span>
        )}
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 pt-4 mt-2">
              {/* All tags */}
              <div className="mb-4">
                <div className="text-xs text-zinc-500 mb-2 font-medium">All tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {rule.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-400"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Install command */}
              <div className="mb-2">
                <div className="text-xs text-zinc-500 mb-2 font-medium">Install</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-zinc-950 border border-white/5 px-3 py-2 font-mono text-xs text-zinc-300">
                    <Terminal className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                    <span>npx niyam add {rule.id}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg bg-zinc-800 border border-white/10 p-2 hover:bg-zinc-700 transition-colors"
                    aria-label="Copy install command"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>
              {copied && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-400"
                >
                  Copied to clipboard!
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end mt-1">
        <ChevronDown
          className={`h-4 w-4 text-zinc-600 transition-transform ${
            isSelected ? "rotate-180" : ""
          }`}
        />
      </div>
    </motion.div>
  );
}
