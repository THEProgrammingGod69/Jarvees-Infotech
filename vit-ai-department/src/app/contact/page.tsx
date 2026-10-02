import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Transmission from "@/components/Transmission";
import { Container, delay, ExtLink, SectionHead, sectionY } from "@/components/ui";
import { dept, fullAddress, institute } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact the Department of ${dept.name}, VIT Pune — ${dept.phone.display}, ${dept.email}. Admissions: ${institute.admissions.phones[0].display}.`,
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    code: "CH-01",
    title: "Department office",
    lines: [
      { label: dept.phone.display, href: dept.phone.href },
      { label: dept.email, href: `mailto:${dept.email}` },
    ],
    note: `${dept.hod.name}, ${dept.hod.role}`,
  },
  {
    code: "CH-02",
    title: "Admissions",
    lines: [
      ...institute.admissions.phones.map((p) => ({ label: p.display, href: p.href })),
      { label: institute.admissions.email, href: `mailto:${institute.admissions.email}` },
    ],
    note: "Undergraduate admission enquiries",
  },
  {
    code: "CH-03",
    title: "General office",
    lines: [{ label: institute.generalOffice.display, href: institute.generalOffice.href }],
    note: institute.hours,
  },
];

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(institute.mapsQuery)}&output=embed`;
  return (
    <>
      <PageHero
        path="contact"
        title="Open a channel."
        intro={<p>Questions about the programme, admissions, research collaboration or CODE APEX — here is who to reach, and how.</p>}
      />

      <section aria-labelledby="channels" className={sectionY}>
        <Container>
          <h2 id="channels" className="sr-only">
            Contact channels
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {channels.map((c, i) => (
              <li key={c.code} data-reveal style={delay(i * 90)}>
                <article data-tilt className="holo hud-corners flex h-full flex-col p-7">
                  <p className="label text-cyan">{c.code}</p>
                  <h3 className="mt-4 text-heading text-frost">{c.title}</h3>
                  <ul className="mt-5 space-y-2">
                    {c.lines.map((l) => (
                      <li key={l.label}>
                        <a href={l.href} className="font-display text-small font-medium text-frost transition-colors hover:text-cyan">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-6 text-small text-haze">{c.note}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="write" className={sectionY}>
        <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHead id="write" index="01" label="Write to us" title="Compose a message." />
            <div data-reveal className="mt-10 space-y-5 text-body text-haze">
              <p>
                Pick a topic and the message is addressed to the right inbox. Prefer the phone? The department office answers
                during office hours.
              </p>
              <ul className="space-y-2 text-small">
                <li>
                  <ExtLink href={dept.socials.linkedin}>Department on LinkedIn</ExtLink>
                </li>
                <li>
                  <ExtLink href={dept.socials.x}>Department on X</ExtLink>
                </li>
                <li>
                  <ExtLink href={dept.officialUrl}>Official department page on vit.edu</ExtLink>
                </li>
              </ul>
            </div>
          </div>
          <div data-reveal>
            <Transmission />
          </div>
        </Container>
      </section>

      <section aria-labelledby="where" className={sectionY}>
        <Container>
          <SectionHead id="where" index="02" label="Location" title="Find Building 3." />
          <div data-reveal className="mt-12 grid gap-5 lg:grid-cols-[1fr_2fr]">
            <address className="holo hud-corners p-7 not-italic">
              <p className="label text-cyan">{institute.campus.name}</p>
              <p className="mt-4 text-heading text-frost">{dept.location}</p>
              <p className="mt-3 text-body text-haze">{fullAddress}</p>
              <p className="label mt-6 text-haze">
                {institute.campus.geo.lat.toFixed(2)}° N · {institute.campus.geo.lng.toFixed(2)}° E
              </p>
              <p className="mt-6 text-small">
                <ExtLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(institute.mapsQuery)}`}>
                  Open in Google Maps
                </ExtLink>
              </p>
            </address>
            <div className="holo relative min-h-80 overflow-hidden p-2">
              <iframe
                title={`Map: ${institute.name}, ${institute.campus.name}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-80 w-full rounded-xl border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)_brightness(0.95)]"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
