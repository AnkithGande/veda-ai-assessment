import type { Request, Response, NextFunction } from "express";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Global Error Handler ─────────────────────────────────────────────────────

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Unexpected errors — don't leak details in production
  logger.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: env.isDev ? err.message : "Internal server error",
    ...(env.isDev && { stack: err.stack }),
  });
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
