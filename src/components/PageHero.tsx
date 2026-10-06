import type { ReactNode } from "react";
import NeuralMesh from "@/components/mesh/NeuralMesh";
import { Container, delay, Scramble, Words } from "@/components/ui";

/**
 * The opening of every inner page: a terminal-style path that decodes, a
 * title whose words rise out of their slots, and a standfirst, over a live
 * neural mesh. Entrances are CSS-only (`.rise`, `.wm-rise`) because this is
 * above the fold and must never wait for JavaScript.
 */
export default function PageHero({
  path,
  title,
  intro,
  children,
}: {
  path: string;
  title: string;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24">
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        <NeuralMesh />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line-bright to-transparent"
      />
      <Container className="relative">
        <p className="label rise flex items-center gap-2 text-haze">
          <span className="text-violet">~/cse-ai</span>
          <span aria-hidden="true">/</span>
          <span className="text-cyan">
            <Scramble text={path} />
          </span>
          <span aria-hidden="true" className="caret" />
        </p>
        <h1 className="mt-6 max-w-5xl text-hero text-frost">
          <Words text={title} rise delayMs={80} />
        </h1>
        <div className="rise mt-7 max-w-2xl text-body-l text-haze" style={delay(220)}>
          {intro}
        </div>
        {children && (
          <div className="rise mt-10" style={delay(300)}>
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}
