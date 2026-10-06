# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page marketing site for AurenzaMUN, a Model United Nations conference (10–11 Oct 2026, SVIS Kandivali, Mumbai). Next.js 16 App Router + React 19, Tailwind CSS v4, Motion (`motion/react`), Lenis, Phosphor icons. It is dark-only, and gold (`--brand`) is the only accent. It deploys on Vercel.

**Next.js 16 has breaking changes compared with older versions.** Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`). One example: `app/layout.tsx` uses the global `LayoutProps<"/">` type.

## Commands

```bash
npm run dev     # dev server on http://localhost:3000
npm run build   # production build (also type-checks)
npm run lint    # ESLint 9 flat config: next core-web-vitals + typescript
npx tsc --noEmit  # type-check only
```

The project has no test suite.

## Architecture

**The page is assembled in one place.** `app/page.tsx` stacks the section components from `components/sections/` in order, between `SiteHeader` and `SiteFooter`. Each section has an anchor id (`#countdown`, `#committees`, `#register`, `#crew`, `#resources`, `#social`), and the nav in `lib/content.ts` links to those ids. If you rename an id, update both places.

**All copy lives in `lib/content.ts`.** It holds plain data only (no JSX), so both Server and Client Components can import it. Edit the data there instead of hard-coding copy in components. That covers the committee roster and agendas, the team roster (`secretariat`), and registration links. The typed shapes change what gets rendered:
- `Committee`: leave out `agenda`, `chair`, or `portfolios` and the matching UI hides itself (no chip, no chair row, no second tab).
- `TeamMember.photo`: a square portrait in `public/team/*.webp`, cropped with the nose centred. Leave it out and the panel falls back to initials.
- `TeamGroup.panelRows`: reserves a fixed grid and shows dashed placeholders, so the layout doesn't shift as names are announced.

`info.md` is the original content extraction from the old Rocket.new site. It is out of date (for example, it says 11 committees where `content.ts` has 12), so treat `content.ts` as the source of truth.

**Components**
- `components/sections/`: one file per page section.
- `components/primitives/`: reusable pieces (Reveal, MagneticButton, Pill, SectionIntro, TiltCard, CommitteeModal, backdrops, etc.).
- `components/primitives/legacy/`: the pre-redesign `LegacyPill` and `LegacySectionIntro`. Committees, Countdown, Registration, Team, Contact, and part of Hero were deliberately restored to the earlier design and still import these. Don't "upgrade" them to the new primitives unless asked.
- `components/providers/SmoothScroll.tsx`: sets up Lenis.

**Performance model (the main design constraint).** Recent work moved motion off the main thread. Keep new code consistent with it:
- **Entrance animations are CSS, not per-frame JS.** `lib/inview.ts` uses one shared IntersectionObserver per threshold to set a `data-shown` attribute once. The `.reveal`, `.rise`, and `.rise-now` classes in `app/globals.css` handle the transition. `Reveal.tsx` wraps this pattern. The CSS timings mirror the constants in `lib/motion.ts` (`EASE`, `DURATION`, `STAGGER`, `VIEWPORT`), so change both together.
- **Scroll-linked effects use CSS scroll-driven animations** (`animation-timeline: scroll()/view()`, gated by `@supports`). A passive-listener fallback runs only where they aren't supported (`useScrollTimelines()` in `lib/device.ts`).
- **The voxel backdrop** (`SiteBackdrop.tsx`) samples `public/voxel-cube-stack.mp4` once, when the page is idle, into a sprite strip, then releases the video. CSS keyframes `backdrop-a`/`backdrop-b` crossfade the frames based on scroll position. Data Saver skips the video.
- **Device gating:** `lib/device.ts` provides `perfTier()` (`low`/`mid`/`high`), `isTouchPrimary()`, and `prefersSaveData()`. These are client-only and belong in effects, never in render. `lib/pointer.ts` provides the `useCoarsePointer()` hook, whose SSR snapshot is `false`, meaning the server renders the desktop behaviour.
- **Reduced motion is deliberately not honoured.** Android reports `prefers-reduced-motion` whenever animations are switched off in Developer options, which left the site frozen on those phones, so the site plays the same animations everywhere. Don't add `@media (prefers-reduced-motion)` rules or `useReducedMotion` gates back.

**Scrolling goes through `lib/scroll.ts`.** `SmoothScroll` registers the single Lenis instance there, on wheel/desktop only; touch-primary devices keep native scrolling. Use `scrollToTarget()` for anchor jumps and the counted `lockScroll()`/unlock helpers for dialogs and the mobile menu. Don't call `window.scrollTo` or toggle `overflow` directly. The helpers fall back to native scrolling when Lenis isn't running.

**Buttons act only after the hold completes.** `MagneticButton` fires its action once the fill wipe finishes (`HOLD_MS` = 500ms). On touch it's press-and-hold, and a move past `TOUCH_SLOP` counts as a scroll instead of a press. A small "press & hold" hint appears above buttons on touch screens.

**Styling.** Tailwind v4 is configured in CSS, not in a JS config file. Design tokens are CSS variables mapped through `@theme inline` in `app/globals.css` (`bg-background`, `text-muted`, `border-hairline`, `text-brand`, `bg-blue-chip`, …). The file also defines a custom `hero-wide` variant. Fonts are Geist, Geist Mono, and Space Grotesk, loaded via `next/font` as CSS variables. The `@/*` path alias maps to the repo root.

**Unused dependencies:** `@mui/material` and `@emotion/*` are installed but not imported anywhere.

**Metadata:** `app/layout.tsx` builds `metadataBase` from `NEXT_PUBLIC_SITE_URL`, falling back to `VERCEL_PROJECT_PRODUCTION_URL` and then localhost. Favicon `<link>` tags are written by hand (`/logo.png?v=2`) on purpose so they override any convention-based or cached icon.
