import type { Metadata } from "next";
import AchievementWall from "@/components/AchievementWall";
import Countdown from "@/components/fx/Countdown";
import PageHero from "@/components/PageHero";
import { Button, Chip, Container, delay, LiveDot, SectionHead, sectionY } from "@/components/ui";
import { achievements, codeApex3, pastEvents } from "@/content/events";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events & achievements",
  description: `${codeApex3.name} — a three-stage hackathon with a ${codeApex3.prizePool} prize pool — plus past hackathons, faculty programmes and student wins from ${dept.short}, VIT Pune.`,
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        path="events"
        title="Hackathons, programmes & wins."
        intro={
          <p>
            The department runs its own 24-hour hackathons, hosts faculty development programmes with IEEE, and sends teams that
            come back with Smart India Hackathon and Allianz trophies.
          </p>
        }
      />

      {/* Code Apex 3.0 */}
      <section aria-labelledby="apex" className={sectionY}>
        <Container>
          <div data-reveal className="border-orbit holo overflow-hidden rounded-[1.75rem]">
            <div className="grid gap-12 p-7 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="label flex items-center gap-3 text-magenta">
                  <LiveDot /> Upcoming · registrations close {codeApex3.registerBy}
                </p>
                <h2 id="apex" className="glitch mt-6 text-hero text-frost" data-text={codeApex3.name}>
                  {codeApex3.name}
                </h2>
                <p className="mt-5 font-display text-display-m text-gradient">{codeApex3.tagline}</p>
                <p className="mt-6 text-body text-haze">
                  Presented by the {codeApex3.organiser}. Three stages, culminating in a 24-hour offline Grand Finale.
                </p>
                <dl className="mt-8 grid grid-cols-2 gap-4 text-small">
                  <div>
                    <dt className="label text-haze">Team size</dt>
                    <dd className="mt-1 text-frost">{codeApex3.team}</dd>
                  </div>
                  <div>
                    <dt className="label text-haze">Registration</dt>
                    <dd className="mt-1 text-frost">{codeApex3.fee}</dd>
                  </div>
                </dl>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button href={codeApex3.registerUrl} external>
                    Register on Unstop
                  </Button>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <p className="label text-haze">Countdown to the Grand Finale</p>
                  <div className="mt-4">
                    <Countdown to={codeApex3.finale} endedLabel="Grand Finale in progress" />
                  </div>
                </div>
                <div className="rounded-2xl border border-line bg-void/50 p-6">
                  <p className="label text-haze">Prize pool</p>
                  <p className="mt-2 font-display text-display-l text-gradient">{codeApex3.prizePool}</p>
                  <ul className="mt-5 grid grid-cols-3 gap-3">
                    {codeApex3.prizes.map((p) => (
                      <li key={p.place}>
                        <p className="label text-haze">{p.place}</p>
                        <p className="mt-1 font-display text-heading text-frost">{p.amount}</p>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {codeApex3.perks.map((p) => (
                      <li key={p}>
                        <Chip>{p}</Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stages as a signal path */}
            <ol className="relative grid border-t border-line md:grid-cols-3">
              {codeApex3.stages.map((s, i) => (
                <li key={s.code} className="relative border-line p-7 sm:p-9 md:border-r md:last:border-r-0 max-md:border-b max-md:last:border-b-0">
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${i === 2 ? "from-magenta to-violet" : "from-cyan to-transparent"}`} />
                  <p className="label text-cyan">{s.code}</p>
                  <p className="mt-3 font-display text-heading text-frost">{s.date}</p>
                  <p className="mt-2 text-small text-haze">{s.body}</p>
                </li>
              ))}
            </ol>
            <ul className="grid border-t border-line md:grid-cols-3">
              {codeApex3.tracks.map((t) => (
                <li key={t.code} className="flex items-baseline gap-4 border-line p-6 md:border-r md:last:border-r-0 max-md:border-b max-md:last:border-b-0">
                  <span className="label text-violet">{t.code}</span>
                  <span className="text-small text-haze">{t.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section aria-labelledby="timeline" className={sectionY}>
        <Container>
          <SectionHead id="timeline" index="01" label="Past events" title="The log." />
          <ol className="relative mt-14 space-y-10 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-cyan before:via-violet before:to-transparent md:before:left-1/2">
            {[...pastEvents]
              .sort((a, b) => new Date(`1 ${b.date}`).getTime() - new Date(`1 ${a.date}`).getTime())
              .map((e, i) => (
                <li key={e.title} data-reveal style={delay(80)} className={`relative pl-10 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12"}`}>
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 left-0 h-[15px] w-[15px] rounded-full border-2 border-cyan bg-void shadow-[0_0_16px_var(--color-cyan)] ${i % 2 ? "md:-left-[7.5px]" : "md:right-[-7.5px] md:left-auto"}`}
                  />
                  <article className="holo p-7">
                    <p className="label text-cyan">{e.date}</p>
                    <h3 className="mt-3 text-heading text-frost">{e.title}</h3>
                    <p className="mt-3 text-small text-haze">{e.body}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {e.tags.map((t) => (
                        <li key={t}>
                          <Chip tone="violet">{t}</Chip>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
          </ol>
        </Container>
      </section>

      {/* Achievements */}
      <section aria-labelledby="wins" className={sectionY}>
        <Container>
          <SectionHead
            id="wins"
            index="02"
            label="Student achievements"
            title="The trophy cabinet."
            intro="Results published by the department between 2024 and 2026. Levels are as the organisers described them; where none was given, the result is filed as inter-college."
          />
          <div data-reveal className="mt-12">
            <AchievementWall items={achievements} />
          </div>
        </Container>
      </section>
    </>
  );
}
