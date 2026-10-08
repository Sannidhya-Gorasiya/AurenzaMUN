"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { scrollToTarget } from "@/lib/scroll";
import { useCoarsePointer } from "@/lib/pointer";

type Variant = "primary" | "outline" | "secondary" | "ghost" | "disabled";

/** How long the fill takes to wipe up (its `duration-500`). A button only
    acts once its fill has finished. */
const HOLD_MS = 500;
/** Past this much finger travel the press is a scroll, not a hold. */
const TOUCH_SLOP = 10; // px

/* `fill` is the colour that wipes up from the bottom on hover/press; the
   label switches to its `onFill` colour as it passes. */
const variantClass: Record<Variant, { base: string; fill: string; onFill: string }> = {
  primary: {
    base: "bg-brand text-brand-fg font-semibold",
    fill: "bg-foreground",
    onFill: "group-hover/btn:text-background group-active/btn:text-background",
  },
  outline: {
    base: "border border-brand/60 text-brand font-semibold",
    fill: "bg-brand",
    onFill: "group-hover/btn:text-brand-fg group-active/btn:text-brand-fg",
  },
  secondary: {
    base: "border border-hairline-strong text-foreground",
    fill: "bg-foreground",
    onFill: "group-hover/btn:text-background group-active/btn:text-background",
  },
  ghost: {
    base: "text-muted hover:text-foreground active:text-brand",
    fill: "",
    onFill: "",
  },
  disabled: {
    base: "border border-dashed border-hairline-strong text-muted cursor-not-allowed",
    fill: "",
    onFill: "",
  },
};

/**
 * The "press & hold" note, shown on touch screens only (a mouse gets the
 * fill on hover and never needs telling). Buttons carry their own; a stacked
 * pair passes `hint={false}` to both and sets one of these between them.
 */
const HINT_TEXT = "font-mono text-[0.5rem] normal-case leading-none tracking-[0.12em] text-muted/80";

export function HoldHint({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none hidden ${HINT_TEXT} [@media(hover:none)]:block ${className}`}
    >
      press &amp; hold
    </span>
  );
}

/**
 * One hint for two full-width buttons stacked with nothing between them:
 * "press & hold" centred in the gap, with a dotted arrow curving up to the
 * button above and another curving down to the one below. The row always
 * keeps its height, so the pair sits the same distance apart with a mouse,
 * where the hint itself is hidden.
 */
export function HoldHintBetween({ className = "" }: { className?: string }) {
  const svg = {
    viewBox: "0 0 28 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <div
      aria-hidden
      className={`pointer-events-none invisible flex h-8 items-center justify-center gap-1.5 text-muted/80 [@media(hover:none)]:visible ${className}`}
    >
      <svg {...svg} className="h-6 w-7 self-start">
        <path d="M26 15C14 16 6 12 6 4" strokeDasharray="0.5 3" />
        <path d="M2.5 7.5 6 3l3.5 4.5" />
      </svg>
      <span className={HINT_TEXT}>press &amp; hold</span>
      <svg {...svg} className="h-6 w-7 self-end">
        <path d="M2 9c12-1 20 3 20 11" strokeDasharray="0.5 3" />
        <path d="M18.5 16.5 22 21l3.5-4.5" />
      </svg>
    </div>
  );
}

/**
 * Pill CTA. With a fine pointer it leans toward the cursor and springs back
 * on leave; on every input a fill wipes up behind the label on hover/press.
 * Touch gets no magnetic pull, which would slide the button out from under
 * the thumb pressing it.
 *
 * A button only acts once its fill has finished. On touch that means
 * holding it until the fill completes (a light buzz confirms, where the
 * device supports it); a quick tap, a scroll or sliding off lets the fill
 * drain away and does nothing. With a mouse the fill runs on hover, so a
 * click counts once the button has filled. Keyboard activation is never
 * held back.
 *
 * Touch is handled on touchend rather than click: Android sends no click
 * after a long press, and touchend still counts as a user gesture, so
 * opening a new tab from it is not blocked as a popup.
 *
 * Renders <a> when `href` is given, otherwise <button>. In-page anchors go
 * through Lenis; anything else opens in a new tab. "disabled" is a focusable
 * aria-disabled span with no effects.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  strength = 0.3,
  className = "",
  ariaLabel,
  arrow = false,
  hint = true,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  strength?: number;
  className?: string;
  ariaLabel?: string;
  /** Trailing arrow that nudges up-right on hover. */
  arrow?: boolean;
  /** The tiny "press & hold" note above the button, on touch screens. */
  hint?: boolean;
}) {
  const coarse = useCoarsePointer();
  const ref = useRef<HTMLElement>(null);
  /* When the fill started: hover for a mouse, touchstart for a finger. */
  const fillStart = useRef<number | null>(null);
  const touch = useRef({ start: 0, x: 0, y: 0, cancelled: true, buzz: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const v = variantClass[variant];
  const disabled = variant === "disabled";
  const magnetic = !disabled && !coarse;

  function handleMove(e: React.PointerEvent) {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  /** What the button does, once allowed to. */
  function activate() {
    if (href?.startsWith("#")) {
      onClick?.();
      requestAnimationFrame(() => {
        if (scrollToTarget(href)) window.history.pushState(null, "", href);
      });
      return;
    }
    onClick?.();
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  function handleEnter(e: React.PointerEvent) {
    if (e.pointerType !== "touch") fillStart.current = performance.now();
  }

  function handleLeave() {
    fillStart.current = null;
    reset();
  }

  /* Mouse, pen and keyboard. Touch never reaches here: touchend cancels
     the click it would have produced. */
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const keyboard = e.detail === 0;
    const start = fillStart.current;
    if (keyboard || (start !== null && performance.now() - start >= HOLD_MS)) activate();
  }

  function handleTouchStart(e: React.TouchEvent) {
    const t = touch.current;
    t.start = performance.now();
    t.x = e.touches[0]?.clientX ?? 0;
    t.y = e.touches[0]?.clientY ?? 0;
    t.cancelled = false;
    clearTimeout(t.buzz);
    t.buzz = window.setTimeout(() => {
      if (!t.cancelled) navigator.vibrate?.(8);
    }, HOLD_MS);
  }

  /* The browser claimed the gesture (a scroll), or the finger moved or slid off. */
  function cancelTouch() {
    touch.current.cancelled = true;
    clearTimeout(touch.current.buzz);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const el = ref.current;
    const p = e.touches[0];
    if (!el || !p) return;
    const t = touch.current;
    if (Math.hypot(p.clientX - t.x, p.clientY - t.y) > TOUCH_SLOP) return cancelTouch();
    const r = el.getBoundingClientRect();
    if (p.clientX < r.left || p.clientX > r.right || p.clientY < r.top || p.clientY > r.bottom) {
      cancelTouch();
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    e.preventDefault();
    const t = touch.current;
    clearTimeout(t.buzz);
    const held = !t.cancelled && performance.now() - t.start >= HOLD_MS;
    t.cancelled = true;
    if (held) activate();
  }

  const base = `group/btn relative isolate inline-flex select-none [-webkit-touch-callout:none] items-center justify-center whitespace-nowrap rounded-surface px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline-2 ${v.base} ${className}`;

  const label = (
    <>
      {v.fill ? (
        /* Clipped in its own box rather than by the button, which has to
           let the hint sit outside it. */
        <span aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-surface">
          <span
            className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out-expo group-hover/btn:scale-y-100 group-active/btn:scale-y-100 ${v.fill}`}
          />
        </span>
      ) : null}
      {hint && !disabled ? <HoldHint className="absolute bottom-full left-4 mb-[3px]" /> : null}
      <span
        className={`relative inline-flex items-center gap-2 transition-colors duration-300 ${v.onFill}`}
      >
        {children}
        {arrow ? (
          <ArrowUpRightIcon
            weight="bold"
            aria-hidden
            className="h-3.5 w-3.5 transition-transform duration-500 ease-out-expo group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          />
        ) : null}
      </span>
    </>
  );

  if (disabled) {
    return (
      <span aria-disabled className={base}>
        {label}
      </span>
    );
  }

  const common = {
    ref: ref as never,
    className: base,
    style: { x: sx, y: sy },
    onPointerEnter: handleEnter,
    onPointerMove: handleMove,
    onPointerUp: reset,
    onPointerCancel: () => {
      cancelTouch();
      reset();
    },
    onPointerLeave: handleLeave,
    onClick: handleClick,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: cancelTouch,
    /* A long press would otherwise open the link menu / preview. */
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    whileTap: { scale: 0.96 },
    "aria-label": ariaLabel,
  };

  if (href) {
    const offsite = !href.startsWith("#");
    return (
      <motion.a
        href={href}
        {...(offsite ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...common}
      >
        {label}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" {...common}>
      {label}
    </motion.button>
  );
}
