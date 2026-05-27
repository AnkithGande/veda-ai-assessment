require("dotenv").config();
const { Client } = require("pg");

const sql = `
CREATE TABLE IF NOT EXISTS "users" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
`;

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log("✅ Connected to Neon");
    await client.query(sql);
    console.log("✅ users table created");
    const r = await client.query("SELECT COUNT(*) FROM users");
    console.log("✅ users table reachable — rows:", r.rows[0].count);
  } catch (e) {
    console.error("❌ Migration failed:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
