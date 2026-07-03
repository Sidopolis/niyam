import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "@/lib/utils";

// --- useMousePosition hook ---

interface MousePosition {
  x: number;
  y: number;
}

function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}

// --- HighlightGroup ---

interface HighlightGroupProps {
  children: ReactNode;
  className?: string;
}

export function HighlightGroup({ children, className }: HighlightGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cards = containerRef.current.querySelectorAll<HTMLElement>(
        "[data-highlight-item]"
      );
      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardX = e.clientX - cardRect.left;
        const cardY = e.clientY - cardRect.top;
        card.style.setProperty("--mouse-x", `${cardX}px`);
        card.style.setProperty("--mouse-y", `${cardY}px`);
      });
    },
    []
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("group", className)}
    >
      {children}
    </div>
  );
}

// --- HighlighterItem ---

interface HighlighterItemProps {
  children: ReactNode;
  className?: string;
}

export function HighlighterItem({ children, className }: HighlighterItemProps) {
  return (
    <div
      data-highlight-item
      className={cn(
        "relative overflow-hidden rounded-xl border border-rule bg-paper p-px",
        // Before pseudo — border glow
        "before:absolute before:inset-0 before:rounded-xl before:opacity-0",
        "before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),_theme(colors.amber.500/40),transparent_40%)]",
        "before:transition-opacity before:duration-500",
        "group-hover:before:opacity-100",
        // After pseudo — inner glow
        "after:absolute after:inset-[1px] after:rounded-[11px] after:opacity-0",
        "after:bg-[radial-gradient(300px_circle_at_var(--mouse-x)_var(--mouse-y),_theme(colors.amber.500/10),transparent_40%)]",
        "after:transition-opacity after:duration-500",
        "group-hover:after:opacity-100",
        className
      )}
    >
      <div className="relative z-10 h-full rounded-[11px] bg-paper-elevated p-6">
        {children}
      </div>
    </div>
  );
}

// --- Particles ---

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  color?: string;
}

export function Particles({
  className,
  quantity = 50,
  staticity = 50,
  ease = 50,
  color = "#f59e0b",
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const mouse = useRef({ x: 0, y: 0 });
  const particles = useRef<
    Array<{
      x: number;
      y: number;
      translateX: number;
      translateY: number;
      size: number;
      alpha: number;
      targetAlpha: number;
      dx: number;
      dy: number;
    }>
  >([]);
  const animationFrameRef = useRef<number>(0);
  const canvasSize = useRef({ w: 0, h: 0 });

  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [245, 158, 11];
  }, []);

  const createParticle = useCallback((): {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
  } => {
    return {
      x: Math.random() * canvasSize.current.w,
      y: Math.random() * canvasSize.current.h,
      translateX: 0,
      translateY: 0,
      size: Math.random() * 2 + 0.5,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvasSize.current = { w: width, h: height };
        canvas.width = width;
        canvas.height = height;
      }
      initParticles();
    });

    resizeObserver.observe(canvas);

    function initParticles() {
      particles.current = Array.from({ length: quantity }, () =>
        createParticle()
      );
    }

    function drawParticle(
      p: (typeof particles.current)[0],
      ctx: CanvasRenderingContext2D
    ) {
      const [r, g, b] = hexToRgb(color);
      ctx.beginPath();
      ctx.arc(p.x + p.translateX, p.y + p.translateY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
      ctx.fill();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

      particles.current.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        // Mouse interaction
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.translateX += (dx / dist) * force * (ease / 100);
          p.translateY += (dy / dist) * force * (ease / 100);
        } else {
          p.translateX *= 1 - staticity / 1000;
          p.translateY *= 1 - staticity / 1000;
        }

        // Fade in
        if (p.alpha < p.targetAlpha) {
          p.alpha += 0.01;
        }

        // Wrap around
        if (p.x > canvasSize.current.w) p.x = 0;
        if (p.x < 0) p.x = canvasSize.current.w;
        if (p.y > canvasSize.current.h) p.y = 0;
        if (p.y < 0) p.y = canvasSize.current.h;

        drawParticle(p, ctx);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [quantity, staticity, ease, color, createParticle, hexToRgb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.current = {
      x: mousePosition.x - rect.left,
      y: mousePosition.y - rect.top,
    };
  }, [mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    />
  );
}
