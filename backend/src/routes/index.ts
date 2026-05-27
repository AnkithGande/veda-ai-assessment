import { Router } from "express";
import assignmentRoutes from "@/features/assignments/assignments.routes";
import authRoutes from "@/features/auth/auth.routes";

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Veda AI Assessment API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── Feature Routes ───────────────────────────────────────────────────────────

router.use("/auth", authRoutes);
router.use("/assignments", assignmentRoutes);

export default router;
