/**
 * Placements and internships — from the department's Placements and
 * Internship pages, AY 2025–26. The placement season was still open when
 * these figures were published ("66% (Ongoing)"), so they are presented as a
 * snapshot with that label, never as a final rate.
 */

export const placementSummary = {
  year: "AY 2025–26",
  status: "Season ongoing",
  placedPercent: 66,
  highestLpa: 32.75,
  averageLpa: 10.09,
} as const;

/** Best published offer per company, LPA. */
export const topOffers = [
  { company: "PhonePe", lpa: 32.75 },
  { company: "Itanta Analytics", lpa: 30 },
  { company: "Uptiq.ai", lpa: 22 },
  { company: "Infineon", lpa: 15 },
  { company: "Morgan Stanley", lpa: 15 },
  { company: "MSCI", lpa: 15 },
  { company: "AppDirect", lpa: 14 },
  { company: "Infoblox", lpa: 13 },
  { company: "Lattice Semiconductor", lpa: 12 },
  { company: "Nutanix", lpa: 11.9 },
  { company: "Semtech", lpa: 11 },
  { company: "Houghton Mifflin Harcourt", lpa: 10 },
  { company: "DNV Group", lpa: 10 },
  { company: "Nasdaq", lpa: 9.89 },
] as const;

export const recruiters = [
  "NVIDIA", "Cadence", "Mu Sigma", "Tata Technologies", "EQ Technologic", "Deloitte",
  "Accenture", "AGDATA India", "Anchanto", "AppDirect", "Autonex AI 360", "BMW TechWorks India",
  "Cognizant", "Colgate-Palmolive", "CSTech.ai", "DNV Group", "EduVantage", "EPAM Systems",
  "GlideCloud Solutions", "Houghton Mifflin Harcourt", "Infineon", "Itanta Analytics", "KPMG",
  "Lattice Semiconductor", "Merkle (Dentsu Global Services)", "Morgan Stanley", "MSCI", "Nasdaq",
  "Nutanix", "PhonePe", "Principal Global Services", "PTC Software India", "Quick Heal",
  "Rocket Software India", "Semtech", "Uptiq.ai", "VOIS (Vodafone)", "Whirlpool", "Wolters Kluwer",
] as const;

export const internshipSummaries = [
  { term: "Semester 7 · AY 2025–26", highest: 87000, average: 35541, minimum: 3000 },
  { term: "Semester 8 · AY 2025–26", highest: 80000, average: 26000, minimum: 5000 },
] as const;

export const internshipHosts = [
  "MSCI", "Lattice Semiconductor", "Nutanix", "PTC Software", "Semtech", "Infineon", "KPMG Global Services",
  "Deloitte", "EPAM Systems", "Principal Global Services", "Colgate-Palmolive", "Whirlpool", "Atlas Copco Group",
  "Houghton Mifflin Harcourt", "Autonex AI", "Uptiq AI", "Itanta Analytics", "Anchanto", "VOIS", "IIT Roorkee",
  "IITM", "Nagpur Municipal Corporation", "Artefact Projects", "EduVantage", "TICS Solutions", "Silicon Stack",
] as const;
