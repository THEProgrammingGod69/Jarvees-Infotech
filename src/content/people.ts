/**
 * Faculty directory.
 *
 * The department's public faculty page renders client-side and published no
 * roster at the time of writing, so this directory is compiled from the
 * department's own 2025–26 records: the faculty patent register, the
 * publications register and the FDP log on the Events & Highlights page.
 * Each entry's `work` lines cite those records, so every line is traceable.
 * Designations other than the Head's are deliberately not stated — they were
 * not published, and a guessed title is a wrong one.
 */

export type FacultyMember = {
  name: string;
  /** Short themes derived from the cited work, for filtering. */
  themes: string[];
  work: string[];
};

export const faculty: FacultyMember[] = [
  {
    name: "Dr. Sunil Sable",
    themes: ["Generative AI", "Agentic AI"],
    work: ["FDP · Generative and Agentic AI — Tools & Demos, SVNIT Surat (Feb 2026)", "FDP · AI in the Era of Industry 5.0 (Feb 2026)"],
  },
  {
    name: "Dr. Shraddha Mankar",
    themes: ["AI security"],
    work: ["FDP · AI in Cybersecurity: Securing Intelligent Systems against Evolving Threats, MMCOE Pune"],
  },
  {
    name: "Dr. Anuradha Yenkikar",
    themes: ["Agentic AI", "Generative AI", "IoT"],
    work: [
      "FDP · Industry Training — Agentic AI, CSE (AIML), VIT",
      "FDP · Generative AI for Academia, RSCOE (Apr 2026)",
      "FDP · Integrating ML and AI for Scalable IoT Solutions (Apr 2026)",
    ],
  },
  {
    name: "Dr. Sangita M. Jaybhaye",
    themes: ["Medical imaging", "Deep learning", "Security"],
    work: [
      "Deep Learning-Enhanced MRI Imaging for Early Alzheimer's Detection — Int. J. of Computing and Digital Systems",
      "Real Time Intrusion Detection System using AI & ML — Int. Conf. on Recent Trends in ML, IoT & Smart Cities",
    ],
  },
  {
    name: "Prof. Prajkta P. Dandavate",
    themes: ["IoT", "Agri-tech", "Deep learning", "Security"],
    work: [
      "Patent granted · A Contact Tracing System to Monitor and Mitigate Risk of Exposure to Contagious Illnesses",
      "Patent published · KrishiMitra: AI-Based Multilingual Agricultural Support System for Farmers",
      "Patent filed · Adaptive Battery Thermal State Prediction and Early Overheat Warning using LSTM Networks",
      "Patent filed · SecureScan: Source Code Vulnerability Detection System",
    ],
  },
  {
    name: "Prof. Anita B. Dombale",
    themes: ["Accessibility AI", "Security", "IoT"],
    work: [
      "Patent granted · An AI-Based Sign Language to Text and Text to Sign Interpreter System",
      "Patent granted · An Artificial Intelligence Based Event and Task Management System",
      "Smart Green Corridors: An IoT-Based System for Ambulance Route Optimization — ICEI 2026",
    ],
  },
  {
    name: "Prof. Madhumati N. Pol",
    themes: ["Multi-agent systems", "AI for wellbeing"],
    work: [
      "Patent published · A Multi-Agent System with Dynamic Semantic Contexting and Adaptive Validation",
      "AI's Role in Promoting Mental Wellness in Higher Education — book chapter, 2026",
    ],
  },
  {
    name: "Prof. Mayuri M. Gawade",
    themes: ["Edge AI", "IoT"],
    work: [
      "Patent filed · An IoT-Based Disaster Management System using LoRa Mesh and Edge AI for Risk Prediction",
      "Co-ordinator · FDP on AI for Sustainable Development Goals (Dec 2025)",
    ],
  },
  {
    name: "Prof. Suhas B. Bhise",
    themes: ["Robotics", "Computer vision", "Edge AI"],
    work: [
      "UAV-Assisted AI-Powered Crack Detection in High-Rise Buildings — IEEE DECoN 2025",
      "AgriBot: A Hexapod-Based Autonomous Robot for Precision Agriculture — IEEE ICICIS 2025",
      "AgriSense: A Monitoring and Alert System for Agriculture — IEEE ICFT 2025",
    ],
  },
  {
    name: "Prof. Pranjal Pandit",
    themes: ["NLP", "Agentic AI"],
    work: ["MOOC · Natural Language Processing (2026)", "FDP · Artificial Intelligence in the Era of Agents and Automation (2026)"],
  },
  {
    name: "Prof. Ramesh G. Patole",
    themes: ["IoT"],
    work: ["FDP · Integrating Machine Learning and AI for Scalable IoT Solutions (Feb 2026)"],
  },
  {
    name: "Prof. Priyanka Kinage",
    themes: ["IoT"],
    work: ["FDP · Integrating Machine Learning and AI for Scalable IoT Solutions (Feb 2026)", "Co-ordinator · FDP on AI for SDGs (Dec 2025)"],
  },
  {
    name: "Prof. Archana Burujwale",
    themes: ["Outreach"],
    work: ["Co-ordinator · FDP on AI for Sustainable Development Goals with IEEE Pune Section (Dec 2025)"],
  },
  {
    name: "Prof. Smita S. Bhosale",
    themes: ["Information technology"],
    work: ["FDP · Recent Trends in Information Technology, BVCOE (Jan 2026)"],
  },
  {
    name: "Prof. Sneha Satpute",
    themes: ["Information technology"],
    work: ["FDP · Recent Trends in Information Technology, BVCOE (Jan 2026)"],
  },
  {
    name: "Prof. Dnyanda Shinde",
    themes: ["Information technology"],
    work: ["FDP · Recent Trends in Information Technology, BVCOE (Jan 2026)"],
  },
  {
    name: "Prof. Priyanka Khalate",
    themes: ["Information technology"],
    work: ["FDP · Recent Trends in Information Technology, BVCOE (Jan 2026)"],
  },
];

export const testimonials = [
  {
    name: "Tanmay Walke",
    programme: "CSE (AI)",
    quote:
      "Education is not the filling of a pail, but the lighting of a fire. VIT Pune has ignited that fire within me, fostering an environment where learning extends beyond textbooks. This department has been more than just a classroom; it's a hub of innovation and limitless possibilities.",
  },
  {
    name: "Shlok Sonkusare",
    programme: "CSE (AI)",
    quote:
      "VIT Pune wasn't just a map to a career; it was a treasure map leading to the depths of my potential. Professors, more than instructors, became catalysts — igniting our curiosity and challenging us to think beyond the confines of textbooks.",
  },
  {
    name: "Tanmay Bora",
    programme: "CSE (AI)",
    quote:
      "With a dedicated faculty and a vibrant campus culture, VIT Pune guides me on a journey of continuous learning, personal growth and the pursuit of excellence. Its clubs aren't just organisations; they are lively hubs for creativity, leadership and collaboration.",
  },
] as const;

/** Social-impact activities CSE (AI) students took part in, AY 2023–26. */
export const socialActivities = [
  { name: "NSS Camp", org: "NSS Unit A65" },
  { name: "Go Green", org: "Social Welfare & Development Committee" },
  { name: "Swachh Pune", org: "Civic clean-up drive" },
  { name: "Blood Donation Camp", org: "Institute drive" },
  { name: "Muskaan", org: "Social Welfare & Development Committee" },
  { name: "Aatmabodh", org: "Social Welfare & Development Committee" },
  { name: "Police Mitra", org: "Community policing volunteers" },
  { name: "Night Patrolling", org: "Community safety" },
  { name: "Vatsalya", org: "Social service activity" },
  { name: "Utkarsh", org: "Social Welfare & Development Committee" },
  { name: "Tree Plantation", org: "On campus, 2025–26" },
  { name: "Cleanup India", org: "2025–26" },
] as const;
