import type { ReactNode } from "react";
import NeuralMesh from "@/components/fx/NeuralMesh";
import Scramble from "@/components/fx/Scramble";
import { Container } from "@/components/ui";

/**
 * The opening of every inner page: a terminal-style path, a decoded title
 * and a standfirst over a live neural mesh. Entrances are CSS-only (`.rise`)
 * because this is above the fold and must not wait for hydration.
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
          <span className="text-cyan">{path}</span>
          <span aria-hidden="true" className="caret" />
        </p>
        <h1 className="rise mt-6 max-w-5xl text-hero text-frost" style={{ ["--d" as string]: "80ms" }}>
          <Scramble text={title} delay={250} />
        </h1>
        <div className="rise mt-7 max-w-2xl text-body-l text-haze" style={{ ["--d" as string]: "160ms" }}>
          {intro}
        </div>
        {children && (
          <div className="rise mt-10" style={{ ["--d" as string]: "240ms" }}>
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}
