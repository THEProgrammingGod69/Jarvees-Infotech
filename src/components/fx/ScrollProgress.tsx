"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** A hairline of light across the top of the viewport that fills as you read. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 right-0 left-0 z-[60] h-px origin-left bg-gradient-to-r from-cyan via-violet to-magenta"
    />
  );
}
