import type { Course } from "../types";

const course: Course = {
  slug: "automation-testing",
  name: "Automation Testing",
  track: "engineering-qa",
  level: "intermediate",
  modes: ["online", "classroom"],
  summary:
    "Selenium with Java, TestNG, the Page Object Model, API testing and a framework you build yourself rather than inherit.",
  duration: "{{AUTOMATION_TESTING_DURATION}}",
  batchTimings: "{{AUTOMATION_TESTING_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "Anyone can record a script that passes once. The job is building a suite that still passes in six months, on a different machine, against a changed application, and tells you something useful when it fails. That is a design problem more than a coding problem, and this course treats it as one.",
    "You write Java first, because a Selenium framework is a Java project and people who skip the language write brittle tests. Then WebDriver properly — locator strategy, the waiting model, and why implicit and explicit waits should not be mixed. Then TestNG, then the Page Object Model, then a hybrid framework you assemble yourself.",
    "The last third is what makes someone employable now rather than five years ago: API testing with Rest Assured, running in a pipeline with Maven and Jenkins, behaviour-driven tests with Cucumber, and reporting that a manager will actually read.",
  ],
  whoFor: [
    "Manual testers moving into automation",
    "Computer science and engineering graduates targeting a QA engineering role",
    "Developers who want to own the test layer of what they build",
    "Support engineers moving towards quality engineering",
  ],
  curriculum: [
    {
      title: "Java for test automation",
      topics: [
        "Types, operators, control flow and arrays",
        "Object-oriented programming: classes, inheritance, interfaces, abstraction, polymorphism",
        "Collections — List, Set, Map — and which one a test framework needs",
        "Exception handling and custom exceptions",
        "File input and output, and reading properties files",
        "Streams and lambdas at the level test code actually uses them",
      ],
    },
    {
      title: "Selenium WebDriver",
      topics: [
        "WebDriver architecture and browser drivers",
        "Locator strategy: id, name, CSS selectors and XPath — absolute, relative and axes",
        "Writing locators that survive a UI change",
        "The waiting model — implicit, explicit and fluent waits, and why mixing them misbehaves",
        "Handling dropdowns, alerts, frames, multiple windows and shadow DOM",
        "Actions class: mouse hover, drag and drop, keyboard interaction",
        "Screenshots, JavaScript executor and scrolling",
      ],
    },
    {
      title: "TestNG",
      topics: [
        "Annotations and the execution lifecycle",
        "Assertions — hard and soft, and where each belongs",
        "Groups, priorities and dependencies",
        "Data providers and parameterisation",
        "testng.xml, suites and parallel execution",
        "Listeners, retry analysers and handling genuinely flaky tests",
      ],
    },
    {
      title: "Framework design",
      topics: [
        "Page Object Model and Page Factory",
        "Separating test data, configuration and test logic",
        "Reusable utilities and a base test class",
        "Data-driven testing with Apache POI and Excel",
        "Hybrid framework assembly — putting the pieces together into something maintainable",
        "Logging with Log4j and building a failure report someone can act on",
      ],
    },
    {
      title: "API testing",
      topics: [
        "HTTP methods, status codes, headers and authentication",
        "Postman: requests, collections, environments and assertions",
        "Rest Assured — given/when/then, path and query parameters",
        "JSON and XML response validation, and JSON schema validation",
        "Chaining requests and combining API setup with UI tests",
      ],
    },
    {
      title: "Build, version control and continuous integration",
      topics: [
        "Maven: project structure, the POM, dependencies and the build lifecycle",
        "Git and GitHub: branching, merging, pull requests and resolving conflicts",
        "Jenkins: jobs, parameterised builds, scheduling and publishing reports",
        "Running a suite in a pipeline and dealing with failures that only happen there",
        "Selenium Grid and cross-browser execution",
      ],
    },
    {
      title: "Behaviour-driven development and reporting",
      topics: [
        "Cucumber: feature files, Gherkin syntax, step definitions",
        "Hooks, tags, backgrounds and scenario outlines",
        "The runner class and integrating Cucumber with the framework",
        "Extent Reports and Allure — building a report that shows what failed and why",
        "An overview of mobile automation with Appium",
      ],
    },
  ],
  liveProject: {
    title: "Build an automation framework from an empty repository",
    description:
      "You start with nothing and build a hybrid framework against a real web application: page objects, configuration, data-driven tests from a spreadsheet, an API layer that sets up test data before the UI tests run, logging and reporting. It goes into Git, builds with Maven, and runs in Jenkins on a schedule. Then the application changes underneath you and you find out how well you designed it — which is the actual lesson.",
    artefacts: [
      "A complete framework repository with a readable commit history",
      "Test suites covering both UI and API layers, running in parallel",
      "A Jenkins job that executes the suite and publishes a report",
      "A written note on what broke when the application changed, and what you would design differently",
    ],
  },
  prerequisites: [
    "Some programming exposure helps, though Java is taught from the beginning here. If you have never written code, expect the first weeks to be demanding.",
    "Manual testing experience is useful context — knowing what is worth automating is half the skill — but is not required.",
    "A laptop able to run a JDK, an IDE and a browser.",
    "If you already know Java, say so when you enquire and the language section can be shortened.",
  ],
  roles: [
    "Automation test engineer",
    "QA engineer",
    "SDET",
    "Quality engineering analyst",
  ],
  codes: ["Selenium", "TestNG", "Maven", "Rest Assured", "Cucumber", "Jenkins"],
  related: ["software-testing", "java", "data-science"],
  metaDescription:
    "Automation testing course in Pune — Selenium with Java, TestNG, Page Object Model, Rest Assured API testing, Maven, Jenkins and Cucumber, with a live project.",
};

export default course;
