import type { Course } from "../types";

const course: Course = {
  slug: "java",
  name: "Java",
  track: "engineering-qa",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "Core and advanced Java — the language, object-oriented design, collections, and building an application that talks to a database.",
  duration: "{{JAVA_DURATION}}",
  batchTimings: "{{JAVA_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "Java remains the default language of enterprise back ends in India, and it is the language most automation frameworks are written in. Learning it well opens both doors.",
    "The course covers core Java properly before moving on — object-oriented design, collections, exceptions, generics — because the advanced material only makes sense on a solid base.",
    "It then goes as far as database access and the web layer, so you finish with an application you built rather than a set of exercises.",
  ],
  whoFor: [
    "Graduates aiming at a Java developer role",
    "Testers who need Java for Selenium and want it taught as a language rather than as snippets",
    "Developers in another language adding Java",
    "Students preparing for campus placements with a programming round",
  ],
  curriculum: [
    {
      title: "Core language",
      topics: [
        "Data types, operators, control flow and arrays",
        "Methods, parameters and scope",
        "Strings, StringBuilder and formatting",
        "The JVM, compilation and how a Java program actually runs",
      ],
    },
    {
      title: "Object-oriented programming",
      topics: [
        "Classes, objects, constructors and the this reference",
        "Inheritance, method overriding and the object class",
        "Abstraction, interfaces and default methods",
        "Encapsulation, access modifiers and package structure",
        "Polymorphism in practice, and composition against inheritance",
      ],
    },
    {
      title: "Collections, exceptions and generics",
      topics: [
        "List, Set, Map and Queue, with the implementation trade-offs",
        "Iterators, comparators and sorting",
        "Checked and unchecked exceptions, try-with-resources",
        "Generics and type safety",
        "Streams, lambdas and the functional interfaces",
      ],
    },
    {
      title: "Applied Java",
      topics: [
        "File input and output, and serialisation",
        "Multithreading fundamentals and synchronisation",
        "JDBC: connections, statements, result sets and transactions",
        "An introduction to Servlets and JSP, and the request lifecycle",
        "An introduction to Spring and Spring Boot",
        "Maven, Git and project structure",
      ],
    },
  ],
  liveProject: {
    title: "Build a database-backed Java application end to end",
    description:
      "You design and build a working application with a real schema behind it — entities, relationships, a data access layer, business logic and a simple interface. It is version controlled, built with Maven, and reviewed the way code is reviewed on a team, which for most learners is the most useful part.",
    artefacts: [
      "A Git repository with a readable commit history",
      "A working application with a documented database schema",
      "Unit tests covering the business logic",
      "Review notes and the changes you made in response",
    ],
  },
  prerequisites: [
    "No prior programming is required; the language is taught from the beginning.",
    "You must be prepared to write code between sessions — programming is not learned by watching.",
    "A laptop able to run a JDK and an IDE.",
  ],
  roles: [
    "Java developer",
    "Backend developer",
    "Automation test engineer, with Selenium",
    "Application support engineer",
  ],
  codes: ["JDK", "Collections", "JDBC", "Maven", "Spring Boot"],
  related: ["automation-testing", "software-testing", "data-science"],
  metaDescription:
    "Java course in Pune — core and advanced Java, object-oriented design, collections, JDBC and an introduction to Spring, with a live project. Classroom or online.",
};

export default course;
