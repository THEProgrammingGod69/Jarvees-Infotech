import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import EnquiryForm from "@/components/EnquiryForm";
import JsonLd from "@/components/JsonLd";
import Section, { Shell, SectionHeading } from "@/components/Section";
import { Cta, MonoLabel, Chip, Value, isToken } from "@/components/ui";
import { courses, getCourse, relatedCourses } from "@/content/courses";
import {
  levelLabel,
  modeLabel,
  trackById,
  whatYouReceive,
  sapCertificationNote,
} from "@/content/types";
import { courseSchema, breadcrumbSchema } from "@/lib/jsonld";
import { nodeForSlug } from "@/content/landscape";
import { site, centres } from "@/lib/site";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return { title: "Course not found" };

  return {
    title: `${course.name} course in Pune`,
    description: course.metaDescription,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: `${course.name} course in Pune — Jarvees Academy`,
      description: course.metaDescription,
      url: `/courses/${course.slug}`,
      type: "article",
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const track = trackById(course.track);
  const related = relatedCourses(course);
  const node = nodeForSlug(course.slug);
  const isSap = course.track === "sap";

  return (
    <>
      {/* ------------------------------------------------------------- Header */}
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline py-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Course
            </p>
          </div>

          <div className="py-14 lg:pl-10">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 font-mono text-mono-label uppercase text-steel">
                <li>
                  <Link href="/" className="transition-colors hover:text-chalk">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/courses"
                    className="transition-colors hover:text-chalk"
                  >
                    Courses
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/courses?track=${track.id}`}
                    className="transition-colors hover:text-chalk"
                  >
                    {track.name}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {course.moduleCode && (
                <span className="border border-signal/40 bg-signal/10 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-signal">
                  {course.moduleCode}
                </span>
              )}
              <MonoLabel>{track.name}</MonoLabel>
            </div>

            <h1 className="mt-5 max-w-4xl text-display-xl text-chalk">
              {course.name}
            </h1>
            <p className="mt-6 max-w-2xl text-body-l text-steel">
              {course.summary}
            </p>

            {/* The spec row. Mono is the native register for this data. */}
            <dl className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-graphite p-4">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  Duration
                </dt>
                <dd className="mt-1.5 font-mono text-body-s text-chalk">
                  <Value>{course.duration}</Value>
                </dd>
              </div>
              <div className="bg-graphite p-4">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  Mode
                </dt>
                <dd className="mt-1.5 font-mono text-body-s text-chalk">
                  {course.modes.map((m) => modeLabel[m]).join(" · ")}
                </dd>
              </div>
              <div className="bg-graphite p-4">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  Level
                </dt>
                <dd className="mt-1.5 font-mono text-body-s text-chalk">
                  {levelLabel[course.level]}
                </dd>
              </div>
              <div className="bg-graphite p-4">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  Batch timings
                </dt>
                <dd className="mt-1.5 font-mono text-body-s text-chalk">
                  <Value>{course.batchTimings}</Value>
                </dd>
              </div>
            </dl>

            {(isToken(course.duration) || isToken(course.batchTimings)) && (
              <p className="mt-3 text-body-s text-steel">
                Duration and batch timings depend on the batch you join and on
                whether you take it online or in the classroom. Ask us and you
                will get the actual dates for the next batch.
              </p>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="#enquire">Enquire about {course.name}</Cta>
              <Cta href="/courses" variant="line">
                All courses
              </Cta>
            </div>
          </div>
        </div>
      </Shell>

      {/* ----------------------------------------------------------- Overview */}
      <Section index="02" label="Overview">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading title="What this course is" />
            <div className="mt-8 space-y-5">
              {course.overview.map((paragraph) => (
                <p key={paragraph} className="text-body-l text-steel">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-hairline bg-graphite p-6">
              <MonoLabel>Who it is for</MonoLabel>
              <ul className="mt-5 space-y-4">
                {course.whoFor.map((who) => (
                  <li
                    key={who}
                    className="border-l border-steel-dim pl-4 text-body-s text-steel"
                  >
                    {who}
                  </li>
                ))}
              </ul>
            </div>

            {course.codes && course.codes.length > 0 && (
              <div className="mt-px border border-hairline bg-graphite p-6">
                <MonoLabel>You will work in</MonoLabel>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {course.codes.map((code) => (
                    <li key={code}>
                      <Chip>{code}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- Curriculum */}
      <Section index="03" label="Curriculum">
        <SectionHeading
          title="Curriculum"
          standfirst={
            course.depth === "full"
              ? "Module by module. Expand any section to see what is actually covered inside it."
              : "The shape of the course. A full module-by-module outline for this one is available on request — ask when you enquire and we will send it."
          }
        />

        <div className="mt-10 border border-hairline">
          {course.curriculum.map((module, i) => (
            <details
              key={module.title}
              // Native disclosure: keyboard accessible, works without
              // JavaScript, and announces its own state to a screen reader.
              // A custom accordion would be worse in all three respects.
              open={i === 0}
              className="group border-b border-hairline last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-baseline gap-4 p-5 transition-colors duration-(--duration-fast) hover:bg-graphite sm:p-6 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-mono-label text-steel tnum">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-heading text-chalk">
                  {module.title}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 font-mono text-mono-label text-steel transition-transform duration-(--duration-fast) group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <ul className="space-y-2.5 border-t border-hairline bg-graphite px-5 py-5 sm:px-6 sm:pl-16">
                {module.topics.map((topic) => (
                  <li key={topic} className="text-body-s text-steel">
                    {topic}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- Live project */}
      <Section index="04" label="Live project" tone="graphite">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <MonoLabel tone="signal">The differentiator</MonoLabel>
            <h2 className="mt-5 text-display-l text-chalk">
              {course.liveProject.title}
            </h2>
            <p className="mt-6 text-body-l text-steel">
              {course.liveProject.description}
            </p>
            <div className="mt-8">
              <Cta href="/live-projects" variant="line">
                How live projects work
              </Cta>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-hairline p-6">
              <MonoLabel>What you end up with</MonoLabel>
              <ul className="mt-5 space-y-4">
                {course.liveProject.artefacts.map((artefact, i) => (
                  <li key={artefact} className="flex gap-4">
                    <span className="font-mono text-mono-label text-steel tnum">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-body-s text-steel">{artefact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------- Prerequisites */}
      <Section index="05" label="Prerequisites">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              title="What you need before you start"
              standfirst="Told straight, including where a course is genuinely harder without a particular background. It is better to know that now than four weeks in."
            />
          </div>
          <div className="lg:col-span-6">
            <ul className="space-y-5">
              {course.prerequisites.map((item) => (
                <li
                  key={item}
                  className="border-l border-steel-dim pl-5 text-body-l text-steel"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------- What you receive */}
      <Section index="06" label="On completion">
        <SectionHeading
          title="What you receive"
          standfirst="Four things, described exactly. Nothing here is a guarantee of employment, and any institute that offers you one is not telling you the truth."
        />

        <ul className="mt-10 grid gap-px bg-hairline md:grid-cols-2">
          {whatYouReceive.map((item) => (
            <li key={item.title} className="bg-ink p-6">
              <h3 className="text-heading text-chalk">{item.title}</h3>
              <p className="mt-3 text-body-s text-steel">{item.body}</p>
            </li>
          ))}
        </ul>

        {isSap && (
          <div className="mt-10 border border-signal/30 bg-signal/5 p-6 sm:p-8">
            <MonoLabel tone="signal">Important</MonoLabel>
            <h3 className="mt-4 text-heading text-chalk">
              {sapCertificationNote.heading}
            </h3>
            <div className="mt-4 max-w-3xl space-y-3">
              {sapCertificationNote.body.map((paragraph) => (
                <p key={paragraph} className="text-body-s text-steel">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 max-w-3xl text-body-s text-steel">
          Roles this course maps to in the market:{" "}
          {course.roles.join(", ")}. That is what employers advertise for, not a
          promise of what you will be offered.
        </p>
      </Section>

      {/* ------------------------------------------------------------ Enquiry */}
      <Section index="07" label="Enquiry" tone="graphite" id="enquire">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              title={`Enquire about ${course.name}`}
              standfirst="Tell us your background and we will tell you honestly whether this is the right course for you, what the next batch looks like, and what it costs."
            />
            <div className="mt-8 border border-hairline p-6">
              <MonoLabel>Or call either centre</MonoLabel>
              <ul className="mt-4 space-y-3">
                {centres.map((centre) => (
                  <li
                    key={centre.id}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="font-mono text-mono-label uppercase text-steel">
                      {centre.shortName}
                    </span>
                    <a
                      href={`tel:${centre.phoneHref}`}
                      className="font-mono text-body-s text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
                    >
                      {centre.phoneDisplay}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-hairline pt-4 text-body-s text-steel">
                Both centres run this course, and it is available online. Open{" "}
                {site.hours}.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <EnquiryForm variant="course" courseName={course.name} />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Related */}
      {related.length > 0 && (
        <Section index="08" label="Related">
          <SectionHeading
            title="What this connects to"
            standfirst={
              node
                ? "These are not a random selection. They are the modules this one actually integrates with in a real SAP system — the same connections drawn on the map on the home page."
                : "Courses that pair well with this one, either because the skills overlap or because they are commonly taken together."
            }
          />

          <ul className="mt-10 grid gap-px bg-hairline md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="bg-ink">
                <Link
                  href={`/courses/${item.slug}`}
                  className="group flex h-full flex-col justify-between gap-6 p-6 transition-colors duration-(--duration-fast) hover:bg-graphite"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-heading text-chalk">{item.name}</h3>
                      {item.moduleCode && (
                        <span className="shrink-0 font-mono text-mono-label text-steel">
                          {item.moduleCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-body-s text-steel">
                      {item.summary}
                    </p>
                  </div>
                  <span className="font-mono text-mono-label uppercase text-chalk">
                    View course{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-(--duration-fast) group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <JsonLd id={`schema-course-${course.slug}`} data={courseSchema(course)} />
      <JsonLd
        id={`schema-breadcrumb-${course.slug}`}
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: course.name, path: `/courses/${course.slug}` },
        ])}
      />
    </>
  );
}
