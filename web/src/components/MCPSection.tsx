import { COPY } from "@/constants/copy";

export default function MCPSection() {
  return (
    <section id="mcp" className="section-shell">
      {/* Section head */}
      <div className="section-head">
        <p className="text-xs uppercase tracking-widest text-accent font-medium mb-3">
          {COPY.mcp.eyebrow}
        </p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-ink">
          {COPY.mcp.heading}
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed max-w-prose">
          {COPY.mcp.lead}
        </p>
      </div>

      {/* Terminal panel */}
      <div className="rounded-xl border border-rule bg-paper-elevated overflow-hidden">
        {/* Terminal chrome */}
        <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-ink-soft/30" />
          <span className="h-3 w-3 rounded-full bg-ink-soft/30" />
          <span className="h-3 w-3 rounded-full bg-ink-soft/30" />
          <span className="ml-3 text-xs text-ink-soft font-mono">
            niyam-mcp-server
          </span>
        </div>

        {/* Examples list */}
        <div className="divide-y divide-rule">
          {COPY.mcp.examples.map((example) => (
            <div
              key={example.file}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3"
            >
              <span className="font-mono text-sm text-ink shrink-0">
                {example.file}
              </span>
              <span className="hidden sm:block text-ink-soft">→</span>
              <span className="font-mono text-sm text-accent">
                {example.rules}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
