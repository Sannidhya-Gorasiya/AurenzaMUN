import type { CSSProperties } from "react";
import { Fragment } from "react";
import { StarFourIcon } from "@phosphor-icons/react/dist/ssr";

/** Copies of the item group on the track: two for the drift to wrap, plus
    room for the scroll push and the widest screens. */
const COPIES = 4;

/**
 * Kinetic ticker: it idles along on its own, is pushed further as the page
 * is scrolled down and runs back as the reader scrolls up.
 *
 * Pure CSS, no script at all. Two nested layers each slide the track by
 * exactly one group, which repeats seamlessly: the inner one on a looping
 * animation (`marquee-drift`), the outer one on the page's scroll position
 * (`marquee-scroll`, a scroll-driven animation). Both run on the
 * compositor, so the ticker keeps full speed and never stutters however
 * busy the page is or whatever the display's refresh rate. Where
 * scroll-driven animations are unsupported it simply drifts. Decorative,
 * so aria-hidden.
 */
export function Marquee({
  items,
  baseVelocity = -2.2,
  className = "",
}: {
  items: string[];
  /** Percent of two groups per second; negative runs leftward. */
  baseVelocity?: number;
  className?: string;
}) {
  /* One group every 100 / (2 * |v|) seconds, as before. */
  const style = {
    "--marquee-duration": `${100 / (2 * Math.max(0.1, Math.abs(baseVelocity)))}s`,
    "--marquee-direction": baseVelocity < 0 ? "normal" : "reverse",
  } as CSSProperties;

  const group = (copy: number) => (
    <div key={copy} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <Fragment key={i}>
          <span
            className={`px-6 font-display text-lg font-extrabold uppercase leading-none tracking-tight ${
              i % 2 ? "text-outline" : "text-foreground"
            }`}
          >
            {item}
          </span>
          <StarFourIcon weight="fill" className="h-4 w-4 shrink-0 text-brand" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div aria-hidden className={`flex w-full overflow-hidden ${className}`}>
      <div className="marquee-scroll flex w-max shrink-0 will-change-transform">
        <div className="marquee-drift flex w-max shrink-0 will-change-transform" style={style}>
          {Array.from({ length: COPIES }, (_, i) => group(i))}
        </div>
      </div>
    </div>
  );
}
