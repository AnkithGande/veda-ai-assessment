import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import { validate } from "@/middleware/validate";
import { register, loginUser, getCurrentUser, verifyToken } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { AppError } from "@/middleware/errorHandler";

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const registerHandler = [
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await register(req.body);
    sendSuccess(res, result, 201, "Account created successfully");
  }),
];

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const loginHandler = [
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await loginUser(req.body);
    sendSuccess(res, result, 200, "Logged in successfully");
  }),
];

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "No token provided");
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  const user = await getCurrentUser(payload.sub);
  sendSuccess(res, user);
});
