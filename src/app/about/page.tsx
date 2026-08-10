import type { Metadata } from "next";

import Section, { Shell, SectionHeading } from "@/components/Section";
import JsonLd from "@/components/JsonLd";
import { Cta, MonoLabel } from "@/components/ui";
import Figure from "@/components/Figure";
import { breadcrumbSchema } from "@/lib/jsonld";
import { site, centres, proofPoints } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the academy",
  description:
    "Jarvees Academy has taught SAP and enterprise technology in Pune since 2015. ISO 9001:2015 certified, two centres, trainers who work on live projects, and an honest account of what a certification does and does not mean.",
  alternates: { canonical: "/about" },
};

const audiences = [
  {
    title: "Freshers",
    body: "Graduates from commerce, engineering, science and management streams. The honest guidance here matters most: a commerce graduate usually gets further with SAP FICO than with ABAP, and someone who already programs should not be steered into a functional module because it is easier to sell.",
  },
  {
    title: "Career switchers from non-IT backgrounds",
    body: "Accountants, purchase and stores staff, sales coordinators, teachers, people returning after a break. SAP's functional modules are unusually good ground for this, because domain knowledge is worth more in them than programming is.",
  },
  {
    title: "Working professionals upskilling",
    body: "People already in IT or in a business function whose company is implementing, upgrading or migrating a system. Usually evening or weekend batches, often online, and usually with a specific deadline attached.",
  },
  {
    title: "Corporate teams",
    body: "Whole teams brought to a common level ahead of a rollout or a support handover, at your office or at ours.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline py-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              About
            </p>
          </div>
          <div className="py-14 lg:pl-10 lg:py-20">
            <MonoLabel tone="signal">Pune · Since {site.founded}</MonoLabel>
            <h1 className="mt-6 max-w-4xl text-display-xl text-chalk">
              A training institute that would rather be accurate than
              impressive
            </h1>
            <p className="mt-7 max-w-2xl text-body-l text-steel">
              Jarvees Academy has taught SAP and enterprise technology in Pune
              since {site.founded}, from two centres, to individual learners and
              to corporate teams. This page is what we can evidence — and where
              the limits of that evidence are.
            </p>
          </div>
        </div>
      </Shell>

      <div className="border-y border-hairline bg-graphite">
        <Shell>
          <dl className="grid divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
            {proofPoints.map((point, i) => (
              <div
                key={point.label}
                className={`py-5 lg:px-6 ${i === 0 ? "lg:pl-0" : ""}`}
              >
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                  {point.label}
                </dt>
                <dd className="mt-1.5 text-body-s text-chalk tnum">
                  {point.value}
                </dd>
              </div>
            ))}
          </dl>
        </Shell>
      </div>

      <Section index="02" label="Founding" bleed>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading title={`Founded in ${site.founded}`} />
          </div>
          <div className="lg:col-span-6 space-y-5 text-body-l text-steel">
            <p>
              The academy opened in {site.founded} as an initiative of{" "}
              {site.legalOperator}, teaching SAP to a city that had a large
              number of companies running it and not many places to learn it
              properly.
            </p>
            <p>
              It has grown to two centres — Narhe on the Dhayari–Katraj road,
              and Tilak Road at Hirabaug Chowk in central Pune — and to a
              catalogue that now covers Salesforce, data science, and the
              software engineering and QA disciplines alongside the SAP modules.
            </p>
            <p>
              Both centres are open {site.hours}, which is unusual and is
              deliberate: most of the people who come here are fitting study
              around a job, and a centre that closes at six is no use to them.
            </p>
          </div>
        </div>
      </Section>

      <Section index="03" label="Philosophy">
        <SectionHeading
          title="How we think about teaching"
          standfirst="Three commitments, in order of how much they cost us."
        />

        <div className="mt-12 grid gap-px bg-hairline lg:grid-cols-3">
          {[
            {
              n: "01",
              title: "You do the work, not the trainer",
              body: "It is faster and tidier to demonstrate a configuration than to watch fifteen people attempt it. It is also useless. Sessions are built around you making the settings, hitting the errors, and working out what the error means.",
            },
            {
              n: "02",
              title: "We will tell you the wrong course is wrong",
              body: "The commercially attractive answer is that whichever course you asked about is perfect for you. Sometimes it is not, and saying so costs us an enrolment and earns a recommendation. We would rather have the recommendation.",
            },
            {
              n: "03",
              title: "No promises we cannot keep",
              body: "We provide placement assistance — resume work, interview preparation, career guidance and introductions where we can make them. We do not guarantee jobs, quote placement percentages we cannot evidence, or publish testimonials we cannot verify.",
            },
          ].map((item) => (
            <div key={item.n} className="bg-ink p-6 sm:p-8">
              <p className="font-mono text-mono-label uppercase text-signal tnum">
                {item.n}
              </p>
              <h3 className="mt-5 text-heading text-chalk">{item.title}</h3>
              <p className="mt-3 text-body-s text-steel">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* The certification section is where most institute websites overclaim.
          Being precise about what ISO 9001 does and does not certify is worth
          more than the vaguer, grander version. */}
      <Section index="04" label="Certification" tone="graphite">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              title={`${site.certification}, and what it actually means`}
            />
          </div>
          <div className="lg:col-span-7">
            <div className="space-y-5 text-body-l text-steel">
              <p>
                Jarvees Academy holds {site.certification} certification, issued
                in {site.certificationIssued}. It is worth being exact about
                what that is, because it is frequently implied to be something
                grander.
              </p>
              <p>
                ISO 9001:2015 is a <span className="text-chalk">quality
                management system</span> standard. It certifies that an
                organisation has documented processes, follows them, records
                what it does, handles complaints through a defined route, and
                submits to periodic external audit against all of that.
              </p>
              <p>
                It is{" "}
                <span className="text-chalk">
                  not an accreditation of curriculum content
                </span>
                , not an endorsement by any software vendor, and not a statement
                that any particular course is good. No ISO standard assesses
                whether our SAP FICO syllabus is any use.
              </p>
              <p>
                What it does tell you is that the organisation is run to a
                documented standard and is audited on it — which is why it
                usually matters most to corporate buyers, whose procurement
                process asks for exactly this.
              </p>
            </div>

            <div className="mt-8 border border-signal/30 bg-signal/5 p-6">
              <MonoLabel tone="signal">Also worth stating plainly</MonoLabel>
              <p className="mt-4 text-body-s text-steel">
                We are an independent training provider. We are not an SAP
                authorised training partner and hold no partner or
                certification-partner status with SAP SE. The certificate you
                receive on completing a course here is issued by Jarvees
                Academy. SAP&rsquo;s own global certification is a separate
                examination taken through SAP and paid for separately.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section index="05" label="Trainers">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              title="Who teaches"
              standfirst="Trainers are working professionals with real-time industry exposure, not full-time lecturers who last touched a live system some years ago."
            />
          </div>
          <div className="lg:col-span-6 space-y-5 text-body-l text-steel">
            <p>
              That matters for a specific reason. Enterprise software changes
              underneath its documentation. Someone currently on an S/4HANA
              conversion knows which simplification items are actually causing
              trouble this year; someone teaching from a syllabus written four
              years ago does not.
            </p>
            <p>
              It also means the live projects resemble real work, because they
              are designed by people who do that work.
            </p>
            <p className="text-body-s text-steel">
              Trainer profiles for a specific course or corporate engagement are
              available on request — ask when you enquire and we will send the
              profile of the person who would actually be teaching you.
            </p>
          </div>
        </div>

        <Figure
          slot="session-in-progress"
          caption="A session in progress"
          className="mt-14"
        />
      </Section>

      <Section index="06" label="Who it is for">
        <SectionHeading
          title="Who comes here"
          standfirst="Four groups, with genuinely different needs. Being told which one you are in is usually the most useful part of the first conversation."
        />

        <div className="mt-12 grid gap-px bg-hairline md:grid-cols-2">
          {audiences.map((audience) => (
            <div key={audience.title} className="bg-ink p-6 sm:p-8">
              <h3 className="text-heading text-chalk">{audience.title}</h3>
              <p className="mt-3 text-body-s text-steel">{audience.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section index="07" label="Next" tone="graphite">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              title="Come and see the place"
              standfirst="You are welcome to visit either centre, meet a trainer and sit in before you decide anything. Call first so someone is free to talk to you properly."
            />
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="/contact">Send enquiry</Cta>
              <Cta href="/centres" variant="line">
                Both centres
              </Cta>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-hairline p-6">
              <MonoLabel>Call either centre</MonoLabel>
              <ul className="mt-4 space-y-4">
                {centres.map((centre) => (
                  <li key={centre.id}>
                    <p className="font-mono text-mono-label uppercase text-steel">
                      {centre.shortName}
                    </p>
                    <a
                      href={`tel:${centre.phoneHref}`}
                      className="mt-1 block font-display text-heading text-chalk transition-colors hover:text-signal"
                    >
                      {centre.phoneDisplay}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-hairline pt-4 text-body-s text-steel">
                Open {site.hours}.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <JsonLd
        id="schema-about-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
