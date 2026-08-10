import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-s4hana",
  name: "SAP S/4HANA",
  moduleCode: "S/4",
  track: "sap",
  level: "intermediate",
  modes: ["online", "classroom"],
  summary:
    "The current generation of SAP's ERP — what actually changed from ECC, why it changed, and what a migration involves.",
  duration: "{{S4HANA_DURATION}}",
  batchTimings: "{{S4HANA_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "S/4HANA is not a new skin on ECC. The data model underneath it changed, and the changes are the substance of the course. Finance and controlling now share a single line-item table. Customers and vendors have been replaced by one business partner. The aggregate and index tables that finance reporting used to depend on are gone, replaced by views calculated on demand.",
    "That matters commercially because a large number of companies are still on ECC and have to move. The people who are useful during that move are the ones who can say what a simplification item means for a specific process, not the ones who can recite the marketing.",
    "The course assumes you know at least one functional area already. It covers the platform, the changed data model, Fiori as the interface, embedded analytics, and then the migration paths — new implementation, system conversion and selective data transition — with the tooling that supports each.",
  ],
  whoFor: [
    "SAP consultants working on ECC who need to move with the market",
    "Functional consultants in FI, CO, MM or SD adding S/4HANA to their profile",
    "Finance and supply chain professionals whose company has an S/4HANA programme running",
    "Learners who have completed a functional module here and want current-generation context",
  ],
  curriculum: [
    {
      title: "Platform and architecture",
      topics: [
        "Why in-memory columnar storage changed the application design, not just its speed",
        "Code pushdown: work moving from the application layer into the database",
        "Deployment options — on-premise, private cloud and public cloud, and what you give up in each",
        "Release strategy and how S/4HANA versions are delivered",
      ],
    },
    {
      title: "The universal journal",
      topics: [
        "ACDOCA: one line-item table for FI and CO, and what that removes",
        "The end of reconciliation between the ledger and controlling",
        "Compatibility views standing in for the old tables, and why custom code still breaks",
        "Document splitting and multiple ledgers in the new model",
        "New asset accounting and the material ledger becoming mandatory",
      ],
    },
    {
      title: "Business partner and master data",
      topics: [
        "The business partner as the single master for customers and vendors",
        "Customer-vendor integration and the synchronisation behind it",
        "BP roles, groupings and number ranges",
        "The extended material number and the fields it affects",
        "Master data implications for existing interfaces",
      ],
    },
    {
      title: "SAP Fiori",
      topics: [
        "Launchpad, catalogues, groups and spaces",
        "Application types — transactional, analytical and fact sheet",
        "How a Fiori app reaches the backend: OData services and the gateway",
        "Roles and authorisations behind tile visibility",
        "Where the classic SAP GUI transaction still exists behind the app",
      ],
    },
    {
      title: "Embedded analytics",
      topics: [
        "Core data services views as the analytical model",
        "Virtual data model layers — basic, composite and consumption views",
        "Analytical Fiori applications and multidimensional reporting",
        "KPI modelling and the reporting that replaces extracted data warehouses for some cases",
      ],
    },
    {
      title: "Functional changes by area",
      topics: [
        "Finance: credit management, cash management and the changed close",
        "Sourcing and procurement: simplified table structures and the procurement Fiori set",
        "Sales: revenue recognition and the changed order-to-cash reporting",
        "Inventory: the material document tables and MATDOC",
      ],
    },
    {
      title: "Migration",
      topics: [
        "New implementation, system conversion and selective data transition compared honestly",
        "Readiness check and the simplification item check",
        "Software Update Manager with database migration option, at a conceptual level",
        "Custom code adaptation and the remediation effort nobody budgets for",
        "Data migration with the migration cockpit",
        "What a realistic project timeline and team structure look like",
      ],
    },
  ],
  liveProject: {
    title: "Assess an ECC process for conversion and rebuild it in S/4HANA",
    description:
      "You take an existing ECC process — order to cash or procure to pay — and produce a conversion assessment for it: which simplification items apply, what the business partner change means for its master data, which custom reports will break when they hit compatibility views, and what the effort is. Then you configure and run the same process in S/4HANA using Fiori applications, and write up what a business user would actually notice on their first day.",
    artefacts: [
      "A simplification impact assessment for a named process",
      "A business partner conversion plan for the master data involved",
      "A configured and executed process in S/4HANA with Fiori app screenshots",
      "A written comparison of the process before and after, at business-user level",
    ],
  },
  prerequisites: [
    "This course assumes prior exposure to at least one SAP functional area. It is not a first SAP course.",
    "If you are starting from zero, take SAP FICO, MM or SD first — the changes here only mean something if you know what they changed from.",
    "No programming is required, although the custom code section is easier to follow with some ABAP awareness.",
    "Finance background helps for the universal journal sections; supply chain background helps for the logistics ones.",
  ],
  roles: [
    "SAP S/4HANA functional consultant",
    "S/4HANA migration or conversion analyst",
    "SAP business process consultant",
    "SAP application consultant, current generation",
  ],
  codes: ["ACDOCA", "MATDOC", "/UI2/FLP", "BP", "Migration Cockpit", "Readiness Check"],
  related: relatedSlugs("s4hana"),
  metaDescription:
    "SAP S/4HANA course in Pune — universal journal, business partner, Fiori, embedded analytics and migration from ECC, with a live project. Classroom or online.",
};

export default course;
