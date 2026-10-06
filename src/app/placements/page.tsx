import type { Metadata } from "next";
import { Readout } from "@/components/cards";
import Marquee from "@/components/Marquee";
import Odometer from "@/components/Odometer";
import PageHero from "@/components/PageHero";
import { Chip, Container, delay, SectionHead, sectionY } from "@/components/ui";
import { internshipHosts, internshipSummaries, placementSummary, recruiters, topOffers } from "@/content/outcomes";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Placements",
  description: `Placement and internship outcomes for ${dept.short}, VIT Pune, AY 2025–26 — highest offer ₹${placementSummary.highestLpa} LPA, average ₹${placementSummary.averageLpa} LPA.`,
  alternates: { canonical: "/placements/" },
};

const inr = new Intl.NumberFormat("en-IN");

export default function PlacementsPage() {
  const max = Math.max(...topOffers.map((o) => o.lpa));
  return (
    <>
      <PageHero
        path="placements"
        title="From lab bench to offer letter."
        intro={
          <p>
            Placement and internship outcomes for {placementSummary.year}, as published by the department while the season was
            still running. Figures will move; the companies already tell the story.
          </p>
        }
      >
        <Chip tone="magenta">
          {placementSummary.year} · {placementSummary.status}
        </Chip>
      </PageHero>

      <section aria-labelledby="summary" className={sectionY}>
        <Container>
          <h2 id="summary" className="sr-only">
            Summary
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            <li data-reveal>
              <Readout value={<Odometer value={placementSummary.placedPercent} suffix="%" />} label="Students placed" detail="Season ongoing at publication" />
            </li>
            <li data-reveal style={delay(80)}>
              <Readout value={<Odometer value={placementSummary.highestLpa} decimals={2} prefix="₹" suffix=" LPA" />} label="Highest package" detail="PhonePe" />
            </li>
            <li data-reveal style={delay(160)}>
              <Readout value={<Odometer value={placementSummary.averageLpa} decimals={2} prefix="₹" suffix=" LPA" />} label="Average package" detail="Across offers to date" />
            </li>
          </ul>
        </Container>
      </section>

      <section aria-labelledby="offers" className={sectionY}>
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead
            id="offers"
            index="01"
            label="Top offers"
            title="Best offer per company."
            intro="Annual CTC in lakhs per annum (LPA), from the department's list of placed students. One bar per company, its best published offer."
          />
          <div data-reveal className="holo p-6 sm:p-8">
            <table className="w-full border-separate border-spacing-y-1.5 text-small">
              <caption className="sr-only">Best published offer per company, AY 2025–26, in LPA</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Company</th>
                  <th scope="col">Offer (LPA)</th>
                </tr>
              </thead>
              <tbody>
                {topOffers.map((o, i) => (
                  <tr key={o.company} className="group">
                    <th scope="row" className="w-[38%] py-1.5 pr-4 text-left font-medium text-haze transition-colors group-hover:text-frost">
                      {o.company}
                    </th>
                    <td className="py-1.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1">
                          <div
                            className="bar-grow h-full rounded-r-[4px] bg-cyan/80 transition-colors group-hover:bg-cyan"
                            style={{ width: `${(o.lpa / max) * 100}%`, ["--i" as string]: i }}
                          />
                        </div>
                        <span className="w-14 text-right font-mono text-frost tabular-nums">{o.lpa.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="label mt-6 text-haze">Source · vit.edu/CSE-AI/placements · {placementSummary.year}</p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="internships" className={sectionY}>
        <Container>
          <SectionHead
            id="internships"
            index="02"
            label="Internships"
            title="Paid to learn, before graduating."
            intro="Final-year internship stipends per month, from the department's internship register."
          />
          <ul className="mt-12 grid gap-5 lg:grid-cols-2">
            {internshipSummaries.map((s, i) => (
              <li key={s.term} data-reveal style={delay(i * 100)}>
                <article className="holo hud-corners h-full p-7 sm:p-9">
                  <p className="label text-cyan">{s.term}</p>
                  <dl className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      ["Highest", s.highest],
                      ["Average", s.average],
                      ["Minimum", s.minimum],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <dt className="label text-haze">{k}</dt>
                        <dd className="mt-2 font-display text-heading text-frost sm:text-display-m">₹{inr.format(v as number)}</dd>
                      </div>
                    ))}
                  </dl>
                  {/* Range strip: where the average sits between the floor and the ceiling. */}
                  <div className="relative mt-8 h-2 rounded-full bg-line" aria-hidden="true">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: "100%" }} />
                    <div
                      className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-void bg-frost"
                      style={{ left: `${((s.average - s.minimum) / (s.highest - s.minimum)) * 100}%` }}
                    />
                  </div>
                  <p className="label mt-3 text-haze">Average marked on the min–max range</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
        <div className="mt-14">
          <p className="label mb-5 text-center text-haze">Internship hosts</p>
          <Marquee label="Internship hosts" seconds={70}>
            {internshipHosts.map((h) => (
              <span key={h} className="mx-2 rounded-full border border-line bg-panel/50 px-5 py-2.5 text-small whitespace-nowrap text-haze">
                {h}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <section aria-labelledby="recruiters" className={sectionY}>
        <Container>
          <SectionHead
            id="recruiters"
            index="03"
            label="Recruiters"
            title={`${recruiters.length} companies, and counting.`}
            intro="Recruiting companies listed on the department's Placements page."
          />
          <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
            {recruiters.map((r, i) => (
              <li
                key={r}
                data-reveal
                style={delay((i % 5) * 40)}
                className="group relative grid min-h-24 place-items-center bg-deep/90 px-4 py-6 text-center transition-colors hover:bg-panel"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--color-cyan)_14%,transparent),transparent_70%)]"
                />
                <span className="relative font-display text-small font-medium text-haze transition-colors group-hover:text-frost">{r}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
