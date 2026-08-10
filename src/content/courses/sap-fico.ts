import type { Course } from "../types";
import { relatedSlugs } from "../landscape";

const course: Course = {
  slug: "sap-fico",
  name: "SAP FICO",
  moduleCode: "FICO",
  track: "sap",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "Financial accounting and controlling — the general ledger, payables, receivables, assets, and the cost side of the business.",
  duration: "{{FICO_DURATION}}",
  batchTimings: "{{FICO_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "FICO is where every other part of an SAP system eventually posts. A goods receipt in materials management, a customer invoice in sales, a depreciation run on an asset — all of them end as a document in the general ledger. That is why FICO is the module most companies staff first, and why it is the most common way into SAP.",
    "The course is split the way the module is. FI covers the books as an accountant would recognise them: general ledger, accounts payable, accounts receivable, asset accounting and bank accounting. CO covers the internal view: what things cost, which cost centre carries them, and which product or customer is actually profitable.",
    "You configure rather than watch. Enterprise structure, chart of accounts, document types, tolerance groups, payment programme, depreciation areas — you build them in a system, post against them, and then find out what happens when the configuration is wrong, which is where the learning actually is.",
  ],
  whoFor: [
    "Commerce, accounting and finance graduates looking for a route into IT that uses what they already studied",
    "Working accountants who want to move from operating a system to configuring one",
    "Career switchers from non-IT backgrounds — FICO is the SAP module that rewards domain knowledge over programming",
    "Finance team members whose company is implementing or upgrading SAP",
  ],
  curriculum: [
    {
      title: "Enterprise structure and global settings",
      topics: [
        "Company, company code, business area and their relationship",
        "Chart of accounts — operating, group and country charts",
        "Fiscal year variant, posting period variant and open/close periods",
        "Document types, number ranges and posting keys",
        "Field status groups and field status variants",
        "Tolerance groups for users, G/L accounts and customers",
      ],
    },
    {
      title: "General ledger accounting",
      topics: [
        "G/L master records — chart of accounts and company code segments",
        "Document posting, parking, holding and reversal",
        "Recurring entries, sample documents and accrual/deferral",
        "Foreign currency configuration, exchange rate types and valuation",
        "Month-end and year-end closing, balance carry-forward",
        "Financial statement version and standard G/L reporting",
      ],
    },
    {
      title: "Accounts payable",
      topics: [
        "Vendor master data — general, company code and purchasing views",
        "Vendor invoices, credit memos and down payments",
        "Automatic payment programme: configuration and the payment run",
        "House banks, bank accounts and payment methods",
        "Withholding tax configuration",
        "Vendor line item reporting and open item clearing",
      ],
    },
    {
      title: "Accounts receivable",
      topics: [
        "Customer master data and account groups",
        "Customer invoices, credit memos and incoming payments",
        "Manual and automatic clearing, residual and partial payments",
        "Dunning procedure configuration and the dunning run",
        "Credit management basics",
        "Customer ageing and open item analysis",
      ],
    },
    {
      title: "Asset accounting",
      topics: [
        "Chart of depreciation, depreciation areas and asset classes",
        "Asset master records and sub-assets",
        "Acquisition — direct, via purchase order, and with an asset under construction",
        "Depreciation keys, methods and the depreciation run",
        "Transfers, retirements and scrapping",
        "Asset reporting and the asset history sheet",
      ],
    },
    {
      title: "Controlling — cost accounting",
      topics: [
        "Controlling area, operating concern and the link to company code",
        "Cost elements — primary, secondary and their creation",
        "Cost centre accounting: hierarchy, planning, distribution and assessment",
        "Internal orders — real and statistical, settlement rules",
        "Profit centre accounting and profit centre derivation",
        "Introduction to product costing and profitability analysis",
      ],
    },
    {
      title: "Integration with the rest of the landscape",
      topics: [
        "MM to FI: automatic account determination, the GR/IR clearing account, valuation classes",
        "SD to FI: revenue account determination and the billing accounting document",
        "Reading a document flow backwards from the accounting document to its source",
        "What changes in S/4HANA: the universal journal and the merged FI-CO line item table",
      ],
    },
  ],
  liveProject: {
    title: "Configure the books for a new company code, end to end",
    description:
      "You are given a small manufacturing business and its opening position. You build the enterprise structure, define the chart of accounts, configure document types and tolerances, set up vendors, customers and house banks, run a payment programme and a dunning run, capitalise and depreciate an asset, and close a period — then produce the financial statements and explain the numbers. When a posting fails, you diagnose it rather than being told the answer.",
    artefacts: [
      "A configuration document covering every setting you made and why",
      "Posted document sets for procure-to-pay and order-to-cash, traced through to the accounting document",
      "A month-end closing checklist you built yourself",
      "A financial statement version with the reports it produces",
    ],
  },
  prerequisites: [
    "An accounting background genuinely helps here — if you know what a trial balance, an accrual and a depreciation schedule are, this course will move much faster for you.",
    "No programming is required. FICO is a configuration module, not a development one.",
    "Comfort with a Windows desktop and basic spreadsheets is enough on the technical side.",
    "If you have no accounting exposure at all, tell us when you enquire — the fundamentals can be covered first rather than assumed.",
  ],
  roles: [
    "SAP FICO functional consultant",
    "SAP FICO end user or power user",
    "Finance systems analyst",
    "SAP support consultant, finance",
  ],
  codes: ["F-02", "FB50", "FB60", "FS00", "F110", "FBL3N", "AFAB", "KS01", "OB52"],
  related: relatedSlugs("fico"),
  metaDescription:
    "SAP FICO course in Pune — configure general ledger, accounts payable and receivable, asset accounting and controlling, with a live project. Classroom at Narhe and Tilak Road, or online.",
};

export default course;
