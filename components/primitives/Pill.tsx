import type { ReactNode } from "react";

type PillVariant = "outline" | "solid" | "plate" | "dashed";

/**
 * Small mono label. One accent on this site, so variants differ by weight
 * rather than colour: `plate` is filled gold, `solid` a quiet tinted chip,
 * `outline` a hairline, `dashed` a pending state. `live` adds a pulsing dot
 * and is reserved for things that are genuinely live (registrations open);
 * `dot` is the same dot held still, a plain bullet.
 */
export function Pill({
  children,
  variant = "outline",
  live = false,
  dot = false,
  className = "",
}: {
  children: ReactNode;
  variant?: PillVariant;
  live?: boolean;
  dot?: boolean;
  className?: string;
}) {
  const variants: Record<PillVariant, string> = {
    outline: "border border-hairline-strong text-foreground/85",
    solid: "border border-transparent bg-brand/12 text-brand",
    plate: "border border-transparent bg-brand text-brand-fg",
    dashed: "border border-dashed border-hairline-strong text-muted",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-[0.68rem] uppercase leading-tight tracking-[0.12em] sm:tracking-[0.18em] ${variants[variant]} ${className}`}
    >
      {live ? (
        <span aria-hidden className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-pulse-dot absolute inset-0 rounded-full ${
              variant === "plate" ? "bg-brand-fg" : "bg-brand"
            }`}
          />
          <span
            className={`relative h-1.5 w-1.5 rounded-full ${
              variant === "plate" ? "bg-brand-fg" : "bg-brand"
            }`}
          />
        </span>
      ) : dot ? (
        <span
          aria-hidden
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            variant === "plate" ? "bg-brand-fg" : "bg-brand"
          }`}
        />
      ) : null}
      {children}
    </span>
  );
}
