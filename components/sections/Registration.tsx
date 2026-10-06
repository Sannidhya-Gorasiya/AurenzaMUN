"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useScroll } from "motion/react";
import { registration } from "@/lib/content";
import { useScrollTimelines } from "@/lib/device";
import { MagneticButton } from "@/components/primitives/MagneticButton";
import { Pill } from "@/components/primitives/Pill";
import { Reveal } from "@/components/primitives/Reveal";
import { SectionIntro } from "@/components/primitives/SectionIntro";
import { LegacySectionIntro } from "@/components/primitives/legacy/LegacySectionIntro";
import { progressBetween } from "@/lib/motion";

const WIDE = "(min-width: 640px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** True from the `sm` breakpoint up; false on the server and on phones. */
const useWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );

const progress = progressBetween(0, 1);

/**
 * Script fallback for one step, mounted only where CSS scroll-driven
 * animations are missing (Firefox, Safari before 26). Writes the same
 * values as the `step-lit` / `step-slide` keyframes straight to the
 * elements, without re-rendering React.
 */
function StepFallback({
  targetRef,
  litRef,
  textRef,
}: {
  targetRef: RefObject<HTMLLIElement | null>;
  litRef: RefObject<HTMLSpanElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 80%", "center 50%"],
  });
  const slide = useWide();
  useEffect(() => {
    const write = (p: number) => {
      const v = progress(p);
      const litEl = litRef.current;
      const textEl = textRef.current;
      if (litEl) litEl.style.opacity = String(v);
      if (textEl) textEl.style.transform = slide ? `translate3d(${40 * (1 - v)}px, 0, 0)` : "";
    };
    write(scrollYProgress.get());
    return scrollYProgress.on("change", write);
  }, [scrollYProgress, litRef, textRef, slide]);
  return null;
}

/**
 * One step: its numeral lights from outline to gold as it crosses
 * mid-screen. From `sm` up the text also slides in; on a phone that slide
 * pushed the text past the screen edge mid-scroll, so there the numeral's
 * fill carries the motion alone. Both run as CSS scroll-driven animations
 * (`.step-lit`, `.step-text` in globals.css), on the compositor.
 */
function Step({
  step,
  cssScroll,
}: {
  step: (typeof registration.steps)[number];
  cssScroll: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const litRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <li
      ref={ref}
      className="step relative grid grid-cols-[auto_1fr] gap-4 py-9 first:pt-0 sm:gap-8 sm:py-16"
    >
      {cssScroll ? null : <StepFallback targetRef={ref} litRef={litRef} textRef={textRef} />}
      <span className="relative w-[1.75em] font-display text-[clamp(2.4rem,8vw,6.5rem)] font-black leading-[0.85] tracking-tight">
        <span aria-hidden className="text-outline">
          {step.index}
        </span>
        <span ref={litRef} aria-hidden className="step-lit absolute inset-0 text-brand">
          {step.index}
        </span>
      </span>
      <div ref={textRef} className="step-text min-w-0 pt-1 sm:pt-2">
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-3xl">
          {step.title}
        </h3>
        <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted sm:mt-3 sm:text-base">
          {step.body}
        </p>
      </div>
    </li>
  );
}

/** Script fallback for the rail, as StepFallback is for the steps. */
function RailFallback({
  targetRef,
  fillRef,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  fillRef: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 70%", "end 60%"],
  });
  useEffect(() => {
    const write = (p: number) => {
      const fillEl = fillRef.current;
      if (fillEl) fillEl.style.transform = `scaleY(${progress(p)})`;
    };
    write(scrollYProgress.get());
    return scrollYProgress.on("change", write);
  }, [scrollYProgress, fillRef]);
  return null;
}

/**
 * The numbered steps beside a rail that fills gold as you read down. Shared
 * by both layouts. All of it is CSS scroll-driven (`.steps-fill`), so
 * nothing here runs on the main thread while the page scrolls.
 */
function StepRail() {
  const cssScroll = useScrollTimelines();
  const ref = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="steps relative">
      {cssScroll ? null : <RailFallback targetRef={ref} fillRef={fillRef} />}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 top-0 w-px bg-hairline"
      >
        <div
          ref={fillRef}
          className="steps-fill h-full w-full origin-top bg-brand will-change-transform"
        />
      </div>
      <ol className="overflow-x-clip pl-6 sm:pl-12">
        {registration.steps.map((s) => (
          <Step key={s.index} step={s} cssScroll={cssScroll} />
        ))}
      </ol>
    </div>
  );
}

/**
 * Phones only: the section's original pre-redesign layout (eyebrow heading,
 * the scroll-lit step rail shared with the wide layout, then the Register
 * Now card with the details as label/value rows).
 */
function RegistrationMobile() {
  const wide = useWide();

  return (
    <div className="sm:hidden">
      <div id="register-heading-mobile">
        <LegacySectionIntro
          eyebrow={registration.eyebrow}
          heading={registration.heading}
          description={registration.description}
          accent="blue"
        />
      </div>

      {/* Mounted only below sm, so a desktop doesn't track scroll for a
          hidden copy of the rail. */}
      <div className="mt-12">{wide ? null : <StepRail />}</div>

      <Reveal delay={0.15}>
        <div className="mt-12 overflow-hidden rounded-surface border border-hairline bg-background/60 p-6">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">
            Register Now
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {registration.card.body}
          </p>

          <div className="mt-6">
            <MagneticButton
              href={registration.card.href}
              variant="primary"
              className="w-full"
              ariaLabel={`${registration.card.button}, opens in a new tab`}
            >
              {registration.card.button}
            </MagneticButton>
          </div>

          <div className="mt-5 border-t border-hairline pt-5">
            <p className="text-xs leading-relaxed text-muted">
              {registration.card.delegation.note}
            </p>
            <div className="mt-3">
              <MagneticButton
                href={registration.card.delegation.href}
                variant="outline"
                className="w-full"
                ariaLabel={`${registration.card.delegation.button}, opens in a new tab`}
              >
                {registration.card.delegation.button}
              </MagneticButton>
            </div>
          </div>

          <dl className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6">
            {registration.details.map((d) => (
              <div
                key={d.label}
                className="flex items-start justify-between gap-4"
              >
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                  {d.label}
                </dt>
                <dd className="text-right text-sm font-medium text-foreground">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </div>
  );
}

export function Registration() {
  /* The two layouts are swapped by mounting, not only by CSS: the wide one
     tracks five elements against the scroll position every frame, which a
     phone should not pay for while that layout sits hidden. */
  const wide = useWide();

  return (
    <section
      id="register"
      aria-labelledby="register-heading register-heading-mobile"
      className="relative px-5 py-28 sm:px-8 sm:py-40"
    >
      <RegistrationMobile />
      {wide ? <RegistrationWide /> : null}
    </section>
  );
}

/** From sm up: the redesigned layout. */
function RegistrationWide() {
  return (
      <div className="mx-auto hidden max-w-7xl sm:block">
        <SectionIntro
          id="register-heading"
          heading={registration.heading}
          description={registration.description}
          size="xl"
        />

        <div className="mt-16 grid gap-16 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          {/* left: the form card, pinned while the steps scroll past. Only
            the card pins, so it always fits the viewport it is pinned to. */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Reveal delay={0.15}>
                <div className="surface relative overflow-hidden p-7 sm:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-32 -top-32 h-76 w-76 rounded-full bg-[radial-gradient(closest-side,rgba(229,192,99,0.2),rgba(229,192,99,0.08)_55%,transparent)]"
                  />
                  <Pill variant="solid" live>
                    Registrations open
                  </Pill>
                  <p className="mt-5 text-[0.95rem] leading-relaxed text-foreground/85">
                    {registration.card.body}
                  </p>

                  <MagneticButton
                    href={registration.card.href}
                    variant="primary"
                    arrow
                    strength={0.15}
                    className="mt-7 w-full"
                    ariaLabel={`${registration.card.button}, opens in a new tab`}
                  >
                    {registration.card.button}
                  </MagneticButton>

                  <div className="mt-6 border-t border-hairline pt-6">
                    <p className="text-sm leading-relaxed text-muted">
                      {registration.card.delegation.note}
                    </p>
                    <MagneticButton
                      href={registration.card.delegation.href}
                      variant="outline"
                      strength={0.15}
                      className="mt-4 w-full"
                      ariaLabel={`${registration.card.delegation.button}, opens in a new tab`}
                    >
                      {registration.card.delegation.button}
                    </MagneticButton>
                  </div>

                  <dl className="mt-7 grid grid-cols-1 gap-4 border-t border-hairline pt-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {registration.details.map((d) => (
                      <div key={d.label}>
                        <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                          {d.label}
                        </dt>
                        <dd className="mt-1.5 text-sm font-medium leading-snug text-foreground">
                          {d.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            </div>
          </div>

          {/* right: the steps, with a rail that fills as you read down */}
          <div className="lg:col-span-6 lg:col-start-7">
            <StepRail />
          </div>
        </div>
      </div>
  );
}
