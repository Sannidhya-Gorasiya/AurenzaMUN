"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { ShaderBackdrop } from "@/components/primitives/ShaderBackdrop";
import { useCoarsePointer } from "@/lib/pointer";

/** Radius of the lit area around the cursor, in px. */
const RADIUS = 340;
/** The lit circle, centred in its window and fading out at its edge. */
const MASK =
  "radial-gradient(circle 340px at 50% 50%, black 0%, rgba(0,0,0,0.5) 50%, transparent 100%)";

/**
 * The hero's paint flow, carried past the hero as a soft light that trails
 * the cursor. It is the same shader, full screen and fixed, but masked to a
 * circle around a spring-smoothed cursor position, so the flow reads as
 * being revealed wherever the pointer goes.
 *
 * Shown only once the hero has left the screen (the hero has the full
 * flow already), and never on touch devices. While
 * hidden the shader stops rendering.
 */
export function CursorFlow() {
  const coarse = useCoarsePointer();
  const [pastHero, setPastHero] = useState(false);

  const x = useMotionValue(-RADIUS * 2);
  const y = useMotionValue(-RADIUS * 2);
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });
  /* The lit circle is a fixed window, one diameter square, moved to the
     cursor; the full-screen flow inside it moves the opposite way, so it
     stays put on screen. Both are transforms, run on the compositor. A
     mask whose centre followed the cursor instead had to be re-rasterised
     across the whole screen on every frame the cursor moved. */
  const winX = useTransform(sx, (v) => v - RADIUS);
  const winY = useTransform(sy, (v) => v - RADIUS);
  const flowX = useTransform(sx, (v) => RADIUS - v);
  const flowY = useTransform(sy, (v) => RADIUS - v);

  const enabled = !coarse;

  useEffect(() => {
    if (!enabled) return;
    const hero = document.getElementById("top");
    if (!hero) return;
    /* While the hero is on screen the layer is invisible, so the cursor is
       not fed to the springs: otherwise every mouse move re-rasterised a
       full-screen mask nobody could see, on top of the hero's own shader. */
    let active = false;
    const io = new IntersectionObserver(([entry]) => {
      active = !entry.isIntersecting;
      setPastHero(active);
    });
    io.observe(hero);

    function onMove(e: PointerEvent) {
      if (!active) return;
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: pastHero ? 0.9 : 0 }}
      transition={{ duration: 0.8 }}
      style={{
        x: winX,
        y: winY,
        width: RADIUS * 2,
        height: RADIUS * 2,
        maskImage: MASK,
        WebkitMaskImage: MASK,
      }}
      className="pointer-events-none fixed left-0 top-0 -z-40 overflow-hidden will-change-transform [filter:brightness(1.7)_saturate(1.15)]"
    >
      <motion.div
        style={{ x: flowX, y: flowY }}
        className="absolute left-0 top-0 h-screen w-screen will-change-transform"
      >
        {/* Navy fog only: the gold light's sharp contours showed the low
            buffer's pixels. Soft and masked, it gains nothing from device
            resolution, so it keeps the old desktop scale. Not culled by
            visibility: the window clips it to a small square, and it is
            already paused while the hero is on screen. */}
        <ShaderBackdrop
          vignette={false}
          gold={false}
          paused={!pastHero}
          cssScale={0.36}
          cull={false}
        />
      </motion.div>
    </motion.div>
  );
}
