import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { motion, type Variant, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationT = "left" | "right" | "top" | "bottom" | "z" | "blur";

interface StaggerContextValue {
  isHovered: boolean;
}

const StaggerContext = createContext<StaggerContextValue>({ isHovered: false });

function splitText(text: string): string[] {
  return text.split("");
}

function setStaggerDirection(
  direction: AnimationT
): { initial: Variant; animate: Variant } {
  switch (direction) {
    case "left":
      return { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "right":
      return { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } };
    case "top":
      return { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } };
    case "bottom":
      return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } };
    case "z":
      return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
      };
    case "blur":
      return {
        initial: { filter: "blur(8px)", opacity: 0 },
        animate: { filter: "blur(0px)", opacity: 1 },
      };
  }
}

function useAnimationVariants(
  direction: AnimationT,
  staggerDelay: number
): { container: Variants; child: Variants } {
  const { initial, animate } = setStaggerDirection(direction);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const child: Variants = {
    hidden: initial,
    visible: animate,
  };

  return { container, child };
}

// --- Main wrapper ---

interface TextStaggerHoverProps {
  children: ReactNode;
  className?: string;
}

export function TextStaggerHover({
  children,
  className,
}: TextStaggerHoverProps) {
  const [isHovered, setIsHovered] = useState(false);

  const contextValue = useMemo(() => ({ isHovered }), [isHovered]);

  return (
    <StaggerContext.Provider value={contextValue}>
      <span
        className={cn("relative inline-block cursor-pointer", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </span>
    </StaggerContext.Provider>
  );
}

// --- Active text (visible when NOT hovered) ---

interface TextStaggerHoverActiveProps {
  text: string;
  direction?: AnimationT;
  staggerDelay?: number;
  className?: string;
}

export function TextStaggerHoverActive({
  text,
  direction = "top",
  staggerDelay = 0.03,
  className,
}: TextStaggerHoverActiveProps) {
  const { isHovered } = useContext(StaggerContext);
  const { container, child } = useAnimationVariants(direction, staggerDelay);
  const chars = splitText(text);

  return (
    <motion.span
      className={cn("inline-flex", className)}
      variants={container}
      initial="visible"
      animate={isHovered ? "hidden" : "visible"}
      aria-hidden={isHovered}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={child}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// --- Hidden text (visible when hovered) ---

interface TextStaggerHoverHiddenProps {
  text: string;
  direction?: AnimationT;
  staggerDelay?: number;
  className?: string;
}

export function TextStaggerHoverHidden({
  text,
  direction = "bottom",
  staggerDelay = 0.03,
  className,
}: TextStaggerHoverHiddenProps) {
  const { isHovered } = useContext(StaggerContext);
  const { container, child } = useAnimationVariants(direction, staggerDelay);
  const chars = splitText(text);

  return (
    <motion.span
      className={cn("absolute inset-0 inline-flex", className)}
      variants={container}
      initial="hidden"
      animate={isHovered ? "visible" : "hidden"}
      aria-hidden={!isHovered}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={child}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
