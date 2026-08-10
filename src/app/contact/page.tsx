import type { Metadata } from "next";

import EnquiryForm from "@/components/EnquiryForm";
import Section, { Shell, SectionHeading } from "@/components/Section";
import JsonLd from "@/components/JsonLd";
import { MonoLabel } from "@/components/ui";
import { breadcrumbSchema } from "@/lib/jsonld";
import { courseOptions } from "@/content/courses";
import { site, centres, mapsUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — send an enquiry or call either centre",
  description:
    "Contact Jarvees Academy in Pune. Phone numbers for the Narhe and Tilak Road centres, email, and an enquiry form. Open 9 AM to 9 PM, all seven days.",
  alternates: { canonical: "/contact" },
};

/** The only place on the site where numbered markers are used, because this
    genuinely is a sequence. */
const process = [
  {
    n: "01",
    title: "You send an enquiry or call",
    body: "Either works. The form goes to the same people who answer the phone.",
  },
  {
    n: "02",
    title: "We call you back and ask about your background",
    body: "What you studied, what you are doing now, what you are aiming at, and when you can actually attend. This is the conversation that decides which course is right.",
  },
  {
    n: "03",
    title: "You get the specifics",
    body: "Duration, batch timings, fees, the next start date, and which centre or which online batch. In writing, so you can compare it with anywhere else you are looking.",
  },
  {
    n: "04",
    title: "You visit, or you sit in",
    body: "You are welcome to come to either centre, meet the trainer and see a session before deciding. Most people who do this find it settles the question.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline py-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Contact
            </p>
          </div>
          <div className="py-14 lg:pl-10 lg:py-20">
            <MonoLabel tone="signal">Open {site.hoursShort}</MonoLabel>
            <h1 className="mt-6 max-w-4xl text-display-xl text-chalk">
              Get in touch
            </h1>
            <p className="mt-7 max-w-2xl text-body-l text-steel">
              Tell us where you are starting from and what you are aiming at.
              You will get an honest answer about which course fits — including,
              sometimes, that none of them does.
            </p>
          </div>
        </div>
      </Shell>

      <Section index="02" label="Enquiry" bleed>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading title="Send an enquiry" />
            <EnquiryForm className="mt-8" courseOptions={courseOptions} />
          </div>

          <div className="lg:col-span-5">
            <div className="border border-hairline bg-graphite p-6">
              <MonoLabel>Call either centre</MonoLabel>
              <ul className="mt-5 space-y-5">
                {centres.map((centre) => (
                  <li key={centre.id}>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-mono text-mono-label uppercase text-steel">
                        {centre.shortName}
                      </p>
                      {centre.isPrimary && (
                        <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-signal">
                          Primary
                        </span>
                      )}
                    </div>
                    <a
                      href={`tel:${centre.phoneHref}`}
                      className="mt-1.5 block font-display text-heading text-chalk transition-colors hover:text-signal"
                    >
                      {centre.phoneDisplay}
                    </a>
                    <address className="mt-2 not-italic text-body-s text-steel">
                      {centre.addressLines[0]}, {centre.locality}{" "}
                      {centre.postalCode}
                    </address>
                    <a
                      href={mapsUrl(centre)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-mono text-mono-label uppercase text-steel transition-colors hover:text-chalk"
                    >
                      Directions ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-px border border-hairline bg-graphite p-6">
              <MonoLabel>Other ways</MonoLabel>
              <ul className="mt-5 space-y-4">
                <li>
                  <p className="font-mono text-mono-label uppercase text-steel">
                    Email
                  </p>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-1 block break-all text-body-s text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <p className="font-mono text-mono-label uppercase text-steel">
                    WhatsApp
                  </p>
                  <a
                    href={`https://wa.me/${centres[0]!.phoneHref.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-body-s text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
                  >
                    Message {centres[0]!.phoneDisplay}
                  </a>
                </li>
                <li>
                  <p className="font-mono text-mono-label uppercase text-steel">
                    Facebook
                  </p>
                  <a
                    href={site.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-body-s text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
                  >
                    facebook.com/Jarveesacademypune
                  </a>
                </li>
              </ul>
              <p className="mt-6 border-t border-hairline pt-4 text-body-s text-steel">
                Open {site.hours}. Enquiries sent late in the evening are
                answered the following day.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section index="03" label="What happens next" tone="graphite">
        <SectionHeading
          title="What happens after you enquire"
          standfirst="No drip campaign and no daily calls. This is the whole process."
        />

        <ol className="mt-12 grid gap-px bg-hairline md:grid-cols-2 xl:grid-cols-4">
          {process.map((step) => (
            <li key={step.n} className="bg-graphite p-6 sm:p-8">
              <p className="font-mono text-mono-label uppercase text-signal tnum">
                {step.n}
              </p>
              <h3 className="mt-5 text-heading text-chalk">{step.title}</h3>
              <p className="mt-3 text-body-s text-steel">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <JsonLd
        id="schema-contact-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
