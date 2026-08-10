/**
 * Course content model.
 *
 * To add a course: copy any file in `src/content/courses/`, change the values,
 * and add the import to `src/content/courses/index.ts`. Nothing else needs to
 * change — the catalogue, filters, detail page, sitemap and JSON-LD all read
 * from this shape.
 *
 * Use `{{DOUBLE_BRACE}}` tokens for anything the academy has not confirmed
 * (durations, batch timings, fees). They render as a visible "to confirm"
 * chip rather than a plausible-looking invention, and every one of them is
 * listed in CONTENT-TODO.md.
 */

export type TrackId = "sap" | "enterprise-platforms" | "data" | "engineering-qa";

export type Mode = "online" | "classroom";

export type Level = "beginner" | "intermediate";

export type CurriculumModule = {
  /** e.g. "General ledger accounting" */
  title: string;
  /** Real sub-topics. Keep these specific — they are the reason someone reads. */
  topics: string[];
};

export type Course = {
  /** URL slug: /courses/<slug>. Keyword-honest, no marketing words. */
  slug: string;
  name: string;
  /** SAP module code where one genuinely exists — FICO, MM, SD, ABAP. */
  moduleCode?: string;
  track: TrackId;
  level: Level;
  modes: Mode[];
  /** One line, shown on catalogue cards. Plain description, no selling. */
  summary: string;
  /** Placeholder token until the academy confirms. */
  duration: string;
  batchTimings: string;
  /**
   * `full` pages carry a module-by-module curriculum. `outline` pages are
   * honest about being a summary and say so on the page.
   */
  depth: "full" | "outline";
  overview: string[];
  whoFor: string[];
  curriculum: CurriculumModule[];
  liveProject: {
    title: string;
    description: string;
    /** What the learner physically ends up with. */
    artefacts: string[];
  };
  prerequisites: string[];
  /** Roles this course maps to in the market. Descriptive, not promised. */
  roles: string[];
  /** Real transaction codes / tools, shown in the mono register. */
  codes?: string[];
  /**
   * Related slugs. For SAP modules these are drawn from real integration
   * adjacency (see `src/content/landscape.ts`), not from a random slice.
   */
  related: string[];
  metaDescription: string;
};

export type Track = {
  id: TrackId;
  name: string;
  /** Mono code shown on the track cell. */
  code: string;
  description: string;
};

export const tracks: Track[] = [
  {
    id: "sap",
    name: "SAP",
    code: "SAP",
    description:
      "The functional and technical modules that make up an SAP landscape, from financial accounting through to the ABAP layer they are all extended in.",
  },
  {
    id: "enterprise-platforms",
    name: "Enterprise platforms",
    code: "PLT",
    description:
      "Cloud business platforms that sit alongside or replace parts of an ERP — configuration, automation and administration.",
  },
  {
    id: "data",
    name: "Data",
    code: "DAT",
    description:
      "Working with data end to end: cleaning it, modelling it, and explaining what the model actually says.",
  },
  {
    id: "engineering-qa",
    name: "Engineering & QA",
    code: "ENG",
    description:
      "Programming languages and the testing discipline that decides whether what was built actually works.",
  },
];

export const trackById = (id: TrackId): Track =>
  tracks.find((t) => t.id === id) ?? tracks[0]!;

export const levelLabel: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
};

export const modeLabel: Record<Mode, string> = {
  online: "Online",
  classroom: "Classroom",
};

/**
 * Identical for every course, so it lives here rather than being repeated —
 * and so the certification wording can never drift out of compliance in one
 * file while staying correct in another.
 */
export const whatYouReceive = [
  {
    title: "Course completion certificate",
    body: "Issued by Jarvees Academy on completion. This is the academy's own certificate — it is not an SAP certification.",
  },
  {
    title: "Live project documentation",
    body: "The configuration documents, test scripts and process notes you produce during the project, in a form you can talk through in an interview.",
  },
  {
    title: "Resume and interview preparation",
    body: "Help structuring your resume around what you actually built, plus interview practice on the questions this module attracts.",
  },
  {
    title: "Placement assistance",
    body: "Career guidance and introductions where we can make them. Assistance, not a guarantee — no institute can promise you a job.",
  },
];

/**
 * Compliance-critical copy. SAP's global certification is a separate paid exam
 * taken through SAP, not something any training institute issues. This block
 * appears on every course detail page in the SAP track.
 */
export const sapCertificationNote = {
  heading: "About SAP certification",
  body: [
    "Two different things are often confused, so it is worth being exact about them.",
    "The certificate you receive here is a course completion certificate from Jarvees Academy. It records that you completed this course and the live project that goes with it.",
    "SAP's own global certification is a separate examination, set and issued by SAP SE, taken through SAP's official channels and paid for separately. It is not included in this course and is not something we can issue on SAP's behalf. If you decide to attempt it, the training here covers the subject matter, and we will tell you honestly what the exam expects.",
  ],
};
