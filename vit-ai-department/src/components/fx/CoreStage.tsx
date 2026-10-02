"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { setCore, type CoreAlign } from "./NeuralCore";
import type { ShapeName } from "./shapes";

type Props = {
  shape: ShapeName;
  /** 0–1. Below ~0.5 the core recedes behind the content. */
  intensity?: number;
  align?: CoreAlign;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

/**
 * A section that tells the Neural Core what to become. The stage takes over
 * when it crosses the vertical centre of the viewport, so exactly one stage
 * is ever in charge and the hand-off happens where the reader is looking.
 */
export default function CoreStage({ shape, intensity = 0.4, align = "center", children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCore({ shape, intensity, align });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shape, intensity, align]);

  return (
    <section ref={ref} {...rest}>
      {children}
    </section>
  );
}
