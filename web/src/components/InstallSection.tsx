import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { COPY } from "@/constants/copy";

export default function InstallSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COPY.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="section-shell">
      {/* Section head */}
      <div className="section-head">
        <p className="text-xs uppercase tracking-widest text-accent font-medium mb-3">
          {COPY.install.eyebrow}
        </p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-ink">
          {COPY.install.heading}
        </h2>
      </div>

      {/* Steps grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COPY.install.steps.map((step, i) => (
          <div key={step.label} className="flex flex-col gap-3">
            <span className="text-2xl font-bold text-accent tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-semibold text-ink">{step.label}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{step.detail}</p>
          </div>
        ))}
      </div>

      {/* Copy command */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={handleCopy}
          className="group flex items-center gap-3 rounded-full border border-rule bg-paper-elevated px-6 py-3 font-mono text-sm text-ink hover:border-accent/50 transition-colors"
        >
          <span className="text-accent">$</span>
          <span>{COPY.installCommand}</span>
          {copied ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <Copy size={14} className="text-ink-soft group-hover:text-ink-muted transition-colors" />
          )}
        </button>
      </div>
    </section>
  );
}
