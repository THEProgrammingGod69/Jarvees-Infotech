import Link from "next/link";
import type { Metadata } from "next";

import ModuleMap from "@/components/ModuleMap";
import Section, { Shell, SectionHeading } from "@/components/Section";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Counter,
  Scramble,
  Spotlight,
  Magnetic,
  Parallax,
  Marquee,
  RatingBar,
} from "@/components/motion";
import { Rise, RiseText } from "@/components/motion/Rise";
import {
  AuroraBackdrop,
  BlueprintGrid,
  EdgeSweep,
  CornerMarks,
} from "@/components/visual/Ambient";
import { Cta, MonoLabel, Chip } from "@/components/ui";
import { faqSchema, homeFaqs } from "@/lib/faq";
import { site, centres, mapsUrl } from "@/lib/site";
import { tracks } from "@/content/types";
import { courses, coursesInTrack } from "@/content/courses";
import { nodes } from "@/content/landscape";

export const metadata: Metadata = {
  title: "SAP and enterprise technology training in Pune",
  description:
    "Jarvees Academy trains SAP, Salesforce, data science and software engineering in Pune since 2015. Classroom at Narhe and Tilak Road or online, with a live project on every course.",
  alternates: { canonical: "/" },
};

/**
 * Verbatim public review. Attribution is the source only — no invented name,
 * no photograph, no job title.
 */
const review = {
  quote:
    "The course content was up to the mark and the trainer provided was excellent. The live project given to me was effective and added on to what I learnt in the course.",
  source: "Verified review, JustDial",
};

const steps = [
  {
    n: "01",
    title: "Learn the module the way it is configured",
    body: "Sessions run in a live system, not on slides. You make the configuration yourself, post against it, and find out what happens when a setting is wrong — because that is the part an interview asks about.",
    detail: "In a live system",
  },
  {
    n: "02",
    title: "Build a live project",
    body: "Every course ends in a project scoped to that module: a full procure-to-pay cycle, an order-to-cash process, an automation framework built from an empty repository. You produce the documents a consultant produces.",
    detail: "Scoped to your module",
  },
  {
    n: "03",
    title: "Prepare for the interview you will actually sit",
    body: "Your resume is built around what you configured and why. Interview practice covers the questions your specific module attracts, and the honest answer to “what did you work on?”",
    detail: "Resume and rehearsal",
  },
];

/**
 * Every figure here is verifiable, and each one is a *count* — a quantity that
 * reads naturally when it ticks up from zero.
 *
 * The rating is deliberately not among them. A counter run at 4.5 displays
 * "4.4 / 5" for most of a second on its way, and an almost-right rating is a
 * wrong claim, briefly. Precise figures in a narrow range are stated; only
 * quantities are animated.
 */
const figures = [
  { value: site.founded, label: "Teaching since", sub: "Two centres in Pune" },
  { value: courses.length, label: "Courses", sub: "Across four tracks" },
  { value: nodes.length, label: "SAP modules", sub: "FICO through to Basis" },
  {
    value: site.rating.count,
    label: "Public ratings",
    sub: `${site.rating.value} out of 5 on ${site.rating.source}`,
  },
];

const differentiators = [
  {
    title: "You configure, we do not demonstrate",
    body: "It is quicker to show fifteen people a setting than to watch them attempt it. It is also useless. You make the settings and you meet the errors.",
  },
  {
    title: "A live project on every course",
    body: "Not a case study and not a walkthrough. A scoped piece of work you complete yourself, that breaks in the middle, and that you then document.",
  },
  {
    title: "Trainers still on projects",
    body: "Enterprise software changes underneath its documentation. The people teaching here are working on current systems, not reciting a four-year-old syllabus.",
  },
  {
    title: "Both modes, same project",
    body: "Online learners get the same system access and the same live project. The online course is not a reduced version of the classroom one.",
  },
  {
    title: "Open 9 to 9, all seven days",
    body: "Most people here are fitting study around a job. A centre that closes at six is no use to them, so ours do not.",
  },
  {
    title: "We will tell you the wrong course is wrong",
    body: "Sometimes the course you asked about is not the one that suits you. Saying so costs us an enrolment and earns a recommendation.",
  },
];

export default function Home() {
  const marqueeItems = [
    ...nodes.map((n) => n.code),
    "SALESFORCE",
    "PYTHON",
    "SELENIUM",
    "TESTNG",
    "JAVA",
    "C#",
    "C++",
    "SQL",
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <div className="relative overflow-hidden">
        <AuroraBackdrop />
        <BlueprintGrid />

        <Shell>
          <div className="rail-grid">
            <div className="relative hidden border-r border-hairline pt-16 pr-6 lg:block">
              <Rise delay={100}>
                <p className="font-mono text-mono-label uppercase text-steel tnum">
                  01
                </p>
                <p className="mt-2 font-mono text-mono-label uppercase text-steel">
                  <Scramble text="Landscape" />
                </p>
              </Rise>
            </div>

            <div className="grid gap-14 py-14 lg:grid-cols-12 lg:gap-10 lg:py-24 lg:pl-10">
              <div className="lg:col-span-5 lg:pt-4">
                <Rise delay={40} className="inline-block">
                  <span className="inline-flex items-center gap-2.5 border border-hairline bg-graphite/70 px-3 py-1.5 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                    </span>
                    <span className="font-mono text-mono-label uppercase text-steel">
                      Pune · Narhe &amp; Tilak Road · Since {site.founded}
                    </span>
                  </span>
                </Rise>

                <RiseText
                  text="SAP and enterprise technology training in Pune"
                  className="mt-7 text-display-xl text-chalk"
                  delay={140}
                />

                {/* Short delay on purpose: this paragraph is the page's
                    largest-contentful element, so anything that keeps it
                    invisible is paid for directly in LCP. */}
                <Rise delay={220}>
                  <p className="mt-7 max-w-xl text-body-l text-steel">
                    Eight SAP modules, Salesforce, data science and software
                    engineering — taught in a live system, classroom at either
                    centre or online, and ending in a project you can talk
                    through line by line.
                  </p>
                </Rise>

                <Rise delay={340}>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Magnetic>
                      <Cta href="/contact">Send enquiry</Cta>
                    </Magnetic>
                    <Magnetic>
                      <Cta href="/courses" variant="line">
                        Browse {courses.length} courses
                      </Cta>
                    </Magnetic>
                  </div>
                </Rise>

                <Rise delay={440}>
                  <p className="mt-9 max-w-md border-l border-signal/40 pl-4 text-body-s text-steel">
                    Start with the map. Each module is a real part of an SAP
                    system, and the lines between them are the integrations that
                    actually exist.
                  </p>
                </Rise>
              </div>

              <div className="relative lg:col-span-7">
                <ModuleMap />
              </div>
            </div>
          </div>
        </Shell>

        <EdgeSweep className="bottom-0" />
      </div>

      {/* -------------------------------------------------------- Course ticker */}
      <div className="relative border-y border-hairline bg-graphite py-4">
        <Marquee items={marqueeItems} speed={54} />
        {/* Fade the track into the page edges so it reads as continuous. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-graphite to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-graphite to-transparent"
        />
      </div>

      {/* --------------------------------------------------------- Proof figures */}
      <div className="relative overflow-hidden border-b border-hairline">
        <BlueprintGrid fade="center" className="opacity-30" />
        <Shell>
          <Stagger className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" as="ul">
            {figures.map((f) => (
              <StaggerItem key={f.label} as="li" className="py-10 lg:px-8">
                <p className="font-display text-display-l text-chalk">
                  <Counter to={f.value} />
                </p>
                <p className="mt-3 font-mono text-mono-label uppercase text-signal">
                  {f.label}
                </p>
                <p className="mt-1.5 text-body-s text-steel">{f.sub}</p>
              </StaggerItem>
            ))}
          </Stagger>
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

        <Stagger className="mt-14 grid gap-px bg-hairline md:grid-cols-2" as="ul">
          {tracks.map((track) => {
            const trackCourses = coursesInTrack(track.id);
            return (
              <StaggerItem key={track.id} as="li">
                <Spotlight className="h-full bg-ink">
                  <Link
                    href={`/courses?track=${track.id}`}
                    className="group flex h-full flex-col justify-between gap-8 p-6 transition-colors duration-(--duration-base) hover:bg-graphite sm:p-8"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-display-m text-chalk">
                          {track.name}
                        </h3>
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
                      <p className="mt-6 font-mono text-mono-label uppercase text-chalk">
                        <span className="tnum">
                          {String(trackCourses.length).padStart(2, "0")}
                        </span>
                        <span className="mx-2 text-steel">
                          {trackCourses.length === 1 ? "course" : "courses"}
                        </span>
                        <span
                          aria-hidden="true"
                          className="inline-block transition-transform duration-(--duration-base) group-hover:translate-x-1.5"
                        >
                          →
                        </span>
                      </p>
                    </div>
                  </Link>
                </Spotlight>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {/* ------------------------------------------------------- How you learn */}
      <Section index="03" label="Method">
        <Reveal>
          <SectionHeading
            title="How you learn here"
            standfirst="Three steps, and the third is the one that gets people hired."
          />
        </Reveal>

        <Stagger className="mt-14 grid gap-px bg-hairline lg:grid-cols-3" as="ol">
          {steps.map((step) => (
            <StaggerItem key={step.n} as="li">
              <Spotlight className="h-full bg-ink p-6 sm:p-8">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-mono-label uppercase text-signal tnum">
                    {step.n}
                  </p>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                    {step.detail}
                  </p>
                </div>
                <div className="rule-fade mt-5" />
                <h3 className="mt-5 text-heading text-chalk">{step.title}</h3>
                <p className="mt-3 text-body-s text-steel">{step.body}</p>
              </Spotlight>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <Magnetic>
              <Cta href="/live-projects" variant="line">
                How live projects work
              </Cta>
            </Magnetic>
          </div>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------ Differentiators */}
      <Section index="04" label="Why here" tone="graphite">
        <Reveal>
          <SectionHeading
            title="What is different about learning here"
            standfirst="Six things, all of them checkable. None of them is a number we cannot evidence."
          />
        </Reveal>

        <Stagger className="mt-14 grid gap-px bg-hairline md:grid-cols-2 lg:grid-cols-3" as="ul">
          {differentiators.map((item, i) => (
            <StaggerItem key={item.title} as="li">
              <Spotlight className="h-full bg-graphite p-6 sm:p-7">
                <p className="font-mono text-mono-label uppercase text-steel tnum">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-heading text-chalk">{item.title}</h3>
                <p className="mt-3 text-body-s text-steel">{item.body}</p>
              </Spotlight>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* ------------------------------------------------------- Delivery modes */}
      <Section index="05" label="Delivery">
        <Reveal>
          <SectionHeading
            title="Classroom or online"
            standfirst="Every course runs in both modes. They are genuinely different experiences, so here is the honest comparison rather than the sales one."
          />
        </Reveal>

        <div className="mt-14 grid gap-px bg-hairline lg:grid-cols-2">
          {[
            {
              title: "Classroom",
              label: "Narhe · Tilak Road",
              points: [
                "Best if you learn faster with someone beside you, or if you know you will not keep up a routine on your own.",
                "You are in a room with people at the same stage, which turns out to matter more than most people expect.",
                "Requires the travel. Narhe suits the Dhayari, Katraj and Navale Bridge side; Tilak Road suits central Pune.",
                "Batch timings are arranged around working hours where possible — ask when you enquire.",
              ],
            },
            {
              title: "Online",
              label: "Live sessions",
              points: [
                "Sessions are live and taught, not recorded videos you work through alone.",
                "Suits working professionals, anyone outside Pune, and people whose shift pattern rules out a fixed classroom slot.",
                "You get the same system access and the same live project. The project is not reduced for online learners.",
                "Needs a stable connection and the discipline to attend. That is the real trade-off, and it is worth being honest about it.",
              ],
            },
          ].map((mode, i) => (
            <Reveal key={mode.title} delay={i * 0.08}>
              <Spotlight className="h-full bg-ink p-6 sm:p-8">
                <h3 className="text-display-m text-chalk">{mode.title}</h3>
                <p className="mt-2 font-mono text-mono-label uppercase text-steel">
                  {mode.label}
                </p>
                <ul className="mt-7 space-y-4">
                  {mode.points.map((point) => (
                    <li
                      key={point}
                      className="border-l border-steel-dim pl-4 text-body-s text-steel"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- Reviews */}
      <Section index="06" label="Reviews" tone="graphite">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <MonoLabel tone="signal">
                <Scramble text="Verified, word for word" />
              </MonoLabel>
              <figure className="mt-7">
                <blockquote>
                  <p className="text-display-m text-chalk">“{review.quote}”</p>
                </blockquote>
                <figcaption className="mt-6 font-mono text-mono-label uppercase text-steel">
                  {review.source}
                </figcaption>
              </figure>
              <p className="mt-8 max-w-xl text-body-s text-steel">
                We do not publish testimonials with names or photographs
                attached, because we cannot verify them for you. What is here is
                quoted from the academy&rsquo;s public listings.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.12}>
              <Spotlight className="relative border border-hairline p-8">
                <CornerMarks />
                <p className="font-mono text-mono-label uppercase text-steel">
                  Public rating
                </p>
                {/* Stated, not counted — see the note on `figures` above. */}
                <p className="mt-5 font-display text-display-xl text-chalk tnum">
                  {site.rating.value}
                  <span className="text-steel"> / 5</span>
                </p>
                <RatingBar value={site.rating.value} />
                <p className="mt-5 text-body-s text-steel">
                  From{" "}
                  <Counter to={site.rating.count} className="text-chalk" />{" "}
                  ratings on {site.rating.source}. That is the whole figure — we
                  have not selected the good ones.
                </p>
              </Spotlight>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- Centres */}
      <Section index="07" label="Centres">
        <Reveal>
          <SectionHeading
            title="Two centres in Pune"
            standfirst="Both run the full catalogue. Choose whichever you can reach reliably after work — attendance is the single biggest predictor of finishing."
          />
        </Reveal>

        <div className="mt-14 grid gap-px bg-hairline lg:grid-cols-2">
          {centres.map((centre, i) => (
            <Reveal key={centre.id} delay={i * 0.08}>
              <Spotlight className="h-full bg-ink p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-display-m text-chalk">{centre.name}</h3>
                  {centre.isPrimary && (
                    <span className="shrink-0 border border-signal/40 bg-signal/10 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-signal">
                      Primary
                    </span>
                  )}
                </div>

                <address className="mt-5 not-italic text-body-s text-steel">
                  {centre.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="block">
                    {centre.locality} {centre.postalCode}, {centre.region}
                  </span>
                </address>

                <ul className="mt-6 space-y-2">
                  {centre.landmarks.map((landmark) => (
                    <li
                      key={landmark}
                      className="border-l border-steel-dim pl-4 text-body-s text-steel"
                    >
                      {landmark}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
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
              </Spotlight>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <Magnetic>
              <Cta href="/centres" variant="line">
                Centre details and travel notes
              </Cta>
            </Magnetic>
          </div>
        </Reveal>
      </Section>

      {/* ----------------------------------------------------------------- FAQ */}
      <Section index="08" label="Questions" tone="graphite">
        <Reveal>
          <SectionHeading
            title="The questions people actually ask"
            standfirst="Answered straight, including the ones where the honest answer is not the one that sells best."
          />
        </Reveal>
        <Faq items={homeFaqs} className="mt-12" />
      </Section>

      {/* ------------------------------------------------------------- Enquiry */}
      <div className="relative overflow-hidden border-t border-hairline">
        <AuroraBackdrop intensity={1.3} />
        <BlueprintGrid fade="top" />
        <Shell>
          <div className="rail-grid">
            <div className="hidden border-r border-hairline py-section pr-6 lg:block">
              <p className="font-mono text-mono-label uppercase text-steel tnum">
                09
              </p>
              <p className="mt-2 font-mono text-mono-label uppercase text-steel">
                Enquiry
              </p>
            </div>

            <div className="grid gap-12 py-section lg:grid-cols-12 lg:pl-10">
              <div className="lg:col-span-7">
                <Parallax distance={22}>
                  <Reveal>
                    <h2 className="text-display-l text-lit">
                      Tell us where you are starting from
                    </h2>
                    <p className="mt-6 max-w-2xl text-body-l text-steel">
                      The useful conversation is a short one about your
                      background and what you are aiming at. We will tell you
                      honestly which course fits, and if none of them does, we
                      will say that too.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                      <Magnetic>
                        <Cta href="/contact">Send enquiry</Cta>
                      </Magnetic>
                      <Magnetic>
                        <Cta href="/corporate-training" variant="line">
                          Corporate training
                        </Cta>
                      </Magnetic>
                    </div>
                  </Reveal>
                </Parallax>
              </div>

              <div className="lg:col-span-5">
                <Reveal delay={0.12}>
                  <div className="relative border border-hairline bg-graphite/60 p-6 backdrop-blur-sm">
                    <CornerMarks />
                    <MonoLabel>Call either centre</MonoLabel>
                    <ul className="mt-5 space-y-5">
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
                    <div className="rule-fade my-6" />
                    <p className="text-body-s text-steel">
                      Open {site.hours}.
                    </p>
                    <a
                      href={`mailto:${site.email}`}
                      className="mt-3 block break-all text-body-s text-steel underline decoration-steel-dim underline-offset-4 transition-colors hover:text-chalk"
                    >
                      {site.email}
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Shell>
      </div>

      <JsonLd id="schema-home-faq" data={faqSchema(homeFaqs)} />
    </>
  );
}
