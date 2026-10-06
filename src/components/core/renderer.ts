import { buildShape, type ShapeName } from "./shapes";

/**
 * The Neural Core renderer: raw WebGL 1, two small shaders, no library.
 *
 * Environment-agnostic on purpose — it draws into an OffscreenCanvas inside
 * a Web Worker (the normal path, so rendering can never block scrolling or
 * input on the main thread), or into a regular canvas on the main thread
 * where OffscreenCanvas WebGL is unavailable.
 *
 * Speed decisions, all measured:
 * - the drawing buffer is ~0.8× the device resolution (soft glowing points
 *   upscale invisibly) and DPR is capped at 1.5 — about 2.5× fewer pixels
 *   than the first version on a high-density laptop screen;
 * - particles are pre-shuffled (see shapes.ts), so under load the renderer
 *   sheds resolution and then particles simply by drawing fewer of them;
 * - nothing is drawn while the tab is hidden; reduced-motion visitors get
 *   one still frame per change and no loop at all.
 */

export type CoreAlign = "left" | "center" | "right";
export type CoreState = { shape: ShapeName; intensity: number; align: CoreAlign };

export type CoreInit = {
  colors: [string, string, string];
  reduced: boolean;
  finePointer: boolean;
  count: number;
  width: number;
  height: number;
  dpr: number;
  state: CoreState;
};

export type CoreController = {
  setState(state: CoreState): void;
  setPointer(x: number, y: number): void;
  resize(width: number, height: number, dpr: number): void;
  setVisible(visible: boolean): void;
  destroy(): void;
};

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
  float a = core * (0.35 + 0.65 * vDepth) * uAlpha * 0.95;
  gl_FragColor = vec4(col * a, a);
}
`;

const MORPH_SECONDS = 1.9;

/** Forms that read best facing the camera sway instead of spinning. */
const FACING: Partial<Record<ShapeName, true>> = { glyph: true, network: true };
/** Forms that lie flat are viewed from above. */
const BASE_PITCH: Partial<Record<ShapeName, number>> = { plane: 0.62, galaxy: 0.48 };

/** Quality ladder the renderer steps down when frames run long. */
const LEVELS = [
  { scale: 1, particles: 1 },
  { scale: 0.85, particles: 0.85 },
  { scale: 0.7, particles: 0.7 },
  { scale: 0.58, particles: 0.55 },
];

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const caf: (id: number) => void =
  typeof cancelAnimationFrame === "function" ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id);

/**
 * Returns null when WebGL is unavailable; the caller then simply leaves the
 * page without a core (the CSS atmosphere is designed to stand alone).
 */
export function createCoreRenderer(canvas: AnyCanvas, init: CoreInit, onReady?: () => void): CoreController | null {
  const context = canvas.getContext("webgl", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "default",
  }) as WebGLRenderingContext | null;
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const { reduced, finePointer } = init;
  const COUNT = init.count;
  let state = init.state;

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
  gl.uniform3fv(uni.colA, hexToRgb(init.colors[0]));
  gl.uniform3fv(uni.colB, hexToRgb(init.colors[1]));
  gl.uniform3fv(uni.colC, hexToRgb(init.colors[2]));

  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) seeds[i] = (i * 0.6180339887) % 1;
  const seedBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc.seed);
  gl.vertexAttribPointer(loc.seed, 1, gl.FLOAT, false, 0, 0);

  // Shapes are generated lazily — the first one immediately, the rest when
  // first asked for.
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
  const first = getShape(state.shape);
  let fromData = first.data;
  let fromBuf: WebGLBuffer = first.buf;
  let target: ShapeName = state.shape;
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
      // Interrupted mid-flight: freeze where the cloud is now and morph from
      // there, so a fast scroll never makes the particles jump.
      const e = easeInOutCubic(progress);
      const fresh = new Float32Array(COUNT * 3);
      for (let i = 0; i < fresh.length; i++) fresh[i] = fromData[i]! + (toData[i]! - fromData[i]!) * e;
      gl.bindBuffer(gl.ARRAY_BUFFER, snapshotBuf);
      gl.bufferData(gl.ARRAY_BUFFER, fresh, gl.DYNAMIC_DRAW);
      fromData = fresh;
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

  // --- Sizing and adaptive quality -------------------------------------
  let cssW = init.width;
  let cssH = init.height;
  let dpr = init.dpr;
  let level = 0;
  let ratio = 1;
  let drawCount = COUNT;
  let aspect = 1;
  const small = Math.min(cssW, cssH) < 700 || !finePointer;

  const applySize = () => {
    const L = LEVELS[level]!;
    ratio = Math.min(dpr, 1.5) * (small ? 0.75 : 0.8) * L.scale;
    canvas.width = Math.max(1, Math.round(cssW * ratio));
    canvas.height = Math.max(1, Math.round(cssH * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = cssW / Math.max(1, cssH);
    drawCount = Math.floor(COUNT * L.particles);
  };
  applySize();

  // Smoothed state, all lerped towards targets each frame.
  let alpha = 0;
  let offsetX = 0;
  let yaw = 0;
  let pitch = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, repel: 0, lastMove: -10 };
  let time = 0;
  let frameEma = 16.7;
  let slowFor = 0;

  function draw(dt: number) {
    const s = state;
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
    gl.uniform1f(uni.pr, ratio);
    // Slightly larger points compensate for the reduced buffer and for any
    // particles shed by the quality ladder, keeping the cloud's density.
    gl.uniform1f(uni.size, (small ? 2.7 : 2.4) / Math.sqrt(LEVELS[level]!.particles));
    gl.uniform2f(uni.rot, yaw + (reduced ? 0 : mouse.sx * 0.4), pitch);
    gl.uniform2f(uni.mouse, mouse.sx, mouse.sy);
    gl.uniform1f(uni.repel, mouse.repel);
    gl.uniform2f(uni.offset, offsetX, 0);
    gl.uniform1f(uni.aspect, aspect);
    gl.uniform1f(uni.scale, wide ? 1 : 0.78);
    gl.uniform1f(uni.alpha, alpha);
    gl.drawArrays(gl.POINTS, 0, drawCount);
  }

  let rafId = 0;
  let last = 0;
  let running = false;
  let visible = true;
  let readySent = false;

  const loop = (now: number) => {
    const dtMs = last ? now - last : 16.7;
    last = now;
    const dt = Math.min(0.05, dtMs / 1000);
    time += dt;
    draw(dt);
    if (!readySent) {
      readySent = true;
      onReady?.();
    }
    // Step down the quality ladder if frames stay long for over a second.
    frameEma = frameEma * 0.92 + dtMs * 0.08;
    if (frameEma > 24) slowFor += dt;
    else slowFor = Math.max(0, slowFor - dt);
    if (slowFor > 1.2 && level < LEVELS.length - 1) {
      level++;
      slowFor = 0;
      frameEma = 16.7;
      applySize();
    }
    rafId = raf(loop);
  };

  const start = () => {
    if (running || reduced || !visible) return;
    running = true;
    last = 0;
    rafId = raf(loop);
  };
  const stop = () => {
    running = false;
    caf(rafId);
  };

  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
  };
  canvas.addEventListener("webglcontextlost", onLost as EventListener);

  if (reduced) {
    draw(0);
    onReady?.();
  } else {
    start();
  }

  return {
    setState(next) {
      state = next;
      morphTo(next.shape);
      if (reduced) draw(0);
    },
    setPointer(x, y) {
      mouse.x = x;
      mouse.y = y;
      mouse.lastMove = time;
    },
    resize(width, height, nextDpr) {
      cssW = width;
      cssH = height;
      dpr = nextDpr;
      applySize();
      if (reduced) draw(0);
    },
    setVisible(v) {
      visible = v;
      if (v) start();
      else stop();
    },
    destroy() {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost as EventListener);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
