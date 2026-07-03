import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CardData {
  title: string;
  count: number;
  color: string;
  href: string;
}

interface TiltedCardsGridProps {
  cards: CardData[];
  className?: string;
}

export function TiltedCardsGrid({ cards, className }: TiltedCardsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6",
        className
      )}
    >
      {cards.map((card, i) => (
        <TiltedCard key={card.title} card={card} index={i} />
      ))}
    </div>
  );
}

interface TiltedCardProps {
  card: CardData;
  index: number;
}

function TiltedCard({ card, index }: TiltedCardProps) {
  const rotation = index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1";

  return (
    <Link
      to={card.href}
      className={cn(
        "group relative block h-[280px] rounded-xl p-6",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10",
        rotation,
        card.color
      )}
    >
      <div className="flex h-full flex-col justify-between">
        <span className="text-sm font-mono uppercase tracking-wider text-ink-muted">
          {card.count} {card.count === 1 ? "item" : "items"}
        </span>

        <h3 className="text-2xl font-semibold text-ink group-hover:text-amber-500 transition-colors">
          {card.title}
        </h3>
      </div>
    </Link>
  );
}
