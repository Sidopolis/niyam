"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Copy, Package, Check } from "lucide-react";
import { rules, type Rule } from "../rules/data";

const categories = ["all", "stacks", "roles", "principles", "workflows", "anti-patterns", "languages"] as const;
const sortOptions = ["alphabetical", "newest", "category"] as const;

export default function RegistryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<string>("alphabetical");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = rules;
    if (category !== "all") {
      result = result.filter(r => r.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.includes(q))
      );
    }
    if (sort === "alphabetical") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "category") {
      result = [...result].sort((a, b) => a.category.localeCompare(b.category));
    }
    return result;
  }, [search, category, sort]);

  function copyInstall(id: string) {
    navigator.clipboard.writeText(`npx niyam add ${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">न</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Niyam</span>
          </a>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="/rules" className="hover:text-white transition-colors">Browse Rules</a>
            <a href="/registry" className="text-white">Registry</a>
            <a href="https://github.com/Sidopolis/niyam" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </nav>

      <section className="px-6 pt-16 pb-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-sm text-cyan-400 mb-4">
            <Package className="h-3.5 w-3.5" />
            {rules.length} modules available
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Community Registry</h1>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-lg">
            A growing collection of community-published rule modules. Subscribe to the ones you need
            and they stay up to date as frameworks evolve and patterns change.
          </p>

          <div className="mt-8 relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search rules by name, tag, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/30"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-4">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-zinc-400 border border-white/5 hover:border-white/10"
                }`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400 focus:outline-none"
          >
            {sortOptions.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-zinc-500 mb-4">{filtered.length} modules</p>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((rule) => (
                <motion.div
                  key={rule.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-zinc-900/30 px-5 py-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm">{rule.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-zinc-500">
                        {rule.category}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">v1.0.0</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 truncate">{rule.description}</p>
                    <div className="flex gap-1.5 mt-2">
                      {rule.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                      <Download className="h-3 w-3" /> niyam-core
                    </span>
                    <button
                      onClick={() => copyInstall(rule.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors font-mono"
                    >
                      {copiedId === rule.id ? (
                        <><Check className="h-3 w-3 text-emerald-400" /> copied</>
                      ) : (
                        <><Copy className="h-3 w-3" /> add {rule.id}</>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}
