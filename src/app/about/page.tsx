import type { Metadata } from "next";
import { Readout } from "@/components/cards";
import HoloImage from "@/components/fx/HoloImage";
import PageHero from "@/components/PageHero";
import { Chip, Container, delay, ExtLink, SectionHead, sectionY } from "@/components/ui";
import { credentials, hodMessage, instituteVision, mentors, missions, peos, pos, psos, vision } from "@/content/about";
import { dept, institute } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Vision, mission, programme objectives and the Head's message for the Department of ${dept.name}, ${institute.name}, Pune.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        path="about"
        title="Built to think."
        intro={
          <p>
            Established in {dept.established} at {institute.name} — an autonomous institute founded in {institute.founded} and
            affiliated to {institute.affiliation} — CSE (AI) runs a four-year B.Tech for {dept.intake} students a year.
          </p>
        }
      >
        <dl className="grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {[
            ["Head of Department", dept.hod.name],
            ["Established", dept.established],
            ["Annual intake", String(dept.intake)],
            ["Location", "Building 3 · Floors 2–3"],
          ].map(([k, v]) => (
            <div key={k} className="bg-void/85 px-5 py-4">
              <dt className="label text-haze">{k}</dt>
              <dd className="mt-1.5 text-small font-semibold text-frost">{v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Vision */}
      <section aria-labelledby="vision" className={sectionY}>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead id="vision" index="01" label="Vision" title="Why we exist." />
          <div className="space-y-10">
            <blockquote data-reveal className="font-display text-display-l text-gradient">
              “{vision}”
            </blockquote>
            <div data-reveal className="border-l border-line-bright pl-6" style={delay(120)}>
              <p className="label text-haze">Institute vision</p>
              <p className="mt-2 text-body-l text-frost">“{instituteVision}”</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <section aria-labelledby="mission" className={sectionY}>
        <Container>
          <SectionHead id="mission" index="02" label="Mission" title="Four commitments." />
          <ul className="mt-14 grid gap-5 md:grid-cols-2">
            {missions.map((m, i) => (
              <li key={m.code} data-reveal style={delay(i * 90)}>
                <article data-tilt className="holo h-full p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-display-l text-gradient">{m.code}</span>
                    <span aria-hidden="true" className="h-px flex-1 translate-y-1 bg-gradient-to-r from-line-bright to-transparent ml-6" />
                  </div>
                  <h3 className="mt-6 text-heading text-frost">{m.title}</h3>
                  <p className="mt-3 text-body text-haze">{m.body}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* PEOs */}
      <section aria-labelledby="peo" className={sectionY}>
        <Container>
          <SectionHead
            id="peo"
            index="03"
            label="Programme educational objectives"
            title="What a graduate becomes."
            intro="Set by the Board of Studies in CSE (AI) and published in the AY 2025–26 Structure & Syllabus."
          />
          <ol className="mt-14 divide-y divide-line border-y border-line">
            {peos.map((p, i) => (
              <li key={p.code} data-reveal style={delay(i * 70)} className="group grid gap-4 py-7 transition-colors hover:bg-panel/40 md:grid-cols-[8rem_14rem_1fr] md:items-baseline md:px-4">
                <span className="label text-cyan">{p.code}</span>
                <span className="font-display text-heading text-frost">{p.focus}</span>
                <span className="text-body text-haze">{p.body}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* HOD */}
      <section aria-labelledby="hod" className={sectionY}>
        <Container className="grid items-start gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div data-reveal className="lg:sticky lg:top-28">
            <div className="holo hud-corners p-3">
              <HoloImage src={dept.hod.portrait} alt={`${dept.hod.name}, ${dept.hod.role}`} caption={dept.hod.name} className="aspect-[4/5]" />
              <div className="p-4">
                <p className="text-heading text-frost">{dept.hod.name}</p>
                <p className="label mt-1 text-cyan">{dept.hod.role}</p>
                <p className="mt-4 text-small text-haze">
                  <ExtLink href={dept.hod.linkedin}>LinkedIn</ExtLink> ·{" "}
                  <a className="hover:text-frost" href={`mailto:${dept.email}`}>
                    {dept.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div>
            <SectionHead id="hod" index="04" label="From the Head of Department" title="A message from the Head." />
            <div className="mt-10 space-y-6">
              {hodMessage.map((para, i) => (
                <p key={i} data-reveal style={delay(i * 90)} className={i === 0 ? "text-body-l text-frost" : "text-body text-haze"}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Mentors */}
      <section aria-labelledby="mentors" className={sectionY}>
        <Container>
          <SectionHead id="mentors" index="05" label="Mentors" title="Guidance from outside the walls." />
          <ul className="mt-14 grid gap-5 md:grid-cols-2">
            {mentors.map((m, i) => (
              <li key={m.name} data-reveal style={delay(i * 100)}>
                <article className="holo flex h-full gap-6 p-7">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-violet/50 font-display text-heading text-violet">
                    {m.name.replace(/^(Prof\.|Dr\.)\s*/, "").split(" ").map((p) => p[0]).join("")}
                  </span>
                  <div>
                    <Chip tone="violet">{m.role}</Chip>
                    <h3 className="mt-4 text-heading text-frost">{m.name}</h3>
                    <p className="mt-2 text-small text-haze">{m.affiliation}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Credentials */}
      <section aria-labelledby="credentials" className={sectionY}>
        <Container>
          <SectionHead
            id="credentials"
            index="06"
            label="The institute"
            title="Credentials, measured."
            intro={`Institute-level accreditations and rankings for ${institute.name}, as published on vit.edu.`}
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {credentials.map((c, i) => (
              <li key={c.label} data-reveal style={delay((i % 4) * 70)}>
                <Readout value={c.value} label={c.label} detail={c.detail} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Outcomes */}
      <section aria-labelledby="outcomes" className={sectionY}>
        <Container>
          <SectionHead
            id="outcomes"
            index="07"
            label="Outcomes"
            title="Programme & specific outcomes."
            intro="Twelve programme outcomes shared with every engineering programme, and three that are specific to CSE (AI)."
          />
          <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <ul className="grid gap-3 sm:grid-cols-2">
              {pos.map((p, i) => (
                <li key={p.code} data-reveal style={delay((i % 2) * 60)}>
                  <details className="holo group h-full p-5 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <span>
                        <span className="label mr-3 text-cyan">{p.code}</span>
                        <span className="text-small font-semibold text-frost">{p.title}</span>
                      </span>
                      <span aria-hidden="true" className="text-haze transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-small text-haze">{p.body}</p>
                  </details>
                </li>
              ))}
            </ul>
            <div className="space-y-4">
              {psos.map((p, i) => (
                <div key={p.code} data-reveal style={delay(i * 90)} className="holo border-orbit p-6">
                  <p className="label text-violet">{p.code}</p>
                  <p className="mt-3 text-body text-frost">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
