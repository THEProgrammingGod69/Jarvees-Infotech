import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-sd",
  name: "SAP SD",
  moduleCode: "SD",
  track: "sap",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "Sales and distribution — order to cash, from the enquiry through delivery and goods issue to the billing document.",
  duration: "{{SD_DURATION}}",
  batchTimings: "{{SD_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "SD is the revenue side of the system. A customer orders something, the system checks whether it can be supplied, a delivery is created and picked, goods issue reduces the stock, and a billing document posts the receivable. Every step creates a document that references the one before it, and that chain — the document flow — is what an SD consultant spends their life reading.",
    "The part of SD that separates people who know it from people who have seen it is pricing. The condition technique — condition tables, access sequences, condition types and pricing procedures — is genuinely abstract the first time you meet it, and it is what most SD interviews are really testing. This course spends real time there rather than skipping to the screens.",
    "You also work the integration points properly: the availability check reading stock owned by MM, goods issue posting a material document, and revenue account determination deciding which G/L account the billing document hits.",
  ],
  whoFor: [
    "Graduates in commerce, business or engineering looking for a functional SAP role",
    "People working in sales operations, order management, customer service or dispatch",
    "Career switchers who want a business-facing SAP module rather than a technical one",
    "Existing users of an SAP sales process who want to configure it rather than operate it",
  ],
  curriculum: [
    {
      title: "Organisational structure",
      topics: [
        "Sales organisation, distribution channel and division — and what a sales area actually is",
        "Sales office, sales group and their reporting use",
        "Plant and shipping point determination",
        "Assignment of the SD structure to company code and to the MM structure",
      ],
    },
    {
      title: "Master data",
      topics: [
        "Customer master — account groups, partner functions and the sales area views",
        "Material master sales and distribution views",
        "Customer–material info records",
        "Condition records for pricing, and their validity periods",
        "Business partner in S/4HANA and how it replaces the separate customer master",
      ],
    },
    {
      title: "Sales documents",
      topics: [
        "Document types, item categories and schedule line categories",
        "Item category determination and schedule line determination",
        "Enquiry, quotation and the standard sales order",
        "Copy control between document types and what it actually controls",
        "Special orders: cash sales, rush orders, free-of-charge deliveries",
        "Returns, credit memo requests and debit memo requests",
      ],
    },
    {
      title: "Pricing and the condition technique",
      topics: [
        "Condition tables, access sequences, condition types and pricing procedures",
        "Pricing procedure determination — document pricing procedure and customer pricing procedure",
        "Condition record maintenance and the pricing analysis screen",
        "Discounts, surcharges, freight and taxes as condition types",
        "Condition exclusion, requirements and calculation types",
        "Free goods determination and material determination",
      ],
    },
    {
      title: "Availability, delivery and goods issue",
      topics: [
        "Availability check and transfer of requirements — how the check reads MM stock",
        "Delivery document types and delivery item categories",
        "Picking, packing and handling units",
        "Post goods issue and the material document and accounting document it creates",
        "Route determination and shipping point determination",
      ],
    },
    {
      title: "Billing and the link to finance",
      topics: [
        "Billing types, billing plans and periodic billing",
        "Invoice, credit memo and debit memo processing",
        "Revenue account determination — the path from billing document to G/L account",
        "The accounting document created by billing, read line by line",
        "Rebate processing and credit management basics",
      ],
    },
    {
      title: "Cross-functional processes and output",
      topics: [
        "Third-party sales and its purchase requisition into MM",
        "Intercompany sales and stock transport orders",
        "Consignment fill-up, issue, return and pick-up",
        "Output determination for order confirmations and invoices",
        "Reading a document flow end to end and diagnosing where it stopped",
      ],
    },
  ],
  liveProject: {
    title: "Build and run an order-to-cash process for a distribution business",
    description:
      "You configure a sales area, define document types and item categories, and build a pricing procedure from scratch — including a customer discount and a freight condition that behave differently. Then you run the cycle: order, availability check, delivery, picking, goods issue, billing. You trace the accounting document back to the revenue account determination that produced it, and you fix a pricing procedure that is returning the wrong value, using the pricing analysis rather than guesswork.",
    artefacts: [
      "A configuration document covering the sales area, document types and copy control",
      "A pricing procedure you designed, with the condition types and access sequences behind it",
      "A complete document flow from order to accounting document, annotated",
      "A short written diagnosis of a pricing fault and how you found it",
    ],
  },
  prerequisites: [
    "No programming required.",
    "Any background in sales, order processing, dispatch or customer service is useful context but is not assumed.",
    "Basic accounting vocabulary helps at the billing stage — revenue, receivable, tax. The course covers what you need.",
    "The pricing section is the abstract part of this module. It is taught from first principles, so prior SAP exposure is not expected.",
  ],
  roles: [
    "SAP SD functional consultant",
    "SAP SD support consultant",
    "Order management or sales operations analyst",
    "Business process analyst, order to cash",
  ],
  codes: ["VA01", "VA21", "VL01N", "VF01", "VK11", "XD01", "VOV8", "V/08", "VTFL"],
  related: relatedSlugs("sd"),
  metaDescription:
    "SAP SD course in Pune — order to cash, pricing and the condition technique, delivery, billing and revenue account determination, with a live project. Classroom or online.",
};

export default course;
