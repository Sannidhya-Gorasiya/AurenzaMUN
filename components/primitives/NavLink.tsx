"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToTarget } from "@/lib/scroll";

/**
 * In-page anchor that hands the scroll to Lenis (or native scrolling where
 * Lenis is off) and keeps the URL hash in step.
 */
export function NavLink({
  href,
  children,
  className,
  onNavigate,
  ariaCurrent,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  ariaCurrent?: boolean;
}) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    onNavigate?.();
    /* Next frame, so a menu closing on the same click has released the
       scroll lock before Lenis is asked to move. */
    requestAnimationFrame(() => {
      if (scrollToTarget(href)) window.history.pushState(null, "", href);
    });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-current={ariaCurrent ? "location" : undefined}
    >
      {children}
    </a>
  );
}
