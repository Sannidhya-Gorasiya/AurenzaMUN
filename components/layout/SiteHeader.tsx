"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { hero, nav } from "@/lib/content";
import { useScrollTimelines } from "@/lib/device";
import { EASE } from "@/lib/motion";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { MagneticButton } from "@/components/primitives/MagneticButton";
import { NavLink } from "@/components/primitives/NavLink";

/** Which section the reader is in, for the nav's active marker. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    /* A thin band across the middle of the viewport: whichever section
       crosses it is the one being read. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const NAV_IDS = nav.map((n) => n.href.slice(1));

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  const cssScroll = useScrollTimelines();
  const progressRef = useRef<HTMLDivElement>(null);

  /* Tucks away after a deliberate stretch of reading downward, returns
     after a deliberate stretch back up. Travel is summed per direction, so
     the slow tail of a flick (a pixel or two a frame) can no longer flip it
     back and forth, and state is only set when it actually changes: setting
     it every frame re-rendered the header, and with it Motion re-measured
     the nav's layout on every scroll frame.

     A plain passive listener reading window.scrollY, which never forces a
     layout, rather than Motion's useScroll, which measured the page's
     scroll height on every frame. */
  const scrolledRef = useRef(false);
  const hiddenRef = useRef(false);
  useEffect(() => {
    let prev = window.scrollY;
    let travel = 0;
    let maxScroll = 1;
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    /* Only without scroll-driven animations: the progress bar in script. */
    const ro = cssScroll ? null : new ResizeObserver(measure);
    ro?.observe(document.body);
    measure();

    function onScroll() {
      const v = window.scrollY;
      const delta = v - prev;
      prev = v;

      const isScrolled = v > 24;
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }

      if (!cssScroll && progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(1, v / maxScroll)})`;
      }

      if (delta === 0) return;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      let next = hiddenRef.current;
      if (v <= 480) next = false;
      else if (travel > 48) next = true;
      else if (travel < -24) next = false;
      if (next !== hiddenRef.current) {
        hiddenRef.current = next;
        setHidden(next);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
  }, [cssScroll]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !open ? "-120%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <div
          className={`relative mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-2 pr-2 transition-[background-color,border-color,box-shadow] duration-500 sm:h-16 sm:pl-3 ${
            scrolled || open
              ? /* A dense fill, not a live blur: over the hero the blur had
                   to re-blur the animating shader under the capsule on
                   every frame, which made even desktops stutter. */
                "border border-hairline bg-background/90 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
              : "border border-transparent"
          }`}
        >
          <NavLink
            href="#top"
            onNavigate={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-full pr-3 transition-transform duration-200 active:scale-95"
          >
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
              preload
            />
            <span className="font-display text-[0.95rem] font-extrabold tracking-tight">
              AURENZA<span className="text-brand">MUN</span>
            </span>
          </NavLink>

          <nav aria-label="Primary" className="hidden items-center lg:flex">
            {nav.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  ariaCurrent={isActive}
                  className={`relative rounded-full px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 xl:px-4 ${
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.08]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Hidden through a wrapper: the button's own inline-flex would
                otherwise out-rank a `hidden` passed in as a class. */}
            <div className="hidden sm:block">
              <MagneticButton href="#register" variant="primary" hint={false} className="!px-5 !py-2.5">
                {hero.ctaPrimary}
              </MagneticButton>
            </div>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong transition-transform active:scale-90 lg:hidden"
            >
              <span
                className={`absolute h-px w-4 bg-foreground transition-transform duration-500 ease-out-expo ${
                  open ? "rotate-45" : "-translate-y-[3px]"
                }`}
              />
              <span
                className={`absolute h-px w-4 bg-foreground transition-transform duration-500 ease-out-expo ${
                  open ? "-rotate-45" : "translate-y-[3px]"
                }`}
              />
            </button>
          </div>

          {/* Reading position along the capsule's bottom edge. */}
          <div
            ref={progressRef}
            aria-hidden
            className={`read-progress absolute inset-x-6 -bottom-px h-px origin-left bg-brand transition-opacity duration-500 will-change-transform ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </motion.header>

      {/* full-screen mobile menu */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-background px-6 pb-10 pt-28 lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.05 }}
                    >
                      <NavLink
                        href={item.href}
                        onNavigate={() => setOpen(false)}
                        className="group flex items-baseline justify-between border-b border-hairline py-3 font-display text-[clamp(1.75rem,8vw,2.75rem)] font-extrabold uppercase leading-none tracking-tight transition-colors active:text-brand"
                      >
                        {item.label}
                        <span className="font-mono text-xs font-normal tracking-[0.2em] text-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </NavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
            >
              <MagneticButton
                href="#register"
                variant="primary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {hero.ctaPrimary}
              </MagneticButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
