import type Lenis from "lenis";

/**
 * The page's one Lenis instance, registered by <SmoothScroll />. Everything
 * that moves the page goes through here so anchor jumps, the dialog and the
 * mobile menu all agree on who owns scrolling. When Lenis is absent (touch
 * screens, or before hydration) every helper falls back to native scrolling.
 */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Scrolls to an element or selector, honouring its `scroll-margin-top`. */
export function scrollToTarget(target: HTMLElement | string, immediate = false) {
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return false;

  if (lenis) {
    /* Lenis reads the target's scroll-margin-top on its own. */
    lenis.scrollTo(el, { immediate, duration: 1.4 });
  } else {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - margin;
    window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  }
  return true;
}

/* Counted, so the dialog opening over an open menu (or the reverse) never
   unlocks the page while something is still on top of it. */
let locks = 0;

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  document.documentElement.classList.add("scroll-locked");
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.documentElement.classList.remove("scroll-locked");
}
