"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Motion primitives.
 *
 * Every component here answers `useReducedMotion` first and returns a plain,
 * fully-formed element when a visitor has asked for stillness — no transform
 * left on the node, no counter stuck at zero, no text stuck mid-scramble. The
 * rule across this file: **the reduced-motion path must render the finished
 * state, never the initial one.**
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Reveal — the workhorse                                                     */
/* -------------------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 18,
  blur = true,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** A short blur-in reads as depth of field rather than as a slide. */
  blur?: boolean;
  className?: string;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(6px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stagger — a group whose children arrive in sequence                        */
/* -------------------------------------------------------------------------- */

const groupVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE },
  },
};

export function Stagger({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Headline — a masked, word-by-word rise                                     */
/* -------------------------------------------------------------------------- */

/**
 * Each word sits in an `overflow: hidden` box and rises into it, so the text
 * appears to be revealed by a moving edge rather than faded in. This is the
 * one piece of motion the visitor is guaranteed to see, so it gets the care.
 *
 * Styling constraint: do NOT combine this with a `background-clip: text`
 * gradient on the same element. The words are wrapped in nested
 * `overflow: hidden` inline-blocks to build the mask, and a background clipped
 * to text does not paint through that nesting — the headline renders
 * completely invisible. Colour this with a plain text colour.
 */
export function Headline({
  text,
  className = "",
  delay = 0,
  as: Tag = "h1",
  trigger = "view",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p";
  /**
   * `mount` for the hero, which is on screen at load. `view` for everything
   * further down the page — a heading that played its entrance before the
   * visitor scrolled to it has animated for nobody.
   */
  trigger?: "mount" | "view";
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <Tag className={className}>{text}</Tag>;

  const motionProps =
    trigger === "mount"
      ? { animate: { y: "0%" } }
      : {
          whileInView: { y: "0%" },
          viewport: { once: true, margin: "-90px" },
        };

  return (
    <Tag className={className}>
      {/* The real string stays in the accessibility tree as one readable
          sentence; the animated copy is split into words and hidden from it,
          so a screen reader never hears the text word by word. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-block overflow-hidden align-bottom"
            // A little vertical room so descenders are not clipped by the mask.
            style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
          >
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              {...motionProps}
              transition={{
                duration: 0.9,
                delay: delay + i * 0.055,
                ease: EASE,
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Counter — counts real figures up on entry                                  */
/* -------------------------------------------------------------------------- */

/**
 * Only ever pointed at figures the academy can evidence, and only at
 * *quantities* — the founding year, the course count, the number of ratings.
 *
 * Two rules, both learned the hard way. A counter is a persuasion device, so
 * pointing one at an invented number is exactly the failure mode this site
 * avoids. And a counter run at a precise value in a narrow range — a 4.5
 * rating — spends most of a second displaying 4.4, which is a wrong claim even
 * though it is a transient one. Ratings are stated; use `RatingBar` for the
 * motion instead.
 */
export function Counter({
  to,
  decimals = 0,
  duration = 1.6,
  className = "",
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced || !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      // Ease-out cubic: fast first, settles on the number.
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  const finalText = `${prefix}${to.toFixed(decimals)}${suffix}`;

  return (
    // The width is reserved by an invisible copy of the *final* string. Without
    // it the counter starts at "0" and grows to "2015", changing its own width
    // on every frame and pushing the layout around it — measured as real
    // cumulative layout shift, not a theoretical one.
    <span ref={ref} className={`relative inline-block tnum ${className}`}>
      <span aria-hidden="true" className="invisible">
        {finalText}
      </span>
      <span className="absolute inset-0">
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scramble — decodes a label, terminal-style                                 */
/* -------------------------------------------------------------------------- */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#";

/**
 * The mono labels decode into place. This is the one flourish that is purely
 * of the subject: it is what a character-cell terminal looks like resolving a
 * field. Used on section labels only, never on body copy.
 */
export function Scramble({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced || !inView) return;
    let frame = 0;
    let raf = 0;
    const total = text.length * 3 + 12;
    const run = () => {
      const revealed = Math.floor((frame / total) * text.length * 1.35);
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealed) return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      frame += 1;
      if (frame <= total) raf = requestAnimationFrame(run);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, text]);

  return (
    <span ref={ref} className={className}>
      {/* The real string stays in the accessibility tree throughout; only the
          visual layer scrambles. A screen reader never hears the noise. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display || text}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Spotlight — a card that lights under the cursor                            */
/* -------------------------------------------------------------------------- */

export function Spotlight({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`group/spot relative isolate overflow-hidden ${className}`}
      style={style}
      onPointerMove={(e) => {
        // Pointer-driven only: it costs nothing on touch, where it never fires.
        if (reduced || e.pointerType === "touch") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setPos(null)}
    >
      {pos && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 h-[340px] w-[340px] rounded-full opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
          style={{
            left: pos.x - 170,
            top: pos.y - 170,
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--color-signal) 12%, transparent) 0%, transparent 70%)",
          }}
        />
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic — a control that leans toward the cursor                          */
/* -------------------------------------------------------------------------- */

export function Magnetic({
  children,
  strength = 0.32,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Parallax                                                                   */
/* -------------------------------------------------------------------------- */

export function Parallax({
  children,
  distance = 60,
  className = "",
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yRaw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 24, mass: 0.4 });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scroll progress                                                            */
/* -------------------------------------------------------------------------- */

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-100 h-px origin-left bg-signal"
      style={{ scaleX }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Marquee                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * CSS-animated rather than JS-driven, so it costs no main-thread time. The
 * track is duplicated and translated by exactly -50%, which is what makes the
 * loop seamless.
 */
export function Marquee({
  items,
  speed = 42,
  className = "",
}: {
  items: string[];
  /** Seconds for one full pass. */
  speed?: number;
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`group relative flex overflow-hidden ${className}`}
      // The label carries the content for assistive tech; the visual track is
      // hidden from it so the duplicated list is not read out twice.
      role="group"
      aria-label={`Courses taught: ${items.join(", ")}`}
    >
      <div
        aria-hidden="true"
        className="flex w-max shrink-0 items-center gap-10 pr-10 motion-safe:[animation:marquee_var(--speed)_linear_infinite] motion-safe:group-hover:[animation-play-state:paused]"
        style={{ ["--speed" as string]: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-10 font-mono text-mono-label uppercase text-steel"
          >
            {item}
            <span className="h-1 w-1 shrink-0 bg-steel-dim" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  RatingBar — five segments that fill to the real score                      */
/* -------------------------------------------------------------------------- */

/**
 * The animated companion to a *stated* rating. Growing a bar to 90% width is
 * honest at every frame in a way that ticking a number through 4.4 is not:
 * a partially-drawn bar reads as "still drawing", a wrong number reads as a
 * wrong number.
 */
export function RatingBar({
  value,
  outOf = 5,
  className = "",
}: {
  value: number;
  outOf?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const segments = Array.from({ length: outOf }, (_, i) => {
    const fill = Math.min(Math.max(value - i, 0), 1);
    return { i, fill };
  });

  return (
    <div
      aria-hidden="true"
      className={`mt-4 flex gap-1.5 ${className}`}
    >
      {segments.map(({ i, fill }) => (
        <span key={i} className="relative h-1 flex-1 bg-hairline">
          <motion.span
            className="absolute inset-y-0 left-0 block bg-signal"
            initial={reduced ? false : { width: 0 }}
            whileInView={{ width: `${fill * 100}%` }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.55,
              delay: 0.12 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={reduced ? { width: `${fill * 100}%` } : undefined}
          />
        </span>
      ))}
    </div>
  );
}
