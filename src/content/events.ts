/**
 * Events, hackathons and student achievements — from the department's
 * Events & Highlights page. Dates are as published.
 */

export const codeApex3 = {
  name: "CODE APEX 3.0",
  organiser: "Artificial Intelligence Students' Forum (AISF) · CSE (AI)",
  tagline: "The end is coming. Build before it does.",
  registerUrl: "https://unstop.com/o/HhCvFaZ",
  registerBy: "9 October 2026",
  /** Grand finale start, IST. */
  finale: "2026-10-24T09:00:00+05:30",
  prizePool: "₹2,00,000+",
  prizes: [
    { place: "1st", amount: "₹50,000" },
    { place: "2nd", amount: "₹30,000" },
    { place: "3rd", amount: "₹20,000" },
  ],
  perks: ["Track-wise winners", "Internship opportunities", "Mentorship", "Goodies"],
  stages: [
    { code: "Stage 01", date: "10–11 Oct 2026", body: "Online evaluation" },
    { code: "Stage 02", date: "15–18 Oct 2026", body: "Online evaluation" },
    { code: "Grand Finale", date: "24 Oct 2026", body: "24-hour offline hackathon · VIT Bibwewadi Campus" },
  ],
  tracks: [
    { code: "Track 01", body: "Announcing soon" },
    { code: "Track 02", body: "Announcing soon" },
    { code: "Track 03", body: "Open Innovation — hardware and software solutions welcome" },
  ],
  team: "1–4 members",
  fee: "₹300 for VIT students · ₹300 + GST for others",
} as const;

export const pastEvents = [
  {
    date: "Mar 2026",
    title: "CODEAPEX 2.0 — 24-Hour Hackathon",
    body: "Online screening, online pitching, then 24 hours offline at Bibwewadi. ₹70,000 prize pool; the top two teams in every track received confirmed internship opportunities.",
    tags: ["AISF", "Hackathon"],
  },
  {
    date: "Dec 2025",
    title: "FDP · AI for Sustainable Development Goals",
    body: "A one-week online Faculty Development Programme with IEEE Pune Section and IEEE CTSoc Pune Chapter — foundations, tools, ethics and hands-on workshops with industry experts. Convened by the Head of Department.",
    tags: ["IEEE", "FDP"],
  },
  {
    date: "Sep 2025",
    title: "Code Verse — 24-Hour Hackathon",
    body: "240+ teams registered — 52% from VIT and 48% from colleges across Maharashtra. Technical association with DRDO DIAT Lab, AVIS Pixel, Denitsu and Sumeru Digital; publication association with IEEE CTSoc and IEEE Pune Section.",
    tags: ["DRDO", "IEEE", "Hackathon"],
  },
  {
    date: "Apr 2026",
    title: "FDP · Integrating ML and AI for Scalable IoT Solutions",
    body: "A week-long Faculty Development Programme organised by CSE (AI), VIT, attended by faculty from across the institute.",
    tags: ["FDP"],
  },
] as const;

export type Level = "International" | "National" | "Inter-college";

export type Achievement = {
  title: string;
  result: string;
  who: string;
  level: Level;
  when: string;
  prize?: string;
};

export const achievements: Achievement[] = [
  { title: "Smart India Hackathon 2025", result: "Winner", who: "Team 100x · Sahil Patil, SY-E", level: "National", when: "2025" },
  { title: "Allianz India Tech Championship 2025", result: "Winner", who: "Prathamesh Nawale, SY", level: "National", when: "2025", prize: "€3,000" },
  { title: "Impetus 2026", result: "1st position", who: "Manasi Gavali, Anushka Rudrawar, Vedant Patil · SY SEDA", level: "International", when: "2026" },
  { title: "MIT ADT AI Grand Challenge 2026", result: "1st position", who: "Team Pentaprime", level: "National", when: "2026" },
  { title: "Thinking Machine AI Hackathon · IIIT Pune", result: "Winner", who: "CSE (AI) team", level: "National", when: "Feb 2026", prize: "₹10,000" },
  { title: "TechCatalyst · GDGoC", result: "1st rank", who: "Team Unexpected Outputs", level: "National", when: "Jan 2026" },
  { title: "Ada Lovelace Citi Bank Hackathon", result: "1st position", who: "TY Div A & B team", level: "National", when: "2025", prize: "Amazon Echo Show" },
  { title: "One Earth International Hackathon", result: "2nd position", who: "TY team", level: "International", when: "2025", prize: "GBP 500" },
  { title: "DATAFORGE 2026 · IIT Roorkee E-Summit", result: "3rd position", who: "TY team", level: "National", when: "2026" },
  { title: "DD Robocon 2025 · IIT Delhi", result: "AIR 3", who: "Tanmay Bora & team", level: "National", when: "Jul 2025", prize: "₹20,000" },
  { title: "IHFC Award for Robotics & AI", result: "1st", who: "Tanmay Bora & team", level: "National", when: "Jul 2025", prize: "₹25,000" },
  { title: "MATLAB Modelling Award · MathWorks", result: "1st", who: "Tanmay Bora, Saumitra Kulkarni", level: "National", when: "Jul 2025", prize: "₹35,000" },
  { title: "MindSpark 2025 · COEP Tech, sponsored by Tata Motors", result: "First runner-up", who: "CSE (AI) team", level: "National", when: "2025" },
  { title: "National Hackathon · AIT Pune", result: "4th rank", who: "Team Dev Dynamo", level: "National", when: "Jan 2026", prize: "₹25,000" },
  { title: "Winter School on Decentralized Trust & Blockchains · IIT Madras", result: "2nd position", who: "CSE (AI) student", level: "Inter-college", when: "2026" },
  { title: "InnovHealth Hackathon · Artemis Hospital", result: "2nd runner-up", who: "Team Bit Misfit", level: "National", when: "2025", prize: "₹10,000" },
  { title: "Kartikeya Rindani Memorial Competitions 2026", result: "1st in Project & TechnoQuiz", who: "Inter-college team incl. VIT", level: "Inter-college", when: "2026" },
  { title: "Code Vista 4.0", result: "1st position", who: "Aniketh Pala", level: "National", when: "Feb 2024", prize: "₹15,000" },
  { title: "Beta Version 8 · ISTE SC MANIT Bhopal", result: "1st runner-up", who: "Shalvi Maheshwari", level: "National", when: "2025", prize: "₹15,000" },
  { title: "Breaking Enigma · ACM VIT", result: "2nd runner-up", who: "Team SPectra · SY SEDA", level: "National", when: "Apr 2026" },
  { title: "Smart India Hackathon 2024", result: "Winners", who: "Teams Prayogini and AlgoAces", level: "National", when: "2024" },
  { title: "National Defence Academy", result: "AIR 57 · 154th course", who: "Viraj Bagwe, FY", level: "National", when: "2025" },
];

export const announcements = [
  "CODE APEX 3.0 — registrations close 9 October · Grand Finale 24 October 2026",
  "Smart India Hackathon 2025 — winners from CSE (AI)",
  "Allianz India Tech Championship 2025 — won by a CSE (AI) second-year student",
  "Placements AY 2025–26 — highest offer ₹32.75 LPA",
  "SY & TY syllabi for AY 2026–27 published",
  "FDP on AI for Sustainable Development Goals with IEEE Pune Section",
] as const;
