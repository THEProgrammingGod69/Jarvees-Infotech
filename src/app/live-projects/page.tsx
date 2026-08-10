import type { Metadata } from "next";

import Section, { Shell, SectionHeading } from "@/components/Section";
import { Reveal } from "@/components/motion";
import JsonLd from "@/components/JsonLd";
import { Cta, MonoLabel } from "@/components/ui";
import { breadcrumbSchema } from "@/lib/jsonld";
import { courses } from "@/content/courses";

export const metadata: Metadata = {
  title: "Live projects — how project-based training works here",
  description:
    "Every course at Jarvees Academy ends in a live project: configuration you make yourself, the documents a consultant produces, and something concrete to talk through in an interview.",
  alternates: { canonical: "/live-projects" },
};

const stages = [
  {
    n: "01",
    title: "You are given a business, not a worksheet",
    body: "The brief is written the way a business writes one — a company, a process that needs to work, and the gaps and contradictions that real requirements contain. Part of the exercise is noticing what the brief does not say and asking about it.",
  },
  {
    n: "02",
    title: "You configure or build it yourself",
    body: "Nobody demonstrates it while you watch. You make the configuration, write the code, or design the test suite, in a system you have access to, and you make the decisions — including the ones that turn out to be wrong.",
  },
  {
    n: "03",
    title: "Something breaks",
    body: "This is deliberate. A posting will not go through, a pricing procedure returns the wrong value, a suite passes locally and fails in the pipeline. Diagnosing it is the part that separates people who have used a system from people who understand it.",
  },
  {
    n: "04",
    title: "You document what you did",
    body: "Configuration documents, test scripts, process notes, a technical specification — the artefacts a consultant is expected to produce. Writing them is how you find out whether you actually understood the decision you made.",
  },
  {
    n: "05",
    title: "You explain it out loud",
    body: "You walk a trainer through what you built and why, and answer the questions an interviewer would ask. This is rehearsal for the conversation that decides whether you get the job.",
  },
];

export default function LiveProjectsPage() {
  return (
    <>
      <Shell>
        <div className="rail-grid">
          <div className="hidden border-r border-hairline py-14 pr-6 lg:block">
            <p className="font-mono text-mono-label uppercase text-steel tnum">
              01
            </p>
            <p className="mt-2 font-mono text-mono-label uppercase text-steel">
              Method
            </p>
          </div>
          <div className="py-14 lg:pl-10 lg:py-20">
            <MonoLabel tone="signal">On every course</MonoLabel>
            <h1 className="mt-6 max-w-4xl text-display-xl text-chalk">
              Live projects
            </h1>
            <p className="mt-7 max-w-2xl text-body-l text-steel">
              The most useful thing you leave here with is not the certificate.
              It is a piece of work you built yourself, that went wrong in the
              middle, that you fixed, and that you can therefore talk about for
              twenty minutes without running out of things to say.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="/courses">See the projects by course</Cta>
              <Cta href="/contact" variant="line">
                Ask about a specific module
              </Cta>
            </div>
          </div>
        </div>
      </Shell>

      {/* This is the one place a public review is the whole point of the
          section, so it is given the room a pull quote deserves. */}
      <div className="border-y border-hairline bg-graphite">
        <Shell>
          <figure className="py-14 lg:py-20">
            <blockquote className="max-w-4xl">
              <p className="text-display-m text-chalk">
                “The course content was up to the mark and the trainer provided
                was excellent. The live project given to me was effective and
                added on to what I learnt in the course.”
              </p>
            </blockquote>
            <figcaption className="mt-6 font-mono text-mono-label uppercase text-steel">
              Verified review, JustDial
            </figcaption>
          </figure>
        </Shell>
      </div>

      <Section index="02" label="What it is" bleed>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading title="What a live project is" />
            <div className="mt-8 space-y-5 text-body-l text-steel">
              <p>
                A live project is a piece of realistic work, scoped to the module
                you are studying, that you complete yourself in a working system
                towards the end of the course.
              </p>
              <p>
                For SAP FICO it is configuring the books for a company from an
                empty client through to a closed period. For MM it is a full
                procure-to-pay cycle including the special procurement processes.
                For automation testing it is a framework built from an empty
                repository that then has to survive the application changing
                underneath it.
              </p>
              <p>
                The scope is deliberately larger than a classroom exercise and
                deliberately smaller than a real implementation. It is big
                enough that you have to make design decisions and live with
                them, and small enough that you can finish it.
              </p>
            </div>
          </div>

          {/* The honesty boundary. This is the most important block on the
              site: it protects the learner from misrepresenting themselves and
              protects the academy from being the reason they did. */}
          <div className="lg:col-span-6">
            <div className="border border-signal/30 bg-signal/5 p-6 sm:p-8">
              <MonoLabel tone="signal">Be clear about this</MonoLabel>
              <h2 className="mt-4 text-heading text-chalk">
                What a live project is not
              </h2>
              <ul className="mt-5 space-y-4 text-body-s text-steel">
                <li>
                  <span className="text-chalk">It is not employment.</span> You
                  are not employed by us or by anyone else while you do it, and
                  it is not an internship.
                </li>
                <li>
                  <span className="text-chalk">
                    It is not work for a client.
                  </span>{" "}
                  You are not working on a real company&rsquo;s live system, and no
                  client is receiving your output.
                </li>
                <li>
                  <span className="text-chalk">
                    It is not professional experience, and it must not go on
                    your resume as a job.
                  </span>{" "}
                  Putting a training project under employment history is
                  misrepresentation, it is found out at reference stage, and it
                  costs people offers.
                </li>
              </ul>
              <p className="mt-5 border-t border-signal/20 pt-5 text-body-s text-steel">
                Describe it for what it is — project-based training work — and
                it does you credit. We will show you how to put it on a resume
                honestly, under projects rather than under experience, and how
                to answer “have you worked on a real project?” in a way that is
                both true and to your advantage.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section index="03" label="How it runs">
        <Reveal>
          <SectionHeading
            title="How a project runs"
            standfirst="Five stages. The third one is the stage that does the teaching."
          />
        </Reveal>

        <ol className="mt-12 border border-hairline">
          {stages.map((stage) => (
            <li
              key={stage.n}
              className="grid gap-4 border-b border-hairline p-6 last:border-b-0 sm:grid-cols-[4rem_1fr] sm:p-8"
            >
              <p className="font-mono text-mono-label uppercase text-signal tnum">
                {stage.n}
              </p>
              <div>
                <h3 className="text-heading text-chalk">{stage.title}</h3>
                <p className="mt-3 max-w-2xl text-body-s text-steel">
                  {stage.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section index="04" label="Artefacts" tone="graphite">
        <SectionHeading
          title="What you physically end up with"
          standfirst="A project you cannot show is a project you cannot use. Every course produces documents you keep."
        />

        <div className="mt-12 grid gap-px bg-hairline md:grid-cols-3">
          {[
            {
              title: "Configuration and design documents",
              body: "A written record of every setting you made and the reason for it, in the format a consultant hands over at the end of a phase. On technical courses this is the specification and the code itself.",
            },
            {
              title: "Test scripts and evidence",
              body: "The scenarios you ran, what you expected, what actually happened, and the screenshots or logs that prove it. This is what turns “I did a project” into something a hiring manager can assess.",
            },
            {
              title: "Process documentation",
              body: "The end-to-end flow written up as a business would read it, including where it broke and what you changed. This is the document people find hardest to write and remember longest.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-graphite p-6 sm:p-8">
              <h3 className="text-heading text-chalk">{item.title}</h3>
              <p className="mt-3 text-body-s text-steel">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section index="05" label="Interviews">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              title="What it prepares you for"
              standfirst="Interviews for functional and technical roles converge on the same question in different words: tell me about something you actually did."
            />
          </div>
          <div className="lg:col-span-6">
            <ul className="space-y-5">
              {[
                "“Walk me through the process end to end.” You can, because you built it, and you know which step you found hardest.",
                "“What went wrong and how did you fix it?” This is the question candidates who only watched a demonstration cannot answer, and it is asked in almost every interview.",
                "“Why did you configure it that way?” Having made the decision yourself, you have a reason, which is a different thing from having memorised a setting.",
                "“What would you do differently?” The honest answer to this is the one that gets people hired, and you will have one.",
              ].map((item) => (
                <li
                  key={item}
                  className="border-l border-steel-dim pl-5 text-body-l text-steel"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Cta href="/courses">Browse {courses.length} courses</Cta>
          <Cta href="/contact" variant="line">
            Send enquiry
          </Cta>
        </div>
      </Section>

      <JsonLd
        id="schema-live-projects-breadcrumb"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Live projects", path: "/live-projects" },
        ])}
      />
    </>
  );
}
