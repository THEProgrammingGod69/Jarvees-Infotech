import Link from "next/link";
import { Container, ExtLink } from "@/components/ui";
import { dept, fullAddress, institute, nav } from "@/lib/site";
import Mark from "./Mark";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-deep/95">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent"
      />
      <Container className="pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3" aria-label="CSE·AI — home">
              <Mark className="h-11 w-11" gradientId="mark-footer" />
              <span className="font-display text-display-m text-frost">
                CSE<span className="text-cyan">·</span>AI
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-small text-haze">
              Department of {dept.name}, {institute.name}, Pune. Established {dept.established}; an autonomous institute
              affiliated to {institute.affiliation}.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="label text-cyan">Navigate</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5 text-small lg:grid-cols-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex min-h-7 items-center text-haze transition-colors hover:text-frost">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label text-cyan">Reach the department</p>
            <address className="mt-5 space-y-3 text-small text-haze not-italic">
              <p>
                {dept.location},<br />
                {fullAddress}
              </p>
              <ul className="space-y-1">
                <li>
                  <a href={dept.phone.href} className="inline-flex min-h-7 items-center transition-colors hover:text-frost">
                    {dept.phone.display}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${dept.email}`} className="inline-flex min-h-7 items-center transition-colors hover:text-frost">
                    {dept.email}
                  </a>
                </li>
              </ul>
              <p>{institute.hours}</p>
            </address>
          </div>

          <div>
            <p className="label text-cyan">Connect</p>
            <ul className="mt-5 space-y-1.5 text-small text-haze [&_a]:inline-flex [&_a]:min-h-7 [&_a]:items-center">
              <li>
                <ExtLink href={dept.socials.linkedin}>LinkedIn</ExtLink>
              </li>
              <li>
                <ExtLink href={dept.socials.x}>X (Twitter)</ExtLink>
              </li>
              <li>
                <ExtLink href={dept.socials.aisf}>AI Students’ Forum</ExtLink>
              </li>
              <li>
                <ExtLink href={dept.officialUrl}>Official department page</ExtLink>
              </li>
              <li>
                <ExtLink href={institute.admissionsUrl}>Admissions at VIT</ExtLink>
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 font-display text-[clamp(3rem,15vw,13rem)] leading-[0.8] font-semibold tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_var(--color-line-bright)] select-none"
        >
          CSE·AI
        </p>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-small text-haze sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {institute.name}, Pune.</p>
          <p className="label">Content compiled from vit.edu/CSE-AI · October 2026</p>
        </div>
      </Container>
    </footer>
  );
}
