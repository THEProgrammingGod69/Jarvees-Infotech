import type { Metadata } from "next";

import Section, { Shell, SectionHeading } from "@/components/Section";
import JsonLd from "@/components/JsonLd";
import { Cta, MonoLabel } from "@/components/ui";
import { breadcrumbSchema } from "@/lib/jsonld";
import { site, centres, mapsUrl, mapsEmbedUrl, fullAddress } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our two centres in Pune — Narhe and Tilak Road",
  description:
    "Jarvees Academy runs two centres in Pune: Narhe on the Dhayari–Katraj road, and Tilak Road at Hirabaug Chowk. Addresses, phone numbers, landmarks and travel notes. Open 9 AM to 9 PM daily.",
  alternates: { canonical: "/centres" },
};

export default function CentresPage() {
  return (
    <>
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline py-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Centres
            </p>
          </div>
          <div className="py-14 lg:pl-10 lg:py-20">
            <MonoLabel tone="signal">Pune · Two locations</MonoLabel>
            <h1 className="mt-6 max-w-4xl text-display-xl text-chalk">
              Narhe and Tilak Road
            </h1>
            <p className="mt-7 max-w-2xl text-body-l text-steel">
              Both centres run the full catalogue, both are open {site.hours},
              and both teach the same courses to the same standard. Choose on
              travel time — the single biggest reason people stop attending is
              a commute they could not sustain after work.
            </p>
          </div>
        </div>
      </Shell>

      {centres.map((centre, index) => (
        <Section
          key={centre.id}
          index={String(index + 2).padStart(2, "0")}
          label={centre.shortName}
          id={centre.id}
          tone={index % 2 === 0 ? "ink" : "graphite"}
          bleed={index === 0}
        >
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-display-l text-chalk">{centre.name}</h2>
                {centre.isPrimary && (
                  <span className="border border-signal/40 bg-signal/10 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-signal">
                    Primary
                  </span>
                )}
              </div>

              <address className="mt-6 not-italic text-body-l text-steel">
                {centre.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="block">
                  {centre.locality} {centre.postalCode}, {centre.region}
                </span>
              </address>

              {/* Click-to-call. On a phone this is the primary action on the
                  whole page, so it is a full-width target, not a text link. */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`tel:${centre.phoneHref}`}
                  className="inline-flex items-center justify-center gap-2 bg-signal px-5 py-3.5 font-mono text-mono-label uppercase text-ink transition-opacity duration-(--duration-fast) hover:opacity-85"
                >
                  Call {centre.phoneDisplay}
                </a>
                <a
                  href={mapsUrl(centre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-hairline px-5 py-3.5 font-mono text-mono-label uppercase text-chalk transition-colors duration-(--duration-fast) hover:border-steel-dim hover:bg-graphite"
                >
                  Open in Maps ↗
                </a>
              </div>

              <dl className="mt-10 space-y-6">
                <div>
                  <dt className="font-mono text-mono-label uppercase text-steel">
                    Landmarks
                  </dt>
                  <dd className="mt-3">
                    <ul className="space-y-2">
                      {centre.landmarks.map((landmark) => (
                        <li
                          key={landmark}
                          className="border-l border-steel-dim pl-4 text-body-s text-steel"
                        >
                          {landmark}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>

                <div>
                  <dt className="font-mono text-mono-label uppercase text-steel">
                    Getting there
                  </dt>
                  <dd className="mt-3 space-y-3">
                    {centre.travel.map((note) => (
                      <p key={note} className="text-body-s text-steel">
                        {note}
                      </p>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono text-mono-label uppercase text-steel">
                    Hours
                  </dt>
                  <dd className="mt-3 text-body-s text-chalk">{site.hours}</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7">
              <div className="border border-hairline">
                <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3">
                  <p className="font-mono text-mono-label uppercase text-steel">
                    Map — {centre.shortName}
                  </p>
                  <a
                    href={mapsUrl(centre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-mono-label uppercase text-steel transition-colors hover:text-chalk"
                  >
                    Directions ↗
                  </a>
                </div>
                {/* Lazy-loaded so the map never blocks first paint or costs a
                    Lighthouse performance point above the fold. */}
                <iframe
                  src={mapsEmbedUrl(centre)}
                  title={`Map showing ${site.name} ${centre.name}, ${fullAddress(centre)}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-[380px] w-full border-0 grayscale-[0.35] contrast-[1.05] lg:h-[520px]"
                />
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section index="04" label="Choosing">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              title="Which centre, honestly"
              standfirst="Both teach the same courses. This is entirely a question of what you can reach reliably."
            />
          </div>
          <div className="lg:col-span-6">
            <div className="grid gap-px bg-hairline">
              <div className="bg-ink p-6">
                <h3 className="text-heading text-chalk">Choose Narhe if</h3>
                <p className="mt-3 text-body-s text-steel">
                  You live or work around Narhe, Dhayari, Ambegaon, Katraj,
                  Warje or the Navale Bridge side, or you are travelling in on
                  the Mumbai–Bengaluru highway. Parking is easier here.
                </p>
              </div>
              <div className="bg-ink p-6">
                <h3 className="text-heading text-chalk">
                  Choose Tilak Road if
                </h3>
                <p className="mt-3 text-body-s text-steel">
                  You are in central Pune — the peths, Swargate, Sadashiv Peth,
                  Deccan — or you are a student at one of the Tilak Road
                  colleges. Public transport to Hirabaug Chowk is straightforward
                  from most of the city.
                </p>
              </div>
              <div className="bg-ink p-6">
                <h3 className="text-heading text-chalk">Choose online if</h3>
                <p className="mt-3 text-body-s text-steel">
                  Neither commute is realistic after a working day, or you are
                  not in Pune at all. Sessions are live and the live project is
                  not reduced.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Cta href="/contact">Send enquiry</Cta>
          <Cta href="/courses" variant="line">
            Browse courses
          </Cta>
        </div>
      </Section>

      <JsonLd
        id="schema-centres-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Centres", path: "/centres" },
        ])}
      />
    </>
  );
}
