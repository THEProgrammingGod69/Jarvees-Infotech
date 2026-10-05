import { dept, institute, SITE_URL } from "./site";

/**
 * schema.org description of the department, nested in its institute. Reads
 * the same constants as the visible page, so the two cannot disagree.
 */
export function departmentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${SITE_URL}/#department`,
    name: `Department of ${dept.name}`,
    alternateName: `${dept.short}, ${institute.short}`,
    url: SITE_URL,
    email: dept.email,
    telephone: dept.phone.href.replace("tel:", ""),
    sameAs: [dept.officialUrl, dept.socials.linkedin, dept.socials.x],
    address: {
      "@type": "PostalAddress",
      streetAddress: institute.campus.street,
      addressLocality: institute.campus.city,
      addressRegion: institute.campus.region,
      postalCode: institute.campus.postalCode,
      addressCountry: institute.campus.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: institute.campus.geo.lat, longitude: institute.campus.geo.lng },
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: institute.name,
      url: institute.url,
      foundingDate: String(institute.founded),
    },
    employee: { "@type": "Person", name: dept.hod.name, jobTitle: dept.hod.role },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Programmes",
      itemListElement: [
        {
          "@type": "Course",
          name: dept.programme,
          provider: { "@type": "CollegeOrUniversity", name: institute.name },
          educationalCredentialAwarded: "Bachelor of Technology",
          timeRequired: "P4Y",
        },
      ],
    },
  };
}
