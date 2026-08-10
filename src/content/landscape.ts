/**
 * The SAP system landscape, as data.
 *
 * This file is the site's signature element and its content model at once. The
 * module map on the home page renders it directly, and course pages derive
 * their "related courses" from `edges` — so MM's related courses are FICO and
 * SD *because those are the modules it actually integrates with*, not because
 * someone picked three at random.
 *
 * Accuracy matters more than tidiness here. Every edge below describes a real
 * integration point that a working SAP consultant would recognise, and every
 * transaction code is a real one. If any of it were wrong it would be obvious
 * in five seconds to the exact audience this site is trying to convince.
 */

export type NodeId =
  | "fico"
  | "mm"
  | "sd"
  | "abap"
  | "basis"
  | "s4hana"
  | "hana"
  | "ecc";

export type LandscapeNode = {
  id: NodeId;
  /** Short code, set in the mono register. */
  code: string;
  name: string;
  /** Which layer of the landscape this sits in — drives vertical position. */
  layer: "platform" | "functional" | "foundation";
  /** Position on a 0–100 schematic grid. */
  x: number;
  y: number;
  /** What this module actually does inside a business. */
  does: string;
  /** The role it maps to on a project. Descriptive of the market, not promised. */
  role: string;
  /** Real transaction codes, or the real tooling where the module is not tcode-driven. */
  codes: string[];
  /** Course slug this node navigates to. */
  slug: string;
};

export type LandscapeEdge = {
  from: NodeId;
  to: NodeId;
  /** Why this integration exists. Shown when either endpoint is active. */
  reason: string;
  /** `flow` = a document/data flow. `substrate` = one layer underpins another. */
  kind: "flow" | "substrate";
};

export const nodes: LandscapeNode[] = [
  {
    id: "hana",
    code: "HANA",
    name: "SAP HANA",
    layer: "platform",
    x: 50,
    y: 8,
    does: "The in-memory column-store database that S/4HANA runs on. Holds the data and does much of the calculation the application layer used to do.",
    role: "HANA database administrator, HANA modeller",
    codes: ["HANA Studio", "CDS views", "SQLScript"],
    slug: "sap-hana",
  },
  {
    id: "s4hana",
    code: "S/4",
    name: "SAP S/4HANA",
    layer: "platform",
    x: 34,
    y: 30,
    does: "The current generation of SAP's ERP. Merges finance and controlling into one line-item table, replaces customers and vendors with a single business partner, and puts Fiori in front of the classic screens.",
    role: "S/4HANA functional consultant, migration consultant",
    codes: ["ACDOCA", "Fiori launchpad", "/UI2/FLP"],
    slug: "sap-s4hana",
  },
  {
    id: "ecc",
    code: "ECC",
    name: "SAP ECC",
    layer: "platform",
    x: 74,
    y: 30,
    does: "The previous generation, still running in a large number of companies. Knowing it is what makes you useful on a migration.",
    role: "ECC support consultant, migration analyst",
    codes: ["SAP GUI", "BSEG", "BKPF"],
    slug: "sap-ecc",
  },
  {
    id: "mm",
    code: "MM",
    name: "Materials Management",
    layer: "functional",
    x: 16,
    y: 57,
    does: "Everything from raising a purchase requisition to receiving the goods and verifying the supplier's invoice. Owns the material master and the stock.",
    role: "SAP MM consultant, procurement analyst",
    codes: ["ME21N", "MIGO", "MIRO", "MM01", "ME11"],
    slug: "sap-mm",
  },
  {
    id: "fico",
    code: "FICO",
    name: "Financial Accounting & Controlling",
    layer: "functional",
    x: 45,
    y: 57,
    does: "The books. General ledger, payables, receivables, assets and bank on the FI side; cost centres, internal orders and profitability on the CO side. Every other module eventually posts here.",
    role: "SAP FICO consultant, finance systems analyst",
    codes: ["F-02", "FB50", "FS00", "F110", "KS01"],
    slug: "sap-fico",
  },
  {
    id: "sd",
    code: "SD",
    name: "Sales & Distribution",
    layer: "functional",
    x: 74,
    y: 57,
    does: "The order-to-cash side. Sales orders, availability, delivery, picking, goods issue and billing — plus the pricing that decides what the customer is charged.",
    role: "SAP SD consultant, order management analyst",
    codes: ["VA01", "VL01N", "VF01", "VK11", "XD01"],
    slug: "sap-sd",
  },
  {
    id: "abap",
    code: "ABAP",
    name: "ABAP Development",
    layer: "foundation",
    x: 30,
    y: 84,
    does: "SAP's own programming language and the layer every module is extended in — custom reports, forms, interfaces, conversions and enhancements.",
    role: "SAP ABAP developer, technical consultant",
    codes: ["SE38", "SE80", "SE11", "SE37", "ST22"],
    slug: "sap-abap",
  },
  {
    id: "basis",
    code: "BASIS",
    name: "SAP Basis",
    layer: "foundation",
    x: 66,
    y: 84,
    does: "The administration underneath all of it: installing and patching systems, managing users and authorisations, scheduling jobs, and moving configuration and code from development through to production.",
    role: "SAP Basis administrator, system administrator",
    codes: ["STMS", "SM59", "SU01", "SM37", "SM21"],
    slug: "sap-basis",
  },
];

export const edges: LandscapeEdge[] = [
  {
    from: "mm",
    to: "fico",
    kind: "flow",
    reason:
      "A goods receipt posts an accounting document against the GR/IR clearing account; invoice verification then clears it and creates the vendor liability. Account determination is configured in MM but the postings land in FI.",
  },
  {
    from: "sd",
    to: "fico",
    kind: "flow",
    reason:
      "Billing creates the accounting document that posts revenue and the customer receivable. Which G/L account it hits is decided by revenue account determination.",
  },
  {
    from: "sd",
    to: "mm",
    kind: "flow",
    reason:
      "The availability check on a sales order reads stock that MM owns, and posting goods issue on the delivery reduces that stock. Stock transport orders sit across both.",
  },
  {
    from: "abap",
    to: "mm",
    kind: "substrate",
    reason:
      "Custom reports, print forms, interfaces and enhancements for procurement are written in ABAP — user exits, BAdIs and the enhancement framework.",
  },
  {
    from: "abap",
    to: "fico",
    kind: "substrate",
    reason:
      "Financial reports, payment file formats and validations beyond standard configuration are ABAP work.",
  },
  {
    from: "abap",
    to: "sd",
    kind: "substrate",
    reason:
      "Pricing routines, output forms such as invoices and delivery notes, and order interfaces are all built in ABAP.",
  },
  {
    from: "basis",
    to: "abap",
    kind: "substrate",
    reason:
      "Basis owns the transport system that moves ABAP objects from development through quality assurance into production, and the authorisations that decide who may run them.",
  },
  {
    from: "basis",
    to: "fico",
    kind: "substrate",
    reason:
      "Configuration is transported by Basis, and the authorisation objects that control who can post to the ledger are administered there.",
  },
  {
    from: "hana",
    to: "s4hana",
    kind: "substrate",
    reason:
      "S/4HANA runs only on the HANA database. The simplifications in S/4 — no aggregate or index tables, the universal journal, embedded analytics — are only possible because of it.",
  },
  {
    from: "ecc",
    to: "s4hana",
    kind: "flow",
    reason:
      "The migration path most companies are on. A system conversion carries existing ECC configuration and data across; a new implementation starts clean.",
  },
  {
    from: "s4hana",
    to: "fico",
    kind: "substrate",
    reason:
      "In S/4HANA, finance and controlling share one line-item table (ACDOCA), which changes how reconciliation, document splitting and reporting work.",
  },
  {
    from: "s4hana",
    to: "mm",
    kind: "substrate",
    reason:
      "S/4HANA replaces the separate customer and vendor masters with the business partner, and extends the material number to 40 characters.",
  },
  {
    from: "s4hana",
    to: "sd",
    kind: "substrate",
    reason:
      "Order-to-cash moves onto Fiori apps with embedded analytics, and revenue recognition changes under the universal journal.",
  },
];

const nodeIndex = new Map(nodes.map((n) => [n.id, n]));

export function getNode(id: NodeId): LandscapeNode | undefined {
  return nodeIndex.get(id);
}

/** Every edge touching a node, in either direction. */
export function edgesFor(id: NodeId): LandscapeEdge[] {
  return edges.filter((e) => e.from === id || e.to === id);
}

/** Course slugs a node genuinely integrates with, nearest first. */
export function relatedSlugs(id: NodeId): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  // Document flows first — they are the integrations a functional consultant
  // is asked about in interviews. Substrate layers follow.
  const ordered = [
    ...edgesFor(id).filter((e) => e.kind === "flow"),
    ...edgesFor(id).filter((e) => e.kind === "substrate"),
  ];
  for (const edge of ordered) {
    const otherId = edge.from === id ? edge.to : edge.from;
    const other = nodeIndex.get(otherId);
    if (other && !seen.has(other.slug)) {
      seen.add(other.slug);
      out.push(other.slug);
    }
  }
  return out;
}

/** Node id for a course slug, when that course is on the map. */
export function nodeForSlug(slug: string): LandscapeNode | undefined {
  return nodes.find((n) => n.slug === slug);
}
