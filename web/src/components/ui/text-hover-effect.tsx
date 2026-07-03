import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextHoverEffectProps {
  text: string;
  className?: string;
}

export function TextHoverEffect({ text, className }: TextHoverEffectProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [maskSize, setMaskSize] = useState(0);

  useEffect(() => {
    setMaskSize(isHovered ? 150 : 0);
  }, [isHovered]);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1000 200"
      xmlns="http://www.w3.org/2000/svg"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("select-none", className)}
    >
      <defs>
        {/* Stroke animation gradient */}
        <linearGradient id="textStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
        </linearGradient>

        {/* Rainbow reveal gradient */}
        <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="20%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#a855f7" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="80%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Radial mask that follows cursor */}
        <motion.radialGradient
          id="revealMask"
          cx={cursor.x / 10 + "%"}
          cy={cursor.y / 2 + "%"}
          r={maskSize + "%"}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="textRevealMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>

      {/* Base stroke text — animated draw on load */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-none stroke-[#f59e0b] dark:stroke-[#f59e0b99] text-[80px] font-bold"
        strokeWidth="1"
        strokeDasharray="1000"
        initial={{ strokeDashoffset: 1000 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Hover-revealed rainbow fill */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[80px] font-bold"
        fill="url(#rainbowGradient)"
        mask="url(#textRevealMask)"
      >
        {text}
      </text>
    </svg>
  );
}
