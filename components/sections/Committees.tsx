"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { committees, type Accent, type Committee, type Track } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { CommitteeModal } from "@/components/primitives/CommitteeModal";
import { GenerativeBackground } from "@/components/primitives/GenerativeBackground";
import { LegacySectionIntro as SectionIntro } from "@/components/primitives/legacy/LegacySectionIntro";
import { TiltCard } from "@/components/primitives/TiltCard";
import { TrackTabs, type TabItem } from "@/components/primitives/TrackTabs";
import { useCoarsePointer } from "@/lib/pointer";

/* The agenda chip renders as a tinted plate so the blue/ice ones can carry
   midnight-blue text at 10:1; gold keeps its own tint, which already reads
   on the card. */
const accentTag: Record<Accent, string> = {
  blue: "bg-blue-chip text-blue-deep",
  gold: "bg-brand/15 text-brand",
  ice: "bg-ice-chip text-ice-deep",
};

const accentDot: Record<Accent, string> = {
  blue: "bg-blue",
  gold: "bg-brand",
  ice: "bg-ice",
};

const accentLink: Record<Accent, string> = {
  blue: "text-blue",
  gold: "text-brand",
  ice: "text-ice",
};

/* Past this much horizontal travel the gesture was a swipe, not a tap, and
   the card underneath must not open its dialog on the click that follows. */
const TAP_SLOP = 8; // px
const SWIPE_DISTANCE = 60; // px
const SWIPE_VELOCITY = 450; // px/s

/**
 * One committee card.
 *
 * Memoised on purpose. Opening or closing the dialog is a state change on
 * the section, which otherwise re-rendered all six motion-wrapped cards in
 * the very frame the dialog was mounting in. Every prop here is
 * referentially stable across that change, so the grid now sits it out.
 */
const CommitteeCard = memo(function CommitteeCard({
  committee,
  accent,
  index,
  onOpen,
}: {
  committee: Committee;
  accent: Accent;
  index: number;
  onOpen: (c: Committee) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.07 }}
    >
      <TiltCard accent={accent} className="relative flex h-full flex-col p-7">
        {/* The whole panel opens the dialog; the button sits on top so the
            card keeps its pointer tilt underneath. */}
        <button
          type="button"
          onClick={() => onOpen(committee)}
          aria-label={
            committee.agenda
              ? `${committee.abbr} — view agenda`
              : `${committee.abbr} — view details`
          }
          className="absolute inset-0 z-10 rounded-surface focus-visible:outline-2"
        />

        {/* No chip on a committee whose agenda is not out yet: promising an
            agenda behind the tap and not having one is worse than staying
            quiet. The "View details" line below still carries the
            affordance. */}
        {committee.agenda ? (
          <span
            className={`inline-block self-start rounded-lg px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] ${accentTag[accent]}`}
            aria-hidden
          >
            Click for agendas
          </span>
        ) : null}
        <h3
          className={`font-display text-2xl font-bold uppercase leading-none tracking-tight ${
            committee.agenda ? "mt-4" : ""
          }`}
        >
          {committee.abbr}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{committee.name}</p>

        {/* Between the committee's full name and the "View details" line, so
            the card answers "who is chairing this?" without a tap. Tight
            margins here and a shorter gap below: the line has to be read at a
            glance, not grow the card by a whole row of the grid. */}
        {committee.chair ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* White pill, so the label reads as a tag on the name rather than
                a second line of prose, and leaves the gold to the accents. */}
            <span className="rounded-md bg-foreground/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground">
              Chair
            </span>
            {/* Display face, as everywhere the site prints a person's name. */}
            <span className="font-display text-sm font-semibold leading-snug tracking-tight text-foreground/90">
              {committee.chair}
            </span>
          </p>
        ) : null}

        <span
          className={`${
            committee.chair ? "mt-4" : "mt-6"
          } inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] ${accentLink[accent]}`}
          aria-hidden
        >
          View details
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </TiltCard>
    </motion.div>
  );
});

export function Committees() {
  const coarse = useCoarsePointer();
  type TrackId = (typeof committees.tracks)[number]["id"];
  const [active, setActive] = useState<TrackId>(committees.tracks[0].id);
  const [open, setOpen] = useState<Committee | null>(null);
  /* Which way the panel should enter from, so switching tracks reads as
     moving along a row rather than a crossfade in place. */
  const [dir, setDir] = useState(0);
  const dragX = useRef(0);

  const index = committees.tracks.findIndex((t) => t.id === active);

  /* Stable, so the memoised cards never see a new prop. dragX is a ref, so
     reading the swipe guard here costs nothing and needs no dependency. */
  const openCommittee = useCallback((c: Committee) => {
    if (dragX.current > TAP_SLOP) return;
    setOpen(c);
  }, []);

  function selectTrack(id: string) {
    const next = committees.tracks.findIndex((t) => t.id === id);
    if (next < 0 || next === index) return;
    setDir(next > index ? 1 : -1);
    setActive(committees.tracks[next].id);
  }

  function step(delta: number) {
    const next = committees.tracks[index + delta];
    if (next) selectTrack(next.id);
  }

  const tabs: TabItem[] = committees.tracks.map((t) => ({
    id: t.id,
    label: t.tab,
    accent: t.accent,
  }));

  const track: Track = useMemo(
    () => committees.tracks.find((t) => t.id === active)!,
    [active],
  );

  return (
    <section
      id="committees"
      aria-labelledby="committees-heading"
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32"
    >
      <GenerativeBackground />

      <div className="mx-auto max-w-6xl">
        <div id="committees-heading">
          <SectionIntro
            eyebrow={committees.eyebrow}
            heading={committees.heading}
            description={committees.description}
            accent="blue"
          />
        </div>

        <p className="mt-4 max-w-2xl font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          {committees.note}
        </p>

        <div className="mt-10">
          <TrackTabs
            tabs={tabs}
            value={active}
            onChange={selectTrack}
            idBase="track"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={track.id}
            id={`track-panel-${track.id}`}
            role="tabpanel"
            aria-labelledby={`track-tab-${track.id}`}
            initial={{ opacity: 0, x: dir * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -48 }}
            transition={{ duration: 0.4, ease: EASE }}
            /* The tabs are the only way to reach the other tracks, and
               reaching up to a pill is the worst thing you can ask of a
               thumb. On touch the panel itself is draggable, so the tracks
               page sideways under the finger. dragDirectionLock keeps a
               vertical flick scrolling the page as normal. */
            drag={coarse ? "x" : false}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onPointerDownCapture={() => {
              dragX.current = 0;
            }}
            onDrag={(_, info) => {
              dragX.current = Math.max(dragX.current, Math.abs(info.offset.x));
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
                step(1);
              } else if (
                info.offset.x > SWIPE_DISTANCE ||
                info.velocity.x > SWIPE_VELOCITY
              ) {
                step(-1);
              }
            }}
            className="mt-10"
          >
            {track.committees.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {track.committees.map((c, i) => (
                  <CommitteeCard
                    key={c.abbr}
                    committee={c}
                    accent={track.accent}
                    index={i}
                    onOpen={openCommittee}
                  />
                ))}
              </div>
            ) : (
              <div className="glass flex flex-col items-center justify-center rounded-surface border-dashed px-8 py-20 text-center">
                <span className={`h-2.5 w-2.5 rounded-full ${accentDot[track.accent]}`} />
                <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                  {track.emptyState}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open ? (
          <CommitteeModal
            key={open.abbr}
            committee={open}
            accent={track.accent}
            portfolioNote={committees.portfolioNote}
            onClose={() => setOpen(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
