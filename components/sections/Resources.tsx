"use client";

import { ArrowUpRightIcon, BookOpenTextIcon, GavelIcon } from "@phosphor-icons/react/dist/ssr";
import { resources } from "@/lib/content";
import { Pill } from "@/components/primitives/Pill";
import { Reveal } from "@/components/primitives/Reveal";
import { SectionIntro } from "@/components/primitives/SectionIntro";
import { SpotlightCard } from "@/components/primitives/SpotlightCard";

const icons = [BookOpenTextIcon, GavelIcon];

/**
 * Two documents side by side: the study guide (the one every delegate
 * needs) gets the lit backdrop and the larger title, the rules of procedure
 * sit beside it at the same height.
 */
export function Resources() {
  return (
    <section
      id="resources"
      aria-labelledby="resources-heading"
      className="relative px-5 py-28 sm:px-8 sm:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          id="resources-heading"
          heading={resources.heading}
          description={resources.description}
        >
          <Reveal delay={0.15}>
            <div className="mt-7">
              <Pill variant="dashed">{resources.statusBadge}</Pill>
            </div>
          </Reveal>
        </SectionIntro>

        <ul className="mt-16 grid gap-4 md:grid-cols-2">
          {resources.cards.map((card, i) => {
            const Icon = icons[i % icons.length];
            const feature = i === 0;
            const href = "href" in card ? card.href : undefined;
            const body = (
                <SpotlightCard
                  className={`flex h-full flex-col p-7 sm:p-9 ${feature ? "min-h-[22rem] md:min-h-[32rem]" : "min-h-[15rem]"}`}
                >
                  {feature ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(120%_80%_at_100%_100%,rgba(229,192,99,0.22),transparent_55%),radial-gradient(90%_70%_at_0%_0%,rgba(30,45,90,0.5),transparent_60%)]"
                    />
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline-strong text-brand">
                      <Icon weight="duotone" className="h-6 w-6" aria-hidden />
                    </span>
                    <span
                      className={`flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] ${href ? "text-brand" : "text-muted"}`}
                    >
                      {card.state}
                      {href ? (
                        <ArrowUpRightIcon
                          weight="bold"
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5"
                          aria-hidden
                        />
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-auto pt-10">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brand">
                      {card.tag}
                    </p>
                    <h3
                      className={`mt-3 font-display font-extrabold uppercase leading-[0.95] tracking-tight ${
                        feature ? "text-[clamp(2rem,4vw,3.5rem)]" : "text-2xl sm:text-3xl"
                      }`}
                    >
                      {card.title}
                    </h3>
                    <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                      {card.description}
                    </p>
                  </div>
                </SpotlightCard>
            );
            return (
              <Reveal
                as="li"
                key={card.title}
                delay={i * 0.08}
              >
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${card.title} (opens Google Drive in a new tab)`}
                    className="block h-full rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1}>
          <p className="mt-10 text-sm text-muted">{resources.closing}</p>
        </Reveal>
      </div>
    </section>
  );
}
