import type { Metadata } from "next";
import FacultyGrid from "@/components/FacultyGrid";
import HoloImage from "@/components/HoloImage";
import PageHero from "@/components/PageHero";
import { Container, ExtLink, SectionHead, sectionY } from "@/components/ui";
import { hodMessage, mentors } from "@/content/about";
import { faculty } from "@/content/people";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Faculty",
  description: `The Head of Department and faculty of ${dept.short}, VIT Pune — with the patents, publications and programmes behind each name.`,
  alternates: { canonical: "/faculty/" },
};

export default function FacultyPage() {
  return (
    <>
      <PageHero
        path="faculty"
        title="The people behind the parameters."
        intro={
          <p>
            A faculty that files patents, publishes at IEEE and Springer venues, and keeps retraining — on agentic AI, generative
            AI and edge intelligence — so the classroom never trails the field.
          </p>
        }
      />

      <section aria-labelledby="head" className={sectionY}>
        <Container>
          <div data-reveal className="holo border-orbit grid gap-10 overflow-hidden p-4 sm:p-6 lg:grid-cols-[22rem_1fr] lg:p-8">
            <HoloImage
              photo={dept.hod.portrait}
              alt={`${dept.hod.name}, ${dept.hod.role}`}
              className="aspect-[4/5]"
              sizes="(min-width: 1024px) 22rem, 92vw"
            />
            <div className="flex flex-col justify-center p-2 sm:p-4">
              <p className="label text-cyan">Head of Department</p>
              <h2 id="head" className="mt-4 text-display-l text-frost">
                {dept.hod.name}
              </h2>
              <p className="label mt-2 text-haze">{dept.hod.role}</p>
              <p className="mt-6 text-body-l text-haze">{hodMessage[0]}</p>
              <p className="mt-6 text-small text-haze">
                <ExtLink href={dept.hod.linkedin}>LinkedIn profile</ExtLink> ·{" "}
                <a href={`mailto:${dept.email}`} className="hover:text-frost">
                  {dept.email}
                </a>{" "}
                ·{" "}
                <a href={dept.phone.href} className="hover:text-frost">
                  {dept.phone.display}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="directory" className={sectionY}>
        <Container>
          <SectionHead
            id="directory"
            index="01"
            label="Faculty directory"
            title="Filter by what they work on."
            intro="Each card lists the work that faculty member is on record for in 2025–26 — patents, papers and faculty development programmes."
          />
          <div className="mt-12">
            <FacultyGrid faculty={faculty} />
          </div>
          <p className="mt-10 max-w-3xl text-small text-haze">
            Compiled from the department&apos;s 2025–26 patent, publication and FDP registers on vit.edu. Designations other than the
            Head&apos;s were not published there and are therefore not stated; the department&apos;s official faculty page is the
            authority on titles and the full roster.
          </p>
        </Container>
      </section>

      <section aria-labelledby="mentors" className={sectionY}>
        <Container>
          <SectionHead id="mentors" index="02" label="Mentors" title="Advisers beyond the campus." />
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {mentors.map((m) => (
              <li key={m.name} data-reveal>
                <article className="holo h-full p-7">
                  <p className="label text-violet">{m.role}</p>
                  <h3 className="mt-3 text-heading text-frost">{m.name}</h3>
                  <p className="mt-2 text-small text-haze">{m.affiliation}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
