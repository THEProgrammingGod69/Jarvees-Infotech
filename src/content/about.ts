/**
 * Vision, mission, objectives, outcomes and the Head's message — verbatim or
 * lightly trimmed from the department's About page and the AY 2025–26
 * Structure & Syllabus document approved by the Board of Studies.
 */

export const vision =
  "Excellence in Computer Science and Engineering, specialized in Artificial Intelligence, fostering skilled professionals and innovators for holistic societal development.";

export const instituteVision =
  "To be globally acclaimed Institute in Technical Education and Research for holistic Socio-economic development.";

export const missions = [
  {
    code: "M1",
    title: "Industry, academia, entrepreneurship",
    body: "To equip aspiring engineers for industry, academia and entrepreneurship by providing quality education in emerging Artificial Intelligence techniques.",
  },
  {
    code: "M2",
    title: "Research-oriented education",
    body: "To impart value-added, research-oriented technical education by inculcating life skills, critical thinking and human values.",
  },
  {
    code: "M3",
    title: "Innovation with integrity",
    body: "To educate and empower learners with professional integrity through innovation, industry engagement and higher studies in Artificial Intelligence for sustainable solutions.",
  },
  {
    code: "M4",
    title: "Ethical, lifelong learners",
    body: "To nurture ethical and socially responsible professionals by fostering lifelong learning skills for holistic societal development.",
  },
] as const;

export const peos = [
  { code: "PEO1", focus: "Core competence", body: "Demonstrate core competence in principles of computing and AI-based technologies." },
  { code: "PEO2", focus: "Breadth", body: "Apply AI principles, methodologies, algorithms and tools to effectively design, develop and implement AI-driven solutions." },
  { code: "PEO3", focus: "Professionalism", body: "Excel in professionalism with the soft skills needed to work collaboratively in interdisciplinary teams." },
  { code: "PEO4", focus: "Learning environment", body: "Aim for continuing education and entrepreneurship in emerging areas of computing and Artificial Intelligence." },
] as const;

export const psos = [
  { code: "PSO1", body: "Demonstrate proficiency in essential concepts of computer science and programming solutions." },
  { code: "PSO2", body: "Formulate robust software design, execution and testing strategies employing software paradigms and Artificial Intelligence knowledge to solve real-world problems." },
  { code: "PSO3", body: "Adapt and exhibit expertise in evolving areas of computer science, engineering and technology." },
] as const;

export const pos = [
  { code: "PO1", title: "Engineering knowledge", body: "Apply mathematics, science, engineering fundamentals and a specialization to complex engineering problems." },
  { code: "PO2", title: "Problem analysis", body: "Identify, formulate and analyse complex problems, reaching substantiated conclusions from first principles." },
  { code: "PO3", title: "Design of solutions", body: "Design systems and processes that meet specified needs with consideration for health, safety, culture, society and environment." },
  { code: "PO4", title: "Investigation", body: "Use research-based knowledge and methods — experiments, analysis, synthesis — to reach valid conclusions." },
  { code: "PO5", title: "Modern tool usage", body: "Create, select and apply modern engineering and IT tools, including prediction and modelling, understanding their limits." },
  { code: "PO6", title: "The engineer and society", body: "Assess societal, health, safety, legal and cultural issues relevant to professional practice." },
  { code: "PO7", title: "Environment and sustainability", body: "Understand the impact of engineering solutions in societal and environmental contexts." },
  { code: "PO8", title: "Ethics", body: "Commit to professional ethics, responsibilities and the norms of engineering practice." },
  { code: "PO9", title: "Individual and team work", body: "Function effectively as an individual and as a member or leader in diverse, multidisciplinary teams." },
  { code: "PO10", title: "Communication", body: "Communicate complex engineering activity clearly — reports, design documents, presentations, instructions." },
  { code: "PO11", title: "Project management and finance", body: "Apply engineering and management principles to manage projects in multidisciplinary environments." },
  { code: "PO12", title: "Life-long learning", body: "Recognise the need for, and engage in, independent learning through technological change." },
] as const;

export const hodMessage = [
  "The Department of Computer Science & Engineering (Artificial Intelligence) at VIT aims to be one of the leading programs in providing value-added, high-quality education in Computer Science and Engineering with a specialization in Artificial Intelligence.",
  "Our vision is to cultivate a culture of innovation, research and entrepreneurship within the department — a dynamic learning environment that encourages creativity, critical thinking and problem-solving through the application of Artificial Intelligence. By integrating theoretical knowledge with practical applications, we aim to equip students to contribute to the advancement of AI on a global scale.",
  "The programme is autonomous, and by using that freedom the curriculum keeps pace with contemporary industry needs. We aim to produce competent, socially responsible professionals who will be at the forefront of transforming the world through Artificial Intelligence — with a passion for lifelong learning and a commitment to ethical practice.",
] as const;

export const mentors = [
  {
    name: "Prof. Abhiram Ranade",
    role: "Mentor",
    affiliation: "Department of Computer Science and Engineering, Indian Institute of Technology Bombay, Powai",
  },
  {
    name: "Dr. Anicia Peters",
    role: "International Mentor",
    affiliation: "Chairperson, Namibia 4IR Presidential Task Force · Research, Innovation and Development, University of Namibia",
  },
] as const;

/** Institute-level credentials, from vit.edu/rankings-and-recognitions. */
export const credentials = [
  { value: "A++", label: "NAAC grade", detail: "Third consecutive cycle · CGPA 3.65 on 4" },
  { value: "Top 150", label: "NIRF", detail: "Among the top 150 institutions in India" },
  { value: "11–50", label: "NIRF Innovation", detail: "Innovation band, 2023" },
  { value: "NBA", label: "Accreditation", detail: "All eligible programmes accredited, New Delhi" },
  { value: "Autonomous", label: "Status", detail: "Affiliated to Savitribai Phule Pune University" },
  { value: "ISO 21001", label: "Certification", detail: "Educational organisations management system, 2018 standard" },
  { value: "2(f) · 12(B)", label: "UGC recognition", detail: "Recognised under the UGC Act, 1956" },
  { value: "Platinum", label: "CII", detail: "Industry–academia collaboration category" },
] as const;
