import type { Metadata } from "next";

import { Shell } from "@/components/Section";
import { Cta, MonoLabel } from "@/components/ui";
import { navigation, centres } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page does not exist. Browse the course catalogue or contact Jarvees Academy in Pune.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Shell>
      <div className="rail-grid">
        <div className="hidden border-r border-hairline py-20 pr-6 lg:block">
          <p className="font-mono text-mono-label uppercase text-steel tnum">
            404
          </p>
        </div>
        <div className="py-20 lg:pl-10">
          <MonoLabel tone="signal">404</MonoLabel>
          <h1 className="mt-6 max-w-3xl text-display-xl text-chalk">
            That page is not here
          </h1>
          <p className="mt-7 max-w-xl text-body-l text-steel">
            The link may be out of date, or the address may have a typo in it.
            Everything the site has is one of these:
          </p>

          <nav aria-label="Site sections" className="mt-10">
            <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block bg-ink p-5 text-heading text-chalk transition-colors duration-(--duration-fast) hover:bg-graphite"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Cta href="/">Back to the home page</Cta>
            <a
              href={`tel:${centres[0]!.phoneHref}`}
              className="font-mono text-mono-label uppercase text-steel underline decoration-steel-dim underline-offset-4 transition-colors hover:text-chalk"
            >
              Or call {centres[0]!.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </Shell>
  );
}
