/**
 * The neural mesh behind inner-page titles: drifting neurons, synapses
 * between neighbours, signals travelling along random synapses, and a pull
 * towards the pointer. 2D canvas, renderable in a Web Worker
 * (OffscreenCanvas) or on the main thread.
 *
 * Batched for speed: synapses are bucketed into four opacity levels and
 * stroked as four paths per frame (the first version stroked every line
 * separately — hundreds of draw calls), neurons are one filled path, and
 * signal glows are a pre-rendered sprite.
 */

export type MeshInit = {
  width: number;
  height: number;
  dpr: number;
  density: number;
  reduced: boolean;
  colors: [string, string];
};

export type MeshController = {
  setPointer(x: number, y: number): void;
  resize(width: number, height: number, dpr: number): void;
  setVisible(visible: boolean): void;
  destroy(): void;
};

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const LINK = 150;
const LINK2 = LINK * LINK;
const PULL = 180;
const BUCKETS = 4;

const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const caf: (id: number) => void =
  typeof cancelAnimationFrame === "function" ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id);

function makeSprite(color: string): CanvasImageSource | null {
  const size = 32;
  let c: AnyCanvas | null = null;
  if (typeof OffscreenCanvas !== "undefined") c = new OffscreenCanvas(size, size);
  else if (typeof document !== "undefined") {
    c = document.createElement("canvas");
    c.width = c.height = size;
  }
  const g = c?.getContext("2d") as Ctx | null;
  if (!c || !g) return null;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c as CanvasImageSource;
}

export function createMeshRenderer(canvas: AnyCanvas, init: MeshInit): MeshController | null {
  const ctx = canvas.getContext("2d") as Ctx | null;
  if (!ctx) return null;
  const [cyan, violet] = init.colors;
  const { reduced, density } = init;
  const sprite = makeSprite(cyan);

  let w = init.width;
  let h = init.height;
  let dpr = Math.min(init.dpr, 1.5);
  type Node = { x: number; y: number; vx: number; vy: number; r: number };
  let nodes: Node[] = [];
  type Pulse = { a: number; b: number; t: number; speed: number };
  const pulses: Pulse[] = [];
  const pointer = { x: -9999, y: -9999 };
  // Reused segment buffers, one per opacity bucket: [x1, y1, x2, y2, ...].
  const segs: number[][] = Array.from({ length: BUCKETS }, () => []);

  const seed = () => {
    const count = Math.max(12, Math.min(72, Math.floor(((w * h) / 16000) * density)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.3 + 0.7,
    }));
  };

  const size = () => {
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1;
    seed();
  };
  size();

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    for (const b of segs) b.length = 0;

    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      const p = nodes[i]!;
      if (!reduced) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        if (dx * dx + dy * dy < PULL * PULL) {
          p.x += dx * 0.004;
          p.y += dy * 0.004;
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const a = nodes[i]!;
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= LINK2) continue;
        const strength = 1 - Math.sqrt(d2) / LINK;
        segs[Math.min(BUCKETS - 1, Math.floor(strength * BUCKETS))]!.push(a.x, a.y, b.x, b.y);
        if (!reduced && pulses.length < 12 && Math.random() < 0.0008) {
          pulses.push({ a: i, b: j, t: 0, speed: 0.008 + Math.random() * 0.012 });
        }
      }
    }

    ctx.strokeStyle = violet;
    for (let k = 0; k < BUCKETS; k++) {
      const s = segs[k]!;
      if (!s.length) continue;
      ctx.globalAlpha = ((k + 0.5) / BUCKETS) * 0.22;
      ctx.beginPath();
      for (let q = 0; q < s.length; q += 4) {
        ctx.moveTo(s[q]!, s[q + 1]!);
        ctx.lineTo(s[q + 2]!, s[q + 3]!);
      }
      ctx.stroke();
    }

    if (pointer.x > -9000) {
      ctx.strokeStyle = cyan;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      for (const p of nodes) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        if (dx * dx + dy * dy < PULL * PULL) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
        }
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = cyan;
    ctx.beginPath();
    for (const p of nodes) ctx.rect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    ctx.fill();

    if (sprite) {
      ctx.globalAlpha = 0.9;
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k]!;
        const a = nodes[pulse.a];
        const b = nodes[pulse.b];
        pulse.t += pulse.speed;
        if (!a || !b || pulse.t >= 1) {
          pulses.splice(k, 1);
          continue;
        }
        const x = a.x + (b.x - a.x) * pulse.t;
        const y = a.y + (b.y - a.y) * pulse.t;
        ctx.drawImage(sprite, x - 9, y - 9, 18, 18);
      }
    }
    ctx.globalAlpha = 1;
  };

  let rafId = 0;
  let running = false;
  let visible = false;
  const loop = () => {
    frame();
    rafId = raf(loop);
  };
  const start = () => {
    if (running || reduced || !visible) return;
    running = true;
    rafId = raf(loop);
  };
  const stop = () => {
    running = false;
    caf(rafId);
  };

  frame();

  return {
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    resize(width, height, nextDpr) {
      w = width;
      h = height;
      dpr = Math.min(nextDpr, 1.5);
      size();
      frame();
    },
    setVisible(v) {
      visible = v;
      if (v) start();
      else stop();
    },
    destroy() {
      stop();
    },
  };
}
