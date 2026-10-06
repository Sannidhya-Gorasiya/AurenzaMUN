"use client";

import { useEffect, useRef } from "react";
import { isTouchPrimary, perfTier } from "@/lib/device";

/* Domain-warped fbm: slow gold light drifting through navy fog, leaning a
   little toward the pointer. Dark in the lower left, where the hero type
   sits, so the headline always reads. Needs highp: desktop GPUs run
   mediump at 32 bits anyway, but phone GPUs run it at 16, where the lattice
   coordinates lose precision and the flow collapses to a flat fill.

   The hash and the octave counts set the look of the flow: changing either
   changes its shapes and how busy it reads, not just its cost. With
   derivatives, the thin gold contour
   widens by one pixel's worth of `f` so it never stair-steps, and a faint
   dither breaks up the banding 8-bit output leaves in the dark gradients. */
const FRAG = (octaves: number, derivatives: boolean) => `
${derivatives ? "#extension GL_OES_standard_derivatives : enable" : ""}
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uVignette;
uniform float uGold;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < ${octaves}; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;

  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 4.2));
  vec2 r = vec2(fbm(p * 1.7 + 3.0 * q + vec2(1.7, 9.2) + t * 1.3),
                fbm(p * 1.7 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.1 + 2.4 * r + (uMouse - 0.5) * 0.4);

  vec3 ink  = vec3(0.027, 0.031, 0.043);
  vec3 navy = vec3(0.062, 0.094, 0.196);
  vec3 gold = vec3(0.898, 0.753, 0.388);

  vec3 col = mix(ink, navy, smoothstep(0.25, 0.85, f));
  col = mix(col, gold * 0.85, smoothstep(0.58, 1.0, f * f * 1.55 + r.x * 0.22) * 0.7 * uGold);
  float aa = ${derivatives ? "fwidth(f)" : "0.0"};
  col += gold * smoothstep(0.018 + aa, 0.0, abs(f - 0.64)) * 0.22 * uGold;

  float lift = smoothstep(-0.1, 1.0, uv.y * 0.75 + uv.x * 0.55);
  col *= mix(mix(1.0, 0.28, uVignette), 1.0, lift);
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/* What each device tier can afford. The flow drifts slowly enough that 30
   or even 24 frames a second reads the same as 60, so it never draws faster
   than that. Phones draw one octave fewer, the detail they have always
   shown. `density` caps buffer pixels per CSS pixel: a phone's 3x screen at
   1.5 gets one buffer pixel per two screen pixels, finer than the eye can
   pick out once smoothed. `floor` is the least the adaptive step-down
   (below) may fall to, in CSS pixels.

   Phones draw well under one buffer pixel per CSS pixel: the fog is soft
   enough that the browser's upscale hides it, and at the old 1.5 a phone
   GPU was shading some 740k pixels thirty times a second, the same GPU
   that has to composite every scroll frame. One buffer pixel per CSS pixel
   (mid) is under half of that, 0.7 (low) about a quarter. */
const QUALITY = {
  high: { octaves: 4, fps: 30, density: 2, floor: 1 },
  mid: { octaves: 3, fps: 24, density: 1, floor: 0.6 },
  low: { octaves: 3, fps: 20, density: 0.7, floor: 0.5 },
} as const;

/* Adaptive resolution: drawn frames are timed over windows of this length.
   If a window runs this much slower than the tier's rate, the GPU is not
   keeping up, so the buffer shrinks by `STEP` (never below the tier's
   floor, and never back up, so it cannot oscillate). The first window is
   skipped: it overlaps page load and shader compilation. */
const WINDOW_MS = 1000;
const SLOW = 1.3;
const STEP = 0.8;

/* Stop drawing once this little of the flow is left on screen: by then the
   hero is scrolling away and fading, and the GPU is better spent on the
   scroll. */
const MIN_VISIBLE = 0.3;

/* Touch only: the flow holds its frame while the page is moving under a
   finger, and resumes this long after the last scroll event. It drifts so
   slowly that a held frame cannot be seen, and the GPU spends those frames
   on the scroll instead. */
const SCROLL_REST_MS = 220;

/* Fixed-scale mode (`cssScale`) caps its buffer at this many pixels. */
const CSS_SCALE_MAX_PIXELS = 320_000;

/**
 * Hand-written WebGL "paint flow" behind the hero. Renders at device
 * resolution up to the tier's density cap, stepping down only if the GPU
 * cannot hold the frame rate; stops once mostly off screen or when the tab
 * is hidden, and on touch screens holds still while the page is being
 * scrolled. Reduced motion keeps it moving: it is a slow drift, not motion
 * tied to the scroll. No WebGL: the CSS gradient behind it shows.
 */
export function ShaderBackdrop({
  className = "",
  vignette = true,
  gold = true,
  paused = false,
  cssScale,
  cull = true,
}: {
  className?: string;
  /** Darken the lower left, where the hero type sits. */
  vignette?: boolean;
  /** Draw the gold light; without it only the navy fog is left. */
  gold?: boolean;
  /** Stop rendering, e.g. while the layer is faded out. */
  paused?: boolean;
  /** Draw at this fraction of CSS pixels instead of device resolution, for
      layers too soft to need it (the cursor light). */
  cssScale?: number;
  /** Stop once mostly off screen. Off for a layer clipped by its parent,
      which would always read as mostly hidden. */
  cull?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    wakeRef.current();
  }, [paused]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const quality = QUALITY[perfTier()];
    const derivatives = !!gl.getExtension("OES_standard_derivatives");
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG(quality.octaves, derivatives)));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    gl.uniform1f(gl.getUniformLocation(prog, "uVignette"), vignette ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(prog, "uGold"), gold ? 1 : 0);
    const [maxW, maxH] = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;

    /* The size is read from a ResizeObserver rather than on every frame,
       which forced a layout read each frame. Where the browser reports the
       exact device-pixel box, the buffer matches the screen's pixels one to
       one; elsewhere it is the CSS box times devicePixelRatio. */
    let cssW = canvas.clientWidth;
    let cssH = canvas.clientHeight;
    let devW = 0;
    let devH = 0;
    const sizer = new ResizeObserver(([entry]) => {
      cssW = entry.contentRect.width;
      cssH = entry.contentRect.height;
      const box = entry.devicePixelContentBoxSize?.[0];
      devW = box ? box.inlineSize : 0;
      devH = box ? box.blockSize : 0;
    });
    try {
      sizer.observe(canvas, { box: "device-pixel-content-box" });
    } catch {
      sizer.observe(canvas);
    }

    /* Fraction of device resolution drawn: the tier's density cap to begin
       with, and only the step-down lowers it. */
    const startDpr = window.devicePixelRatio || 1;
    let res = Math.min(1, quality.density / startDpr);
    function resize() {
      if (!canvas || !gl) return;
      let w: number;
      let h: number;
      if (cssScale) {
        const s = Math.min(cssScale, Math.sqrt(CSS_SCALE_MAX_PIXELS / Math.max(1, cssW * cssH)));
        w = cssW * s;
        h = cssH * s;
      } else {
        const dpr = window.devicePixelRatio || 1;
        w = (devW || cssW * dpr) * res;
        h = (devH || cssH * dpr) * res;
      }
      w = Math.min(maxW, Math.max(1, Math.round(w)));
      h = Math.min(maxH, Math.max(1, Math.round(h)));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    }

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    function onPointer(e: PointerEvent) {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    }

    let raf = 0;
    let visible = true;
    const start = performance.now();

    function draw(now: number) {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl!.uniform1f(uTime, (now - start) / 1000 + 12);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    const running = () => visible && !document.hidden && !pausedRef.current;

    const interval = 1000 / quality.fps;
    let last = 0;
    let frames = 0;
    let windowStart = 0;
    let warmedUp = false;

    function measure(now: number) {
      if (cssScale) return;
      if (frames++ === 0) {
        windowStart = now;
        return;
      }
      if (now - windowStart < WINDOW_MS) return;
      const avg = (now - windowStart) / (frames - 1);
      frames = 0;
      if (!warmedUp) {
        warmedUp = true;
        return;
      }
      if (avg <= interval * SLOW) return;
      const floor = quality.floor / (window.devicePixelRatio || 1);
      res = Math.max(Math.min(1, floor), res * STEP);
    }

    const touch = isTouchPrimary();
    let scrolledAt = -Infinity;
    const onScroll = () => {
      scrolledAt = performance.now();
    };

    function loop(now: number) {
      if (now - scrolledAt < SCROLL_REST_MS) {
        /* A held frame is not a slow one: the timing window starts over. */
        frames = 0;
      } else if (now - last >= interval - 2) {
        /* Skip frames to hold the tier's rate; a small tolerance keeps a
           60Hz display landing on every second frame for 30fps. */
        last = now;
        draw(now);
        measure(now);
      }
      if (running()) raf = requestAnimationFrame(loop);
    }

    function wake() {
      cancelAnimationFrame(raf);
      /* A pause is not a slow frame: start a fresh timing window. */
      frames = 0;
      if (running()) raf = requestAnimationFrame(loop);
    }
    wakeRef.current = wake;

    /* Measured against the canvas and against the screen, so a hero taller
       than the screen still counts as visible while it fills it. */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible =
          entry.isIntersecting &&
          (entry.intersectionRatio >= MIN_VISIBLE ||
            entry.intersectionRect.height >= window.innerHeight * MIN_VISIBLE);
        wake();
      },
      { threshold: [0, MIN_VISIBLE, 0.6, 1] },
    );
    if (cull) io.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("pointermove", onPointer, { passive: true });
    if (touch) window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      sizer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [vignette, gold, cssScale, cull]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`h-full w-full bg-[radial-gradient(80%_60%_at_80%_20%,#1a2448_0%,#07080b_70%)] ${className}`}
    />
  );
}
