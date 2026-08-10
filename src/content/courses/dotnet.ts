import type { Course } from "../types";

const course: Course = {
  slug: "dotnet",
  name: ".NET",
  track: "engineering-qa",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "C# and the .NET platform — language fundamentals, object-oriented design, data access with Entity Framework, and building a web API.",
  duration: "{{DOTNET_DURATION}}",
  batchTimings: "{{DOTNET_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "C# on modern .NET is one of the most productive back-end stacks available, and it is heavily used in enterprise development — which is the same market SAP sits in.",
    "The course teaches C# as a language first, then the platform: how a .NET application is structured, how it reaches a database through Entity Framework, and how a web API is built and consumed.",
    "You finish with an application you designed and built, in a repository, rather than a folder of exercises.",
  ],
  whoFor: [
    "Graduates aiming at a .NET or C# developer role",
    "Developers in another language adding the Microsoft stack",
    "Students preparing for placements at companies with a .NET back end",
    "Testers who need C# for a Microsoft-stack automation framework",
  ],
  curriculum: [
    {
      title: "C# fundamentals",
      topics: [
        "Types, value against reference semantics, operators and control flow",
        "Methods, parameters, optional and named arguments",
        "Arrays, strings and the null handling features of modern C#",
        "The common language runtime and how a .NET program runs",
      ],
    },
    {
      title: "Object-oriented and functional C#",
      topics: [
        "Classes, structs, records and when each is right",
        "Inheritance, interfaces, abstract classes and polymorphism",
        "Properties, indexers and encapsulation",
        "Exception handling and custom exceptions",
        "Generics, collections and LINQ",
        "Delegates, events and lambda expressions",
        "async and await, and what asynchronous actually means here",
      ],
    },
    {
      title: "Data access",
      topics: [
        "Relational database fundamentals and SQL Server basics",
        "ADO.NET connections, commands and readers",
        "Entity Framework Core: models, migrations and the DbContext",
        "Querying with LINQ to Entities, and the queries it generates",
        "Transactions and concurrency",
      ],
    },
    {
      title: "Building applications",
      topics: [
        "ASP.NET Core project structure and the request pipeline",
        "Building a REST API: controllers, routing, model binding and validation",
        "Dependency injection and configuration",
        "An introduction to Razor Pages or MVC for the web layer",
        "Unit testing with xUnit",
        "Git, NuGet and publishing a build",
      ],
    },
  ],
  liveProject: {
    title: "Design and build a .NET web API with a database behind it",
    description:
      "You build a working service from a requirements brief: the domain model, the database through Entity Framework migrations, a REST API with validation and error handling, dependency injection throughout, and tests. It is version controlled and code reviewed.",
    artefacts: [
      "A Git repository with a readable commit history",
      "A working REST API with its endpoint documentation",
      "Entity Framework migrations and the resulting schema",
      "Unit tests and the review notes you responded to",
    ],
  },
  prerequisites: [
    "No prior programming required; C# is taught from the beginning.",
    "Willingness to write code between sessions is essential.",
    "A Windows, macOS or Linux machine able to run the .NET SDK and an editor.",
  ],
  roles: [
    ".NET developer",
    "C# backend developer",
    "Full-stack developer, Microsoft stack",
    "Application support engineer",
  ],
  codes: ["C#", ".NET", "Entity Framework", "ASP.NET Core", "xUnit"],
  related: ["java", "automation-testing", "software-testing"],
  metaDescription:
    ".NET and C# course in Pune — language fundamentals, LINQ, Entity Framework Core and ASP.NET Core web APIs, with a live project. Classroom at two centres or online.",
};

export default course;
