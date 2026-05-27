import type { QuestionConfigItem } from "./assignments.types";

// ─── Generated paper content shape ───────────────────────────────────────────

export interface GeneratedQuestion {
  id: string;
  number: number;
  type: string;
  text: string;
  marks: number;
  options?: string[];          // MCQ only
  answer?: string;             // model answer
}

export interface GeneratedSection {
  title: string;
  type: string;
  totalMarks: number;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaperContent {
  title: string;
  generatedAt: string;
  totalQuestions: number;
  totalMarks: number;
  sections: GeneratedSection[];
  metadata: {
    generatorVersion: string;
    mode: "mock";
  };
}

// ─── Question banks per type ──────────────────────────────────────────────────

const MCQ_TEMPLATES = [
  {
    text: "Which of the following best describes the primary purpose of the topic discussed?",
    options: ["Option A — Foundational concept", "Option B — Applied method", "Option C — Theoretical framework", "Option D — Practical outcome"],
    answer: "Option A — Foundational concept",
  },
  {
    text: "What is the correct relationship between the key variables in this subject area?",
    options: ["They are directly proportional", "They are inversely proportional", "They are independent", "They are logarithmically related"],
    answer: "They are directly proportional",
  },
  {
    text: "Which statement is TRUE regarding the core principle of this topic?",
    options: ["It applies only in controlled environments", "It is universally applicable", "It requires external validation", "It is context-dependent"],
    answer: "It is universally applicable",
  },
  {
    text: "A student applies the main concept incorrectly. What is the most likely error?",
    options: ["Misidentifying the input variables", "Ignoring boundary conditions", "Applying the wrong formula", "All of the above"],
    answer: "All of the above",
  },
  {
    text: "Which example best illustrates the concept covered in this section?",
    options: ["Example involving direct application", "Example involving indirect inference", "Example involving historical context", "Example involving future prediction"],
    answer: "Example involving direct application",
  },
];

const SHORT_ANSWER_TEMPLATES = [
  "Define the key term introduced in this topic and provide one real-world example.",
  "Explain the significance of the main concept in two to three sentences.",
  "What are the two most important factors that influence the outcome in this context?",
  "Describe the relationship between the primary and secondary elements discussed.",
  "State the main principle and explain when it does not apply.",
];

const LONG_ANSWER_TEMPLATES = [
  "Critically analyse the main concept covered in this topic. Your answer should include a definition, key characteristics, real-world applications, and any limitations. Support your answer with relevant examples.",
  "Compare and contrast the two major approaches discussed in this subject area. Discuss their advantages, disadvantages, and appropriate use cases. Conclude with a recommendation.",
  "Explain the step-by-step process involved in applying the core methodology of this topic. Include diagrams or structured points where appropriate, and discuss potential sources of error.",
  "Evaluate the impact of the primary concept on modern practice. Discuss historical development, current relevance, and future implications. Use evidence to support your arguments.",
];

const TRUE_FALSE_TEMPLATES = [
  { text: "The primary concept discussed always produces consistent results under standard conditions.", answer: "True" },
  { text: "The secondary variable has no measurable effect on the primary outcome.", answer: "False" },
  { text: "The methodology described can be applied without modification in all contexts.", answer: "False" },
  { text: "Understanding the foundational principle is essential before applying advanced techniques.", answer: "True" },
  { text: "The relationship between the key elements is always linear.", answer: "False" },
];

// ─── Generator ────────────────────────────────────────────────────────────────

function generateQuestionsForType(
  type: string,
  count: number,
  marks: number,
  startNumber: number
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const num = startNumber + i;
    const id = `q-${type.toLowerCase()}-${num}`;

    switch (type) {
      case "MCQ": {
        const tpl = MCQ_TEMPLATES[i % MCQ_TEMPLATES.length];
        questions.push({
          id,
          number: num,
          type,
          text: tpl.text,
          marks,
          options: tpl.options,
          answer: tpl.answer,
        });
        break;
      }
      case "SHORT_ANSWER": {
        questions.push({
          id,
          number: num,
          type,
          text: SHORT_ANSWER_TEMPLATES[i % SHORT_ANSWER_TEMPLATES.length],
          marks,
          answer: "Model answer: Provide a concise, accurate response covering the key points outlined in the marking scheme.",
        });
        break;
      }
      case "LONG_ANSWER": {
        questions.push({
          id,
          number: num,
          type,
          text: LONG_ANSWER_TEMPLATES[i % LONG_ANSWER_TEMPLATES.length],
          marks,
          answer: "Model answer: A comprehensive response should address all bullet points in the marking rubric with supporting evidence.",
        });
        break;
      }
      case "TRUE_FALSE": {
        const tpl = TRUE_FALSE_TEMPLATES[i % TRUE_FALSE_TEMPLATES.length];
        questions.push({
          id,
          number: num,
          type,
          text: tpl.text,
          marks,
          options: ["True", "False"],
          answer: tpl.answer,
        });
        break;
      }
      default: {
        questions.push({
          id,
          number: num,
          type,
          text: `Question ${num}: Answer the following based on your understanding of the topic.`,
          marks,
        });
      }
    }
  }

  return questions;
}

const SECTION_TITLES: Record<string, string> = {
  MCQ: "Section A — Multiple Choice Questions",
  SHORT_ANSWER: "Section B — Short Answer Questions",
  LONG_ANSWER: "Section C — Long Answer Questions",
  TRUE_FALSE: "Section D — True / False Questions",
};

/**
 * Generates a deterministic mock paper from the assignment config.
 * No external API calls — safe to use for pipeline validation.
 */
export function generateMockPaper(
  title: string,
  questionConfig: QuestionConfigItem[]
): GeneratedPaperContent {
  const sections: GeneratedSection[] = [];
  let questionNumber = 1;
  let totalQuestions = 0;
  let totalMarks = 0;

  for (const config of questionConfig) {
    const questions = generateQuestionsForType(
      config.type,
      config.count,
      config.marks,
      questionNumber
    );

    const sectionMarks = config.count * config.marks;

    sections.push({
      title: SECTION_TITLES[config.type] ?? `Section — ${config.type}`,
      type: config.type,
      totalMarks: sectionMarks,
      questions,
    });

    questionNumber += config.count;
    totalQuestions += config.count;
    totalMarks += sectionMarks;
  }

  return {
    title,
    generatedAt: new Date().toISOString(),
    totalQuestions,
    totalMarks,
    sections,
    metadata: {
      generatorVersion: "1.0.0-mock",
      mode: "mock",
    },
  };
}
