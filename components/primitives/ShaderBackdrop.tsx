"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { perfTier } from "@/lib/device";

/* Domain-warped fbm: slow gold light drifting through navy fog, leaning a
   little toward the pointer. Dark in the lower left, where the hero type
   sits, so the headline always reads. Needs highp: desktop GPUs run
   mediump at 32 bits anyway, but phone GPUs run it at 16, where the hash's
   sin(dot(...)) arguments overflow and the flow collapses to a flat fill. */
const FRAG = (octaves: number) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uVignette;

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
  col = mix(col, gold * 0.85, smoothstep(0.58, 1.0, f * f * 1.55 + r.x * 0.22) * 0.7);
  col += gold * smoothstep(0.018, 0.0, abs(f - 0.64)) * 0.22;

  float lift = smoothstep(-0.1, 1.0, uv.y * 0.75 + uv.x * 0.55);
  col *= mix(mix(1.0, 0.28, uVignette), 1.0, lift);

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
   or even 24 frames a second reads the same as 60, and the finest octave is
   below what a low-resolution buffer can show anyway. Desktops are not
   exempt: each pixel costs five fbm calls, and at half a 1440p screen that
   saturated laptop GPUs, so every tier also caps its buffer at `maxPixels`
   however large the screen is. Phones drop to three octaves, which pays for
   the highp maths they need. */
const QUALITY = {
  high: { scale: 0.36, octaves: 4, fps: 30, maxPixels: 320_000 },
  mid: { scale: 0.34, octaves: 3, fps: 30, maxPixels: 200_000 },
  low: { scale: 0.25, octaves: 3, fps: 24, maxPixels: 120_000 },
} as const;

/**
 * Hand-written WebGL "paint flow" behind the hero. Renders at reduced
 * resolution (it is soft by nature) and frame rate on phones, stops when
 * off screen or the tab is hidden, and paints a single still frame under
 * reduced motion. No WebGL: the CSS gradient behind it shows instead.
 */
export function ShaderBackdrop({
  className = "",
  vignette = true,
  paused = false,
}: {
  className?: string;
  /** Darken the lower left, where the hero type sits. */
  vignette?: boolean;
  /** Stop rendering, e.g. while the layer is faded out. */
  paused?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
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
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG(quality.octaves)));
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

    /* Reduced resolution: the image is all soft gradients, so the saving
       is free and it keeps phones cool. The size is read from a
       ResizeObserver rather than clientWidth on every frame, which forced
       a layout read each frame. */
    let cssW = canvas.clientWidth;
    let cssH = canvas.clientHeight;
    const sizer = new ResizeObserver(([entry]) => {
      cssW = entry.contentRect.width;
      cssH = entry.contentRect.height;
    });
    sizer.observe(canvas);
    function resize() {
      if (!canvas || !gl) return;
      const area = cssW * cssH * quality.scale * quality.scale;
      const scale =
        area > quality.maxPixels ? quality.scale * Math.sqrt(quality.maxPixels / area) : quality.scale;
      const w = Math.max(1, Math.floor(cssW * scale));
      const h = Math.max(1, Math.floor(cssH * scale));
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
      gl!.uniform1f(uTime, reduce ? 12 : (now - start) / 1000 + 12);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    const running = () => visible && !document.hidden && !pausedRef.current;

    const interval = 1000 / quality.fps;
    let last = 0;
    function loop(now: number) {
      /* Skip frames to hold the tier's rate; a small tolerance keeps a
         60Hz display landing on every second frame for 30fps. */
      if (now - last >= interval - 2) {
        last = now;
        draw(now);
      }
      if (running()) raf = requestAnimationFrame(loop);
    }

    function wake() {
      cancelAnimationFrame(raf);
      if (running()) raf = requestAnimationFrame(loop);
    }
    wakeRef.current = wake;

    if (reduce) {
      draw(performance.now());
      const ro = new ResizeObserver(() => requestAnimationFrame(() => draw(performance.now())));
      ro.observe(canvas);
      return () => {
        ro.disconnect();
        sizer.disconnect();
      };
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      sizer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reduce, vignette]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`h-full w-full bg-[radial-gradient(80%_60%_at_80%_20%,#1a2448_0%,#07080b_70%)] ${className}`}
    />
  );
}
