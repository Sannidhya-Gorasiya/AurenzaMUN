/* Original pre-redesign Pill, kept for the Team, Committees and Contact
   sections, which were restored to their earlier design. */
import type { ReactNode } from "react";
import type { Accent } from "@/lib/content";

type PillVariant = "solid" | "plate" | "outline" | "dashed" | "ghost";
type PillSize = "md" | "sm";

/* Blue/ice pills are light chips carrying midnight-blue text, which is the
   only way that navy stays legible on this near-black page. Gold keeps the
   glass treatment — it is already high-contrast on the dark background. */
const accentSolid: Record<Accent, string> = {
  blue: "bg-blue-chip text-blue-deep",
  gold: "bg-surface-strong text-brand",
  ice: "bg-ice-chip text-ice-deep",
};

const accentOutline: Record<Accent, string> = {
  blue: "bg-blue-chip text-blue-deep border-blue-chip",
  gold: "glass text-brand border-brand/40",
  ice: "bg-ice-chip text-ice-deep border-ice-chip",
};

const accentBorder: Record<Accent, string> = {
  blue: "border-blue/40",
  gold: "border-brand/40",
  ice: "border-ice/40",
};

/* Dots sit on the chip, so they take the same midnight tone as the label. */
const accentDot: Record<Accent, string> = {
  blue: "bg-blue-deep",
  gold: "bg-brand",
  ice: "bg-ice-deep",
};

export function LegacyPill({
  children,
  accent = "blue",
  variant = "outline",
  size = "md",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  accent?: Accent;
  variant?: PillVariant;
  size?: PillSize;
  dot?: boolean;
  className?: string;
}) {
  const base = "inline-flex items-center gap-2 rounded-lg font-mono uppercase";

  /* The type step lives here rather than in a caller's `className`, because
     two competing `text-*`/`tracking-*` utilities resolve by stylesheet
     order, not by which one the caller passed last.
     `sm` exists for long department lines — "HEAD OF TECHNICALS &
     DEVELOPMENT" overruns a three-across team panel at the default step — and
     carries a real line-height so that a label which still has to wrap on a
     narrow viewport stacks instead of colliding with itself. It steps down
     once more below `sm`, where the two-across team grid leaves a panel about
     half a phone wide: the step is sized so the longest department line —
     "SUB-HEAD OF TECHNICALS & DEVELOPMENT" — breaks into two lines rather
     than three, which takes roughly 22 monospace characters per line. Nearly
     all of that budget came out of the tracking, which buys width without
     costing much legibility. */
  const sizes: Record<PillSize, string> = {
    md: "px-4 py-1.5 text-[0.7rem] tracking-[0.2em] leading-none",
    sm: "px-2 py-1 text-[0.5rem] tracking-[0.01em] leading-[1.35] sm:px-3 sm:py-1.5 sm:text-[0.6rem] sm:tracking-[0.14em]",
  };

  const variants: Record<PillVariant, string> = {
    solid: `${accentSolid[accent]} border border-transparent`,
    outline: `border ${accentOutline[accent]}`,
    dashed: `border border-dashed ${accentBorder[accent]} text-muted`,
    /* Filled gold plate, the same pairing the primary buttons use. */
    plate: "border border-transparent bg-brand text-brand-fg",
    /* Ghost-white plate for accents that have no light chip of their own. */
    ghost: "border border-transparent bg-foreground text-background",
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {dot ? (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "plate" ? "bg-brand-fg" : accentDot[accent]
          }`}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
