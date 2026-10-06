import type { PhotoId } from "./photos.generated";

/**
 * Facilities — from the department's Facilities page. Photographs are the
 * department's own, self-hosted and pre-optimised (see assets/photos and
 * scripts/optimize-images.mjs), so the site never depends on another server.
 */

export const labs = [
  {
    id: "innovation",
    name: "Artificial Intelligence Innovation Lab",
    short: "AI Innovation Lab",
    seats: 30,
    photo: "lab-innovation" satisfies PhotoId,
    specs: [
      "30 × HP desktops · 12th Gen Intel Core i5-12500, 3.0 GHz",
      "16 GB RAM per workstation",
      "Eagle Pro AI AX1500 smart router",
    ],
  },
  {
    id: "dl",
    name: "Deep Learning Lab",
    short: "Deep Learning Lab",
    seats: 25,
    photo: "lab-deep-learning" satisfies PhotoId,
    specs: ["25 × HP workstations"],
  },
  {
    id: "computing",
    name: "Computing Lab",
    short: "Computing Lab",
    seats: 27,
    photo: "lab-computing" satisfies PhotoId,
    specs: ["27 × HP workstations", "Oculus Quest all-in-one VR headset, 256 GB", "Printing station"],
  },
  {
    id: "programming",
    name: "Programming Lab",
    short: "Programming Lab",
    seats: 25,
    photo: "lab-programming" satisfies PhotoId,
    specs: ["25 × HP workstations"],
  },
] as const;

export const classroomPhoto: PhotoId = "classroom";
export const departmentPhoto: PhotoId = "department";
