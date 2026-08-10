import type { Course } from "../types";

const course: Course = {
  slug: "software-testing",
  name: "Software Testing",
  track: "engineering-qa",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "Manual testing done properly — test design, defect reporting, and the judgement about what is worth testing at all.",
  duration: "{{SOFTWARE_TESTING_DURATION}}",
  batchTimings: "{{SOFTWARE_TESTING_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "Automation gets the attention, but the thinking underneath it is manual testing: deciding what could go wrong, designing cases that would catch it, and writing a defect report clear enough that a developer can reproduce the problem without asking you anything.",
    "This course covers the discipline rather than a tool. Test design techniques, the testing types and levels, the documents a QA role actually produces, and defect lifecycle management in a tracker.",
    "It is the natural first course before automation, and it is taken on its own by people moving into QA from a non-technical background.",
  ],
  whoFor: [
    "Graduates from any stream entering software quality assurance",
    "Career switchers looking for a route into IT that does not begin with programming",
    "Business and domain specialists moving into a QA or user acceptance testing role",
    "Anyone planning to take automation testing afterwards",
  ],
  curriculum: [
    {
      title: "Fundamentals",
      topics: [
        "What testing is for, and what it cannot prove",
        "Software development lifecycle models and where testing sits in each",
        "Verification against validation",
        "Testing levels: unit, integration, system, user acceptance",
        "Testing types: functional, regression, smoke, sanity, retesting",
      ],
    },
    {
      title: "Test design techniques",
      topics: [
        "Equivalence partitioning and boundary value analysis",
        "Decision tables and state transition testing",
        "Use case testing and error guessing",
        "Exploratory testing and charter-based sessions",
        "Deciding coverage: what is worth testing and what is not",
      ],
    },
    {
      title: "Documentation and process",
      topics: [
        "Reading a requirement and finding what is ambiguous in it",
        "Test plans, test scenarios and test cases",
        "Requirement traceability matrix",
        "Test data preparation",
        "Entry and exit criteria, and test closure reports",
      ],
    },
    {
      title: "Defects and tools",
      topics: [
        "Writing a defect report that can be reproduced from the text alone",
        "Severity against priority, and negotiating both",
        "Defect lifecycle and triage",
        "Working in JIRA: issues, workflows, boards and reports",
        "Agile testing: the sprint, the stand-up and the tester's role in refinement",
        "An introduction to API and database testing for manual testers",
      ],
    },
  ],
  liveProject: {
    title: "Test a real application from requirements through to a closure report",
    description:
      "You are given an application and a set of imperfect requirements. You identify the ambiguities and ask about them, design a test suite with the techniques covered, execute it, log real defects in a tracker, retest the fixes, and produce a closure report that says honestly what was and was not covered.",
    artefacts: [
      "A test plan and a full set of test cases",
      "A requirement traceability matrix",
      "Logged defects with reproduction steps and evidence",
      "A test closure report including known gaps",
    ],
  },
  prerequisites: [
    "No programming background required.",
    "No prior IT experience assumed — this is one of the genuine entry points into the industry.",
    "Careful reading and clear written English matter more here than technical skill.",
  ],
  roles: [
    "Manual test engineer",
    "QA analyst",
    "User acceptance testing analyst",
    "Quality assurance associate",
  ],
  codes: ["JIRA", "Test cases", "RTM", "Defect lifecycle"],
  related: ["automation-testing", "java", "data-science"],
  metaDescription:
    "Software testing course in Pune — manual testing, test design techniques, documentation, defect management and JIRA, with a live project. Classroom or online.",
};

export default course;
