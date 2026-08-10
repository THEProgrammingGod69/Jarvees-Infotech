import type { Metadata } from "next";

import CourseCatalogue from "@/components/CourseCatalogue";
import JsonLd from "@/components/JsonLd";
import { Shell } from "@/components/Section";
import { Cta, MonoLabel } from "@/components/ui";
import { breadcrumbSchema } from "@/lib/jsonld";
import { courses } from "@/content/courses";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Courses — SAP, Salesforce, data science and software engineering",
  description:
    "The full Jarvees Academy catalogue: eight SAP modules, Salesforce, data science, and software engineering and QA. Filter by track, mode and level. Pune, online or classroom.",
  alternates: { canonical: "/courses" },
};

/**
 * The catalogue is the site's one inverted page.
 *
 * A catalogue is a document you scan and filter, not an interface you move
 * through, so it is set on paper. It also makes the dark of the other seven
 * routes read as a choice rather than a habit.
 */
export default function CoursesPage() {
  return (
    <div className="bg-paper text-ink">
      <Shell>
        <div className="py-14 lg:py-20">
          <MonoLabel tone="paper">Catalogue · {courses.length} courses</MonoLabel>
          <h1 className="mt-6 max-w-4xl text-display-xl text-ink">
            Every course we teach
          </h1>
          <p className="mt-6 max-w-2xl text-body-l text-ink/70">
            Four tracks. Every one of them runs both online and in the
            classroom at either Pune centre, and every one of them ends in a
            live project. Durations and batch timings are confirmed when you
            enquire, because they depend on the batch you join.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Cta href="/contact" tone="paper">
              Send enquiry
            </Cta>
            <Cta href="/live-projects" variant="line" tone="paper">
              How live projects work
            </Cta>
          </div>
        </div>

        <CourseCatalogue courses={courses} />

        <div className="py-14 lg:py-20">
          <h2 className="max-w-3xl text-display-m text-ink">
            Not sure which one fits?
          </h2>
          <p className="mt-4 max-w-2xl text-body-l text-ink/70">
            Tell us your background and what you are aiming at. The honest
            answer is often a different course from the one people first ask
            about — a commerce graduate usually gets further with FICO than with
            ABAP, and the reverse is true for someone who already programs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Cta href="/contact" tone="paper">
              Ask us
            </Cta>
            <p className="font-mono text-mono-label uppercase text-ink/65">
              Open {site.hoursShort}
            </p>
          </div>
        </div>
      </Shell>

      <JsonLd
        id="schema-courses-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
        ])}
      />
    </div>
  );
}
