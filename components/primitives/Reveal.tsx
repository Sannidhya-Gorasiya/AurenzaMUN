"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { VIEWPORT } from "@/lib/motion";
import { observeOnce } from "@/lib/inview";

type RevealTag = "div" | "section" | "li" | "span" | "article";

/**
 * Scroll-reveal workhorse: fades + rises into view once. The movement is a
 * CSS transition (`.reveal` in globals.css) triggered by a shared observer,
 * so it runs on the compositor rather than in script every frame.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 24,
  amount = VIEWPORT.amount,
  className = "",
}: {
  children: ReactNode;
  as?: RevealTag;
  delay?: number;
  y?: number;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as;

  useEffect(() => {
    const el = ref.current;
    return el ? observeOnce(el, amount) : undefined;
  }, [amount]);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
