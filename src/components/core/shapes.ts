/**
 * Point-cloud targets for the Neural Core. Each generator fills a
 * Float32Array of `count * 3` positions in a roughly unit-radius-2 volume.
 * Everything is deterministic (seeded) so a shape is identical on every
 * visit and between morph passes.
 *
 * Runs inside the core's Web Worker (and on the main thread only as a
 * fallback), so it must not touch `document` directly.
 */

export type ShapeName = "brain" | "sphere" | "galaxy" | "plane" | "network" | "knot" | "glyph";

export const SHAPES: ShapeName[] = ["brain", "sphere", "galaxy", "plane", "network", "knot", "glyph"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gaussian sample via Box–Muller — used for soft volumetric jitter. */
function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-7);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

function sphere(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // A thin shell plus an inner nucleus: reads as a body, not a wireframe.
    const shell = rand() < 0.86 ? 1.65 + gauss(rand) * 0.025 : 0.55 + rand() * 0.6;
    out[i * 3] = Math.cos(theta) * r * shell;
    out[i * 3 + 1] = y * shell;
    out[i * 3 + 2] = Math.sin(theta) * r * shell;
  }
  return out;
}

/**
 * Two hemispheres with cortical folds, a corpus gap between them, and a
 * cerebellum tucked under the back. Folds are a sum of sines on the surface
 * normal — cheap, deterministic, and convincingly gyral at this density.
 */
function brain(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const isCerebellum = rand() < 0.11;
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    let nx = Math.sin(v) * Math.cos(u);
    const ny = Math.cos(v);
    const nz = Math.sin(v) * Math.sin(u);

    if (isCerebellum) {
      const s = 0.55 + gauss(rand) * 0.02;
      out[i * 3] = nx * s * 1.25;
      out[i * 3 + 1] = ny * s * 0.55 - 0.85;
      out[i * 3 + 2] = nz * s * 0.85 - 0.95;
      continue;
    }

    const side = nx >= 0 ? 1 : -1;
    // Flatten the medial face so the hemispheres meet along a plane.
    nx = side * Math.max(Math.abs(nx), 0.08);
    const fold =
      0.09 * Math.sin(9 * u + 3 * v) +
      0.06 * Math.sin(17 * v - 5 * u) +
      0.035 * Math.sin(29 * u * v);
    const r = 1 + fold + gauss(rand) * 0.012;
    let x = nx * r * 0.95 + side * 0.13;
    let y = ny * r * 1.05;
    const z = nz * r * 1.38;
    // Taper the frontal lobe and lift the occipital slightly.
    y += 0.12 * Math.max(0, -z);
    x *= 1 - 0.08 * Math.max(0, z);
    out[i * 3] = x * 1.25;
    out[i * 3 + 1] = y * 1.15 + 0.15;
    out[i * 3 + 2] = z * 1.05;
  }
  return out;
}

function galaxy(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const arms = 4;
  for (let i = 0; i < count; i++) {
    const r = Math.pow(rand(), 0.7) * 2.6;
    const arm = (i % arms) / arms;
    const twist = r * 2.2;
    const angle = arm * Math.PI * 2 + twist;
    const spread = 0.42 * (1 - r / 3.2);
    out[i * 3] = Math.cos(angle) * r + gauss(rand) * spread;
    out[i * 3 + 1] = gauss(rand) * 0.09 * (2.8 - r);
    out[i * 3 + 2] = Math.sin(angle) * r + gauss(rand) * spread;
  }
  return out;
}

/** A rippling data field — raw signal before any structure is imposed. */
function plane(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const side = Math.ceil(Math.sqrt(count));
  for (let i = 0; i < count; i++) {
    const gx = (i % side) / (side - 1) - 0.5;
    const gz = Math.floor(i / side) / (side - 1) - 0.5;
    const x = gx * 5.2 + (rand() - 0.5) * 0.012;
    const z = gz * 5.2 + (rand() - 0.5) * 0.012;
    const d = Math.sqrt(x * x + z * z);
    out[i * 3] = x;
    out[i * 3 + 1] = Math.sin(d * 2.4) * 0.28 * Math.exp(-d * 0.35) - 0.4;
    out[i * 3 + 2] = z;
  }
  return out;
}

/**
 * A literal feed-forward network: five layers of neuron clusters, with the
 * remaining points strung along a sample of the inter-layer synapses.
 */
function network(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const layers = [4, 7, 9, 7, 3];
  const nodes: [number, number, number][] = [];
  layers.forEach((n, li) => {
    const x = (li - (layers.length - 1) / 2) * 1.05;
    for (let k = 0; k < n; k++) {
      const y = (k - (n - 1) / 2) * 0.42;
      nodes.push([x, y, (rand() - 0.5) * 0.3]);
    }
  });
  const edges: [number, number][] = [];
  let offset = 0;
  for (let li = 0; li < layers.length - 1; li++) {
    const a = layers[li]!;
    const b = layers[li + 1]!;
    for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) edges.push([offset + i, offset + a + j]);
    offset += a;
  }
  const nodeShare = Math.floor(count * 0.42);
  for (let i = 0; i < count; i++) {
    if (i < nodeShare) {
      const n = nodes[i % nodes.length]!;
      out[i * 3] = n[0] + gauss(rand) * 0.045;
      out[i * 3 + 1] = n[1] + gauss(rand) * 0.045;
      out[i * 3 + 2] = n[2] + gauss(rand) * 0.045;
    } else {
      const [ai, bi] = edges[Math.floor(rand() * edges.length)]!;
      const a = nodes[ai]!;
      const b = nodes[bi]!;
      const t = rand();
      out[i * 3] = a[0] + (b[0] - a[0]) * t;
      out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t;
      out[i * 3 + 2] = a[2] + (b[2] - a[2]) * t;
    }
  }
  return out;
}

function knot(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const p = 2;
  const q = 3;
  for (let i = 0; i < count; i++) {
    const t = rand() * Math.PI * 2;
    const r = 1.05 + 0.45 * Math.cos(q * t);
    const cx = r * Math.cos(p * t);
    const cy = r * Math.sin(p * t);
    const cz = 0.45 * Math.sin(q * t);
    // Tube around the curve, thicker towards the centre of the cross-section.
    const a = rand() * Math.PI * 2;
    const tube = 0.17 * Math.sqrt(rand());
    out[i * 3] = (cx + Math.cos(a) * tube) * 1.15;
    out[i * 3 + 1] = (cy + Math.sin(a) * tube) * 1.15;
    out[i * 3 + 2] = (cz + Math.cos(a + 1.3) * tube) * 1.15;
  }
  return out;
}

/**
 * The letters "AI", sampled from an offscreen canvas. Needs a DOM, so it is
 * only ever called client-side; falls back to a sphere if 2D canvas is
 * unavailable.
 */
function glyph(count: number, rand: () => number) {
  const w = 320;
  const h = 200;
  // OffscreenCanvas works in the worker; a DOM canvas is the fallback for
  // older main-thread environments.
  let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null;
  if (typeof OffscreenCanvas !== "undefined") {
    ctx = new OffscreenCanvas(w, h).getContext("2d");
  } else if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
  }
  if (!ctx) return sphere(count, rand);
  ctx.fillStyle = "#fff";
  ctx.font = "800 170px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AI", w / 2, h / 2 + 8);
  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: number[] = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3]! > 128) filled.push(x, y);
    }
  }
  const out = new Float32Array(count * 3);
  const pairs = filled.length / 2;
  if (pairs === 0) return sphere(count, rand);
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rand() * pairs) * 2;
    out[i * 3] = ((filled[k]! - w / 2) / w) * 4.6;
    out[i * 3 + 1] = (-(filled[k + 1]! - h / 2) / w) * 4.6;
    out[i * 3 + 2] = gauss(rand) * 0.14;
  }
  return out;
}

const generators: Record<ShapeName, (count: number, rand: () => number) => Float32Array> = {
  brain,
  sphere,
  galaxy,
  plane,
  network,
  knot,
  glyph,
};

/**
 * Points are returned in a fixed shuffled order (the same permutation for
 * every shape), so any prefix of the buffer is an even sample of the whole
 * form. That is what lets the renderer shed particles under load by simply
 * drawing fewer of them — and point i still morphs into point i.
 */
const permutations = new Map<number, Uint32Array>();

function permutation(count: number) {
  let perm = permutations.get(count);
  if (!perm) {
    perm = new Uint32Array(count);
    for (let i = 0; i < count; i++) perm[i] = i;
    const rand = mulberry32(0x5eed);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = perm[i]!;
      perm[i] = perm[j]!;
      perm[j] = t;
    }
    permutations.set(count, perm);
  }
  return perm;
}

export function buildShape(name: ShapeName, count: number) {
  // A per-shape seed keeps each shape stable while giving them unrelated noise.
  const seed = SHAPES.indexOf(name) * 7919 + 17;
  const raw = generators[name](count, mulberry32(seed));
  const perm = permutation(count);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const k = perm[i]! * 3;
    out[i * 3] = raw[k]!;
    out[i * 3 + 1] = raw[k + 1]!;
    out[i * 3 + 2] = raw[k + 2]!;
  }
  return out;
}
