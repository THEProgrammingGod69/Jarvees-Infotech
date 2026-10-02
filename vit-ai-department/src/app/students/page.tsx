import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Button, Chip, Container, delay, SectionHead, sectionY } from "@/components/ui";
import { achievements, codeApex3 } from "@/content/events";
import { socialActivities, testimonials } from "@/content/people";
import { studentInnovations } from "@/content/research";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Students",
  description: `Student life in ${dept.short}, VIT Pune — the AI Students' Forum, hackathons, social-impact work and student patents.`,
  alternates: { canonical: "/students" },
};

const beyondCode = achievements.filter((a) => a.title.startsWith("National Defence Academy"));

export default function StudentsPage() {
  return (
    <>
      <PageHero
        path="students"
        title="Life inside the network."
        intro={
          <p>
            Clubs that run national hackathons, second-years filing patents, NSS camps and clean-up drives — and a student forum,
            founded in 2025, that now runs the department&apos;s flagship hackathon.
          </p>
        }
      />

      <section aria-labelledby="aisf" className={sectionY}>
        <Container className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHead
              id="aisf"
              index="01"
              label="Student forum"
              title="AISF — the AI Students' Forum."
              intro="The department's technical club. AISF co-hosted Code Verse in September 2025 — 240+ teams, nearly half of them from other colleges — and presents CODE APEX, now in its third edition."
            />
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <Button href={dept.socials.aisf} external>
                AISF on LinkedIn
              </Button>
              <Button href="/events" variant="ghost">
                {codeApex3.name}
              </Button>
            </div>
          </div>
          <ul data-reveal className="grid grid-cols-2 gap-4">
            {[
              ["240+", "teams at Code Verse 2025"],
              ["48%", "of Code Verse teams from other colleges"],
              ["₹2L+", `${codeApex3.name} prize pool`],
              ["24 h", "offline Grand Finale"],
            ].map(([v, k], i) => (
              <li key={k} className="holo hud-corners p-6" style={delay(i * 80)}>
                <p className="font-display text-display-l text-gradient">{v}</p>
                <p className="mt-2 text-small text-haze">{k}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="voices" className={sectionY}>
        <Container>
          <SectionHead id="voices" index="02" label="Students' speak" title="Heard in the corridors." />
          <ul className="mt-14 space-y-5">
            {testimonials.map((t, i) => (
              <li key={t.name} data-reveal style={delay(i * 80)}>
                <figure className={`holo grid gap-6 p-8 md:grid-cols-[12rem_1fr] md:p-10 ${i % 2 ? "md:ml-[8%]" : "md:mr-[8%]"}`}>
                  <figcaption>
                    <p className="text-heading text-frost">{t.name}</p>
                    <p className="label mt-1 text-cyan">{t.programme}</p>
                  </figcaption>
                  <blockquote className="font-display text-display-m text-frost/90">“{t.quote}”</blockquote>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="impact" className={sectionY}>
        <Container>
          <SectionHead
            id="impact"
            index="03"
            label="Social impact"
            title="Engineers, and citizens."
            intro="Community and social-service activities CSE (AI) students took part in between 2023 and 2026."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {socialActivities.map((s, i) => (
              <li key={s.name} data-reveal style={delay((i % 4) * 60)}>
                <article data-tilt className="holo flex h-full items-start gap-4 p-5">
                  <span aria-hidden="true" className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cyan/40 text-[0.7rem] text-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-small font-semibold text-frost">{s.name}</h3>
                    <p className="mt-1 text-small text-haze">{s.org}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="patents" className={sectionY}>
        <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHead
            id="patents"
            index="04"
            label="Student innovation"
            title="Patent filings, before the degree."
            intro="From the department's 2025–26 student patent register."
          />
          <ol className="space-y-3">
            {studentInnovations.map((t, i) => (
              <li key={t} data-reveal style={delay((i % 3) * 50)} className="flex gap-4 border-b border-line pb-3">
                <span className="label pt-1 text-cyan">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-body text-frost">{t}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="beyond" className={sectionY}>
        <Container>
          <SectionHead id="beyond" index="05" label="Beyond code" title="Not every win is a hackathon." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {beyondCode.map((a) => (
              <article key={a.title} data-reveal className="holo p-7">
                <Chip tone="cyan">{a.when}</Chip>
                <p className="mt-5 font-display text-display-m text-gradient">{a.result}</p>
                <h3 className="mt-2 text-heading text-frost">{a.title}</h3>
                <p className="mt-2 text-small text-haze">{a.who}</p>
              </article>
            ))}
            <article data-reveal className="holo p-7" style={delay(80)}>
              <Chip tone="violet">2024</Chip>
              <p className="mt-5 font-display text-display-m text-gradient">High Commendation</p>
              <h3 className="mt-2 text-heading text-frost">SSI Model United Nations 2024</h3>
              <p className="mt-2 text-small text-haze">Shivam Sanap</p>
            </article>
            <article data-reveal className="holo p-7" style={delay(160)}>
              <Chip tone="magenta">Mood Indigo</Chip>
              <p className="mt-5 font-display text-display-m text-gradient">Slam poetry</p>
              <h3 className="mt-2 text-heading text-frost">IIT Bombay&apos;s Mood Indigo Multicities</h3>
              <p className="mt-2 text-small text-haze">Soham Suvarna</p>
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}
