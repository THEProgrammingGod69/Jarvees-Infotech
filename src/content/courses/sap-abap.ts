import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-abap",
  name: "SAP ABAP",
  moduleCode: "ABAP",
  track: "sap",
  level: "intermediate",
  modes: ["online", "classroom"],
  summary:
    "SAP's programming language and the development layer every functional module is extended in — reports, forms, interfaces, conversions and enhancements.",
  duration: "{{ABAP_DURATION}}",
  batchTimings: "{{ABAP_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "Standard SAP does perhaps eighty per cent of what a company needs. ABAP is how the rest gets built. Custom reports the business asks for, the invoice layout with their logo on it, the interface that pushes orders to a warehouse system, the validation that stops a user posting something they should not — all of it is ABAP.",
    "The work divides into five recognisable kinds, and the course is organised around them: reports, interfaces, conversions, enhancements and forms. Knowing which of the five a requirement is tells you most of how to build it.",
    "You will spend time in the data dictionary before you write much code, because in ABAP the data model is not an afterthought — tables, data elements, domains, search helps and lock objects are the foundation everything else stands on. Then classical and interactive reporting, ALV, dialog programming, and the enhancement techniques that let you change standard SAP behaviour without modifying SAP's own code.",
  ],
  whoFor: [
    "Computer science, IT and engineering graduates who can already write basic code in some language",
    "Developers in another language moving into the SAP ecosystem",
    "Functional consultants who want to read and debug the code behind their module",
    "Support engineers who need to diagnose short dumps and performance problems rather than escalate them",
  ],
  curriculum: [
    {
      title: "Environment and language fundamentals",
      topics: [
        "The ABAP workbench and object navigator; packages and transport requests",
        "Data types, variables, constants and system fields",
        "Control structures, string operations and arithmetic",
        "Internal tables — standard, sorted and hashed, and when each is correct",
        "Open SQL, joins, and the difference between reading a table and reading it well",
        "Debugging: breakpoints, watchpoints and the new debugger",
      ],
    },
    {
      title: "Data dictionary",
      topics: [
        "Domains, data elements and transparent tables",
        "Structures, table types and append structures",
        "Foreign keys, check tables and value tables",
        "Views — database, projection, maintenance and help views",
        "Search helps, elementary and collective",
        "Lock objects and the enqueue/dequeue mechanism",
        "Table maintenance generator",
      ],
    },
    {
      title: "Modularisation and reporting",
      topics: [
        "Subroutines, function modules and function groups",
        "Include programs and their proper use",
        "Selection screens — parameters, select-options, variants and validation",
        "Classical reports, and events in a report's lifecycle",
        "Interactive reports and hide/hotspot handling",
        "ALV reporting with the function modules and with CL_SALV_TABLE",
      ],
    },
    {
      title: "Object-oriented ABAP",
      topics: [
        "Classes, objects, attributes and methods; local against global classes",
        "Inheritance, interfaces and polymorphism in ABAP terms",
        "Events and event handling",
        "Exception classes and structured error handling",
        "Class builder and the ABAP Objects style of writing reports",
      ],
    },
    {
      title: "Dialog programming and forms",
      topics: [
        "Module pool programming, PBO and PAI",
        "Screen painter, menu painter and the status bar",
        "Table controls and tabstrips",
        "SAPscript fundamentals and when you will still meet it",
        "Smart Forms — form design, windows, text and table output",
        "Overview of Adobe Forms",
      ],
    },
    {
      title: "Data transfer and interfaces",
      topics: [
        "Batch data communication — session method and call transaction",
        "Recording with SHDB and handling errors properly",
        "Legacy System Migration Workbench",
        "BAPIs and how to call them correctly, including the commit",
        "ALE and IDocs — segments, message types, partner profiles, monitoring and reprocessing",
        "File handling on the application and presentation server",
      ],
    },
    {
      title: "Enhancements and performance",
      topics: [
        "User exits and customer exits with the enhancement projects that hold them",
        "BAdIs — classic and new, and how to find the right one",
        "The enhancement framework: implicit and explicit enhancement points",
        "Modifications, access keys, and why you avoid them",
        "Performance: runtime analysis, SQL trace, index usage, and the cost of nested loops",
        "Short dump analysis and reading someone else's code under pressure",
      ],
    },
    {
      title: "ABAP in an S/4HANA world",
      topics: [
        "Code pushdown and why the old rules about doing work in ABAP changed",
        "Core data services views and their annotations",
        "The ABAP restricted syntax in a HANA-optimised system",
        "Where OData services fit for Fiori applications",
      ],
    },
  ],
  liveProject: {
    title: "Build a custom reporting and interface set for a procurement process",
    description:
      "You are given a business requirement in the words a business would actually use, not a specification. You design the data dictionary objects, build an ALV report with a selection screen and drill-down, produce a Smart Form output for a purchase order, load legacy vendor data through a BDC with proper error handling, and implement a BAdI that enforces a business rule on purchase order creation. Then you profile a deliberately slow report and make it fast, and explain what you changed and why.",
    artefacts: [
      "A technical specification you wrote from a business requirement",
      "Working ABAP objects — dictionary objects, an ALV report, a Smart Form and a BDC program",
      "A BAdI implementation with the search process you used to find it documented",
      "A before-and-after performance analysis with the runtime figures",
    ],
  },
  prerequisites: [
    "Programming exposure genuinely helps here. If you have written loops, conditions and functions in any language — C, Java, Python, even VBA — you will be comfortable.",
    "If you have never programmed, say so when you enquire. The fundamentals can be covered first; starting ABAP cold with no programming background is possible but slower, and we would rather tell you that up front.",
    "No prior SAP knowledge is assumed. Functional context is explained as it becomes relevant.",
    "A database background is useful for the Open SQL and performance sections but is not required.",
  ],
  roles: [
    "SAP ABAP developer",
    "SAP technical consultant",
    "SAP application support engineer",
    "SAP technical-functional consultant, with a module alongside",
  ],
  codes: ["SE38", "SE80", "SE11", "SE37", "SE24", "SE18", "SE19", "ST22", "SAT", "ST05"],
  related: relatedSlugs("abap"),
  metaDescription:
    "SAP ABAP course in Pune — data dictionary, reports, ALV, dialog programming, Smart Forms, BAPIs, IDocs and enhancements, with a live project. Classroom or online.",
};

export default course;
