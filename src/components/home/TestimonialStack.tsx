import { vars } from "@/components/ui";

type Testimonial = { name: string; programme: string; quote: string };

/**
 * Testimonials as a deck: each card sticks below the header and the next
 * one slides up over it, while the cards underneath shrink back and dim —
 * scroll-driven on the compositor (`.stack`, `.stack__card--recede`).
 * Without scroll timelines the cards still stack (it is plain sticky
 * positioning), they just do not recede.
 */
export default function TestimonialStack({ items }: { items: readonly Testimonial[] }) {
  const n = items.length;
  return (
    <ul className="stack mx-auto mt-14 max-w-3xl">
      {items.map((t, i) => (
        <li
          key={t.name}
          className={`stack__card sticky ${i < n - 1 ? "stack__card--recede pb-[22vh]" : ""}`}
          style={vars({
            top: `calc(6.5rem + ${i} * 1.4rem)`,
            "--r0": `${((i / n) * 100).toFixed(1)}%`,
            "--r1": `${(((i + 1) / n) * 100).toFixed(1)}%`,
          })}
        >
          <figure className="holo bg-panel flex flex-col p-7 sm:p-10">
            <span aria-hidden="true" className="font-display text-[4rem] leading-none text-gradient">
              “
            </span>
            <blockquote className="mt-2 font-display text-[clamp(1.05rem,1.8vw,1.35rem)] leading-relaxed text-frost/90">{t.quote}</blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan/40 font-display text-small text-cyan">
                {t.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-small font-semibold text-frost">{t.name}</span>
                <span className="label block text-haze">{t.programme}</span>
              </span>
              <span className="label ml-auto text-haze">
                {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
