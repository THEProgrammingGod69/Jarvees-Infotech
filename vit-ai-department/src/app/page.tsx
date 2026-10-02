import Link from "next/link";
import { AchievementCard, LabCard, Readout } from "@/components/cards";
import CoreStage from "@/components/fx/CoreStage";
import Countdown from "@/components/fx/Countdown";
import Counter from "@/components/fx/Counter";
import Marquee from "@/components/fx/Marquee";
import NeuralCore from "@/components/fx/NeuralCore";
import Rail from "@/components/fx/Rail";
import Scramble from "@/components/fx/Scramble";
import Terminal from "@/components/fx/Terminal";
import type { ShapeName } from "@/components/fx/shapes";
import { Button, Chip, Container, delay, LiveDot, SectionHead, sectionY } from "@/components/ui";
import { vision } from "@/content/about";
import { modules } from "@/content/curriculum";
import { achievements, announcements, codeApex3 } from "@/content/events";
import { labs } from "@/content/labs";
import { placementSummary, recruiters } from "@/content/outcomes";
import { testimonials } from "@/content/people";
import { dept, institute } from "@/lib/site";

const courseNames = (ids: string[]) =>
  modules
    .filter((m) => ids.includes(m.id))
    .flatMap((m) => m.courses.filter((c) => c.kind === "core" || c.kind === "elective").map((c) => c.name));

const layers: {
  shape: ShapeName;
  code: string;
  year: string;
  title: string;
  body: string;
  chips: string[];
}[] = [
  {
    shape: "plane",
    code: "Layer 01 · Input",
    year: "First Year",
    title: "Raw signal.",
    body: "Every VIT engineer begins on a common first year run by the Department of Engineering, Sciences & Humanities. It is the input layer: unstructured, wide, and the foundation everything after it is trained on.",
    chips: ["Common first year", "Engineering, Sciences & Humanities"],
  },
  {
    shape: "network",
    code: "Layer 02 · Hidden",
    year: "Second Year · Modules III–IV",
    title: "Structure.",
    body: "Data structures, databases and object orientation — then Machine Learning arrives in Module IV, alongside algorithms, networking and full-stack engineering.",
    chips: courseNames(["m3", "m4"]).slice(0, 8),
  },
  {
    shape: "knot",
    code: "Layer 03 · Hidden",
    year: "Third Year · Modules V–VI",
    title: "Depth.",
    body: "Artificial neural networks, then deep learning; cloud computing, cyber security and blockchain; a twelve-hour-a-week design studio; and industry certifications from IBM, Google and AWS.",
    chips: courseNames(["m5", "m6"]),
  },
  {
    shape: "glyph",
    code: "Layer 04 · Output",
    year: "Final Year · Modules VII–VIII",
    title: "Synthesis.",
    body: "Generative AI, natural language processing and a two-semester major project — or a full semester embedded in industry, a research lab, a sponsored project or a global internship.",
    chips: ["Generative AI", "Natural Language Processing", "Major Project", "Industry · Research · Global internships"],
  },
];

const half = Math.ceil(recruiters.length / 2);

export default function Home() {
  return (
    <>
      <NeuralCore />
      <div className="relative z-10">
        {/* ------------------------------------------------------------ Hero */}
        <CoreStage
          shape="brain"
          intensity={1}
          align="right"
          aria-labelledby="hero-title"
          className="relative flex min-h-[100svh] items-center pt-28 pb-20"
        >
          <Container>
            <div className="max-w-3xl">
              <Link
                href="/events"
                className="rise group inline-flex items-center gap-3 rounded-full border border-magenta/30 bg-void/70 py-1.5 pr-4 pl-3 transition-colors hover:border-magenta/70"
              >
                <LiveDot />
                <span className="label text-frost">
                  {codeApex3.name} <span className="text-haze">· registrations close {codeApex3.registerBy.replace(" 2026", "")}</span>
                </span>
                <span aria-hidden="true" className="text-magenta transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <p className="label rise mt-10 text-haze" style={delay(60)}>
                {institute.name}, Pune <span className="text-cyan">·</span> Est. {dept.established}
              </p>

              <h1 id="hero-title" className="mt-6 text-hero text-frost">
                <span className="rise block" style={delay(120)}>
                  <Scramble text="Engineering" delay={300} />
                </span>
                <span className="rise block text-gradient pb-2" style={delay(200)}>
                  intelligence.
                </span>
              </h1>

              <p className="rise mt-8 max-w-xl text-body-l text-haze" style={delay(280)}>
                The Department of Computer Science &amp; Engineering (Artificial Intelligence) trains engineers who build,
                question and ship AI — on an autonomous curriculum that runs from data structures to generative models.
              </p>

              <div className="rise mt-10 flex flex-wrap gap-3" style={delay(360)}>
                <Button href="/programme">Explore the programme</Button>
                <Button href="/events" variant="ghost">
                  See what students build
                </Button>
              </div>
            </div>

            <dl className="rise mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4" style={delay(440)}>
              {[
                ["Intake", `${dept.intake}`],
                ["NAAC", "A++"],
                ["NIRF", "Top 150"],
                ["Highest offer", `₹${placementSummary.highestLpa} LPA`],
              ].map(([k, v]) => (
                <div key={k} className="bg-void/85 px-5 py-4">
                  <dt className="label text-haze">{k}</dt>
                  <dd className="mt-1.5 font-display text-heading text-frost">{v}</dd>
                </div>
              ))}
            </dl>
          </Container>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-[42%] hidden h-[38rem] w-[38rem] translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-violet)_22%,transparent),transparent_62%)] blur-2xl lg:right-[29%] lg:block"
          />
          <p aria-hidden="true" className="label absolute top-1/2 right-6 hidden origin-right translate-y-1/2 -rotate-90 text-haze xl:block">
            {`${institute.campus.geo.lat.toFixed(2)}° N · ${institute.campus.geo.lng.toFixed(2)}° E · BLDG 03 · FLOORS 2–3`}
          </p>
          <div aria-hidden="true" className="absolute right-8 bottom-8 hidden items-center gap-4 lg:flex">
            <span className="label text-haze">Scroll · run the forward pass</span>
            <span className="relative h-12 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scan_1.8s_linear_infinite] bg-cyan" />
            </span>
          </div>
        </CoreStage>

        {/* ---------------------------------------------------------- Ticker */}
        <div className="border-y border-line bg-void/85 py-4">
          <Marquee label="Announcements" seconds={55}>
            {announcements.map((a) => (
              <span key={a} className="label flex items-center gap-6 px-6 whitespace-nowrap text-haze">
                <span aria-hidden="true" className="text-cyan">
                  ◆
                </span>
                {a}
              </span>
            ))}
          </Marquee>
        </div>

        {/* ----------------------------------------------------------- Stats */}
        <CoreStage shape="sphere" intensity={0.32} align="center" aria-labelledby="signal-title" className={sectionY}>
          <Container>
            <SectionHead
              id="signal-title"
              index="00"
              label="Signal strength"
              title="A young department, already loud."
              intro={`Established in ${dept.established}, CSE (AI) admits ${dept.intake} students a year — and its students are already being hired by PhonePe, Morgan Stanley, MSCI and Nutanix.`}
            />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Annual intake", value: <Counter value={dept.intake} />, detail: "B.Tech seats" },
                { label: "Highest package", value: <Counter value={placementSummary.highestLpa} decimals={2} prefix="₹" />, detail: "LPA · AY 2025–26" },
                { label: "Average package", value: <Counter value={placementSummary.averageLpa} decimals={2} prefix="₹" />, detail: "LPA · season ongoing" },
                { label: "Top stipend", value: <Counter value={87000} prefix="₹" />, detail: "per month · Sem 7 internship" },
                { label: "Hackathon teams", value: <Counter value={240} suffix="+" />, detail: "registered for Code Verse" },
              ].map((s, i) => (
                <div key={s.label} data-reveal style={delay(i * 80)}>
                  <Readout value={s.value} label={s.label} detail={s.detail} />
                </div>
              ))}
            </div>
          </Container>
        </CoreStage>

        {/* ------------------------------------------------- Vision/terminal */}
        <CoreStage shape="galaxy" intensity={0.55} align="left" aria-labelledby="vision-title" className={sectionY}>
          <Container className="grid items-center gap-14 lg:grid-cols-2">
            <div className="lg:order-2">
              <SectionHead id="vision-title" index="01" label="Vision" title="Intelligence, for society." />
              <blockquote data-reveal className="mt-8 border-l border-cyan/50 pl-6 font-display text-display-m text-frost" style={delay(120)}>
                “{vision}”
              </blockquote>
              <div data-reveal className="mt-8" style={delay(200)}>
                <Button href="/about" variant="ghost">
                  Mission &amp; objectives
                </Button>
              </div>
            </div>
            <div data-reveal className="lg:order-1" style={delay(120)}>
              <Terminal
                title="cse-ai@vit-pune: ~"
                lines={[
                  { kind: "cmd", text: "whoami" },
                  { kind: "out", text: `Department of ${dept.name}` },
                  { kind: "cmd", text: "cat mission.txt" },
                  { kind: "out", text: "M1 · engineers for industry, academia, entrepreneurship" },
                  { kind: "out", text: "M2 · value-added, research-oriented education" },
                  { kind: "out", text: "M3 · innovation, industry engagement, higher studies" },
                  { kind: "out", text: "M4 · ethical, socially responsible lifelong learners" },
                  { kind: "cmd", text: "head --of-department" },
                  { kind: "out", text: `${dept.hod.name} — ${dept.hod.role}` },
                  { kind: "cmd", text: `ping ${dept.email}` },
                  { kind: "ok", text: `✓ reachable · ${dept.phone.display}` },
                ]}
              />
            </div>
          </Container>
        </CoreStage>

        {/* ---------------------------------------------------- Forward pass */}
        <section aria-labelledby="pass-title" className="pt-[clamp(4.5rem,9vw,8.5rem)]">
          <Container>
            <SectionHead
              id="pass-title"
              index="02"
              label="The forward pass"
              title="Four years. Four layers."
              intro="A degree here is built like the networks it teaches: an input layer, two hidden layers of increasing depth, and an output. Keep scrolling — the core re-forms at each one."
            />
          </Container>
          {layers.map((l, i) => (
            <CoreStage key={l.code} shape={l.shape} intensity={0.95} align="right" aria-labelledby={`layer-${i}`} className="flex min-h-[88vh] items-center py-16">
              <Container>
                <div data-reveal className="holo max-w-xl p-7 sm:p-10">
                  <div className="flex items-center justify-between gap-4">
                    <p className="label text-cyan">{l.code}</p>
                    <p className="label text-haze">{String(i + 1).padStart(2, "0")} / 04</p>
                  </div>
                  <p className="label mt-6 text-violet">{l.year}</p>
                  <h3 id={`layer-${i}`} className="mt-3 text-display-xl text-frost">
                    {l.title}
                  </h3>
                  <p className="mt-5 text-body text-haze">{l.body}</p>
                  <ul className="mt-7 flex flex-wrap gap-2" aria-label="Courses">
                    {l.chips.map((c) => (
                      <li key={c}>
                        <Chip>{c}</Chip>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan to-violet" style={{ width: `${(i + 1) * 25}%` }} />
                  </div>
                </div>
              </Container>
            </CoreStage>
          ))}
          <Container className="pb-8">
            <div data-reveal className="flex justify-center">
              <Button href="/programme" variant="ghost">
                Open the full curriculum
              </Button>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------------------ Labs */}
        <CoreStage shape="sphere" intensity={0.22} align="center" aria-labelledby="labs-title" className={sectionY}>
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHead
                id="labs-title"
                index="03"
                label="Infrastructure"
                title="Where the models are trained."
                intro={`Four dedicated laboratories on the second and third floors of Building 3 — ${labs.reduce((n, l) => n + l.seats, 0)} workstations, and a VR headset for immersive work.`}
              />
              <div data-reveal>
                <Button href="/labs" variant="ghost">
                  Tour the labs
                </Button>
              </div>
            </div>
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {labs.map((lab, i) => (
                <li key={lab.id} data-reveal style={delay(i * 90)}>
                  <LabCard lab={lab} index={i} />
                </li>
              ))}
            </ul>
          </Container>
        </CoreStage>

        {/* ---------------------------------------------------- Achievements */}
        <CoreStage shape="galaxy" intensity={0.3} align="center" aria-labelledby="wins-title" className={sectionY}>
          <Container>
            <SectionHead
              id="wins-title"
              index="04"
              label="Signal from the field"
              title="Students who ship — and win."
              intro="Smart India Hackathon, the Allianz India Tech Championship, IIT Delhi's Robocon, IIT Roorkee's DATAFORGE. A sample of the last two years."
            />
            <div className="mt-10" data-reveal>
              <Rail label="Student achievements">
                {achievements.slice(0, 12).map((a) => (
                  <li key={a.title} className="w-[82%] shrink-0 snap-start sm:w-[22rem]">
                    <AchievementCard a={a} />
                  </li>
                ))}
              </Rail>
            </div>
          </Container>
        </CoreStage>

        {/* ------------------------------------------------------ Recruiters */}
        <CoreStage shape="network" intensity={0.25} align="center" aria-labelledby="recruit-title" className={sectionY}>
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
              <SectionHead
                id="recruit-title"
                index="05"
                label="Placements · AY 2025–26"
                title="Where our engineers go."
                intro="The 2025–26 placement season was still running when these figures were published — read them as a snapshot, not a final count."
              />
              <div className="grid grid-cols-3 gap-3" data-reveal>
                <Readout value={<Counter value={placementSummary.placedPercent} suffix="%" />} label="Placed" detail="so far" />
                <Readout value={<Counter value={placementSummary.highestLpa} decimals={2} />} label="Highest" detail="LPA" />
                <Readout value={<Counter value={placementSummary.averageLpa} decimals={2} />} label="Average" detail="LPA" />
              </div>
            </div>
          </Container>
          <div className="mt-16 space-y-4">
            {[recruiters.slice(0, half), recruiters.slice(half)].map((row, r) => (
              <Marquee key={r} label={r === 0 ? "Recruiters" : "More recruiters"} reverse={r === 1} seconds={60}>
                {row.map((name) => (
                  <span
                    key={name}
                    className="mx-2 rounded-full border border-line bg-panel/50 px-6 py-3 font-display text-heading whitespace-nowrap text-haze transition-colors hover:border-cyan/50 hover:text-frost"
                  >
                    {name}
                  </span>
                ))}
              </Marquee>
            ))}
          </div>
          <Container className="mt-12">
            <div data-reveal className="flex justify-center">
              <Button href="/placements" variant="ghost">
                Placement &amp; internship data
              </Button>
            </div>
          </Container>
        </CoreStage>

        {/* ------------------------------------------------------- Code Apex */}
        <CoreStage shape="glyph" intensity={0.4} align="right" aria-labelledby="apex-title" className={sectionY}>
          <Container>
            <div data-reveal className="border-orbit holo overflow-hidden rounded-[1.75rem] p-7 sm:p-12">
              <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <p className="label flex items-center gap-3 text-magenta">
                    <LiveDot /> Registrations open · close {codeApex3.registerBy}
                  </p>
                  <h2 id="apex-title" className="glitch mt-6 text-display-xl text-frost" data-text={codeApex3.name}>
                    {codeApex3.name}
                  </h2>
                  <p className="mt-4 font-display text-display-m text-gradient">{codeApex3.tagline}</p>
                  <p className="mt-6 max-w-xl text-body text-haze">
                    A three-stage hackathon by the {codeApex3.organiser}, ending in a 24-hour offline Grand Finale on the
                    Bibwewadi campus. Teams of {codeApex3.team}. Prize pool {codeApex3.prizePool}.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href={codeApex3.registerUrl} external>
                      Register on Unstop
                    </Button>
                    <Button href="/events" variant="ghost">
                      Stages &amp; tracks
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="label text-haze">Grand Finale · 24 October 2026</p>
                  <div className="mt-4">
                    <Countdown to={codeApex3.finale} endedLabel="Grand Finale in progress" />
                  </div>
                  <ul className="mt-8 grid grid-cols-3 gap-3">
                    {codeApex3.prizes.map((p) => (
                      <li key={p.place} className="rounded-xl border border-line bg-void/50 p-4">
                        <p className="label text-haze">{p.place}</p>
                        <p className="mt-2 font-display text-heading text-frost">{p.amount}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </CoreStage>

        {/* ---------------------------------------------------- Testimonials */}
        <CoreStage shape="sphere" intensity={0.25} align="center" aria-labelledby="voices-title" className={sectionY}>
          <Container>
            <SectionHead id="voices-title" index="06" label="Students' speak" title="In their words." align="center" />
            <ul className="mt-14 grid gap-5 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <li key={t.name} data-reveal style={delay(i * 100)}>
                  <figure className="holo flex h-full flex-col p-7">
                    <span aria-hidden="true" className="font-display text-[4rem] leading-none text-gradient">
                      “
                    </span>
                    <blockquote className="mt-2 text-body text-frost/90">{t.quote}</blockquote>
                    <figcaption className="mt-auto flex items-center gap-3 pt-8">
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan/40 font-display text-small text-cyan">
                        {t.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <span>
                        <span className="block text-small font-semibold text-frost">{t.name}</span>
                        <span className="label block text-haze">{t.programme}</span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </CoreStage>

        {/* ------------------------------------------------------------- CTA */}
        <CoreStage shape="brain" intensity={0.7} align="center" aria-labelledby="cta-title" className="py-[clamp(6rem,14vw,12rem)]">
          <Container className="text-center">
            <p data-reveal className="label text-cyan">
              Admissions · {institute.short}
            </p>
            <h2 id="cta-title" data-reveal className="mx-auto mt-6 max-w-4xl text-hero text-frost" style={delay(80)}>
              Your forward pass <span className="text-gradient">starts here.</span>
            </h2>
            <p data-reveal className="mx-auto mt-8 max-w-xl text-body-l text-haze" style={delay(160)}>
              Admission enquiries: <a className="text-frost hover:text-cyan" href={institute.admissions.phones[0].href}>{institute.admissions.phones[0].display}</a>{" "}
              · <a className="text-frost hover:text-cyan" href={`mailto:${institute.admissions.email}`}>{institute.admissions.email}</a>
            </p>
            <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3" style={delay(240)}>
              <Button href={institute.admissionsUrl} external>
                Undergraduate admissions
              </Button>
              <Button href="/contact" variant="ghost">
                Talk to the department
              </Button>
            </div>
          </Container>
        </CoreStage>
      </div>
    </>
  );
}
