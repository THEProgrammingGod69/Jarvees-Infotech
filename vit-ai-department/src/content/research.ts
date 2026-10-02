/**
 * Research — from the department's Research page and the 2025–26 registers
 * published under Events & Highlights. Only items present in those registers
 * appear here; no totals are stated because the registers are paginated and
 * a partial count presented as a total would be a false claim.
 */

export type PatentStatus = "Granted" | "Published" | "Filed";

export type Patent = {
  title: string;
  inventor: string;
  status: PatentStatus;
  jurisdiction: "India" | "South Africa";
  year: number;
  domain: string;
};

export const patents: Patent[] = [
  { title: "An AI-Based Sign Language to Text and Text to Sign Interpreter System", inventor: "Prof. Anita B. Dombale", status: "Granted", jurisdiction: "South Africa", year: 2026, domain: "Accessibility AI" },
  { title: "A Contact Tracing System to Monitor and Mitigate Risk of Exposure to Contagious Illnesses", inventor: "Prof. Prajkta P. Dandavate", status: "Granted", jurisdiction: "South Africa", year: 2026, domain: "Healthcare" },
  { title: "An Energy Meter Monitoring System using IoT", inventor: "Prof. Prajkta P. Dandavate", status: "Granted", jurisdiction: "India", year: 2026, domain: "IoT" },
  { title: "An Artificial Intelligence Based Event and Task Management System", inventor: "Prof. Anita B. Dombale", status: "Granted", jurisdiction: "South Africa", year: 2025, domain: "Applied AI" },
  { title: "A System for Handwritten to Text Conversion and Plagiarism Checking", inventor: "Prof. Anita B. Dombale", status: "Granted", jurisdiction: "South Africa", year: 2025, domain: "Computer vision" },
  { title: "A System for Data Security", inventor: "Prof. Anita B. Dombale", status: "Granted", jurisdiction: "South Africa", year: 2025, domain: "Security" },
  { title: "A System for Pixel Data Management", inventor: "Prof. Anita B. Dombale", status: "Granted", jurisdiction: "South Africa", year: 2025, domain: "Computer vision" },
  { title: "A Multi-Agent System with Dynamic Semantic Contexting and Adaptive Validation", inventor: "Prof. Madhumati N. Pol", status: "Published", jurisdiction: "India", year: 2026, domain: "Multi-agent systems" },
  { title: "KrishiMitra: AI-Based Multilingual Agricultural Support System for Farmers", inventor: "Prof. Prajkta P. Dandavate", status: "Published", jurisdiction: "India", year: 2026, domain: "Agri-tech" },
  { title: "IoT-Enabled Precision Agriculture Monitoring for Crop Health", inventor: "Prof. Prajkta P. Dandavate", status: "Published", jurisdiction: "India", year: 2026, domain: "Agri-tech" },
  { title: "IoT-Enabled Smart Solar Street Lighting System", inventor: "Prof. Prajkta P. Dandavate", status: "Published", jurisdiction: "India", year: 2026, domain: "IoT" },
  { title: "Solar-Powered Bird Repellent Sling Machine", inventor: "Prof. Prajkta P. Dandavate", status: "Published", jurisdiction: "India", year: 2025, domain: "Agri-tech" },
  { title: "An IoT-Based Disaster Management System using LoRa Mesh and Edge AI for Risk Prediction", inventor: "Prof. Mayuri M. Gawade", status: "Filed", jurisdiction: "South Africa", year: 2026, domain: "Edge AI" },
  { title: "Adaptive Battery Thermal State Prediction and Early Overheat Warning System Based on LSTM Networks", inventor: "Prof. Prajkta P. Dandavate", status: "Filed", jurisdiction: "India", year: 2026, domain: "Deep learning" },
  { title: "Hybrid Deep Neural Network and Ensemble Model for Predicting Consumer Preferences and Sales in E-Commerce", inventor: "Prof. Prajkta P. Dandavate", status: "Filed", jurisdiction: "India", year: 2026, domain: "Deep learning" },
  { title: "SecureScan: Source Code Vulnerability Detection System", inventor: "Prof. Prajkta P. Dandavate", status: "Filed", jurisdiction: "India", year: 2026, domain: "Security" },
  { title: "Blockchain-Enabled Real Estate Transaction and Ownership Verification", inventor: "Prof. Prajkta P. Dandavate", status: "Filed", jurisdiction: "India", year: 2026, domain: "Security" },
  { title: "An IoT-Based Smart Pill Dispensing Device for Automatic and Personalised Medicine Delivery", inventor: "Prof. Suhas B. Bhise", status: "Filed", jurisdiction: "South Africa", year: 2025, domain: "Healthcare" },
];

export const publications = [
  { title: "UAV-Assisted AI-Powered Crack Detection in High-Rise Buildings", venue: "IEEE · DECoN 2025", url: "https://ieeexplore.ieee.org/abstract/document/11447901" },
  { title: "AgriBot: A Hexapod-Based Autonomous Robot for Precision Agriculture and Sustainable Farming", venue: "IEEE · ICICIS 2025", url: "https://ieeexplore.ieee.org/document/11371072" },
  { title: "AgriSense: A Monitoring System for Agriculture and Alert System", venue: "IEEE · ICFT 2025", url: "https://ieeexplore.ieee.org/document/11336493" },
  { title: "Automatic Fire-Fighting Robot for Warehouses & Storages", venue: "Springer · ICT for Sustainable Development", url: "https://link.springer.com/chapter/10.1007/978-3-032-06697-8_39" },
  { title: "Deep Learning-Enhanced MRI Imaging for Early Alzheimer's Detection", venue: "Int. Journal of Computing and Digital Systems", url: null },
  { title: "Smart Green Corridors: An IoT-Based System for Ambulance Route Optimization", venue: "ICEI 2026 · Emerging Trends and Innovations in ICT", url: null },
  { title: "Smart Assistance System for Alzheimer's Patients Using the Internet of Things", venue: "ICEI 2026 · Emerging Trends and Innovations in ICT", url: null },
  { title: "Enhancing RSA Algorithm Security through Advanced Combinatorial n! Permutations", venue: "Journal of Discrete Mathematical Sciences & Cryptography", url: null },
  { title: "AI's Role in Promoting Mental Wellness in Higher Education", venue: "Book chapter · Developing AI Literacy, 2026", url: null },
] as const;

export const industryProjects = [
  { partner: "IUCAA, Pune", title: "Large-scale distributed storage for the HTC clusters behind gravitational-wave detection workloads", domain: "Systems" },
  { partner: "Accion Labs", title: "Generative-AI marketing content generation from a company profile", domain: "Generative AI" },
  { partner: "Passion Infotech", title: "Global Climate Disaster Database from satellite imagery and case evidence", domain: "Climate AI" },
  { partner: "Passion Infotech", title: "Air-quality monitoring that predicts its impact on solar power generation", domain: "Climate AI" },
  { partner: "Passion Infotech", title: "Soil-health model predicting quality and nutrient requirements across India", domain: "Agri-tech" },
  { partner: "SVL Technologies", title: "Alzheimer's disease detection", domain: "Healthcare" },
  { partner: "SVL Technologies", title: "Sign-language detection", domain: "Accessibility AI" },
  { partner: "Gyan Box", title: "Emotion recognition with CNNs for personalised music recommendation", domain: "Computer vision" },
  { partner: "Edu plus", title: "AI-based facial-recognition classroom attendance", domain: "Computer vision" },
  { partner: "Edu plus", title: "AI-based coding test platform and personalised question-paper generation", domain: "Applied AI" },
] as const;

export const studentInnovations = [
  "Drone detection using a Swin Transformer FPN and R-CNN",
  "Real-time AI-powered traffic system for emergency vehicles using YOLO with Arduino actuation",
  "LegalAid AI: a voice-enabled legal assistant",
  "Verification-driven dual-stream retrieval for statutory legal auditing",
  "AI-driven phishing website detection for research platforms",
  "IoT streetlight fault detection and lifespan estimation using fuzzy logic",
  "Multi-tier accident response framework with embedded IoT sensors and fuzzy decision logic",
  "Instant intrusion detection using machine learning",
  "The Voice of the Mutes",
  "Smart Retail Hybrid: decision support for inventory under supply-chain uncertainty",
] as const;

/** Domains for the constellation — each links to the work that justifies it. */
export const domains = [
  { id: "vision", label: "Computer Vision", items: ["Crack detection from UAV imagery", "Drone detection with Swin Transformers", "Facial-recognition attendance", "Handwriting to text"] },
  { id: "genai", label: "Generative & Agentic AI", items: ["Multi-agent semantic contexting (patent)", "GenAI marketing content — Accion Labs", "Agentic AI faculty training"] },
  { id: "nlp", label: "Language & Accessibility", items: ["Sign language ↔ text interpreter (granted)", "LegalAid AI voice assistant", "KrishiMitra multilingual farm support"] },
  { id: "health", label: "Healthcare AI", items: ["Alzheimer's detection from MRI", "Contact tracing system (granted)", "Smart pill dispenser"] },
  { id: "edge", label: "IoT & Edge AI", items: ["LoRa-mesh disaster prediction", "Smart green corridors for ambulances", "Smart solar street lighting"] },
  { id: "agri", label: "Agri & Climate", items: ["AgriBot hexapod robot", "Soil-health prediction", "Climate disaster database"] },
  { id: "security", label: "Security & Blockchain", items: ["SecureScan vulnerability detection", "Real-time intrusion detection", "Blockchain property verification"] },
  { id: "robotics", label: "Robotics", items: ["Fire-fighting warehouse robot", "DD Robocon 2025 — AIR 3", "Hexapod precision farming"] },
] as const;
