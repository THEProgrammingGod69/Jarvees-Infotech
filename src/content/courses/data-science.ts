import type { Course } from "../types";

const course: Course = {
  slug: "data-science",
  name: "Data Science",
  track: "data",
  level: "beginner",
  modes: ["online", "classroom"],
  summary:
    "Python, statistics, SQL and machine learning — cleaning real data, building models, and explaining what the model actually says.",
  duration: "{{DATA_SCIENCE_DURATION}}",
  batchTimings: "{{DATA_SCIENCE_BATCH_TIMINGS}}",
  depth: "full",
  overview: [
    "Most of data science is not modelling. It is finding the data, understanding what each column really means, discovering that a quarter of it is missing, and deciding what to do about that — and only then fitting something. The course is weighted accordingly.",
    "You work in Python throughout, with SQL alongside it because in a real job the data is in a database and someone will ask you to get it out yourself. Statistics is covered before machine learning rather than after, because a model you cannot evaluate is not useful.",
    "The modelling section covers the algorithms that are actually used on tabular business data — regression, trees, random forests, gradient boosting, clustering — and spends serious time on evaluation: what precision and recall mean when the classes are unbalanced, why a high accuracy figure can be worthless, and how overfitting shows up.",
  ],
  whoFor: [
    "Graduates in engineering, science, statistics, mathematics or commerce",
    "Working professionals in analytics, MIS or reporting roles who want to move beyond spreadsheets",
    "Software engineers moving towards data work",
    "Anyone comfortable with quantitative thinking who is prepared to write code",
  ],
  curriculum: [
    {
      title: "Python for data work",
      topics: [
        "Language fundamentals — types, control flow, functions, comprehensions",
        "Working with files, dates and text",
        "NumPy arrays and vectorised operations",
        "pandas: series, dataframes, indexing, joins, grouping and reshaping",
        "Virtual environments, Jupyter and version control with Git",
      ],
    },
    {
      title: "SQL",
      topics: [
        "Select, filter, order and aggregate",
        "Joins of every kind, and what an outer join does to your row count",
        "Subqueries, common table expressions and window functions",
        "Grouping sets, ranking and running totals",
        "Reading a schema you did not design",
      ],
    },
    {
      title: "Statistics and probability",
      topics: [
        "Descriptive statistics and distributions",
        "Probability, conditional probability and Bayes' theorem",
        "Sampling, the central limit theorem and confidence intervals",
        "Hypothesis testing — t-tests, chi-square, ANOVA — and what a p-value does not mean",
        "Correlation against causation, and confounding",
      ],
    },
    {
      title: "Exploratory analysis and data preparation",
      topics: [
        "Profiling a dataset you have never seen before",
        "Missing data: mechanisms, and the honest options for handling it",
        "Outlier detection and the decision of whether to remove one",
        "Encoding categorical variables, scaling and transformation",
        "Feature engineering, and leakage — the mistake that makes a model look brilliant and useless",
        "Visualisation with matplotlib and seaborn",
      ],
    },
    {
      title: "Supervised learning",
      topics: [
        "Linear and polynomial regression, residual analysis",
        "Logistic regression and interpreting coefficients",
        "Decision trees, and why a single tree overfits",
        "Random forests and gradient boosting, including XGBoost",
        "Regularisation: ridge, lasso and the bias-variance trade-off",
        "k-nearest neighbours, naive Bayes and support vector machines",
      ],
    },
    {
      title: "Evaluation and model selection",
      topics: [
        "Train, validation and test splits; cross-validation",
        "Accuracy, precision, recall, F1, and choosing between them for a real problem",
        "ROC and precision-recall curves, and threshold selection",
        "Confusion matrices on unbalanced classes",
        "Hyperparameter tuning with grid and randomised search",
        "Diagnosing overfitting and underfitting from learning curves",
      ],
    },
    {
      title: "Unsupervised learning and time series",
      topics: [
        "k-means, choosing k, and hierarchical clustering",
        "Principal component analysis and dimensionality reduction",
        "Association rules for basket analysis",
        "Time series components, stationarity and differencing",
        "Moving averages and an introduction to ARIMA",
      ],
    },
    {
      title: "Applied work and delivery",
      topics: [
        "Introduction to natural language processing — tokenisation, TF-IDF, sentiment",
        "Introduction to neural networks and where deep learning is and is not worth it",
        "Serving a model with Flask or Streamlit",
        "Building a dashboard in Power BI or Tableau",
        "Communicating a result to someone who will not read your code",
      ],
    },
  ],
  liveProject: {
    title: "Take a messy real-world dataset from raw file to defended recommendation",
    description:
      "You are given a dataset with the problems real data has — missing values, inconsistent categories, a leaked column that will tempt you, and a class imbalance. You profile it, clean it with your decisions documented, engineer features, build and tune several models, and select one on evidence rather than on the highest number. Then you present the result to a non-technical audience and defend the choice, including what the model gets wrong and what you would not use it for.",
    artefacts: [
      "A documented cleaning and feature engineering notebook",
      "A model comparison with cross-validated metrics and the selection reasoning",
      "A deployed prediction interface, or a dashboard reporting the result",
      "A short written summary aimed at a business reader, including the model's limitations",
    ],
  },
  prerequisites: [
    "Comfort with school-level mathematics — algebra and basic probability. The statistics is taught from the beginning.",
    "No prior programming is required, but you must be willing to write code every session; this is not a tools-only course.",
    "A laptop able to run Python. Setup is covered in the first sessions.",
    "If you already know Python, tell us when you enquire and the early sessions can be compressed.",
  ],
  roles: [
    "Data analyst",
    "Junior data scientist",
    "Business intelligence analyst",
    "Reporting and analytics specialist",
  ],
  codes: ["pandas", "scikit-learn", "SQL", "matplotlib", "XGBoost"],
  related: ["automation-testing", "salesforce", "java"],
  metaDescription:
    "Data Science course in Pune — Python, SQL, statistics and machine learning with model evaluation and a live project on real, messy data. Classroom or online.",
};

export default course;
