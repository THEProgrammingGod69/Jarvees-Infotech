"use client";

import { useEffect, useRef } from "react";
import { buildShape, type ShapeName } from "./shapes";

/**
 * The Neural Core — the site's signature element.
 *
 * One fixed WebGL canvas behind the home page: a cloud of particles that
 * morphs between forms (a brain, a network, a galaxy, the letters "AI") as
 * the reader scrolls through the sections that ask for them. It is raw
 * WebGL 1 with two small shaders — no 3D library — so it costs a few KB
 * rather than a few hundred.
 *
 * Sections drive it declaratively through <CoreStage>, which writes to the
 * tiny store below. The render loop reads the store; React never re-renders
 * because of the animation.
 */

export type CoreAlign = "left" | "center" | "right";
type CoreState = { shape: ShapeName; intensity: number; align: CoreAlign };

let coreState: CoreState = { shape: "brain", intensity: 1, align: "right" };
const listeners = new Set<(s: CoreState) => void>();

export function setCore(next: Partial<CoreState>) {
  coreState = { ...coreState, ...next };
  listeners.forEach((l) => l(coreState));
}

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aSeed;
uniform float uTime;
uniform float uMorph;
uniform float uPixelRatio;
uniform float uSize;
uniform vec2 uRot;
uniform vec2 uMouse;
uniform float uRepel;
uniform vec2 uOffset;
uniform float uAspect;
uniform float uScale;
varying float vSeed;
varying float vDepth;
varying float vGlow;

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

void main() {
  vec3 p = mix(aFrom, aTo, uMorph);
  // Mid-morph the cloud dissolves into turbulence and re-condenses.
  float burst = sin(3.14159265 * uMorph);
  vec3 swirl = vec3(
    sin(aSeed * 12.9898 + uTime * 0.9 + p.y * 2.0),
    cos(aSeed * 78.233 + uTime * 0.7 + p.z * 2.0),
    sin(aSeed * 37.719 + uTime * 0.8 + p.x * 2.0)
  );
  p += swirl * burst * 0.6;
  // A slow breath, so a settled shape is never quite still.
  p += normalize(p + 0.0001) * sin(uTime * 1.3 + aSeed * 6.2831) * 0.02;
  p *= uScale;
  p = rotX(uRot.y) * (rotY(uRot.x) * p);

  float z = p.z - 6.2;
  float f = 2.7474774; // 1 / tan(20deg): a 40deg vertical field of view
  vec2 ndc = vec2(p.x * f / uAspect, p.y * f) / -z;

  // Pointer repulsion in screen space.
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float push = smoothstep(0.34, 0.0, length(d)) * uRepel;
  vec2 dir = normalize(d + vec2(1e-5));
  ndc += vec2(dir.x / uAspect, dir.y) * push * 0.085;
  ndc += uOffset;

  gl_Position = vec4(ndc, 0.0, 1.0);
  gl_PointSize = uSize * uPixelRatio * (6.0 / -z) * (0.55 + 0.9 * fract(aSeed * 91.7));
  vSeed = aSeed;
  vDepth = clamp((p.z + 2.6) / 5.2, 0.0, 1.0);
  vGlow = push;
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform float uAlpha;
varying float vSeed;
varying float vDepth;
varying float vGlow;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = pow(smoothstep(0.5, 0.0, d), 1.7);
  vec3 col = mix(uColA, uColB, smoothstep(0.1, 0.9, fract(vSeed * 3.17) * 0.55 + (1.0 - vDepth) * 0.6));
  if (fract(vSeed * 113.0) > 0.986) col = uColC;
  col += vGlow * 0.7;
  float a = core * (0.35 + 0.65 * vDepth) * uAlpha * 0.9;
  gl_FragColor = vec4(col * a, a);
}
`;

const MORPH_SECONDS = 1.9;

/** Forms that read best facing the camera sway instead of spinning. */
const FACING: Partial<Record<ShapeName, true>> = { glyph: true, network: true };
/** Forms that lie flat are viewed from above. */
const BASE_PITCH: Partial<Record<ShapeName, number>> = { plane: 0.62, galaxy: 0.48 };

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace("#", ""), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function NeuralCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!context) {
      canvas.style.display = "none";
      return;
    }
    // Re-bound as non-null so hoisted helpers below keep the narrowing.
    const gl: WebGLRenderingContext = context;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700 || !finePointer;
    const cores = navigator.hardwareConcurrency ?? 4;
    const COUNT = small || cores <= 4 ? 9000 : 20000;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      canvas.style.display = "none";
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(program);

    const loc = {
      from: gl.getAttribLocation(program, "aFrom"),
      to: gl.getAttribLocation(program, "aTo"),
      seed: gl.getAttribLocation(program, "aSeed"),
    };
    const u = (n: string) => gl.getUniformLocation(program, n);
    const uni = {
      time: u("uTime"),
      morph: u("uMorph"),
      pr: u("uPixelRatio"),
      size: u("uSize"),
      rot: u("uRot"),
      mouse: u("uMouse"),
      repel: u("uRepel"),
      offset: u("uOffset"),
      aspect: u("uAspect"),
      scale: u("uScale"),
      colA: u("uColA"),
      colB: u("uColB"),
      colC: u("uColC"),
      alpha: u("uAlpha"),
    };

    // Colours come from the token layer, so the core can never drift from
    // the palette.
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    gl.uniform3fv(uni.colA, hexToRgb(token("--color-cyan", "#5ce1ff")));
    gl.uniform3fv(uni.colB, hexToRgb(token("--color-violet", "#a68bff")));
    gl.uniform3fv(uni.colC, hexToRgb(token("--color-magenta", "#ff5cad")));

    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) seeds[i] = (i * 0.6180339887) % 1;
    const seedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc.seed);
    gl.vertexAttribPointer(loc.seed, 1, gl.FLOAT, false, 0, 0);

    // Shapes are generated lazily — the first one immediately, the rest
    // when they are first asked for.
    const shapeData = new Map<ShapeName, Float32Array>();
    const shapeBuf = new Map<ShapeName, WebGLBuffer>();
    const getShape = (name: ShapeName) => {
      let data = shapeData.get(name);
      if (!data) {
        data = buildShape(name, COUNT);
        shapeData.set(name, data);
        const buf = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        shapeBuf.set(name, buf);
      }
      return { data, buf: shapeBuf.get(name)! };
    };

    const snapshotBuf = gl.createBuffer()!;
    let snapshotData = new Float32Array(COUNT * 3);

    let fromData = getShape(coreState.shape).data;
    let fromBuf: WebGLBuffer = getShape(coreState.shape).buf;
    let target: ShapeName = coreState.shape;
    let toData = fromData;
    let toBuf = fromBuf;
    let progress = 1;

    const bindPair = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, fromBuf);
      gl.enableVertexAttribArray(loc.from);
      gl.vertexAttribPointer(loc.from, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, toBuf);
      gl.enableVertexAttribArray(loc.to);
      gl.vertexAttribPointer(loc.to, 3, gl.FLOAT, false, 0, 0);
    };
    bindPair();

    const morphTo = (name: ShapeName) => {
      if (name === target) return;
      const next = getShape(name);
      if (progress < 1) {
        // Interrupted mid-flight: freeze where the cloud is now and morph
        // from there, so a fast scroll never makes the particles jump.
        const e = easeInOutCubic(progress);
        const fresh = new Float32Array(COUNT * 3);
        for (let i = 0; i < fresh.length; i++) fresh[i] = fromData[i]! + (toData[i]! - fromData[i]!) * e;
        snapshotData = fresh;
        gl.bindBuffer(gl.ARRAY_BUFFER, snapshotBuf);
        gl.bufferData(gl.ARRAY_BUFFER, snapshotData, gl.DYNAMIC_DRAW);
        fromData = snapshotData;
        fromBuf = snapshotBuf;
      } else {
        fromData = toData;
        fromBuf = toBuf;
      }
      toData = next.data;
      toBuf = next.buf;
      target = name;
      progress = reduced ? 1 : 0;
      bindPair();
    };

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let aspect = 1;
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = w / Math.max(1, h);
      if (reduced) draw(0);
    };

    // Smoothed state, all lerped towards their targets each frame.
    let alpha = 0;
    let offsetX = 0;
    let yaw = 0;
    let pitch = 0;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, repel: 0, lastMove: -10 };
    let time = 0;

    const onPointer = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouse.lastMove = time;
    };

    function draw(dt: number) {
      const s = coreState;
      const wide = aspect > 1.15;
      const targetOffset = !wide ? 0 : s.align === "right" ? 0.42 : s.align === "left" ? -0.42 : 0;
      const k = reduced ? 1 : Math.min(1, dt * 2.4);
      alpha += ((wide ? s.intensity : s.intensity * 0.55) - alpha) * k;
      offsetX += (targetOffset - offsetX) * k;

      if (progress < 1) progress = Math.min(1, progress + dt / MORPH_SECONDS);

      mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3);
      mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
      const active = finePointer && !reduced && time - mouse.lastMove < 2.5 ? 1 : 0;
      mouse.repel += (active - mouse.repel) * Math.min(1, dt * 3);

      if (!reduced) {
        if (FACING[target]) {
          const base = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
          yaw += (base + Math.sin(time * 0.45) * 0.32 - yaw) * Math.min(1, dt * 1.6);
        } else {
          yaw += dt * 0.12;
        }
      }
      const targetPitch = (BASE_PITCH[target] ?? 0) + (reduced ? 0 : mouse.sy * 0.22);
      pitch += (targetPitch - pitch) * (reduced ? 1 : Math.min(1, dt * 2));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uni.time, time);
      gl.uniform1f(uni.morph, easeInOutCubic(progress));
      gl.uniform1f(uni.pr, dpr);
      gl.uniform1f(uni.size, small ? 2.6 : 2.3);
      gl.uniform2f(uni.rot, yaw + (reduced ? 0 : mouse.sx * 0.4), pitch);
      gl.uniform2f(uni.mouse, mouse.sx, mouse.sy);
      gl.uniform1f(uni.repel, mouse.repel);
      gl.uniform2f(uni.offset, offsetX, 0);
      gl.uniform1f(uni.aspect, aspect);
      gl.uniform1f(uni.scale, wide ? 1 : 0.78);
      gl.uniform1f(uni.alpha, alpha);
      gl.drawArrays(gl.POINTS, 0, COUNT);
    }

    let raf = 0;
    let last = performance.now();
    let running = false;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onState = (s: CoreState) => {
      morphTo(s.shape);
      if (reduced) draw(0);
    };
    listeners.add(onState);
    // A stage may have registered before the canvas mounted.
    morphTo(coreState.shape);

    const onVisibility = () => (document.hidden ? stop() : start());
    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    if (reduced) {
      draw(0);
    } else {
      start();
    }
    canvas.dataset.ready = "true";

    return () => {
      stop();
      listeners.delete(onState);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-0 transition-opacity duration-[1500ms] data-[ready=true]:opacity-100"
    />
  );
}
