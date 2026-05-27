require("dotenv").config();
const { Client } = require("pg");

const sql = `
-- Create enum
DO $$ BEGIN
  CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create assignments table
CREATE TABLE IF NOT EXISTS "assignments" (
  "id"             TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "dueDate"        TIMESTAMP(3) NOT NULL,
  "instructions"   TEXT NOT NULL,
  "sourceFileUrl"  TEXT,
  "status"         "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
  "totalQuestions" INTEGER NOT NULL,
  "totalMarks"     INTEGER NOT NULL,
  "questionConfig" JSONB NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- Create generated_papers table
CREATE TABLE IF NOT EXISTS "generated_papers" (
  "id"           TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "content"      JSONB NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "generated_papers_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on assignmentId (enforces one-to-one)
DO $$ BEGIN
  ALTER TABLE "generated_papers"
    ADD CONSTRAINT "generated_papers_assignmentId_key" UNIQUE ("assignmentId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Foreign key with cascade delete
DO $$ BEGIN
  ALTER TABLE "generated_papers"
    ADD CONSTRAINT "generated_papers_assignmentId_fkey"
    FOREIGN KEY ("assignmentId")
    REFERENCES "assignments"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`;

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to Neon");

    await client.query(sql);
    console.log("✅ Migration applied — tables created successfully");

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('assignments', 'generated_papers')
      ORDER BY table_name;
    `);

    console.log("✅ Verified tables:", result.rows.map((r) => r.table_name).join(", "));
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
