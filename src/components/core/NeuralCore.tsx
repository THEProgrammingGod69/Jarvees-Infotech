"use client";

import { useEffect, useRef } from "react";
import { whenIdle } from "@/motion/idle";
import type { CoreMessage } from "./core.worker";
import type { CoreAlign, CoreController, CoreInit, CoreState } from "./renderer";
import type { ShapeName } from "./shapes";

/**
 * The Neural Core — the site's signature element: one fixed canvas behind
 * the home page, a cloud of particles that re-forms (brain, network,
 * galaxy, the letters "AI") as the reader scrolls through the sections
 * that ask for it.
 *
 * Sections opt in declaratively, with no client code of their own:
 *
 *   <section data-core-shape="brain" data-core-intensity="1" data-core-align="right">
 *
 * Whichever section covers the centre of the viewport is in charge.
 *
 * Rendering happens in a Web Worker on an OffscreenCanvas, so this
 * component costs the main thread almost nothing: it creates the canvas,
 * hands it over, and forwards section changes and pointer moves. Browsers
 * without OffscreenCanvas WebGL fall back to rendering on the main thread
 * after the page is idle.
 */

type Send = (msg: Exclude<CoreMessage, { type: "init" }>) => void;

const DEFAULT_STATE: CoreState = { shape: "brain", intensity: 1, align: "right" };

function readState(el: HTMLElement): CoreState {
  return {
    shape: (el.dataset.coreShape as ShapeName) ?? "sphere",
    intensity: Number(el.dataset.coreIntensity ?? 0.4),
    align: (el.dataset.coreAlign as CoreAlign) ?? "center",
  };
}

function dispatch(core: CoreController, msg: Exclude<CoreMessage, { type: "init" }>) {
  switch (msg.type) {
    case "state":
      return core.setState(msg.state);
    case "pointer":
      return core.setPointer(msg.x, msg.y);
    case "resize":
      return core.resize(msg.width, msg.height, msg.dpr);
    case "visible":
      return core.setVisible(msg.visible);
    case "destroy":
      return core.destroy();
  }
}

export default function NeuralCore() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700 || !finePointer;
    const cores = navigator.hardwareConcurrency ?? 4;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-core-shape]"));

    let disposed = false;
    let send: Send = () => {};
    let teardown = () => {};
    let cancelIdle = () => {};
    let state: CoreState = sections[0] ? readState(sections[0]) : DEFAULT_STATE;

    const makeCanvas = () => {
      host.replaceChildren();
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1.4s cubic-bezier(.16,1,.3,1)";
      host.appendChild(canvas);
      return canvas;
    };
    const ready = (canvas: HTMLCanvasElement) => () => {
      if (!disposed) canvas.style.opacity = "1";
    };
    const initFor = (canvas: HTMLCanvasElement): CoreInit => ({
      colors: [token("--color-cyan", "#5ce1ff"), token("--color-violet", "#a68bff"), token("--color-magenta", "#ff5cad")],
      reduced,
      finePointer,
      count: small ? 7000 : cores <= 4 ? 10000 : 14000,
      width: canvas.clientWidth || window.innerWidth,
      height: canvas.clientHeight || window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      state,
    });

    const startInline = () => {
      const canvas = makeCanvas();
      cancelIdle = whenIdle(() => {
        void import("./renderer").then(({ createCoreRenderer }) => {
          if (disposed) return;
          const core = createCoreRenderer(canvas, initFor(canvas), ready(canvas));
          if (!core) {
            host.replaceChildren();
            return;
          }
          send = (msg) => dispatch(core, msg);
          teardown = () => core.destroy();
        });
      });
    };

    const startWorker = () => {
      const canvas = makeCanvas();
      let worker: Worker;
      try {
        worker = new Worker(new URL("./core.worker.ts", import.meta.url), { type: "module" });
        const offscreen = canvas.transferControlToOffscreen();
        worker.postMessage({ type: "init", canvas: offscreen, init: initFor(canvas) } satisfies CoreMessage, [offscreen]);
      } catch {
        startInline();
        return;
      }
      const fallBack = () => {
        worker.terminate();
        if (!disposed) startInline();
      };
      worker.onmessage = (e: MessageEvent<{ type: string }>) => {
        if (e.data.type === "ready") ready(canvas)();
        else if (e.data.type === "fail") fallBack();
      };
      worker.onerror = fallBack;
      send = (msg) => worker.postMessage(msg);
      teardown = () => {
        worker.postMessage({ type: "destroy" } satisfies CoreMessage);
        window.setTimeout(() => worker.terminate(), 200);
      };
    };

    // The core fades in over a second anyway: start it once the page is idle
    // so the worker's download and WebGL start-up never delay first paint.
    const canOffscreen = typeof OffscreenCanvas !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype;
    const cancelStart = whenIdle(() => {
      if (disposed) return;
      if (canOffscreen) startWorker();
      else startInline();
    }, 1000);

    // Whichever stage covers the centre point of the viewport is in charge.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          state = readState(entry.target as HTMLElement);
          send({ type: "state", state });
        }
      },
      { rootMargin: "-50% -50% -50% -50%" },
    );
    sections.forEach((s) => io.observe(s));

    // Pointer: coalesced to one message per frame, mouse only.
    let px = 0;
    let py = 0;
    let pointerQueued = false;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = -((e.clientY / window.innerHeight) * 2 - 1);
      if (pointerQueued) return;
      pointerQueued = true;
      requestAnimationFrame(() => {
        pointerQueued = false;
        send({ type: "pointer", x: px, y: py });
      });
    };

    // Resize, debounced: mobile URL bars resize the viewport while
    // scrolling, and reallocating the drawing buffer each time would stutter.
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        send({ type: "resize", width: host.clientWidth, height: host.clientHeight, dpr: window.devicePixelRatio || 1 });
      }, 150);
    });
    ro.observe(host);

    const onVisibility = () => send({ type: "visible", visible: !document.hidden });

    if (finePointer && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelStart();
      cancelIdle();
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      teardown();
      host.replaceChildren();
    };
  }, []);

  // Large-viewport height: the drawing buffer keeps its size when a mobile
  // URL bar slides in and out.
  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh" />;
}
