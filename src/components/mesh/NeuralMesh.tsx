"use client";

import { useEffect, useRef } from "react";
import type { MeshMessage } from "./mesh.worker";
import type { MeshController, MeshInit } from "./renderer";
import { whenIdle } from "@/motion/idle";

type Send = (msg: Exclude<MeshMessage, { type: "init" }>) => void;

function dispatch(mesh: MeshController, msg: Exclude<MeshMessage, { type: "init" }>) {
  switch (msg.type) {
    case "pointer":
      return mesh.setPointer(msg.x, msg.y);
    case "resize":
      return mesh.resize(msg.width, msg.height, msg.dpr);
    case "visible":
      return mesh.setVisible(msg.visible);
    case "destroy":
      return mesh.destroy();
  }
}

/**
 * Host for the neural mesh. Rendering runs in a Web Worker where
 * OffscreenCanvas is available (main thread otherwise, started when idle)
 * and only while the mesh is on screen.
 */
export default function NeuralMesh({ density = 1 }: { density?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;

    let disposed = false;
    let send: Send = () => {};
    let teardown = () => {};
    let visible = false;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1s ease";
    host.replaceChildren(canvas);

    const init = (): MeshInit => ({
      width: host.clientWidth,
      height: host.clientHeight,
      dpr: window.devicePixelRatio || 1,
      density,
      reduced,
      colors: [token("--color-cyan", "#5ce1ff"), token("--color-violet", "#a68bff")],
    });
    const show = () => {
      if (!disposed) canvas.style.opacity = "1";
    };

    const startInline = (target: HTMLCanvasElement) => {
      const id = window.setTimeout(() => {
        void import("./renderer").then(({ createMeshRenderer }) => {
          if (disposed) return;
          const mesh = createMeshRenderer(target, init());
          if (!mesh) return;
          send = (msg) => dispatch(mesh, msg);
          teardown = () => mesh.destroy();
          mesh.setVisible(visible);
          show();
        });
      }, 200);
      teardown = () => window.clearTimeout(id);
    };

    // Start once the page is idle: the mesh fades in anyway, and its worker
    // download and canvas set-up should never compete with first paint.
    const cancelStart = whenIdle(() => {
      if (disposed) return;
      if (typeof OffscreenCanvas !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype) {
        try {
          const worker = new Worker(new URL("./mesh.worker.ts", import.meta.url), { type: "module" });
          const offscreen = canvas.transferControlToOffscreen();
          worker.postMessage({ type: "init", canvas: offscreen, init: init() } satisfies MeshMessage, [offscreen]);
          worker.onmessage = (e: MessageEvent<{ type: string }>) => {
            if (e.data.type === "ready") show();
          };
          send = (msg) => worker.postMessage(msg);
          send({ type: "visible", visible });
          teardown = () => {
            worker.postMessage({ type: "destroy" } satisfies MeshMessage);
            window.setTimeout(() => worker.terminate(), 200);
          };
        } catch {
          const fresh = document.createElement("canvas");
          fresh.style.cssText = canvas.style.cssText;
          fresh.setAttribute("aria-hidden", "true");
          host.replaceChildren(fresh);
          startInline(fresh);
        }
      } else {
        startInline(canvas);
      }
    }, 1000);

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting && !document.hidden;
      send({ type: "visible", visible });
    });
    io.observe(host);
    const onVisibility = () => {
      const rect = host.getBoundingClientRect();
      visible = !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight;
      send({ type: "visible", visible });
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => send({ type: "resize", width: host.clientWidth, height: host.clientHeight, dpr: window.devicePixelRatio || 1 }),
        120,
      );
    });
    ro.observe(host);

    let queued = false;
    let cx = 0;
    let cy = 0;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !visible) return;
      cx = e.clientX;
      cy = e.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const r = host.getBoundingClientRect();
        send({ type: "pointer", x: cx - r.left, y: cy - r.top });
      });
    };
    const onLeave = () => send({ type: "pointer", x: -9999, y: -9999 });
    if (finePointer && !reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      disposed = true;
      cancelStart();
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      teardown();
      host.replaceChildren();
    };
  }, [density]);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0" />;
}
