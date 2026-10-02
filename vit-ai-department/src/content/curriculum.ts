/**
 * Course structure, from "Structure & Syllabus — B.Tech CSE (AI), w.e.f.
 * AY 2025–26" (Board of Studies in CSE (AI), approved by the Academic Board).
 * Codes are the institute's own. VIT's first year is common to all branches
 * and run by Engineering, Sciences & Humanities, so the department's own
 * structure starts at Module III.
 */

export type Course = {
  code: string;
  name: string;
  /** NEP category where it is evident from the structure. */
  kind: "core" | "skill" | "project" | "elective" | "internship";
};

export type Module = {
  id: string;
  year: "SY" | "TY" | "B.Tech";
  module: string;
  theme: string;
  summary: string;
  credits?: number;
  courses: Course[];
};

export const modules: Module[] = [
  {
    id: "m3",
    year: "SY",
    module: "Module III",
    theme: "Foundations",
    summary: "Data structures, databases and object orientation — the substrate every model runs on.",
    credits: 21,
    courses: [
      { code: "CI2011", name: "Fundamentals of Data Structures", kind: "core" },
      { code: "CI2012", name: "Database Management Systems", kind: "core" },
      { code: "CI2013", name: "Object Oriented Programming", kind: "core" },
      { code: "CI2014", name: "Digital Systems and Microprocessor", kind: "core" },
      { code: "CIM001", name: "Discrete Mathematics", kind: "core" },
      { code: "HS2002", name: "From Campus to Corporate – 1", kind: "skill" },
      { code: "HS2001", name: "Reasoning and Aptitude Development – 3", kind: "skill" },
      { code: "CI2006", name: "Design Thinking – 1", kind: "project" },
      { code: "CI2007", name: "Engineering Design and Innovation – I", kind: "project" },
    ],
  },
  {
    id: "m4",
    year: "SY",
    module: "Module IV",
    theme: "First models",
    summary: "Machine learning arrives alongside algorithms, networking and full-stack engineering.",
    credits: 21,
    courses: [
      { code: "CI2017", name: "Advanced Data Structures and Algorithms", kind: "core" },
      { code: "CI2018", name: "Machine Learning", kind: "core" },
      { code: "CI2019", name: "Data Communication and Networking", kind: "core" },
      { code: "CI2020", name: "Full Stack Development", kind: "core" },
      { code: "MM0902", name: "Industry Automation 5.0", kind: "core" },
      { code: "HS2003", name: "From Campus to Corporate – 2", kind: "skill" },
      { code: "HS2004", name: "Reasoning and Aptitude Development – 4", kind: "skill" },
      { code: "CI2021", name: "Design Thinking – 2", kind: "project" },
      { code: "CI2022", name: "Engineering Design and Innovation – 2", kind: "project" },
    ],
  },
  {
    id: "m5",
    year: "TY",
    module: "Module V",
    theme: "Neural depth",
    summary: "Artificial neural networks, algorithm design and cloud computing, with a 12-hour-a-week design studio.",
    courses: [
      { code: "CI3001", name: "Computer Network Technology", kind: "core" },
      { code: "CI3002", name: "Design and Analysis of Algorithms", kind: "core" },
      { code: "CI3003", name: "Artificial Neural Networks", kind: "core" },
      { code: "CI3004", name: "Cloud Computing", kind: "core" },
      { code: "CI3005", name: "Design Thinking – 5", kind: "project" },
      { code: "CI3006", name: "Engineering Design and Innovation", kind: "project" },
    ],
  },
  {
    id: "m6",
    year: "TY",
    module: "Module VI",
    theme: "Deep learning",
    summary: "Deep learning, software engineering and the security of systems — cyber security and blockchain.",
    courses: [
      { code: "CI3007", name: "Software Engineering", kind: "core" },
      { code: "CI3008", name: "Cyber Security and Blockchain", kind: "core" },
      { code: "CI3009", name: "Deep Learning", kind: "core" },
      { code: "CI3010", name: "Design Thinking – 6", kind: "project" },
      { code: "CI3011", name: "Engineering Design and Innovation", kind: "project" },
    ],
  },
  {
    id: "m7",
    year: "B.Tech",
    module: "Module VII",
    theme: "Generative frontier",
    summary: "Generative AI and a semester-long major project — or a full semester in industry, research or abroad.",
    courses: [
      { code: "CI4001", name: "Generative AI", kind: "elective" },
      { code: "CI4002", name: "Swayam (MOOC)", kind: "elective" },
      { code: "OE", name: "LinkedIn Learning", kind: "elective" },
      { code: "CI4008", name: "Major Project", kind: "project" },
      { code: "CI4007", name: "Design Thinking – 7", kind: "project" },
    ],
  },
  {
    id: "m8",
    year: "B.Tech",
    module: "Module VIII",
    theme: "Language & launch",
    summary: "Natural language processing and the major project's completion — or a second internship semester.",
    courses: [
      { code: "CI4005", name: "Natural Language Processing", kind: "elective" },
      { code: "CI4014", name: "Swayam Course", kind: "elective" },
      { code: "OE", name: "LinkedIn Learning", kind: "elective" },
      { code: "CI4016", name: "Major Project", kind: "project" },
    ],
  },
];

/** Final-year students may replace coursework with a 32-hour-a-week internship. */
export const internshipTracks = [
  { code: "CI4010 · CI4017", name: "Industry Internship", body: "A full semester embedded with a company's engineering team." },
  { code: "CI4011 · CI4019", name: "Project Internship", body: "A sponsored project delivered end-to-end under joint supervision." },
  { code: "CI4012 · CI4018", name: "Research Internship", body: "A semester at a research lab or institute, working on an open problem." },
  { code: "CI4013 · CI4020", name: "Global Internship", body: "A semester with an international university or organisation." },
] as const;

/** Multidisciplinary (MD) industry-certification courses on the TY structure. */
export const certifications = [
  "IBM Full Stack Software Developer",
  "IBM Back-End Developer",
  "IBM Data Science",
  "IBM Mainframe Developer",
  "AWS Cloud Technology Consultant",
  "Google UX Design",
  "Google Digital Marketing",
] as const;

/** Final-year multidisciplinary electives (MD42xx). */
export const finalYearElectives = [
  "Large Language Models",
  "Generative AI Skills for Developers",
  "Essentials in Generative AI",
  "Prompt Engineering Skills",
  "Natural Language Processing Skills",
  "Understanding Quantum Computing",
  "AWS Certified Solutions Architect",
  "IT Security Specialist",
  "Mastering Microsoft Power BI",
  "Concepts of Data Visualization and Storytelling",
  "Career in Data Analysis",
  "Python in Finance",
] as const;

/** Threads that run through every module, read off the structure itself. */
export const pillars = [
  {
    title: "Design Thinking, every semester",
    body: "A Design Thinking course sits in every module from SY to final year — problem framing is taught as a habit, not a one-off workshop.",
  },
  {
    title: "Engineering Design & Innovation",
    body: "Project studios scale from two credits in SY to twelve lab hours a week in TY, ending in a two-semester major project.",
  },
  {
    title: "Campus to Corporate",
    body: "Aptitude development and the Campus-to-Corporate series run alongside the core so placement readiness is built, not crammed.",
  },
  {
    title: "Continuous assessment",
    body: "Course projects, lab work, group discussions, presentations and viva voce carry real weight next to mid- and end-semester exams.",
  },
] as const;

export const syllabi = [
  { label: "SY Syllabus · AY 2026–27 · Sem I", href: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/08/SY-Syllabus_CSE_AI_AY26_27-SEM-I-Final.pdf" },
  { label: "TY Syllabus · AY 2026–27 · Sem I", href: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/08/TY-Syllabus_CSE_AI_AY26_27-SEM-I-5-7-2026.pdf" },
  { label: "B.Tech & TY Syllabus · AY 2026–27 · Sem I", href: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/07/B.Tech-and-TY-Syllabus_CSE_AI_AY26_27-SEM-I.pdf" },
  { label: "Structure & Curriculum · AY 2025–26", href: "https://www.vit.edu/CSE-AI/wp-content/uploads/2026/04/Syllabus_CSE_AI_AY25_26-SEM-II-Final.pdf" },
  { label: "Structure & Curriculum · AY 2024–25", href: "https://d1r3r36pquuygt.cloudfront.net/vit/CSE-AI/2025/01/Syllabus_CSE_AI_AY24_25.pdf" },
  { label: "Structure & Curriculum · AY 2023–24", href: "https://d1r3r36pquuygt.cloudfront.net/vit/CSE-AI/2025/01/Syllabus_CSE_AI_AY23_24.pdf" },
] as const;
