-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "instructions" TEXT NOT NULL,
    "sourceFileUrl" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "totalQuestions" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "questionConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_papers" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_papers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generated_papers_assignmentId_key" ON "generated_papers"("assignmentId");

-- AddForeignKey
ALTER TABLE "generated_papers" ADD CONSTRAINT "generated_papers_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
