import Link from "next/link";

import { Mark } from "./Wordmark";
import { site, centres, navigation, mapsUrl } from "@/lib/site";
import { tracks } from "@/content/types";
import { coursesInTrack } from "@/content/courses";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-graphite">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-10">
        {/* Both centres, in full. A two-centre institute converts on proximity,
            so the addresses are footer content on every page, not a link. */}
        <div className="grid gap-px border-x border-hairline bg-hairline sm:grid-cols-2">
          {centres.map((centre) => (
            <div key={centre.id} className="bg-graphite p-6 sm:p-8">
              <p className="font-mono text-mono-label uppercase text-signal">
                {centre.name}
                {centre.isPrimary && (
                  <span className="ml-2 text-steel">Primary</span>
                )}
              </p>
              <address className="mt-4 not-italic text-body-s text-steel">
                {centre.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="block">
                  {centre.locality} {centre.postalCode}, {centre.region}
                </span>
              </address>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a
                  href={`tel:${centre.phoneHref}`}
                  className="font-mono text-mono-label text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
                >
                  {centre.phoneDisplay}
                </a>
                <a
                  href={mapsUrl(centre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-mono-label uppercase text-steel transition-colors hover:text-chalk"
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-10 border-x border-b border-hairline p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Mark className="h-5 w-5 text-signal" />
              <span className="font-display text-heading text-chalk">
                Jarvees Academy
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-body-s text-steel">
              SAP and enterprise technology training in Pune since {site.founded}.
              Classroom at both centres or online, with a live project on every
              course.
            </p>

            {/* These figures are displayed on every page, which is what makes
                the site-wide AggregateRating in the structured data honest. */}
            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-mono-label uppercase text-steel">
              <div>
                <dt className="sr-only">Established</dt>
                <dd>Since {site.founded}</dd>
              </div>
              <div>
                <dt className="sr-only">Quality certification</dt>
                <dd>{site.certification}</dd>
              </div>
              <div>
                <dt className="sr-only">Rating</dt>
                <dd className="tnum">
                  {site.rating.value} / 5 · {site.rating.count} ratings
                </dd>
              </div>
            </dl>

            <p className="mt-4 font-mono text-mono-label uppercase text-steel">
              Open {site.hoursShort}
            </p>
          </div>

          <nav aria-label="Courses" className="lg:col-span-4">
            <h2 className="font-mono text-mono-label uppercase text-steel">
              Courses
            </h2>
            <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {tracks.map((track) => (
                <li key={track.id}>
                  <p className="mb-1 text-body-s text-chalk">{track.name}</p>
                  <ul className="mb-4 space-y-1">
                    {coursesInTrack(track.id).map((course) => (
                      <li key={course.slug}>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="text-body-s text-steel transition-colors hover:text-chalk"
                        >
                          {course.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer" className="lg:col-span-4">
            <h2 className="font-mono text-mono-label uppercase text-steel">
              Academy
            </h2>
            <ul className="mt-4 space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-s text-steel transition-colors hover:text-chalk"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-8 font-mono text-mono-label uppercase text-steel">
              Contact
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="break-all text-body-s text-steel transition-colors hover:text-chalk"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-s text-steel transition-colors hover:text-chalk"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-x border-b border-hairline p-6 sm:p-8">
          {/* Trademark position. Required, and stated plainly rather than hidden. */}
          <p className="max-w-4xl text-body-s text-steel">
            {site.trademarkNotice}
          </p>
          <div className="flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-mono-label uppercase text-steel">
              © {year} {site.name}
            </p>
            {/* The legal operator is attributed exactly once, here. */}
            <p className="font-mono text-mono-label uppercase text-steel">
              {site.legalLine}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
