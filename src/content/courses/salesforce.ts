import type { Course } from "../types";

const course: Course = {
  slug: "salesforce",
  name: "Salesforce",
  track: "enterprise-platforms",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "Administration and configuration of the Salesforce platform — data model, security, automation, and the Sales and Service clouds.",
  duration: "{{SALESFORCE_DURATION}}",
  batchTimings: "{{SALESFORCE_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "Salesforce is configured far more often than it is coded. An administrator who understands the data model, the sharing and security layer, and the automation tools can build most of what a business asks for without writing a line of Apex — and knowing where that line is, is a large part of the job.",
    "The course is built around the platform as an administrator meets it: objects and relationships first, then the security model, then automation with Flow, then reporting, then the two clouds most organisations actually run — Sales and Service.",
    "Security gets proper time because it is where configuration errors become real problems. Profiles, permission sets, role hierarchy, organisation-wide defaults and sharing rules interact in ways that are easy to get subtly wrong, and interviews know it.",
  ],
  whoFor: [
    "Graduates from any stream looking for a cloud platform role that is configuration-led rather than code-led",
    "People working in sales operations, customer support or CRM administration",
    "Business analysts who need to configure the system they are specifying",
    "Career switchers who want a platform with a large and visible job market",
  ],
  curriculum: [
    {
      title: "Platform and org setup",
      topics: [
        "Multi-tenant architecture and what it means for what you can and cannot change",
        "Editions, licences and the limits that follow from them",
        "Company settings, business hours, fiscal year and currency",
        "Lightning Experience navigation, apps and the setup tree",
      ],
    },
    {
      title: "Data model",
      topics: [
        "Standard objects and custom objects",
        "Field types, formula fields and roll-up summary fields",
        "Relationships: lookup, master-detail and many-to-many through a junction object",
        "Record types and page layout assignment",
        "Schema builder and reading an existing org's model",
      ],
    },
    {
      title: "Security and access",
      topics: [
        "Profiles against permission sets, and why permission sets win",
        "Object, field and record level security as three separate layers",
        "Organisation-wide defaults, role hierarchy, sharing rules and manual sharing",
        "Login and session settings, and multi-factor authentication",
        "Auditing: field history, setup audit trail and login history",
      ],
    },
    {
      title: "Interface configuration",
      topics: [
        "Lightning App Builder — record, home and app pages",
        "Dynamic forms and conditional visibility",
        "List views, compact layouts and search layouts",
        "Custom tabs, apps and utility bars",
      ],
    },
    {
      title: "Automation",
      topics: [
        "Validation rules and where they belong in the order of execution",
        "Flow: screen flows, record-triggered flows, scheduled flows and subflows",
        "Decisions, loops, assignments and get/update/create elements",
        "Approval processes with entry criteria and multi-step approvals",
        "Email alerts, tasks and outbound actions",
        "Order of execution, and debugging automation that fires in the wrong sequence",
      ],
    },
    {
      title: "Sales Cloud and Service Cloud",
      topics: [
        "Leads, conversion, accounts, contacts and opportunities",
        "Products, price books, quotes and opportunity stages",
        "Forecasting and sales path configuration",
        "Cases: creation, assignment rules, escalation and queues",
        "Web-to-case, email-to-case and entitlement processes",
        "Knowledge articles and Omni-Channel routing",
      ],
    },
    {
      title: "Reporting and data management",
      topics: [
        "Report types, filters, bucketing, formulas and joined reports",
        "Dashboards, dynamic dashboards and refresh behaviour",
        "Data Import Wizard against Data Loader — when each is correct",
        "Duplicate rules, matching rules and data quality",
        "Backups, data export and mass transfer",
      ],
    },
    {
      title: "Release management and next steps",
      topics: [
        "Sandboxes, change sets and an introduction to deployment practice",
        "AppExchange packages and their risks",
        "An introduction to Apex, SOQL and Lightning Web Components — enough to know when a developer is needed",
        "The Salesforce Administrator certification: what it covers and how it is taken",
      ],
    },
  ],
  liveProject: {
    title: "Build a working Salesforce org for a business from a requirements brief",
    description:
      "You are given a business with a sales process and a support process described in plain language. You design the data model, build the objects and relationships, configure a security model where three teams see genuinely different data, automate the approval of a discount above a threshold with Flow, build a case escalation process, and produce the reports and dashboard the management team asked for. You then have to explain a sharing decision to someone who thinks they should be able to see a record and cannot.",
    artefacts: [
      "A documented data model with the relationship choices justified",
      "A configured org covering security, automation and both processes",
      "A Flow you built, with its trigger conditions and the order-of-execution reasoning",
      "A report and dashboard set answering the stated business questions",
    ],
  },
  prerequisites: [
    "No programming background required — this is a configuration course.",
    "Comfort with spreadsheets and logical thinking is what the automation sections lean on.",
    "Any exposure to sales, support or CRM processes is useful context but is not assumed.",
    "You will need a computer with a browser; Salesforce provides free developer orgs for practice.",
  ],
  roles: [
    "Salesforce administrator",
    "Salesforce business analyst",
    "CRM analyst",
    "Salesforce support or operations specialist",
  ],
  codes: ["Flow Builder", "SOQL", "Data Loader", "Setup Audit Trail"],
  related: ["data-science", "sap-sd", "automation-testing"],
  metaDescription:
    "Salesforce administrator course in Pune — data model, security, Flow automation, Sales Cloud and Service Cloud, with a live project. Classroom at two centres or online.",
};

export default course;
