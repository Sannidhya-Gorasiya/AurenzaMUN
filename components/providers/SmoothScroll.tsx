"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { isTouchPrimary } from "@/lib/device";
import { registerLenis } from "@/lib/scroll";

/**
 * Lenis smooth scrolling for the whole page. Lenis drives the real window
 * scroll position, so Motion's useScroll/whileInView keep working untouched.
 * Wheel only. Touch-first devices skip Lenis entirely and keep the
 * browser's own scrolling, which runs on the compositor thread: it stays
 * locked to the display's refresh rate however busy the page is. Measured
 * on a phone-class CPU, Lenis's touch smoothing (syncTouch) drove the
 * scroll from JavaScript and stuttered whenever a frame ran long, and even
 * with it off, Lenis still read the scroll position and toggled a class on
 * <html> (a whole-document restyle) on every scroll; lib/scroll falls back
 * to native there. Reduced motion keeps it: the site plays the same
 * everywhere (see the note at the end of globals.css).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (isTouchPrimary()) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      autoRaf: true,
    });
    registerLenis(lenis);

    return () => {
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
