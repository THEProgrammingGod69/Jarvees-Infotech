import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-hana",
  name: "SAP HANA",
  moduleCode: "HANA",
  track: "sap",
  level: "intermediate",
  modes: ["online", "classroom"],
  summary:
    "The in-memory database underneath S/4HANA — how it stores data, how you model on it, and why the application layer changed because of it.",
  duration: "{{HANA_DURATION}}",
  batchTimings: "{{HANA_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "HANA is a column-store, in-memory database, and both of those properties change what is sensible to do with data. Aggregates that used to be stored can be calculated when asked for. Work that used to happen in the application layer is better done in the database. S/4HANA exists in the shape it does because of these facts.",
    "This course covers HANA as a database and a modelling environment: the storage model, the modelling artefacts, SQLScript, and the design decisions that make a model fast rather than merely correct.",
    "It suits people heading for a technical SAP role, and it pairs naturally with ABAP or with S/4HANA.",
  ],
  whoFor: [
    "ABAP developers moving to HANA-optimised development",
    "Database and BI professionals entering the SAP ecosystem",
    "Technical consultants supporting an S/4HANA landscape",
  ],
  curriculum: [
    {
      title: "Architecture and storage",
      topics: [
        "Column store against row store, and when each is correct",
        "In-memory processing, compression and the delta merge",
        "Persistence: savepoints, logs and why in-memory is not volatile",
        "Index server, scale-up and scale-out at a conceptual level",
      ],
    },
    {
      title: "Modelling",
      topics: [
        "Attribute, analytic and calculation views in context",
        "Calculation views: dimension, cube and cube with star join",
        "Joins, unions, aggregation and projection nodes",
        "Input parameters, variables and filters",
        "Core data services views and the virtual data model",
      ],
    },
    {
      title: "SQLScript and procedures",
      topics: [
        "SQLScript basics and declarative against imperative logic",
        "Table variables and avoiding row-by-row processing",
        "Stored procedures, functions and their parameters",
        "Calling HANA procedures from ABAP",
      ],
    },
    {
      title: "Performance and administration basics",
      topics: [
        "Explain plan and the performance analysis tools",
        "Modelling choices that cost you at runtime",
        "Security: users, roles and analytic privileges",
        "Data provisioning options at an overview level",
      ],
    },
  ],
  liveProject: {
    title: "Model a reporting requirement on HANA and make it fast",
    description:
      "You take a reporting requirement over a realistic data volume, build the calculation views to satisfy it, and then measure it. A deliberately naive first model is profiled, the plan is read, and the model is rebuilt until the query returns in a time a user would accept — with the reasoning written down.",
    artefacts: [
      "A set of calculation views satisfying a stated reporting requirement",
      "SQLScript procedures where the logic needed them",
      "A before-and-after performance comparison with the explain plans",
    ],
  },
  prerequisites: [
    "SQL knowledge is genuinely necessary here — you should be comfortable with joins and aggregation before starting.",
    "ABAP or database experience helps but is not required.",
    "This is not a first SAP course.",
  ],
  roles: [
    "SAP HANA modeller",
    "HANA database developer",
    "SAP technical consultant",
  ],
  codes: ["HANA Studio", "SQLScript", "CDS", "Explain Plan"],
  related: relatedSlugs("hana"),
  metaDescription:
    "SAP HANA course in Pune — column store architecture, calculation views, CDS, SQLScript and performance modelling, with a live project. Classroom or online.",
};

export default course;
