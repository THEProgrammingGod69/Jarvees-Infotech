import type { Course } from "../types";

const course: Course = {
  slug: "cpp",
  name: "C++",
  track: "engineering-qa",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "C++ from the fundamentals through object-oriented design, the standard library, and the memory model that makes the language what it is.",
  duration: "{{CPP_DURATION}}",
  batchTimings: "{{CPP_BATCH_TIMINGS}}",
  depth: "outline",
  overview: [
    "C++ is where you learn what a program is actually doing. Memory is yours to manage, the cost of an abstraction is visible, and the habits you build transfer to every other language you will use afterwards.",
    "It remains the language of embedded systems, systems programming, graphics, finance and competitive programming, and it is the language most engineering syllabuses and placement tests are built around.",
    "The course covers the language and the standard library, with real attention to pointers, references and object lifetime — the parts that are genuinely difficult and are usually rushed.",
  ],
  whoFor: [
    "Engineering and computer science students preparing for placements",
    "Learners heading for embedded, systems or performance-critical work",
    "Programmers who want a proper foundation before or alongside a higher-level language",
    "Anyone strengthening data structures and algorithms for interviews",
  ],
  curriculum: [
    {
      title: "Language fundamentals",
      topics: [
        "Types, operators, control flow and functions",
        "Compilation, linking and the build process",
        "Arrays, strings and the C++ string type",
        "References, const correctness and scope",
        "Header files, translation units and the preprocessor",
      ],
    },
    {
      title: "Memory and pointers",
      topics: [
        "Stack against heap, and object lifetime",
        "Pointers, pointer arithmetic and pointers to functions",
        "Dynamic allocation, and the leaks that follow from getting it wrong",
        "Smart pointers and RAII",
        "Copy semantics, the rule of three, and an introduction to move semantics",
      ],
    },
    {
      title: "Object-oriented C++",
      topics: [
        "Classes, constructors, destructors and initialiser lists",
        "Encapsulation, inheritance and access specifiers",
        "Virtual functions, polymorphism and the virtual table",
        "Operator overloading",
        "Abstract classes and interface design",
        "Templates: function templates, class templates and generic design",
        "Exception handling",
      ],
    },
    {
      title: "Standard library and applied work",
      topics: [
        "Containers: vector, list, map, set, unordered containers",
        "Iterators and the standard algorithms",
        "File input and output with streams",
        "Data structures and algorithms implemented from scratch: linked lists, stacks, queues, trees, sorting and searching",
        "Complexity analysis and choosing the right structure",
        "Debugging with a debugger rather than with print statements",
      ],
    },
  ],
  liveProject: {
    title: "Build a non-trivial C++ program with your own data structures",
    description:
      "You build a complete program — a small system with real state, file persistence and a menu-driven or command-line interface — implementing the core data structures yourself rather than reaching for the standard library, then rewriting parts with the standard library and comparing the two. Memory correctness is checked, not assumed.",
    artefacts: [
      "A compiling, documented C++ project in a Git repository",
      "Data structures implemented from first principles, with complexity notes",
      "A comparison of your implementation against the standard library equivalent",
      "Evidence of memory-correctness checking",
    ],
  },
  prerequisites: [
    "No prior programming is required, though C++ is a demanding first language and we will say so honestly.",
    "School-level mathematics and logical reasoning.",
    "A laptop able to run a compiler and an editor or IDE.",
  ],
  roles: [
    "C++ developer",
    "Embedded software engineer",
    "Systems programmer",
    "Graduate engineer preparing for placement tests",
  ],
  codes: ["C++17", "STL", "GDB", "CMake"],
  related: ["java", "dotnet", "data-science"],
  metaDescription:
    "C++ course in Pune — language fundamentals, pointers and memory, object-oriented design, templates and the STL, with a live project. Classroom or online.",
};

export default course;
