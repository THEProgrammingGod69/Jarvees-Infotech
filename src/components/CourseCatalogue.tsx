"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Course, Level, Mode, TrackId } from "@/content/types";
import { tracks, levelLabel, modeLabel } from "@/content/types";
import { Value } from "@/components/ui";

/**
 * The catalogue, on the light plane.
 *
 * This is a specification sheet, not an interface: dense, filterable, and set
 * as a document. Amber appears here only as a fill behind ink text — on paper
 * it measures 1.54:1 and can never be a text colour (DESIGN.md §2).
 */

type TrackFilter = TrackId | "all";
type ModeFilter = Mode | "all";
type LevelFilter = Level | "all";

function FilterGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-mono-label uppercase text-ink/65">
        {legend}
      </legend>
      <div className="mt-3 flex flex-wrap gap-px bg-paper-line">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`px-3 py-2 font-mono text-[0.625rem] uppercase tracking-[0.1em] transition-colors duration-(--duration-fast) ${
                active
                  ? "bg-signal text-ink"
                  : "bg-paper text-ink/70 hover:bg-paper-alt hover:text-ink"
              }`}
            >
              {option.label}
              {typeof option.count === "number" && (
                <span className={active ? "ml-2 text-ink/75" : "ml-2 text-ink/65"}>
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function CourseCatalogue({ courses }: { courses: Course[] }) {
  const [track, setTrack] = useState<TrackFilter>("all");

  /**
   * `?track=` deep links (from the track cells on the home page) are read
   * here, from `window.location`, rather than through `useSearchParams`.
   *
   * That is deliberate. `useSearchParams` would opt this route out of static
   * generation, and a dynamically rendered page streams its metadata into the
   * body instead of the head — measured, not assumed: it cost the page its
   * meta description. Reading the param after mount keeps `/courses` fully
   * static, keeps the metadata in the head, and renders the complete
   * catalogue in the first paint with no layout shift.
   */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("track");
    if (requested && tracks.some((t) => t.id === requested)) {
      setTrack(requested as TrackId);
    }
  }, []);
  const [mode, setMode] = useState<ModeFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");

  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          (track === "all" || course.track === track) &&
          (mode === "all" || course.modes.includes(mode)) &&
          (level === "all" || course.level === level),
      ),
    [courses, track, mode, level],
  );

  const countFor = (id: TrackId) =>
    courses.filter((c) => c.track === id).length;

  const cleared = track === "all" && mode === "all" && level === "all";

  return (
    <>
      <div className="grid gap-8 border-y border-paper-line py-8 lg:grid-cols-[auto_auto_auto_1fr] lg:gap-12">
        <FilterGroup<TrackFilter>
          legend="Track"
          value={track}
          onChange={setTrack}
          options={[
            { value: "all", label: "All", count: courses.length },
            ...tracks.map((t) => ({
              value: t.id as TrackFilter,
              label: t.name,
              count: countFor(t.id),
            })),
          ]}
        />

        <FilterGroup<ModeFilter>
          legend="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "all", label: "Both" },
            { value: "online", label: modeLabel.online },
            { value: "classroom", label: modeLabel.classroom },
          ]}
        />

        <FilterGroup<LevelFilter>
          legend="Level"
          value={level}
          onChange={setLevel}
          options={[
            { value: "all", label: "Any" },
            { value: "beginner", label: levelLabel.beginner },
            { value: "intermediate", label: levelLabel.intermediate },
          ]}
        />

        <div className="flex items-end justify-between gap-4 lg:justify-end">
          <p
            aria-live="polite"
            className="font-mono text-mono-label uppercase text-ink/65 tnum"
          >
            {filtered.length} of {courses.length}
          </p>
          {!cleared && (
            <button
              type="button"
              onClick={() => {
                setTrack("all");
                setMode("all");
                setLevel("all");
              }}
              className="font-mono text-mono-label uppercase text-ink underline decoration-paper-line underline-offset-4 transition-colors hover:decoration-ink"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-b border-paper-line py-16">
          <p className="text-display-m text-ink">Nothing matches that yet</p>
          <p className="mt-4 max-w-lg text-body-l text-ink/70">
            Every course runs both online and in the classroom, so widening the
            mode filter will bring results back. If you are looking for
            something not in the catalogue, ask us — we will tell you honestly
            whether we teach it.
          </p>
          <button
            type="button"
            onClick={() => {
              setTrack("all");
              setMode("all");
              setLevel("all");
            }}
            className="mt-6 bg-signal px-5 py-3 font-mono text-mono-label uppercase text-ink"
          >
            Show all {courses.length} courses
          </button>
        </div>
      ) : (
        <ul className="grid gap-px border-b border-paper-line bg-paper-line md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <li key={course.slug} className="bg-paper">
              <Link
                href={`/courses/${course.slug}`}
                className="group flex h-full flex-col justify-between gap-6 p-6 transition-colors duration-(--duration-fast) hover:bg-paper-alt"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-heading text-ink">{course.name}</h2>
                    {course.moduleCode && (
                      <span className="shrink-0 border border-paper-line px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink/70">
                        {course.moduleCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-body-s text-ink/70">
                    {course.summary}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-paper-line pt-4 font-mono text-[0.625rem] uppercase tracking-[0.1em]">
                  <div>
                    <dt className="text-ink/65">Duration</dt>
                    <dd className="mt-1 text-ink/80">
                      <Value>{course.duration}</Value>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink/65">Level</dt>
                    <dd className="mt-1 text-ink/80">
                      {levelLabel[course.level]}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-ink/65">Mode</dt>
                    <dd className="mt-1 text-ink/80">
                      {course.modes.map((m) => modeLabel[m]).join(" · ")}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
