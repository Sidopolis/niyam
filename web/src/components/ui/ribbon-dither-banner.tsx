import { lazy, Suspense, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({
    default: mod.Dithering,
  }))
);

const ACCENT_SHADER = "#f59e0b";

interface RibbonDitherBannerProps {
  children: ReactNode;
  className?: string;
}

export function RibbonDitherBanner({
  children,
  className,
}: RibbonDitherBannerProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-full overflow-hidden",
        "border border-amber-500/20",
        className
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Suspense fallback={null}>
          <Dithering
            colorFront={ACCENT_SHADER}
            colorBack="#000000"
            shape="warp"
            type="4x4"
            style={{ width: "100%", height: "100%" }}
          />
        </Suspense>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none" />

      <div className="relative z-10 px-4 py-1.5 text-sm font-medium text-ink">
        {children}
      </div>
    </div>
  );
}
