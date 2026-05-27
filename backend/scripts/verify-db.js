require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verify() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to Neon");

    const assignmentCount = await prisma.assignment.count();
    console.log(`✅ assignments table reachable — ${assignmentCount} rows`);

    const paperCount = await prisma.generatedPaper.count();
    console.log(`✅ generated_papers table reachable — ${paperCount} rows`);

    console.log("\n🎉 Database fully initialized and Prisma client working.");
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
