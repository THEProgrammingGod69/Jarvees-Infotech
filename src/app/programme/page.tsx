import type { Metadata } from "next";
import CurriculumExplorer from "@/components/CurriculumExplorer";
import PageHero from "@/components/PageHero";
import { Chip, Container, delay, SectionHead, sectionY } from "@/components/ui";
import { certifications, finalYearElectives, internshipTracks, modules, pillars, syllabi } from "@/content/curriculum";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Programme",
  description: `${dept.programme}: the module-by-module curriculum, final-year internship tracks, industry certifications and syllabus downloads.`,
  alternates: { canonical: "/programme" },
};

export default function ProgrammePage() {
  return (
    <>
      <PageHero
        path="programme"
        title="The curriculum, layer by layer."
        intro={
          <p>
            {dept.programme} — a four-year undergraduate programme with an autonomous curriculum, set by the department&apos;s
            own Board of Studies and revised every year to keep pace with the field.
          </p>
        }
      >
        <ul className="flex flex-wrap gap-2">
          <li><Chip tone="cyan">4 years · B.Tech</Chip></li>
          <li><Chip>{dept.intake} seats</Chip></li>
          <li><Chip>Autonomous curriculum</Chip></li>
          <li><Chip>NEP course nomenclature</Chip></li>
          <li><Chip tone="violet">Modules III – VIII</Chip></li>
        </ul>
      </PageHero>

      <section aria-labelledby="explorer" className={sectionY}>
        <Container>
          <SectionHead
            id="explorer"
            index="01"
            label="Curriculum explorer"
            title="Pick a layer. Watch the signal."
            intro="VIT's first year is common to every branch; the department's own structure runs from Module III to Module VIII. Course codes are the institute's own, from the AY 2025–26 Structure & Syllabus."
          />
          <div data-reveal className="mt-12">
            <CurriculumExplorer modules={modules} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="tracks" className={sectionY}>
        <Container>
          <SectionHead
            id="tracks"
            index="02"
            label="Final year"
            title="Two ways to finish."
            intro="In Modules VII and VIII a student either stays on campus for coursework and a major project, or swaps the semester for a 32-hour-a-week internship."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <article data-reveal className="holo border-orbit p-8">
              <p className="label text-cyan">Track A · Coursework</p>
              <h3 className="mt-4 font-display text-display-m text-frost">Generative AI, NLP &amp; a major project</h3>
              <ul className="mt-6 space-y-3 text-body text-haze">
                {["CI4001 · Generative AI", "CI4005 · Natural Language Processing", "CI4008 / CI4016 · Major Project, both semesters", "Swayam MOOCs and LinkedIn Learning electives", "CI4007 · Design Thinking – 7"].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 h-1 w-3 shrink-0 bg-cyan" />
                    {x}
                  </li>
                ))}
              </ul>
            </article>
            <div>
              <p data-reveal className="label text-violet">Track B · Internship semester</p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {internshipTracks.map((t, i) => (
                  <li key={t.name} data-reveal style={delay(i * 80)}>
                    <article data-tilt className="holo h-full p-6">
                      <p className="label text-haze">{t.code}</p>
                      <h3 className="mt-3 text-heading text-frost">{t.name}</h3>
                      <p className="mt-2 text-small text-haze">{t.body}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="pillars" className={sectionY}>
        <Container>
          <SectionHead id="pillars" index="03" label="Through-lines" title="What runs through every module." />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <li key={p.title} data-reveal style={delay(i * 80)}>
                <article className="holo hud-corners h-full p-7">
                  <span className="font-display text-display-l text-gradient">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-heading text-frost">{p.title}</h3>
                  <p className="mt-3 text-small text-haze">{p.body}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="certs" className={sectionY}>
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHead
              id="certs"
              index="04"
              label="Industry certification courses"
              title="IBM, Google, AWS — inside the timetable."
              intro="Multidisciplinary (MD) courses in third year are industry certification tracks."
            />
            <ul data-reveal className="mt-10 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <li key={c}>
                  <Chip tone="cyan">{c}</Chip>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead
              id="electives"
              index="05"
              label="Final-year electives"
              title="Choose your frontier."
              intro="Multidisciplinary electives offered to final-year students."
            />
            <ul data-reveal className="mt-10 flex flex-wrap gap-2">
              {finalYearElectives.map((c) => (
                <li key={c}>
                  <Chip tone="violet">{c}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-labelledby="downloads" className={sectionY}>
        <Container>
          <SectionHead id="downloads" index="06" label="Documents" title="Syllabus downloads." intro="Official PDFs, served from vit.edu." />
          <ul className="mt-12 grid gap-3 md:grid-cols-2">
            {syllabi.map((s, i) => (
              <li key={s.href} data-reveal style={delay((i % 2) * 70)}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="holo group flex items-center justify-between gap-6 p-5"
                >
                  <span className="flex items-center gap-4">
                    <span className="label grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line-bright text-cyan">PDF</span>
                    <span className="text-small font-semibold text-frost">{s.label}</span>
                  </span>
                  <span aria-hidden="true" className="text-haze transition-transform duration-500 group-hover:translate-x-1 group-hover:text-cyan">
                    ↗
                  </span>
                  <span className="sr-only">(PDF, opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
