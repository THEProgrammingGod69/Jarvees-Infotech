import type { Metadata } from "next";
import Constellation from "@/components/Constellation";
import Marquee from "@/components/fx/Marquee";
import PageHero from "@/components/PageHero";
import PatentBoard from "@/components/PatentBoard";
import { Chip, Container, delay, SectionHead, sectionY } from "@/components/ui";
import { domains, industryProjects, patents, publications, studentInnovations } from "@/content/research";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research",
  description: `Patents, publications, industry projects and student innovation from ${dept.short}, VIT Pune.`,
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  const granted = patents.filter((p) => p.status === "Granted").length;
  return (
    <>
      <PageHero
        path="research"
        title="Research with a pulse."
        intro={
          <p>
            Granted patents in India and South Africa, papers at IEEE and Springer venues, and projects with partners from IUCAA
            to Accion Labs — most of it aimed at problems you can point to: farms, hospitals, roads and disasters.
          </p>
        }
      >
        <ul className="flex flex-wrap gap-2">
          <li><Chip tone="cyan">{granted} granted patents listed</Chip></li>
          <li><Chip>{patents.length} patents on this page</Chip></li>
          <li><Chip tone="violet">{industryProjects.length} industry projects</Chip></li>
        </ul>
      </PageHero>

      <section aria-labelledby="domains" className={sectionY}>
        <Container>
          <SectionHead
            id="domains"
            index="01"
            label="Domains"
            title="Eight orbits of work."
            intro="Every domain below is backed by a patent, a paper, a project or a competition result on record. Hover or tab through the nodes."
          />
          <div data-reveal className="mt-12">
            <Constellation domains={domains} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="patents" className={sectionY}>
        <Container>
          <SectionHead
            id="patents"
            index="02"
            label="Faculty patents · 2025–26"
            title="From idea to granted claim."
            intro="Highlights from the department's 2025–26 faculty patent register. The register is longer than this page; these are the entries shown here."
          />
          <div data-reveal className="mt-12">
            <PatentBoard patents={patents} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="papers" className={sectionY}>
        <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHead
            id="papers"
            index="03"
            label="Publications"
            title="Selected papers."
            intro="Conference and journal publications from the 2025–26 register."
          />
          <ol className="divide-y divide-line border-y border-line">
            {publications.map((p, i) => (
              <li key={p.title} data-reveal style={delay((i % 3) * 60)} className="group py-5">
                <p className="label text-cyan">{p.venue}</p>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-start gap-2 text-body font-semibold text-frost transition-colors hover:text-cyan"
                  >
                    {p.title}
                    <span aria-hidden="true" className="text-haze transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <p className="mt-2 text-body font-semibold text-frost">{p.title}</p>
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="industry" className={sectionY}>
        <Container>
          <SectionHead
            id="industry"
            index="04"
            label="Industry projects"
            title="Real partners. Real data."
            intro="Projects carried out with industry and research partners, as listed on the department's Research page."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industryProjects.map((p, i) => (
              <li key={p.title} data-reveal style={delay((i % 3) * 80)}>
                <article data-tilt className="holo flex h-full flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-small font-semibold text-gradient">{p.partner}</span>
                    <span className="label text-[0.625rem] text-haze">{p.domain}</span>
                  </div>
                  <p className="mt-4 text-body text-frost">{p.title}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="students" className={sectionY}>
        <Container>
          <SectionHead
            id="students"
            index="05"
            label="Student patents · 2025–26"
            title="Second-years with patent filings."
            intro="Titles from the 2025–26 student patent register — most filed by students still in their second year."
          />
        </Container>
        <div className="mt-12 space-y-4">
          {[studentInnovations.slice(0, 5), studentInnovations.slice(5)].map((row, r) => (
            <Marquee key={r} label={r === 0 ? "Student patents" : "More student patents"} reverse={r === 1} seconds={70}>
              {row.map((t) => (
                <span key={t} className="mx-2 rounded-2xl border border-line bg-panel/60 px-6 py-4 text-small whitespace-nowrap text-frost">
                  <span aria-hidden="true" className="mr-3 text-cyan">
                    ◆
                  </span>
                  {t}
                </span>
              ))}
            </Marquee>
          ))}
        </div>
      </section>
    </>
  );
}
