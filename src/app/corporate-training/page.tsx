import type { Metadata } from "next";

import EnquiryForm from "@/components/EnquiryForm";
import Section, { Shell, SectionHeading } from "@/components/Section";
import JsonLd from "@/components/JsonLd";
import { Cta, MonoLabel } from "@/components/ui";
import Figure from "@/components/Figure";
import { breadcrumbSchema } from "@/lib/jsonld";
import { site, centres } from "@/lib/site";
import { tracks } from "@/content/types";
import { coursesInTrack, courseOptions } from "@/content/courses";

export const metadata: Metadata = {
  title: "Corporate training — SAP and enterprise technology for teams",
  description:
    "Corporate SAP, Salesforce, data and QA training in Pune. On-site, at our centres, or remote. Custom curriculum, cohort delivery, ISO 9001:2015 certified provider since 2015.",
  alternates: { canonical: "/corporate-training" },
};

export default function CorporateTrainingPage() {
  return (
    <>
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline py-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Corporate
            </p>
          </div>
          <div className="py-14 lg:pl-10 lg:py-20">
            <MonoLabel tone="signal">For teams</MonoLabel>
            <h1 className="mt-6 max-w-4xl text-display-xl text-chalk">
              Corporate training
            </h1>
            <p className="mt-7 max-w-2xl text-body-l text-steel">
              Training built around what your team has to be able to do at the
              end of it — an ERP rollout they need to support, a migration they
              have been handed, a QA function that has to start automating.
              Delivered at your office, at either of our Pune centres, or
              remotely.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="#enquire">Request a proposal</Cta>
              <Cta href="/courses" variant="line">
                See the catalogue
              </Cta>
            </div>
          </div>
        </div>
      </Shell>

      {/* Procurement-facing facts. These are the questions a purchasing or L&D
          function asks first, so they are answered before anything is sold. */}
      <div className="border-y border-hairline bg-graphite">
        <Shell>
          <dl className="grid divide-y divide-hairline lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            {[
              { term: "Operating since", detail: String(site.founded) },
              { term: "Quality certification", detail: site.certification },
              { term: "Delivery", detail: "On-site · Our centres · Remote" },
              { term: "Curriculum", detail: "Standard or built to brief" },
            ].map((item, i) => (
              <div
                key={item.term}
                className={`py-6 lg:px-6 ${i === 0 ? "lg:pl-0" : ""}`}
              >
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  {item.term}
                </dt>
                <dd className="mt-2 text-body-s text-chalk">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </Shell>
      </div>

      <Section index="02" label="Outcomes" bleed>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              title="We start from the outcome"
              standfirst="The first conversation is not about a syllabus. It is about what your team cannot currently do, and what changes for the business when they can."
            />
          </div>
          <div className="lg:col-span-6">
            <div className="space-y-5 text-body-l text-steel">
              <p>
                A finance team about to go live on S/4HANA needs something
                different from a support desk inheriting an ECC landscape, and
                both need something different from a graduate intake being
                brought up to a common baseline.
              </p>
              <p>
                So the scoping conversation covers the current level honestly
                (usually by assessing it rather than asking), the processes your
                organisation actually runs, the systems your people will have
                access to, and the date by which they have to be productive.
              </p>
              <p>
                What comes back is a curriculum, a schedule that fits around
                operational cover, and a clear statement of what is and is not
                included.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section index="03" label="Delivery">
        <SectionHeading
          title="How delivery works"
          standfirst="Three formats. Most engagements end up being a combination."
        />

        <div className="mt-12 grid gap-px bg-hairline lg:grid-cols-3">
          {[
            {
              title: "At your office",
              body: "We come to you. Best for cohorts of roughly eight and above, where the team can be released together and the training can use your own process examples.",
              note: "Pune and surrounding areas",
            },
            {
              title: "At our centres",
              body: "Narhe or Tilak Road, in a room set up for it, away from the interruptions of the floor. Suits smaller groups and mixed cohorts drawn from several teams.",
              note: `${centres.map((c) => c.shortName).join(" · ")}`,
            },
            {
              title: "Remote, live",
              body: "Live sessions rather than recordings, for distributed teams or where releasing people for a full day is not possible. The same trainers and the same project work.",
              note: "Any location",
            },
          ].map((item) => (
            <div key={item.title} className="bg-ink p-6 sm:p-8">
              <h3 className="text-heading text-chalk">{item.title}</h3>
              <p className="mt-3 text-body-s text-steel">{item.body}</p>
              <p className="mt-5 font-mono text-mono-label uppercase text-steel">
                {item.note}
              </p>
            </div>
          ))}
        </div>

        <Figure
          slot="corporate-session"
          caption="On-site delivery"
          className="mt-12"
        />

        <div className="mt-12 grid gap-px bg-hairline lg:grid-cols-2">
          <div className="bg-graphite p-6 sm:p-8">
            <MonoLabel>Cohort size</MonoLabel>
            <p className="mt-4 text-body-s text-steel">
              Small enough that everyone works hands-on in the system rather
              than watching someone else do it. We will tell you if a group is
              too large to run properly and suggest splitting it, because a
              cohort that cannot all get their hands on the keyboard does not
              learn.
            </p>
          </div>
          <div className="bg-graphite p-6 sm:p-8">
            <MonoLabel>Scheduling</MonoLabel>
            <p className="mt-4 text-body-s text-steel">
              Full days, half days, or evenings around shift patterns. We are
              open {site.hoursShort}, which gives more scheduling room than most
              providers can offer.
            </p>
          </div>
        </div>
      </Section>

      <Section index="04" label="Subjects">
        <SectionHeading
          title="What we can train"
          standfirst="The full catalogue is available for corporate delivery, and modules can be combined into one programme."
        />

        <div className="mt-12 grid gap-px bg-hairline md:grid-cols-2">
          {tracks.map((track) => (
            <div key={track.id} className="bg-ink p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-heading text-chalk">{track.name}</h3>
                <span className="font-mono text-mono-label uppercase text-steel">
                  {track.code}
                </span>
              </div>
              <p className="mt-3 text-body-s text-steel">{track.description}</p>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                {coursesInTrack(track.id).map((course) => (
                  <li
                    key={course.slug}
                    className="font-mono text-mono-label uppercase text-steel"
                  >
                    {course.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-body-s text-steel">
          If you need something adjacent to this list, ask. We will either tell
          you we can build it or tell you we cannot, and the second answer comes
          quickly.
        </p>
      </Section>

      <Section index="05" label="Procurement" tone="graphite">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              title="For procurement and L&D"
              standfirst="The details a supplier assessment asks for, stated plainly."
            />
          </div>
          <div className="lg:col-span-6">
            <dl className="space-y-6">
              <div className="border-l border-steel-dim pl-5">
                <dt className="text-heading text-chalk">
                  {site.certification} certified
                </dt>
                <dd className="mt-2 text-body-s text-steel">
                  A quality management system certification, issued in{" "}
                  {site.certificationIssued}. It certifies that our management
                  processes are documented and audited. It is not an
                  accreditation of curriculum content, and we will not present
                  it as one — but it is usually the box a supplier assessment
                  needs ticked.
                </dd>
              </div>
              <div className="border-l border-steel-dim pl-5">
                <dt className="text-heading text-chalk">
                  Operating since {site.founded}
                </dt>
                <dd className="mt-2 text-body-s text-steel">
                  Jarvees Academy has run continuously from two Pune locations,
                  as an initiative of {site.legalOperator}.
                </dd>
              </div>
              <div className="border-l border-steel-dim pl-5">
                <dt className="text-heading text-chalk">
                  Trainer profiles on request
                </dt>
                <dd className="mt-2 text-body-s text-steel">
                  Trainers are working professionals with current project
                  exposure. Profiles for the specific trainers proposed for your
                  engagement are provided with the proposal.
                </dd>
              </div>
              <div className="border-l border-steel-dim pl-5">
                <dt className="text-heading text-chalk">
                  Independent of the software vendors
                </dt>
                <dd className="mt-2 text-body-s text-steel">
                  We are an independent training provider. We are not an SAP
                  partner and hold no reseller or certification-partner status,
                  with SAP or anyone else. If a tender requires vendor-authorised
                  training, we are not the right supplier and will say so
                  immediately.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section index="06" label="Enquiry" id="enquire">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              title="Request a proposal"
              standfirst="Tell us the team, the gap and the deadline. You will get a curriculum, a schedule and a price — not a brochure."
            />

            <div className="mt-8 border border-hairline p-6">
              <MonoLabel>Speak to someone</MonoLabel>
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
              <a
                href={`mailto:${site.email}`}
                className="mt-5 block break-all border-t border-hairline pt-4 text-body-s text-steel underline decoration-steel-dim underline-offset-4 transition-colors hover:text-chalk"
              >
                {site.email}
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <EnquiryForm variant="corporate" courseOptions={courseOptions} />
          </div>
        </div>
      </Section>

      <JsonLd
        id="schema-corporate-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Corporate training", path: "/corporate-training" },
        ])}
      />
    </>
  );
}
