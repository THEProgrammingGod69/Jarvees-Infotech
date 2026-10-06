/**
 * Single source of truth for the department's facts and contact details.
 *
 * Every value here was taken from the department's and the institute's own
 * published pages (vit.edu/CSE-AI and vit.edu, scraped October 2026). The
 * structured data reads from these same constants as the visible page, so a
 * phone number changed here changes everywhere at once.
 */

/**
 * Canonical origin, used for canonical URLs, the sitemap and structured
 * data. An explicit NEXT_PUBLIC_SITE_URL always wins (set it to the final
 * domain). Without it, the production URL each host exposes at build time is
 * used — Vercel, Netlify, Cloudflare Pages — so a deployment with no
 * configuration still publishes correct absolute URLs. next.config.ts warns
 * at build time if none of these is available.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  process.env.URL ?? // Netlify
  process.env.CF_PAGES_URL ?? // Cloudflare Pages
  "http://localhost:3000"
).replace(/\/$/, "");

export const dept = {
  name: "Computer Science & Engineering (Artificial Intelligence)",
  short: "CSE (AI)",
  divisionCode: "CSAI",
  programme: "B.Tech Computer Science & Engineering (Artificial Intelligence)",
  established: "2022–23",
  intake: 360,
  location: "Building No. 3, Second & Third Floor",
  phone: { display: "+91 75880 19070", href: "tel:+917588019070" },
  email: "hodcseai@vit.edu",
  officialUrl: "https://www.vit.edu/CSE-AI/",
  socials: {
    x: "https://x.com/Cseai2025",
    linkedin: "https://www.linkedin.com/in/cse-artificial-intelligence-vit-pune-2b4528374/",
    aisf: "https://www.linkedin.com/company/artificial-intelligence-student-forum-aisf/",
  },
  hod: {
    name: "Prof. Dr. Nilesh P. Sable",
    role: "Professor & Head",
    linkedin: "https://www.linkedin.com/in/nilesh-sable-39633519/",
    /** Self-hosted photo id (src/content/photos.generated.ts). */
    portrait: "hod",
  },
} as const;

export const institute = {
  name: "Vishwakarma Institute of Technology",
  short: "VIT Pune",
  trust: "Bansilal Ramnath Agarwal Charitable Trust",
  founded: 1983,
  affiliation: "Savitribai Phule Pune University",
  url: "https://www.vit.edu/",
  admissionsUrl: "https://www.vit.edu/undergraduate/",
  campus: {
    name: "Bibwewadi Campus",
    street: "666, Upper Indiranagar, Bibwewadi",
    city: "Pune",
    region: "Maharashtra",
    postalCode: "411037",
    country: "IN",
    // Two decimals: accurate to the campus, not to a doorway.
    geo: { lat: 18.46, lng: 73.87 },
  },
  admissions: {
    phones: [
      { display: "+91 70584 32258", href: "tel:+917058432258" },
      { display: "+91 87934 28634", href: "tel:+918793428634" },
    ],
    email: "admissions@vit.edu",
  },
  generalOffice: { display: "020 2991 2562", href: "tel:+912029912562" },
  hours: "Monday to Friday · 10:00 AM – 5:00 PM",
  mapsQuery: "Vishwakarma Institute of Technology, Bibwewadi, Pune",
} as const;

export const nav = [
  { href: "/about", label: "About", code: "01" },
  { href: "/programme", label: "Programme", code: "02" },
  { href: "/faculty", label: "Faculty", code: "03" },
  { href: "/research", label: "Research", code: "04" },
  { href: "/placements", label: "Placements", code: "05" },
  { href: "/labs", label: "Labs", code: "06" },
  { href: "/events", label: "Events", code: "07" },
  { href: "/students", label: "Students", code: "08" },
  { href: "/contact", label: "Contact", code: "09" },
] as const;

export const fullAddress = `${institute.campus.street}, ${institute.campus.city}, ${institute.campus.region} ${institute.campus.postalCode}`;
