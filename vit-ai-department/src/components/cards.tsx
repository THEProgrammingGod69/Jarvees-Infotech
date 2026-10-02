import type { Achievement } from "@/content/events";
import { labs } from "@/content/labs";
import HoloImage from "@/components/fx/HoloImage";
import { Chip } from "@/components/ui";

const levelTone = { International: "magenta", National: "cyan", "Inter-college": "violet" } as const;

export function AchievementCard({ a, className = "" }: { a: Achievement; className?: string }) {
  return (
    <article data-tilt className={`holo flex h-full flex-col p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <Chip tone={levelTone[a.level]}>{a.level}</Chip>
        <span className="label text-haze">{a.when}</span>
      </div>
      <p className="mt-6 font-display text-display-m text-gradient">{a.result}</p>
      <h3 className="mt-3 text-heading text-frost">{a.title}</h3>
      <p className="mt-2 text-small text-haze">{a.who}</p>
      {a.prize && (
        <p className="label mt-auto pt-6 text-cyan">
          <span className="text-haze">Prize · </span>
          {a.prize}
        </p>
      )}
    </article>
  );
}

export function LabCard({ lab, index }: { lab: (typeof labs)[number]; index: number }) {
  return (
    <article data-tilt className="holo group/lab flex h-full flex-col overflow-hidden p-3">
      <HoloImage src={lab.photo} alt={`${lab.name}, CSE (AI), VIT Pune`} caption={lab.name} />
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-center justify-between">
          <span className="label text-cyan">LAB-{String(index + 1).padStart(2, "0")}</span>
          <span className="label text-haze">{lab.seats} seats</span>
        </div>
        <h3 className="mt-3 text-heading text-frost">{lab.name}</h3>
        <ul className="mt-3 space-y-1.5 text-small text-haze">
          {lab.specs.map((s) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** A large numeric readout with a mono caption. */
export function Readout({ value, label, detail }: { value: React.ReactNode; label: string; detail?: string }) {
  return (
    <div className="holo hud-corners h-full p-6">
      <p className="label text-haze">{label}</p>
      <p className="mt-4 font-display text-[clamp(1.45rem,2.6vw,2.2rem)] leading-tight font-semibold tracking-[-0.025em] [overflow-wrap:anywhere] text-frost">
        {value}
      </p>
      {detail && <p className="mt-2 text-small text-haze">{detail}</p>}
    </div>
  );
}
