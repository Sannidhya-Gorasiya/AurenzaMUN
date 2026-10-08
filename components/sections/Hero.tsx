"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { useScroll } from "motion/react";
import { hero } from "@/lib/content";
import { useScrollTimelines } from "@/lib/device";
import { progressBetween } from "@/lib/motion";
import { AnimatedHeading } from "@/components/primitives/AnimatedHeading";
import { HINT_TEXT, HoldHint, HoldHintBetween, MagneticButton } from "@/components/primitives/MagneticButton";
import { Pill } from "@/components/primitives/Pill";
import { LegacyPill } from "@/components/primitives/legacy/LegacyPill";
import { ShaderBackdrop } from "@/components/primitives/ShaderBackdrop";

const sceneFade = progressBetween(0.2, 0.95);

/**
 * A note hung under a hero chip: a ghost-white dotted arrow curving up to
 * the chip and a line in the hint type at its tail. Absolutely placed, so it
 * takes no room in the row. Dropped below 360px, where the chips wrap onto
 * two lines and the first note would sit on the second chip.
 */
function ChipNote({ children }: { children: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-3 top-full mt-1 flex items-start gap-1 whitespace-nowrap max-[359px]:hidden"
    >
      <svg
        viewBox="0 0 20 18"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-5 shrink-0 text-foreground"
      >
        <path d="M18 15C10 15 5 11 5 4" strokeDasharray="0.5 3" />
        <path d="M1.5 7.5 5 3l3.5 4.5" />
      </svg>
      <span className={`${HINT_TEXT} mt-[11px]`}>{children}</span>
    </span>
  );
}

/**
 * Script fallback for the parallax, mounted only where CSS scroll-driven
 * animations are missing (Safari before 26, older Android WebViews). It
 * writes the same values as the `hero-scene` / `hero-type` keyframes in
 * globals.css straight to the two layers, without re-rendering React.
 */
function HeroParallaxFallback({
  target,
  scene,
  type,
}: {
  target: RefObject<HTMLElement | null>;
  scene: RefObject<HTMLDivElement | null>;
  type: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  useEffect(
    () =>
      scrollYProgress.on("change", (v) => {
        const sceneEl = scene.current;
        const typeEl = type.current;
        if (sceneEl) {
          sceneEl.style.transform = `translate3d(0, ${v * 30}%, 0) scale(${1 + 0.12 * v})`;
          sceneEl.style.opacity = String(1 - sceneFade(v));
        }
        if (typeEl) typeEl.style.transform = `translate3d(0, ${v * -35}%, 0)`;
      }),
    [scrollYProgress, scene, type],
  );
  return null;
}

export function Hero() {
  const cssScroll = useScrollTimelines();
  const ref = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  /* As the hero scrolls away the paint flow sinks and fades out, handing
     over to the site-wide voxel backdrop, while the type lifts faster than
     the page: a two-plane parallax rather than a plain slide. It runs as
     CSS scroll-driven animations (`hero-scene`, `hero-type` in
     globals.css), on the compositor, so it tracks the finger exactly at
     any refresh rate; the script fallback covers browsers without them. */

  /* Fade + rise on load, in CSS (`.intro-rise`), so it plays from first
     paint on the compositor. */
  const fade = (delay: number) => ({ "--intro-delay": `${delay}s` }) as CSSProperties;

  return (
    <section
      ref={ref}
      id="top"
      aria-label="AurenzaMUN introduction"
      className="hero-timeline relative isolate flex flex-col overflow-hidden px-5 pb-12 pt-24 sm:px-8 sm:pb-14 sm:pt-28 hero-wide:min-h-[100dvh]"
    >
      {/* The paint flow. Its lower edge is masked away so it dissolves into
          the voxel backdrop instead of ending on a hard line. */}
      {!cssScroll ? (
        <HeroParallaxFallback target={ref} scene={sceneRef} type={typeRef} />
      ) : null}
      <div
        ref={sceneRef}
        aria-hidden
        className="hero-scene absolute inset-0 -z-20 will-change-transform [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <ShaderBackdrop />
      </div>
      {/* Legibility: the lede sits bottom-left, so the scene is weighted a
          little darker there. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(7,8,11,0.45),transparent_60%)]"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div
          className="intro-rise flex flex-nowrap items-center gap-1.5 max-[359px]:flex-wrap sm:flex-wrap sm:gap-3"
          style={fade(0.2)}
        >
          <a
            href={hero.calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${hero.badges[0]}, add to Google Calendar`}
            className="relative inline-block shrink-0 transition-all duration-200 hover:opacity-80 active:scale-95 active:opacity-70"
          >
            <Pill
              variant="plate"
              dot
              className="cursor-pointer whitespace-nowrap max-sm:gap-1! max-sm:px-2.5! max-sm:text-[0.56rem]! max-sm:tracking-[0.06em]!"
            >
              {hero.badges[0]}
            </Pill>
            <ChipNote>{hero.badgeNotes[0]}</ChipNote>
          </a>
          <a
            href={hero.venueMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${hero.badges[1]}, open in Google Maps`}
            className="relative inline-block shrink-0 transition-all duration-200 hover:opacity-80 active:scale-95 active:opacity-70"
          >
            {/* The original filled venue chip, sized to match the date
                chip beside it (LegacyPill's own type step is a little
                smaller and sets no line height). */}
            <LegacyPill
              accent="blue"
              dot
              className="cursor-pointer whitespace-nowrap px-3.5! text-[0.68rem]! leading-tight! tracking-[0.12em]! sm:tracking-[0.18em]! max-sm:gap-1! max-sm:px-2.5! max-sm:text-[0.56rem]! max-sm:tracking-[0.06em]!"
            >
              {hero.badges[1]}
            </LegacyPill>
            <ChipNote>{hero.badgeNotes[1]}</ChipNote>
          </a>
        </div>

        <div
          ref={typeRef}
          className="hero-type mt-12 will-change-transform sm:mt-16 hero-wide:mt-auto hero-wide:pt-16"
        >
          <AnimatedHeading
            as="h1"
            lines={hero.headline}
            splitBy="char"
            accentLine={1}
            animateOnMount
            delay={0.25}
            lineClassName={["", "sm:text-right"]}
            className="font-display text-[clamp(3.5rem,16.5vw,16rem)] font-bold uppercase leading-[0.82] tracking-tight"
          />

          <div className="mt-8 grid gap-8 sm:mt-6 lg:-mt-[clamp(4rem,9vw,9rem)] lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p
                className="intro-rise max-w-[36ch] text-lg leading-relaxed text-foreground/85 sm:text-xl"
                style={fade(0.9)}
              >
                {hero.lede}
              </p>
              <div
                className="intro-rise mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:gap-3"
                style={fade(1.05)}
              >
                {/* One "press & hold" for the pair, not one over each: centred
                    between them with arrows to both when stacked on a phone,
                    above the row on a touch tablet. The arrowed row is the
                    gap between the stacked buttons. */}
                <MagneticButton href="#register" variant="primary" arrow hint={false}>
                  {hero.ctaPrimary}
                </MagneticButton>
                <HoldHintBetween className="sm:hidden" />
                <HoldHint className="max-sm:hidden! sm:order-first sm:-mb-1.5 sm:basis-full sm:pl-4" />
                <MagneticButton href="#committees" variant="secondary" hint={false}>
                  {hero.ctaSecondary}
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
