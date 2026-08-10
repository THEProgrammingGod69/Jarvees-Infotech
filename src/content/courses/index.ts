/**
 * Course registry.
 *
 * To add a course: copy any file in this folder, edit the values, then add one
 * import and one entry to the array below. The catalogue, filters, detail
 * pages, sitemap, related-course links and JSON-LD all read from here.
 */

import type { Course } from "../types";

import sapFico from "./sap-fico";
import sapMm from "./sap-mm";
import sapSd from "./sap-sd";
import sapAbap from "./sap-abap";
import sapS4hana from "./sap-s4hana";
import sapEcc from "./sap-ecc";
import sapBasis from "./sap-basis";
import sapHana from "./sap-hana";
import salesforce from "./salesforce";
import dataScience from "./data-science";
import automationTesting from "./automation-testing";
import softwareTesting from "./software-testing";
import java from "./java";
import dotnet from "./dotnet";
import cpp from "./cpp";

export const courses: Course[] = [
  sapFico,
  sapMm,
  sapSd,
  sapAbap,
  sapS4hana,
  sapEcc,
  sapBasis,
  sapHana,
  salesforce,
  dataScience,
  automationTesting,
  softwareTesting,
  java,
  dotnet,
  cpp,
];

const bySlug = new Map(courses.map((c) => [c.slug, c]));

export function getCourse(slug: string): Course | undefined {
  return bySlug.get(slug);
}

export function coursesInTrack(trackId: Course["track"]): Course[] {
  return courses.filter((c) => c.track === trackId);
}

export function relatedCourses(course: Course, limit = 3): Course[] {
  return course.related
    .filter((slug) => slug !== course.slug)
    .map((slug) => bySlug.get(slug))
    .filter((c): c is Course => Boolean(c))
    .slice(0, limit);
}

/** Course names for the enquiry form's course-of-interest select. */
export const courseOptions = courses.map((c) => ({
  value: c.slug,
  label: c.name,
}));
