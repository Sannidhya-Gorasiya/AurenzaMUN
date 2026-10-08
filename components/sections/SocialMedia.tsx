"use client";

import type { ReactNode } from "react";
import { social } from "@/lib/content";
import type { Accent } from "@/lib/content";
import { GenerativeBackground } from "@/components/primitives/GenerativeBackground";
import { LegacyPill as Pill } from "@/components/primitives/legacy/LegacyPill";
import { Reveal } from "@/components/primitives/Reveal";
import { LegacySectionIntro as SectionIntro } from "@/components/primitives/legacy/LegacySectionIntro";
import { TiltCard } from "@/components/primitives/TiltCard";

const accents: Accent[] = ["gold", "blue", "ice"];

const iconText: Record<Accent, string> = {
  gold: "text-brand",
  blue: "text-blue",
  ice: "text-ice",
};

const icons: Record<string, ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  "Mail Us": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  ),
};

export function SocialMedia() {
  return (
    <section
      id="social"
      aria-labelledby="social-heading"
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32"
    >
      <GenerativeBackground />

      <div className="mx-auto max-w-6xl">
        <div id="social-heading">
          <SectionIntro
            eyebrow={social.eyebrow}
            heading={social.heading}
            description={social.description}
            accent="blue"
            accentClass="text-brand"
          />
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {social.platforms.map((p, i) => {
            const accent = accents[i % accents.length];
            return (
              <Reveal key={p.name} delay={i * 0.1}>
                <TiltCard
                  accent={accent}
                  className="relative flex h-full flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:p-7 sm:text-left"
                >
                  <a
                    href={p.href}
                    {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={p.external ? `AurenzaMUN on ${p.name}` : `Email AurenzaMUN at ${p.handle}`}
                    className="absolute inset-0 rounded-surface focus-visible:outline-2"
                  />
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-surface border border-border-glass bg-gradient-to-br from-blue/25 via-transparent to-brand/20 ${iconText[accent]}`}
                  >
                    {icons[p.name]}
                  </div>

                  <div className="flex min-w-0 flex-col items-center sm:items-start">
                    {/* Gold has no light chip of its own, so its label floated
                        on the card while the blue/ice ones sat on a plate.
                        The ghost-white chip puts it on the same footing. */}
                    <Pill
                      accent={accent}
                      variant={accent === "gold" ? "ghost" : "outline"}
                      className="self-center sm:self-start"
                    >
                      {p.name}
                    </Pill>
                    <p className="mt-3 break-words font-display text-xl font-bold tracking-tight">
                      {p.handle}
                    </p>
                    <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                      {p.cta}
                    </span>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
