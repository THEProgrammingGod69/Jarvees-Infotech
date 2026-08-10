import Link from "next/link";
import type { Metadata } from "next";

import ModuleMap from "@/components/ModuleMap";
import Section, { Shell, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import { Cta, MonoLabel, Chip } from "@/components/ui";
import { site, centres, mapsUrl, proofPoints } from "@/lib/site";
import { tracks } from "@/content/types";
import { courses, coursesInTrack } from "@/content/courses";

export const metadata: Metadata = {
  title: "SAP and enterprise technology training in Pune",
  description:
    "Jarvees Academy trains SAP, Salesforce, data science and software engineering in Pune since 2015. Classroom at Narhe and Tilak Road or online, with a live project on every course.",
  alternates: { canonical: "/" },
};

/**
 * Two verbatim public reviews. Attribution is the source only — no invented
 * names, no photographs, no job titles. The first is quoted from the client's
 * public JustDial listing.
 */
const reviews = [
  {
    quote:
      "The course content was up to the mark and the trainer provided was excellent. The live project given to me was effective and added on to what I learnt in the course.",
    source: "Verified review, JustDial",
  },
];

const steps = [
  {
    n: "01",
    title: "Learn the module the way it is configured",
    body: "Sessions run in a live system, not on slides. You make the configuration yourself, post against it, and find out what happens when a setting is wrong — because that is the part an interview asks about.",
  },
  {
    n: "02",
    title: "Build a live project",
    body: "Every course ends in a project scoped to that module: a full procure-to-pay cycle, an order-to-cash process, an automation framework built from an empty repository. You produce the documents a consultant produces.",
  },
  {
    n: "03",
    title: "Prepare for the interview you will actually sit",
    body: "Your resume is built around what you configured and why. Interview practice covers the questions your specific module attracts, and the honest answer to “what did you work on?”",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline pt-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Landscape
            </p>
          </div>

          <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:pl-10 lg:py-20">
            <div className="lg:col-span-5 lg:pt-6">
              <MonoLabel tone="signal">
                Pune · Narhe &amp; Tilak Road · Since {site.founded}
              </MonoLabel>

              <h1 className="mt-6 text-display-xl text-chalk">
                SAP and enterprise technology training in Pune
              </h1>

              <p className="mt-7 max-w-xl text-body-l text-steel">
                Eight SAP modules, Salesforce, data science and software
                engineering — taught in a live system, classroom at either
                centre or online, and ending in a project you can talk through
                line by line.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Cta href="/contact">Send enquiry</Cta>
                <Cta href="/courses" variant="line">
                  Browse {courses.length} courses
                </Cta>
              </div>

              <p className="mt-8 max-w-md text-body-s text-steel">
                Start with the map. Each module is a real part of an SAP system
                and the lines between them are the integrations that actually
                exist.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ModuleMap />
            </div>
          </div>
        </div>
      </Shell>

      {/* --------------------------------------------------------- Proof strip */}
      <div className="border-y border-hairline bg-graphite">
        <Shell>
          <ul className="grid divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
            {proofPoints.map((point, i) => (
              <li
                key={point.label}
                className={`py-5 lg:px-6 ${i === 0 ? "lg:pl-0" : ""} ${
                  i === proofPoints.length - 1 ? "lg:pr-0" : ""
                }`}
              >
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  {point.label}
                </p>
                <p className="mt-1.5 text-body-s text-chalk tnum">
                  {point.value}
                </p>
              </li>
            ))}
          </ul>
        </Shell>
      </div>

      {/* -------------------------------------------------------------- Tracks */}
      <Section index="02" label="Catalogue" bleed>
        <Reveal>
          <SectionHeading
            title="Four tracks"
            standfirst="The catalogue is organised the way the work is organised. SAP is the flagship and has the most depth; the other three tracks are taught to the same standard and with the same live-project model."
          />
        </Reveal>

        <div className="mt-12 grid gap-px bg-hairline md:grid-cols-2">
          {tracks.map((track) => {
            const trackCourses = coursesInTrack(track.id);
            return (
              <Link
                key={track.id}
                href={`/courses?track=${track.id}`}
                className="group flex flex-col justify-between gap-8 bg-ink p-6 transition-colors duration-(--duration-fast) hover:bg-graphite sm:p-8"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-display-m text-chalk">{track.name}</h3>
                    <span className="font-mono text-mono-label uppercase text-steel">
                      {track.code}
                    </span>
                  </div>
                  <p className="mt-4 max-w-md text-body-s text-steel">
                    {track.description}
                  </p>
                </div>

                <div>
                  <ul className="flex flex-wrap gap-1.5">
                    {trackCourses.map((course) => (
                      <li key={course.slug}>
                        <Chip>{course.moduleCode ?? course.name}</Chip>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 font-mono text-mono-label uppercase text-chalk">
                    <span className="tnum">
                      {String(trackCourses.length).padStart(2, "0")}
                    </span>
                    <span className="mx-2 text-steel">
                      {trackCourses.length === 1 ? "course" : "courses"}
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-(--duration-fast) group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ------------------------------------------------------- How you learn */}
      <Section index="03" label="Method">
        <Reveal>
          <SectionHeading
            title="How you learn here"
            standfirst="Three steps, and the third is the one that gets people hired."
          />
        </Reveal>

        <ol className="mt-12 grid gap-px bg-hairline lg:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="bg-ink p-6 sm:p-8">
              <p className="font-mono text-mono-label uppercase text-signal tnum">
                {step.n}
              </p>
              <h3 className="mt-5 text-heading text-chalk">{step.title}</h3>
              <p className="mt-3 text-body-s text-steel">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Cta href="/live-projects" variant="line">
            How live projects work
          </Cta>
        </div>
      </Section>

      {/* ------------------------------------------------------- Delivery mode */}
      <Section index="04" label="Delivery">
        <Reveal>
          <SectionHeading
            title="Classroom or online"
            standfirst="Every course runs in both modes. They are genuinely different experiences, so here is the honest comparison rather than the sales one."
          />
        </Reveal>

        <div className="mt-12 grid gap-px bg-hairline lg:grid-cols-2">
          <div className="bg-ink p-6 sm:p-8">
            <h3 className="text-heading text-chalk">Classroom</h3>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Narhe · Tilak Road
            </p>
            <ul className="mt-6 space-y-3 text-body-s text-steel">
              <li>
                Best if you learn faster with someone beside you, or if you know
                you will not keep up a routine on your own.
              </li>
              <li>
                You are in a room with people at the same stage, which turns out
                to matter more than most people expect.
              </li>
              <li>
                Requires the travel. Narhe suits the Dhayari, Katraj and Navale
                Bridge side; Tilak Road suits central Pune.
              </li>
              <li>
                Batch timings are arranged around working hours where possible —
                ask when you enquire.
              </li>
            </ul>
          </div>

          <div className="bg-ink p-6 sm:p-8">
            <h3 className="text-heading text-chalk">Online</h3>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Live sessions
            </p>
            <ul className="mt-6 space-y-3 text-body-s text-steel">
              <li>
                Sessions are live and taught, not recorded videos you work
                through alone.
              </li>
              <li>
                Suits working professionals, anyone outside Pune, and people
                whose shift pattern rules out a fixed classroom slot.
              </li>
              <li>
                You get the same system access and the same live project. The
                project is not reduced for online learners.
              </li>
              <li>
                Needs a stable connection and the discipline to attend. That is
                the real trade-off, and it is worth being honest about it.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- Reviews */}
      <Section index="05" label="Reviews" tone="graphite">
        <Reveal>
          <SectionHeading
            title="What people have said publicly"
            standfirst="Quoted from the academy's public listings, word for word. We do not publish testimonials with names or photographs attached, because we cannot verify them for you."
          />
        </Reveal>

        <div className="mt-12 grid gap-px bg-hairline lg:grid-cols-2">
          {reviews.map((review) => (
            <figure key={review.source} className="bg-graphite p-6 sm:p-8">
              <blockquote className="text-body-l text-chalk">
                <p>“{review.quote}”</p>
              </blockquote>
              <figcaption className="mt-6 font-mono text-mono-label uppercase text-steel">
                {review.source}
              </figcaption>
            </figure>
          ))}

          <div className="bg-graphite p-6 sm:p-8">
            <p className="font-mono text-mono-label uppercase text-steel">
              Public rating
            </p>
            <p className="mt-4 font-display text-display-l text-chalk tnum">
              {site.rating.value}
              <span className="text-steel"> / 5</span>
            </p>
            <p className="mt-3 text-body-s text-steel">
              From {site.rating.count} ratings on {site.rating.source}. That is
              the whole figure — we have not selected the good ones.
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- Centres */}
      <Section index="06" label="Centres">
        <Reveal>
          <SectionHeading
            title="Two centres in Pune"
            standfirst="Both run the full catalogue. Choose whichever you can reach reliably after work — attendance is the single biggest predictor of finishing."
          />
        </Reveal>

        <div className="mt-12 grid gap-px bg-hairline lg:grid-cols-2">
          {centres.map((centre) => (
            <div key={centre.id} className="bg-ink p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-heading text-chalk">{centre.name}</h3>
                {centre.isPrimary && (
                  <span className="font-mono text-mono-label uppercase text-signal">
                    Primary
                  </span>
                )}
              </div>

              <address className="mt-4 not-italic text-body-s text-steel">
                {centre.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="block">
                  {centre.locality} {centre.postalCode}, {centre.region}
                </span>
              </address>

              <ul className="mt-5 space-y-1.5">
                {centre.landmarks.map((landmark) => (
                  <li
                    key={landmark}
                    className="text-body-s text-steel"
                  >
                    {landmark}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={`tel:${centre.phoneHref}`}
                  className="font-mono text-mono-label text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
                >
                  {centre.phoneDisplay}
                </a>
                <a
                  href={mapsUrl(centre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-mono-label uppercase text-steel transition-colors hover:text-chalk"
                >
                  Directions ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Cta href="/centres" variant="line">
            Centre details and travel notes
          </Cta>
        </div>
      </Section>

      {/* ------------------------------------------------------------- Enquiry */}
      <Section index="07" label="Enquiry" tone="graphite">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              title="Tell us where you are starting from"
              standfirst="The useful conversation is a short one about your background and what you are aiming at. We will tell you honestly which course fits, and if none of them does, we will say that too."
            />
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="/contact">Send enquiry</Cta>
              <Cta href="/corporate-training" variant="line">
                Corporate training
              </Cta>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-hairline p-6">
              <MonoLabel>Call either centre</MonoLabel>
              <ul className="mt-4 space-y-4">
                {centres.map((centre) => (
                  <li key={centre.id}>
                    <p className="font-mono text-mono-label uppercase text-steel">
                      {centre.shortName}
                    </p>
                    <a
                      href={`tel:${centre.phoneHref}`}
                      className="mt-1 block font-display text-heading text-chalk transition-colors hover:text-signal"
                    >
                      {centre.phoneDisplay}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-hairline pt-4 text-body-s text-steel">
                Open {site.hours}.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-3 block break-all text-body-s text-steel underline decoration-steel-dim underline-offset-4 transition-colors hover:text-chalk"
              >
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
