import Link from "next/link";
import NeuralMesh from "@/components/mesh/NeuralMesh";
import { Button, Container } from "@/components/ui";
import { nav } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <div className="absolute inset-0 opacity-70">
        <NeuralMesh density={0.7} />
      </div>
      <Container className="relative">
        <p className="label text-magenta">Error 404 · signal lost</p>
        <h1
          data-live
          className="glitch mt-6 font-display text-[clamp(5rem,22vw,16rem)] leading-none font-semibold tracking-[-0.05em] text-frost"
          data-text="404"
        >
          404
        </h1>
        <p className="mt-6 max-w-lg text-body-l text-haze">This neuron never fired. The page may have moved, or the link was mistyped.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/">Back to the core</Button>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-small">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="inline-flex min-h-7 items-center text-haze transition-colors hover:text-cyan">
                <span className="label mr-2 text-cyan">{n.code}</span>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
