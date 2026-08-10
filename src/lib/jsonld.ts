import { SITE_URL, site, centres, fullAddress, mapsUrl } from "./site";
import type { Course } from "@/content/types";
import { trackById, levelLabel } from "@/content/types";

type Json = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organisation`;

/**
 * EducationalOrganization for the brand.
 *
 * The aggregateRating carries the real JustDial figures and nothing else. It is
 * emitted site-wide because the same figures are displayed site-wide, in the
 * footer — structured data must not claim a rating the page does not show.
 */
export function organisationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: "Jarvees Academy Pune",
    url: SITE_URL,
    email: site.email,
    foundingDate: String(site.founded),
    parentOrganization: {
      "@type": "Organization",
      name: "Jarvees Infotech Private Limited",
    },
    sameAs: [site.facebook],
    address: centres.map((c) => ({
      "@type": "PostalAddress",
      streetAddress: c.addressLines.join(", "),
      addressLocality: c.locality,
      addressRegion: c.region,
      postalCode: c.postalCode,
      addressCountry: "IN",
    })),
    telephone: centres.map((c) => `+${c.phoneHref.replace(/^\+/, "")}`),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "ISO 9001:2015 Quality Management System certification",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating.value,
      reviewCount: site.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

/** One LocalBusiness block per centre, each with its own address, geo and hours. */
export function centreSchemas(): Json[] {
  return centres.map((centre) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/centres#${centre.id}`,
    name: `${site.name} — ${centre.name}`,
    parentOrganization: { "@id": ORG_ID },
    url: `${SITE_URL}/centres`,
    email: site.email,
    telephone: centre.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: centre.addressLines.join(", "),
      addressLocality: centre.locality,
      addressRegion: centre.region,
      postalCode: centre.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: centre.geo.lat,
      longitude: centre.geo.lng,
    },
    hasMap: mapsUrl(centre),
    openingHours: site.openingHoursSpec,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    areaServed: { "@type": "City", name: "Pune" },
  }));
}

/**
 * Course schema for a detail page.
 *
 * `hasCourseInstance` describes the delivery modes honestly. No price is
 * asserted, because the academy has not published one — an invented
 * `offers` block would be exactly the kind of fabrication this site avoids.
 */
export function courseSchema(course: Course): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/courses/${course.slug}#course`,
    name: `${course.name} training`,
    description: course.metaDescription,
    url: `${SITE_URL}/courses/${course.slug}`,
    provider: { "@id": ORG_ID },
    educationalLevel: levelLabel[course.level],
    about: trackById(course.track).name,
    inLanguage: "en",
    teaches: course.curriculum.map((m) => m.title),
    hasCourseInstance: course.modes.map((mode) => ({
      "@type": "CourseInstance",
      courseMode: mode === "online" ? "online" : "onsite",
      courseWorkload: course.duration.startsWith("{{")
        ? undefined
        : course.duration,
      location:
        mode === "classroom"
          ? centres.map((c) => ({
              "@type": "Place",
              name: `${site.name} — ${c.name}`,
              address: fullAddress(c),
            }))
          : undefined,
    })),
  };
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
