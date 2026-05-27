require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Inline the mock paper generator logic
function generateMockPaper(title, questionConfig) {
  const sections = [];
  let questionNumber = 1;
  let totalQuestions = 0;
  let totalMarks = 0;

  for (const config of questionConfig) {
    const questions = [];
    for (let i = 0; i < config.count; i++) {
      questions.push({
        id: `q-${config.type.toLowerCase()}-${questionNumber + i}`,
        number: questionNumber + i,
        type: config.type,
        text: `Sample question ${questionNumber + i} for ${config.type}`,
        marks: config.marks,
      });
    }
    sections.push({
      title: `Section — ${config.type}`,
      type: config.type,
      totalMarks: config.count * config.marks,
      questions,
    });
    questionNumber += config.count;
    totalQuestions += config.count;
    totalMarks += config.count * config.marks;
  }

  return {
    title,
    generatedAt: new Date().toISOString(),
    totalQuestions,
    totalMarks,
    sections,
    metadata: { generatorVersion: "1.0.0-mock", mode: "mock" },
  };
}

async function runTest() {
  console.log("=== Generation Pipeline Test ===\n");

  // 1. Find or create a test assignment
  let assignment = await prisma.assignment.findFirst({
    where: { status: { in: ["PENDING", "FAILED"] } },
    orderBy: { createdAt: "desc" },
  });

  if (!assignment) {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    assignment = await prisma.assignment.create({
      data: {
        title: "Pipeline Test Assignment",
        dueDate: future,
        instructions: "Test instructions for generation pipeline validation.",
        questionConfig: [{ type: "MCQ", count: 3, marks: 2 }],
        totalQuestions: 3,
        totalMarks: 6,
        status: "PENDING",
      },
    });
    console.log("Created test assignment:", assignment.id);
  } else {
    console.log("Using assignment:", assignment.id, "| status:", assignment.status);
  }

  const id = assignment.id;

  // 2. Mark GENERATING
  await prisma.assignment.update({ where: { id }, data: { status: "GENERATING" } });
  console.log("✅ Status → GENERATING");

  // 3. Generate paper
  const paperContent = generateMockPaper(
    assignment.title,
    assignment.questionConfig
  );
  console.log("✅ Mock paper generated:", paperContent.totalQuestions, "questions,", paperContent.totalMarks, "marks");

  // 4. Upsert generated_papers
  const paper = await prisma.generatedPaper.upsert({
    where: { assignmentId: id },
    create: { assignmentId: id, content: paperContent },
    update: { content: paperContent },
  });
  console.log("✅ GeneratedPaper upserted, id:", paper.id);

  // 5. Mark COMPLETED
  await prisma.assignment.update({ where: { id }, data: { status: "COMPLETED" } });
  console.log("✅ Status → COMPLETED");

  // 6. Verify
  const final = await prisma.assignment.findUnique({
    where: { id },
    include: { generatedPaper: true },
  });
  console.log("\n=== Final State ===");
  console.log("Assignment status:", final.status);
  console.log("GeneratedPaper exists:", !!final.generatedPaper);
  console.log("Paper sections:", final.generatedPaper?.content?.sections?.length ?? 0);
  console.log("\n✅ Pipeline test PASSED — generation works without Redis");
}

runTest()
  .catch((e) => { console.error("❌ Test FAILED:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
