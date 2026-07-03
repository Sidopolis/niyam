import { lazy, Suspense } from "react";
import { cn } from "@/lib/utils";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({
    default: mod.Dithering,
  }))
);

const ACCENT_SHADER = "#f59e0b";

interface HeroDitheringCardProps {
  headline: string;
  subheadline: string;
  installCopied: boolean;
  onCopyInstall: () => void;
  className?: string;
}

export function HeroDitheringCard({
  headline,
  subheadline,
  installCopied,
  onCopyInstall,
  className,
}: HeroDitheringCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-rule bg-paper-elevated",
        className
      )}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <Suspense fallback={null}>
          <Dithering
            color1={ACCENT_SHADER}
            color2="#000000"
            warp={0.4}
            warpShape="circle"
            type="4x4"
            style={{ width: "100%", height: "100%" }}
          />
        </Suspense>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 md:px-12 md:py-24 gap-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink">
          {headline}
        </h1>

        <p className="text-lg md:text-xl text-ink-muted max-w-2xl">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onCopyInstall}
            className={cn(
              "inline-flex items-center justify-center px-6 py-3 rounded-lg",
              "bg-amber-500 text-gray-900 font-semibold",
              "hover:bg-amber-400 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            )}
          >
            {installCopied ? "Copied!" : "Get Started"}
          </button>

          <button
            className={cn(
              "inline-flex items-center justify-center px-6 py-3 rounded-lg",
              "border border-rule bg-transparent text-ink",
              "font-mono text-sm uppercase tracking-wider",
              "hover:bg-paper-2 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            )}
          >
            Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
