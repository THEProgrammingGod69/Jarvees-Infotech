/**
 * Facilities — from the department's Facilities page. Photographs are the
 * department's own, served from vit.edu; <HoloImage> falls back to a drawn
 * plate if one ever fails to load, so a missing photo never breaks a card.
 */

export const labs = [
  {
    id: "innovation",
    name: "Artificial Intelligence Innovation Lab",
    short: "AI Innovation Lab",
    seats: 30,
    photo: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/OAK_8167-2-1024x678.jpg",
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
    photo: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/OAK_8176-3-1024x678.jpg",
    specs: ["25 × HP workstations"],
  },
  {
    id: "computing",
    name: "Computing Lab",
    short: "Computing Lab",
    seats: 27,
    photo: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/OAK_8155-2-1024x678.jpg",
    specs: ["27 × HP workstations", "Oculus Quest all-in-one VR headset, 256 GB", "Printing station"],
  },
  {
    id: "programming",
    name: "Programming Lab",
    short: "Programming Lab",
    seats: 25,
    photo: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/OAK_8151-1-1024x678.jpg",
    specs: ["25 × HP workstations"],
  },
] as const;

export const classroomPhoto = "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/20260306_112653-2-1024x768.jpg";
export const departmentPhoto = "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/OAK_8065-1-scaled.jpg";
