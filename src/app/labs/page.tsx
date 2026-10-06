import type { Metadata } from "next";
import BuildingDiagram from "@/components/BuildingDiagram";
import HoloImage from "@/components/HoloImage";
import Odometer from "@/components/Odometer";
import PageHero from "@/components/PageHero";
import { Chip, Container, delay, SectionHead, sectionY, vars } from "@/components/ui";
import { classroomPhoto, departmentPhoto, labs } from "@/content/labs";
import { dept } from "@/lib/site";

export const metadata: Metadata = {
  title: "Labs & facilities",
  description: `The laboratories of ${dept.short}, VIT Pune — the AI Innovation Lab, Deep Learning Lab, Computing Lab and Programming Lab in Building 3.`,
  alternates: { canonical: "/labs/" },
};

/**
 * One square per seat. When the card is revealed the seats power on in a
 * ripple spreading out from the middle of the room, like a lab booting up.
 */
function SeatMatrix({ seats }: { seats: number }) {
  const cols = 10;
  const rows = Math.ceil(seats / cols);
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  return (
    <div data-reveal="keep" className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${seats} workstations`}>
      {Array.from({ length: seats }, (_, i) => {
        const d = Math.hypot((i % cols) - cx, Math.floor(i / cols) - cy);
        return <span key={i} className="seat aspect-square rounded-[3px] bg-cyan/70" style={vars({ "--d": `${Math.round(120 + d * 90)}ms` })} />;
      })}
    </div>
  );
}

export default function LabsPage() {
  const seats = labs.reduce((n, l) => n + l.seats, 0);
  return (
    <>
      <PageHero
        path="labs"
        title="Where ideas get compute."
        intro={
          <p>
            Four dedicated laboratories across the second and third floors of Building 3 on the Bibwewadi campus — workstations,
            networking and a VR headset for immersive experiments.
          </p>
        }
      />

      <section aria-labelledby="footprint" className={sectionY}>
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHead id="footprint" index="01" label="Footprint" title="Two floors of Building 3." />
            <dl className="mt-10 grid grid-cols-2 gap-4" data-reveal>
              <div className="holo hud-corners p-6">
                <dt className="label text-haze">Workstations</dt>
                <dd className="mt-3 font-display text-display-l text-frost">
                  <Odometer value={seats} />
                </dd>
              </div>
              <div className="holo hud-corners p-6">
                <dt className="label text-haze">Laboratories</dt>
                <dd className="mt-3 font-display text-display-l text-frost">
                  <Odometer value={labs.length} />
                </dd>
              </div>
            </dl>
            <p data-reveal className="mt-8 text-body text-haze" style={delay(100)}>
              {dept.location}, VIT Bibwewadi Campus, Pune.
            </p>
          </div>
          <div data-reveal className="mx-auto w-full max-w-md">
            <BuildingDiagram />
          </div>
        </Container>
      </section>

      <section aria-labelledby="labs" className={sectionY}>
        <Container>
          <SectionHead id="labs" index="02" label="Laboratories" title="The lab manifest." />
          <ul className="mt-14 space-y-6">
            {labs.map((lab, i) => (
              <li key={lab.id} data-reveal>
                <article className="holo grid gap-8 overflow-hidden p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr] lg:p-8">
                  <HoloImage
                    photo={lab.photo}
                    alt={`${lab.name}, CSE (AI), VIT Pune`}
                    className={`aspect-[3/2] ${i % 2 ? "lg:order-2" : ""}`}
                    sizes="(min-width: 1024px) 45vw, 92vw"
                  />
                  <div className="flex flex-col justify-center gap-6 p-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Chip tone="cyan">LAB-{String(i + 1).padStart(2, "0")}</Chip>
                      <Chip>{lab.seats} seats</Chip>
                    </div>
                    <h3 className="text-display-l text-frost">{lab.name}</h3>
                    <ul className="space-y-2 text-body text-haze">
                      {lab.specs.map((s) => (
                        <li key={s} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2.5 h-1 w-3 shrink-0 bg-violet" />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <div className="max-w-xs">
                      <p className="label mb-3 text-haze">Seat map</p>
                      <SeatMatrix seats={lab.seats} />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="spaces" className={sectionY}>
        <Container>
          <SectionHead id="spaces" index="03" label="Spaces" title="Classrooms & the department." />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <figure data-reveal className="holo p-3">
              <HoloImage photo={classroomPhoto} alt="A CSE (AI) classroom at VIT Pune" className="aspect-[4/3]" sizes="(min-width: 768px) 45vw, 92vw" />
              <figcaption className="label p-4 text-haze">Classroom · Building 3</figcaption>
            </figure>
            <figure data-reveal className="holo p-3" style={delay(100)}>
              <HoloImage photo={departmentPhoto} alt="Inside the CSE (AI) department, VIT Pune" className="aspect-[4/3]" sizes="(min-width: 768px) 45vw, 92vw" />
              <figcaption className="label p-4 text-haze">Inside the department</figcaption>
            </figure>
          </div>
        </Container>
      </section>
    </>
  );
}
