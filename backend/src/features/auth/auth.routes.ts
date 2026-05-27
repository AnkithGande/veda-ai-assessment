import { Router } from "express";
import { registerHandler, loginHandler, meHandler } from "./auth.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", ...registerHandler);

// POST /api/auth/login
router.post("/login", ...loginHandler);

// GET /api/auth/me
router.get("/me", meHandler);

export default router;
