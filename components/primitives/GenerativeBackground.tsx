/**
 * No-photo decorative background: a soft "aurora" glow plus a faint grid.
 * The glow is painted with non-blurred radial-gradients (the soft falloff
 * comes from each gradient's alpha ramp, not a `filter: blur` pass) so it is
 * a single cheap paint with no GPU rasterization cost. Purely decorative ->
 * aria-hidden and pointer-events-none.
 */
export function GenerativeBackground({
  variant = "section",
  className = "",
}: {
  variant?: "hero" | "section";
  className?: string;
}) {
  const hero = variant === "hero";

  const glow = hero
    ? [
        "radial-gradient(60rem 60rem at 15% 0%, rgba(231,194,90,0.22) 0%, transparent 60%)",
        "radial-gradient(48rem 48rem at 95% 100%, rgba(76,141,255,0.16) 0%, transparent 60%)",
        "radial-gradient(40rem 40rem at 75% 45%, rgba(169,196,245,0.12) 0%, transparent 60%)",
      ].join(", ")
    : [
        "radial-gradient(44rem 44rem at 0% 10%, rgba(231,194,90,0.12) 0%, transparent 60%)",
        "radial-gradient(36rem 36rem at 100% 90%, rgba(76,141,255,0.10) 0%, transparent 60%)",
      ].join(", ");

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* aurora glow — non-blurred radial gradients */}
      <div className="absolute inset-0" style={{ backgroundImage: glow }} />

      {/* faint grid. Not on touch screens: at 4% it barely shows on a
          phone, and a masked layer the size of a whole section is costly
          for a phone to rasterise as it scrolls into view. */}
      <div
        className="absolute inset-0 opacity-[0.04] [@media(hover:none)_and_(pointer:coarse)]:hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
