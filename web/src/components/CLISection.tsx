import { Terminal } from "lucide-react";
import { COPY } from "@/constants/copy";
import {
  HighlightGroup,
  HighlighterItem,
  Particles,
} from "@/components/ui/highlight-group";

export default function CLISection() {
  return (
    <section id="cli" className="section-shell relative">
      {/* Particles background */}
      <Particles
        className="absolute inset-0 -z-10"
        quantity={30}
        staticity={60}
        ease={40}
      />

      {/* Section head */}
      <div className="section-head">
        <p className="text-xs uppercase tracking-widest text-accent font-medium mb-3">
          {COPY.cli.eyebrow}
        </p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-ink">
          {COPY.cli.heading}
        </h2>
      </div>

      {/* Commands grid */}
      <HighlightGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COPY.cli.commands.map((item) => (
          <HighlighterItem key={item.cmd}>
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={14} className="text-accent" />
              <code className="font-mono text-sm text-ink font-medium">
                {item.cmd}
              </code>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {item.desc}
            </p>
          </HighlighterItem>
        ))}
      </HighlightGroup>
    </section>
  );
}
