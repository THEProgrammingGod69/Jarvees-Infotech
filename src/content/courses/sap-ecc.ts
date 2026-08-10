import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-ecc",
  name: "SAP ECC",
  moduleCode: "ECC",
  track: "sap",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "The previous generation of SAP ERP, still running in a large number of companies — and the thing an S/4HANA migration migrates from.",
  duration: "{{ECC_DURATION}}",
  batchTimings: "{{ECC_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "ECC has not gone away. A great many companies are still running it, still hiring support consultants for it, and still planning the move off it — and on a migration project the person who knows the old system is as valuable as the person who knows the new one.",
    "This course covers ECC as a system: the navigation and architecture, the client concept, how the modules sit together, the classic table structures that S/4HANA replaced, and the support work that keeps it running.",
    "It is usually taken alongside a functional module rather than instead of one. Tell us which module you are aiming for when you enquire and we will tell you honestly whether you need this as well.",
  ],
  whoFor: [
    "Learners heading for an SAP support role in a company that has not yet migrated",
    "Consultants preparing for a system conversion project who need the source system properly",
    "Functional learners who want the architectural context behind their module",
  ],
  curriculum: [
    {
      title: "System architecture and navigation",
      topics: [
        "Three-tier architecture: presentation, application and database",
        "The client concept and what it isolates",
        "SAP GUI navigation, transaction codes, favourites and session handling",
        "The system landscape: development, quality assurance and production",
      ],
    },
    {
      title: "Modules and how they connect",
      topics: [
        "The functional module map — FI, CO, MM, SD, PP, QM, PM, HR",
        "Integration points and where documents cross module boundaries",
        "Organisational structures shared across modules",
      ],
    },
    {
      title: "Classic data model",
      topics: [
        "BKPF and BSEG, and the index and aggregate tables around them",
        "Why finance reporting depended on those tables",
        "Separate customer and vendor masters",
        "What S/4HANA removed, and what breaks as a result",
      ],
    },
    {
      title: "Support and day-to-day operation",
      topics: [
        "Incident handling and the shape of an SAP support ticket",
        "Reading a document flow to find where a process stopped",
        "Common configuration checks before escalating",
        "Transport requests and moving a fix through the landscape",
      ],
    },
  ],
  liveProject: {
    title: "Support-desk simulation on a running ECC process",
    description:
      "You are given a set of realistic incidents against a working process — a posting that will not go through, a document flow that stops at delivery, a missing account determination — and you diagnose each one, document the root cause, and either fix it or write the specification for whoever will.",
    artefacts: [
      "Incident records with root cause analysis for each",
      "A document flow trace showing where each process failed",
      "A transport request containing a configuration fix you made",
    ],
  },
  prerequisites: [
    "No programming required.",
    "This works best taken alongside or after a functional module such as FICO, MM or SD.",
    "No prior SAP exposure is assumed.",
  ],
  roles: [
    "SAP support consultant",
    "SAP end user or power user",
    "Migration analyst on a system conversion",
  ],
  codes: ["SAP GUI", "BKPF", "BSEG", "SE16N", "SM35"],
  related: relatedSlugs("ecc"),
  metaDescription:
    "SAP ECC course in Pune — architecture, module integration, the classic data model and support practice, with a live project. Classroom at two centres or online.",
};

export default course;
