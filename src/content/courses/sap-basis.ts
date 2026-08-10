import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-basis",
  name: "SAP Basis",
  moduleCode: "BASIS",
  track: "sap",
  level: "intermediate",
  modes: ["online", "classroom"],
  summary:
    "System administration for SAP — installation, transports, users and authorisations, monitoring, and keeping the landscape running.",
  duration: "{{BASIS_DURATION}}",
  batchTimings: "{{BASIS_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "Basis is the layer everything else depends on. Every piece of configuration a functional consultant makes and every program a developer writes has to be transported from development into production by Basis, and every user who logs in does so with an authorisation that Basis administers.",
    "It is a technical, infrastructure-facing role — closer to systems administration than to business process work — and it suits people who like knowing how the machine actually runs.",
    "This outline covers the administration work that fills a Basis administrator's week. Tell us your background when you enquire and we will tell you where you would be starting from.",
  ],
  whoFor: [
    "IT and computer science graduates interested in infrastructure rather than business processes",
    "System or network administrators moving into the SAP ecosystem",
    "Support engineers who want to move to the technical side of an SAP team",
  ],
  curriculum: [
    {
      title: "Architecture and installation",
      topics: [
        "Three-tier architecture, work processes and the dispatcher",
        "Instances, profiles and the parameters that matter",
        "Installation overview and post-installation activities",
        "Starting, stopping and checking a system",
      ],
    },
    {
      title: "Transport management",
      topics: [
        "The landscape: development, quality assurance and production",
        "Transport Management System configuration",
        "Transport requests, tasks, release and import",
        "Import queues, return codes and diagnosing a failed transport",
      ],
    },
    {
      title: "Users and authorisations",
      topics: [
        "User administration, user types and licence relevance",
        "Roles, profiles and the profile generator",
        "Authorisation objects and how an authorisation check actually works",
        "Tracing a missing authorisation and fixing it correctly",
      ],
    },
    {
      title: "Monitoring and operations",
      topics: [
        "System log, work process overview and lock entries",
        "Background job scheduling and monitoring",
        "Update and spool administration",
        "Performance monitoring and the standard analysis transactions",
        "Client administration: copy, export and deletion",
        "Backup and recovery concepts, and support package application",
      ],
    },
  ],
  liveProject: {
    title: "Administer a landscape through a change and a failure",
    description:
      "You configure a transport route, move a change through development and quality assurance into production, build a role with exactly the authorisations a job needs and no more, then diagnose a failed transport and a user who cannot execute a transaction — using traces rather than guesswork.",
    artefacts: [
      "A transport route configuration with the change history behind it",
      "A role definition with the authorisation objects justified",
      "An authorisation trace and the fix it led to",
      "A monitoring checklist for a daily system health check",
    ],
  },
  prerequisites: [
    "Comfort with operating systems and basic networking helps considerably.",
    "Database familiarity is useful but not required.",
    "No programming is needed, although reading a short dump is part of the job.",
  ],
  roles: [
    "SAP Basis administrator",
    "SAP system administrator",
    "SAP technical support engineer",
  ],
  codes: ["STMS", "SU01", "PFCG", "SM37", "SM21", "SM59", "ST02"],
  related: relatedSlugs("basis"),
  metaDescription:
    "SAP Basis course in Pune — system architecture, transport management, users and authorisations, monitoring and administration, with a live project.",
};

export default course;
