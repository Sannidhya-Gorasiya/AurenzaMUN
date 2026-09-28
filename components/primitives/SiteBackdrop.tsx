"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { isTouchPrimary, perfTier, prefersSaveData, useScrollTimelines } from "@/lib/device";

/**
 * Voxel cube stack (exported from Unicorn Studio's Amphorae template) as a
 * faint gold ghost behind the whole site. Page position maps onto the clip,
 * so the stack builds as you read down and is complete at the footer.
 *
 * Nothing about it runs per frame on the main thread:
 *
 *   1. Once the page has loaded and gone idle, the clip is sampled into a
 *      single vertical strip of small frames (a sprite), with the gold tint
 *      and the old 10% screen baked into the pixels. The video is then
 *      released. Each frame is blurred by about a pixel as it is baked, so
 *      when the browser upscales the small frames they stay soft rather
 *      than turning blocky.
 *   2. Two copies of the strip sit in a window the size of one frame. A
 *      CSS scroll-driven animation (`backdrop-a` / `backdrop-b` in
 *      globals.css) steps copy A to the frame at the scroll position and
 *      copy B to the next one, and fades B in across the gap: a crossfade
 *      from frame to frame, run by the compositor, at the display's refresh
 *      rate, however busy the page is. Browsers without scroll-driven
 *      animations get the same values written from a passive scroll
 *      listener.
 *
 * Touch devices keep the plain light layer underneath until the strip is
 * ready, then the cubes fade in over it. Reduced motion bakes one nearly
 * built frame. Data Saver skips the download and keeps only the light.
 */
const SRC = "/voxel-cube-stack.mp4";

const BG = [7, 8, 11] as const; // --background
const GOLD = [229, 192, 99] as const; // --brand
/** The old layer's opacity, now baked into the pixels. */
const STRENGTH = 0.1;
/** CSS px per baked px: the softness the old 8px blur gave. */
const SOFTNESS = 5;
/** Rows repeated above and below each frame, so upscaling never samples its neighbour. */
const PAD = 2;
/** Tallest strip that every GPU and iOS canvas limit accepts. */
const MAX_STRIP = 4096;

const FRAMES = { low: 20, mid: 28, high: 36 } as const;

/** The same gold as the baked frames, at about their brightest. */
const LIGHT = [
  "radial-gradient(130% 65% at 50% 105%, rgba(229,192,99,0.085) 0%, rgba(229,192,99,0.03) 45%, transparent 75%)",
  "radial-gradient(70% 45% at 95% 0%, rgba(229,192,99,0.05) 0%, transparent 70%)",
].join(", ");

type Strip = { frames: number; w: number; h: number; aspect: number };

/**
 * Soften a baked frame in place: two passes of a 3-tap box blur each way,
 * close to a Gaussian of about one baked pixel (SOFTNESS CSS px, the old
 * 8px blur). The browser stretches each baked pixel over a dozen or more
 * screen pixels on a phone, and a stretched hard edge reads as a staircase
 * of blocks; with no detail finer than a pixel left, the stretch is smooth.
 */
function blur(src: Float32Array, tmp: Float32Array, w: number, h: number) {
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const l = src[row + Math.max(0, x - 1)];
        const r = src[row + Math.min(w - 1, x + 1)];
        tmp[row + x] = (l + src[row + x] + r) / 3;
      }
    }
    for (let y = 0; y < h; y++) {
      const up = Math.max(0, y - 1) * w;
      const down = Math.min(h - 1, y + 1) * w;
      const row = y * w;
      for (let x = 0; x < w; x++) src[row + x] = (tmp[up + x] + tmp[row + x] + tmp[down + x]) / 3;
    }
  }
}

/** Resolves once the seek lands, or after a timeout so one bad seek never stalls the bake. */
function seek(v: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      v.removeEventListener("seeked", done);
      resolve();
    };
    const timer = setTimeout(done, 3000);
    v.addEventListener("seeked", done);
    v.currentTime = t;
  });
}

function whenReady(v: HTMLVideoElement) {
  return new Promise<boolean>((resolve) => {
    if (v.readyState >= 2) return resolve(true);
    const ok = () => finish(true);
    const fail = () => finish(false);
    const timer = setTimeout(fail, 15000);
    function finish(r: boolean) {
      clearTimeout(timer);
      v.removeEventListener("loadeddata", ok);
      v.removeEventListener("error", fail);
      resolve(r);
    }
    v.addEventListener("loadeddata", ok);
    v.addEventListener("error", fail);
    v.preload = "auto";
    v.load();
    /* iOS will not fetch frame data for a video nobody has played. */
    void v.play().then(() => v.pause()).catch(() => {});
  });
}

/** Waits until the reader has not scrolled for a moment, so baking never competes with a flick. */
function whenStill(last: { t: number }) {
  return new Promise<void>((resolve) => {
    const check = () => (performance.now() - last.t > 180 ? resolve() : setTimeout(check, 120));
    check();
  });
}

export function SiteBackdrop() {
  const stripA = useRef<HTMLCanvasElement>(null);
  const stripB = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const cssScroll = useScrollTimelines();
  const [strip, setStrip] = useState<Strip | null>(null);

  /* -- light layer, touch only -------------------------------------------- */
  useEffect(() => {
    const el = lightRef.current;
    if (!el || !isTouchPrimary()) return;
    if (reduce) {
      el.style.opacity = "0.85";
      return;
    }
    /* Where scroll-driven animations exist, globals.css brightens it on the
       compositor; otherwise it is set from a passive listener. */
    if (cssScroll) return;
    let maxScroll = 1;
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const update = () => {
      el.style.opacity = String(0.45 + 0.55 * Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [reduce, cssScroll]);

  /* -- bake the strip ------------------------------------------------------ */
  useEffect(() => {
    const v = videoRef.current;
    const a = stripA.current;
    const b = stripB.current;
    if (!v || !a || !b || prefersSaveData()) return;

    let cancelled = false;
    const lastScroll = { t: 0 };
    const onScroll = () => {
      lastScroll.t = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    async function bake() {
      if (!v || !a || !b || !(await whenReady(v)) || cancelled || !v.duration) return;
      v.pause();

      const aspect = v.videoWidth / v.videoHeight || 16 / 9;
      /* Size the frames from how wide the clip is shown once it covers the
         screen, so the softness matches on a phone and on a monitor. */
      const shownWidth = Math.max(window.innerWidth, window.innerHeight * aspect);
      const w = Math.round(Math.min(400, Math.max(64, shownWidth / SOFTNESS)));
      const h = Math.max(1, Math.round(w / aspect));
      const cell = h + PAD * 2;
      const count = reduce
        ? 1
        : Math.max(2, Math.min(FRAMES[perfTier()], Math.floor(MAX_STRIP / cell)));

      a.width = b.width = w;
      a.height = b.height = cell * count;
      const actx = a.getContext("2d", { alpha: false });
      if (!actx) return;

      /* Two-step downscale, so fine voxel edges average rather than alias. */
      const mid = document.createElement("canvas");
      mid.width = w * 2;
      mid.height = h * 2;
      const mctx = mid.getContext("2d")!;
      mctx.imageSmoothingQuality = "high";
      const frame = document.createElement("canvas");
      frame.width = w;
      frame.height = h;
      const fctx = frame.getContext("2d", { willReadFrequently: true })!;
      fctx.imageSmoothingQuality = "high";
      const lum = new Float32Array(w * h);
      const tmp = new Float32Array(w * h);

      const span = Math.max(0, v.duration - 0.05);
      for (let i = 0; i < count; i++) {
        await whenStill(lastScroll);
        if (cancelled) return;
        await seek(v, reduce ? v.duration * 0.8 : (i / Math.max(1, count - 1)) * span);
        if (cancelled) return;

        mctx.drawImage(v, 0, 0, mid.width, mid.height);
        fctx.drawImage(mid, 0, 0, w, h);

        /* grayscale -> blurred -> gold -> screened at 10% over the page
           background */
        const img = fctx.getImageData(0, 0, w, h);
        const d = img.data;
        for (let p = 0, k = 0; p < d.length; p += 4, k++) {
          lum[k] = Math.min(1, ((0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2]) / 255) * 1.1) * 0.85;
        }
        blur(lum, tmp, w, h);
        for (let p = 0, k = 0; p < d.length; p += 4, k++) {
          const l = lum[k];
          for (let c = 0; c < 3; c++) {
            const bg = BG[c] / 255;
            d[p + c] = Math.round((bg + STRENGTH * (GOLD[c] / 255) * l * (1 - bg)) * 255);
          }
        }
        fctx.putImageData(img, 0, 0);

        /* The frame, with its edge rows repeated into the padding. */
        const y = i * cell + PAD;
        actx.drawImage(frame, 0, y);
        actx.drawImage(frame, 0, 0, w, 1, 0, y - PAD, w, PAD);
        actx.drawImage(frame, 0, h - 1, w, 1, 0, y + h, w, PAD);

        await new Promise((r) => setTimeout(r, 16));
      }
      if (cancelled) return;

      b.getContext("2d", { alpha: false })?.drawImage(a, 0, 0);
      /* Every frame is in hand: free the decoder and the download. */
      v.removeAttribute("src");
      v.load();
      setStrip({ frames: count, w, h, aspect });
    }

    /* Start only once the page has loaded and gone idle, so the clip never
       competes with the hero, the fonts or the first scroll. */
    const hasIdle = "requestIdleCallback" in window;
    let idleId = 0;
    const start = () => {
      idleId = hasIdle
        ? window.requestIdleCallback(() => void bake(), { timeout: 2500 })
        : window.setTimeout(() => void bake(), 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", start);
      if (hasIdle) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      v.pause();
    };
  }, [reduce]);

  /* -- script fallback for the frame stepping ------------------------------ */
  useEffect(() => {
    const a = stripA.current;
    const b = stripB.current;
    if (!strip || !a || !b || reduce || cssScroll) return;
    const gaps = strip.frames - 1;
    let maxScroll = 1;
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const update = () => {
      const f = Math.min(1, Math.max(0, window.scrollY / maxScroll)) * gaps;
      const i = Math.min(gaps, Math.floor(f));
      a.style.translate = `0 ${(-100 * i) / strip.frames}%`;
      b.style.translate = `0 ${(-100 * (i + 1)) / strip.frames}%`;
      b.style.opacity = String(f - i);
    };
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [strip, reduce, cssScroll]);

  /* A window exactly one frame in size, covering the screen like
     object-fit: cover; each strip is N frames tall inside it, nudged up by
     the padding so only each frame's interior shows. */
  const windowStyle: CSSProperties | undefined = strip
    ? {
        width: `max(100vw, calc(100vh * ${strip.aspect}))`,
        aspectRatio: `${strip.w} / ${strip.h}`,
      }
    : undefined;
  const stripStyle: CSSProperties | undefined = strip
    ? ({
        top: `${(-100 * PAD) / strip.h}%`,
        height: `${(100 * (strip.h + PAD * 2) * strip.frames) / strip.h}%`,
        "--frames": strip.frames,
      } as CSSProperties)
    : undefined;
  const animated = !!strip && !reduce;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-background">
      {/* Touch only (the same query as isTouchPrimary, so it is right from
          the first paint): the light the cubes cast, shown until they are
          ready and underneath them after. */}
      <div
        ref={lightRef}
        className="backdrop-light absolute inset-0 hidden opacity-45 [@media(hover:none)_and_(pointer:coarse)]:block"
        style={{ backgroundImage: LIGHT, willChange: "opacity" }}
      />
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-opacity duration-1000 ${
          strip ? "opacity-100" : "opacity-0"
        }`}
        style={windowStyle}
      >
        <canvas
          ref={stripA}
          width={1}
          height={1}
          className={`absolute left-0 w-full will-change-transform ${animated ? "backdrop-a" : ""}`}
          style={
            animated
              ? { ...stripStyle, animationTimingFunction: `steps(${strip.frames - 1}, end)` }
              : stripStyle
          }
        />
        <canvas
          ref={stripB}
          width={1}
          height={1}
          className={`absolute left-0 w-full will-change-transform ${animated ? "backdrop-b" : "hidden"}`}
          style={
            animated
              ? {
                  ...stripStyle,
                  animationTimingFunction: `steps(${strip.frames - 1}, end), linear`,
                  animationIterationCount: `1, ${strip.frames - 1}`,
                }
              : stripStyle
          }
        />
      </div>
      {/* Only a source to sample from; never shown. */}
      <video
        ref={videoRef}
        src={SRC}
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        className="absolute left-0 top-0 h-px w-px opacity-0"
      />
    </div>
  );
}
