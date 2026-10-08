"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { Accent } from "@/lib/content";
import { useCoarsePointer } from "@/lib/pointer";

const accentHover: Record<Accent, string> = {
  blue: "hover:border-blue/50 hover:shadow-blue/20",
  gold: "hover:border-brand/50 hover:shadow-brand/20",
  ice: "hover:border-ice/50 hover:shadow-ice/20",
};

/* The same accent treatment, applied from JS while a finger is down.
   Tailwind scopes `hover:` under `@media (hover: hover)`, so on a phone the
   whole accent layer never fired and every card read as flat. */
const accentPress: Record<Accent, string> = {
  blue: "border-blue/60 shadow-blue/25",
  gold: "border-brand/60 shadow-brand/25",
  ice: "border-ice/60 shadow-ice/25",
};

const MAX_TILT = 7; // degrees

/**
 * Glass card that reacts to whichever input the device actually has.
 *
 * With a pointer: a subtle 3D tilt toward the cursor plus an accent-tinted
 * hover glow. Under a finger: no tilt — a touch is a discrete point, not a
 * path to follow, and tracking it read as the card lunging at the tap and
 * snapping back — so touch gets a press-in scale and the accent glow held
 * for as long as the finger is down.
 *
 * interactive={false} keeps the card static, glow-only.
 */
export function TiltCard({
  children,
  accent = "gold",
  interactive = true,
  className = "",
}: {
  children: ReactNode;
  accent?: Accent;
  interactive?: boolean;
  className?: string;
}) {
  const coarse = useCoarsePointer();
  const ref = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const reactive = interactive;
  const tilt = reactive && !coarse;

  function handleMove(e: React.PointerEvent) {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * MAX_TILT * 2);
    rx.set(-py * MAX_TILT * 2);
  }

  function handleDown(e: React.PointerEvent) {
    if (!reactive) return;
    setPressed(true);
    handleMove(e);
  }

  /* pointercancel matters most here: the browser fires it the moment it
     claims the gesture for scrolling, so a finger dragging past a card
     releases it instead of leaving it stuck lit. */
  function release() {
    setPressed(false);
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerDown={handleDown}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      whileTap={reactive ? { scale: 0.985 } : undefined}
      style={
        tilt
          ? { rotateX: srx, rotateY: sry, transformPerspective: 900 }
          : undefined
      }
      className={`glass rounded-surface shadow-lg shadow-black/30 transition-[border-color,box-shadow] duration-300 ${accentHover[accent]} ${
        pressed ? accentPress[accent] : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
