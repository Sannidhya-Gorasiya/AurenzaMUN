"use client";

import Image from "next/image";
import type { TeamGroup, TeamMember } from "@/lib/content";
import { secretariat } from "@/lib/content";
import { GenerativeBackground } from "@/components/primitives/GenerativeBackground";
import { LegacyPill as Pill } from "@/components/primitives/legacy/LegacyPill";
import { Reveal } from "@/components/primitives/Reveal";
import { LegacySectionIntro as SectionIntro } from "@/components/primitives/legacy/LegacySectionIntro";
import { TiltCard } from "@/components/primitives/TiltCard";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

const slug = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-");

/* Two across on a phone: at one per row the roster was a half-dozen screens
   of scrolling, and the panel carries little enough — a portrait, a
   department line and a name — to halve cleanly. Below 360px it goes back to
   one, because a half-width panel there is too narrow to break the longest
   department line ("SUB-HEAD OF TECHNICALS & DEVELOPMENT") in fewer than
   three lines, and no type step small enough to fix that is worth reading.
   A centred wrapping flex row rather than a grid: ten heads over three
   columns, or nine sub-heads over two, leave a short last row, and a grid
   would pack those leftovers against the left edge while the rows above them
   read as centred pairs. Flex lines centre themselves, so a lone panel sits
   between the two above it. `PANEL_WIDTH` holds each panel to exactly the
   column width a grid would have given it, gutters deducted, so a full row is
   unchanged; `items-stretch` (the default) keeps every panel in a line the
   same height, which is what `auto-rows-fr` did — so an announced panel and
   an empty one still read as two states of one row. */
const GRID = "flex flex-wrap justify-center gap-3 sm:gap-5";

/* One column below 360px, two up to `lg`, three above — minus that panel's
   share of the gutters, which changes with the gap at `sm`. Each deduction
   rounds up a hundredth past the exact share: a line that adds up to exactly
   100% is one sub-pixel rounding away from wrapping a panel onto its own
   row, and the slack is far too small to see. */
const PANEL_WIDTH =
  "w-full min-[360px]:w-[calc(50%-0.38rem)] sm:w-[calc(50%-0.63rem)] lg:w-[calc(33.333%-0.84rem)]";

/** One team panel: an announced member, or a dashed placeholder when absent. */
function Panel({ member, index }: { member?: TeamMember; index: number }) {
  return (
    <Reveal
      as="li"
      /* Stagger across a row, not across the whole grid — an index-wide delay
         would still be animating in the last row long after the reader got
         there. */
      delay={(index % secretariat.panelsPerRow) * 0.08}
      className={`list-none ${PANEL_WIDTH}`}
    >
      <TiltCard
        accent="gold"
        interactive={!!member}
        className={`flex h-full flex-col p-3 sm:p-7 ${member ? "" : "border-dashed"}`}
      >
        {member ? (
          <>
            {/* Initials stand in for anyone whose portrait has not landed. */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-surface border border-border-glass bg-gradient-to-br from-blue/25 via-transparent to-brand/20 sm:h-28 sm:w-28">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 640px) 112px, 64px"
                />
              ) : (
                <span className="font-display text-xl font-bold text-foreground/80 sm:text-3xl">
                  {initials(member.name)}
                </span>
              )}
            </div>

            <Pill
              accent="gold"
              variant="solid"
              size="sm"
              className="mt-4 max-w-full self-start sm:mt-6"
            >
              {member.role}
            </Pill>
            <h4 className="mt-2.5 font-display text-base font-bold leading-tight tracking-tight sm:mt-4 sm:text-2xl">
              {member.name}
            </h4>
          </>
        ) : (
          <div
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-surface border border-dashed border-border-glass bg-surface sm:h-28 sm:w-28"
          >
            <span className="h-2 w-2 rounded-full bg-brand/40" />
          </div>
        )}
      </TiltCard>
    </Reveal>
  );
}

/** One tier of the roster: sub-heading, hairline, then its grid of panels. */
function Group({ group }: { group: TeamGroup }) {
  const id = `crew-${slug(group.label)}`;
  /* A tier with `panelRows` holds its reserved grid; one without ends with
     its last announced name. */
  const panels = group.panelRows
    ? group.panelRows * secretariat.panelsPerRow
    : group.members.length;

  return (
    <>
      <Reveal className="mt-12 flex items-center gap-4 sm:mt-16 sm:gap-5">
        <h3
          id={id}
          className="font-display text-xl font-bold uppercase tracking-tight sm:text-3xl"
        >
          {group.label}
        </h3>
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-brand/40 to-transparent" />
      </Reveal>

      <ul aria-labelledby={id} className={`mt-6 sm:mt-8 ${GRID}`}>
        {Array.from({ length: panels }, (_, i) => {
          /* Indexing past the array is the point here, so read it as optional
             rather than letting the type promise a member. */
          const m = i < group.members.length ? group.members[i] : undefined;
          return <Panel key={m ? m.name : `${id}-slot-${i}`} member={m} index={i} />;
        })}
      </ul>
    </>
  );
}

export function Secretariat() {
  return (
    <section
      id="crew"
      aria-labelledby="crew-heading"
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32"
    >
      <GenerativeBackground />

      <div className="mx-auto max-w-6xl">
        <div id="crew-heading">
          <SectionIntro
            eyebrow={secretariat.eyebrow}
            heading={secretariat.heading}
            description={secretariat.description}
            accent="blue"
            accentClass="text-brand"
          />
        </div>

        {secretariat.groups.map((g) => (
          <Group key={g.label} group={g} />
        ))}
      </div>
    </section>
  );
}
