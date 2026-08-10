/**
 * Single source of truth for verified client facts.
 *
 * IMPORTANT: every value in this file is confirmed from the client's public
 * listings. Nothing here may be edited to a "better sounding" value. Figures
 * the client has not supplied appear as `{{TOKEN}}` placeholders and are
 * tracked in CONTENT-TODO.md — do not replace one with an estimate.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.jarveesacademy.com";

export const site = {
  name: "Jarvees Academy",
  /** Used once, in the footer only. The brand is Jarvees Academy. */
  legalOperator: "Jarvees Infotech Pvt. Ltd.",
  legalLine: "Jarvees Academy is an initiative of Jarvees Infotech Pvt. Ltd.",
  founded: 2015,
  certification: "ISO 9001:2015",
  certificationIssued: 2020,
  email: "jarveesacademy.pune@gmail.com",
  facebook: "https://www.facebook.com/Jarveesacademypune",
  hours: "9:00 AM – 9:00 PM, all seven days",
  hoursShort: "9 AM – 9 PM, daily",
  /** schema.org openingHours syntax. */
  openingHoursSpec: "Mo-Su 09:00-21:00",
  rating: {
    value: 4.5,
    count: 59,
    source: "JustDial",
  },
  trademarkNotice:
    "SAP and other SAP products mentioned are trademarks of SAP SE. Jarvees Academy is an independent training provider and is not affiliated with SAP SE.",
} as const;

export type Centre = {
  id: string;
  name: string;
  shortName: string;
  isPrimary: boolean;
  addressLines: string[];
  locality: string;
  region: string;
  postalCode: string;
  phoneDisplay: string;
  /** E.164, for tel: links. */
  phoneHref: string;
  landmarks: string[];
  travel: string[];
  /**
   * Area-level coordinates for structured data only. Flagged in
   * CONTENT-TODO.md for client verification. All user-facing map links are
   * built from the address string instead, so the pin a visitor sees is
   * always driven by the verified address rather than by these values.
   */
  geo: { lat: number; lng: number };
};

export const centres: Centre[] = [
  {
    id: "narhe",
    name: "Narhe Centre",
    shortName: "Narhe",
    isPrimary: true,
    addressLines: [
      "103, Kanta Heights, Near Samsung Galaxy",
      "Dhayari–Katraj Road, Narhe Gaon",
    ],
    locality: "Pune",
    region: "Maharashtra",
    postalCode: "411041",
    phoneDisplay: "+91 90225 84956",
    phoneHref: "+919022584956",
    landmarks: [
      "Directly on the Dhayari–Katraj road, next to Samsung Galaxy",
      "Short run from Navale Bridge and the Mumbai–Bengaluru highway",
      "Walking distance from Narhe Gaon bus stop",
    ],
    travel: [
      "Coming from Navale Bridge, stay on the Dhayari–Katraj road towards Narhe Gaon; Kanta Heights is on the right, just past Samsung Galaxy.",
      "From Katraj, head towards Dhayari — the centre is on the left before Narhe Gaon village.",
      "PMPML buses towards Narhe and Dhayari stop within a few minutes' walk. Parking is available on the service road.",
    ],
    geo: { lat: 18.4529, lng: 73.8177 },
  },
  {
    id: "tilak-road",
    name: "Tilak Road Centre",
    shortName: "Tilak Road",
    isPrimary: false,
    addressLines: [
      "106, Hirabaug Chowk, Mangal Murti Complex",
      "Tilak Road, Shukrawar Peth",
    ],
    locality: "Pune",
    region: "Maharashtra",
    postalCode: "411002",
    phoneDisplay: "+91 93075 90139",
    phoneHref: "+919307590139",
    landmarks: [
      "At Hirabaug Chowk, on Tilak Road",
      "Central Pune — close to Swargate and Sarasbaug",
      "Short walk from Tilak Road's college cluster",
    ],
    travel: [
      "Hirabaug Chowk sits on Tilak Road between Swargate and Alka Talkies; Mangal Murti Complex faces the chowk.",
      "From Swargate bus stand and the Swargate metro station it is a short auto ride or a walk up Tilak Road.",
      "Convenient for working professionals in central Pune and for students in the Tilak Road and Sadashiv Peth colleges.",
    ],
    geo: { lat: 18.5074, lng: 73.85 },
  },
];

export const primaryCentre = centres[0]!;

/** Both centre phone numbers, for contact surfaces that list all lines. */
export const phones = centres.map((c) => ({
  centre: c.shortName,
  display: c.phoneDisplay,
  href: c.phoneHref,
}));

/**
 * A Google Maps link built from the verified address text rather than from
 * coordinates — the address is confirmed, the coordinates are approximate.
 */
export function mapsUrl(centre: Centre): string {
  const query = [
    centre.addressLines.join(", "),
    centre.locality,
    centre.postalCode,
    centre.region,
  ].join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(centre: Centre): string {
  const query = [
    "Jarvees Academy",
    centre.addressLines.join(", "),
    centre.locality,
    centre.postalCode,
  ].join(", ");
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function fullAddress(centre: Centre): string {
  return `${centre.addressLines.join(", ")}, ${centre.locality} ${centre.postalCode}, ${centre.region}`;
}

/** Facts that are verifiable. Nothing may be added here without a source. */
export const proofPoints = [
  { label: "Established", value: "2015" },
  { label: "Quality certification", value: "ISO 9001:2015" },
  { label: "Rating", value: "4.5 / 5 from 59 ratings" },
  { label: "Centres in Pune", value: "Two" },
  { label: "Delivery", value: "Online & classroom" },
] as const;

export const navigation = [
  { href: "/courses", label: "Courses" },
  { href: "/live-projects", label: "Live projects" },
  { href: "/corporate-training", label: "Corporate" },
  { href: "/about", label: "About" },
  { href: "/centres", label: "Centres" },
  { href: "/contact", label: "Contact" },
] as const;
