import { COPY } from "@/constants/copy";
import { LINKS } from "@/constants/links";
import { TiltedCardsGrid } from "@/components/ui/tilted-cards-grid";

const cardColors = [
  "border border-amber-500/30 bg-amber-500/5",
  "border border-emerald-500/30 bg-emerald-500/5",
  "border border-cyan-500/30 bg-cyan-500/5",
  "border border-purple-500/30 bg-purple-500/5",
  "border border-rose-500/30 bg-rose-500/5",
  "border border-blue-500/30 bg-blue-500/5",
];

const cards = COPY.features.cards.map((card, i) => ({
  title: card.title,
  count: parseInt(card.count, 10),
  color: cardColors[i],
  href: LINKS.features,
}));

export default function FeaturesSection() {
  return (
    <section id="features" className="section-shell">
      {/* Section head */}
      <div className="section-head">
        <p className="text-xs uppercase tracking-widest text-accent font-medium mb-3">
          {COPY.features.eyebrow}
        </p>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-ink">
          {COPY.features.heading}
        </h2>
      </div>

      {/* Tilted cards grid */}
      <TiltedCardsGrid cards={cards} />
    </section>
  );
}
