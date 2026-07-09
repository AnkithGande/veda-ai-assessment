import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { upload } from "../../config/multer";
import { paginationQuerySchema } from "./assignments.schema";
import { create, list, getById, remove, generate } from "./assignments.controller";

const router = Router();

// ─── Multer error handler ─────────────────────────────────────────────────────
// MulterError is not a standard Error — it bypasses asyncHandler and must be
// caught with a dedicated 4-parameter Express error middleware on the route.

function multerErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        error: "File size exceeds the maximum limit of 25 MB.",
      });
      return;
    }
    // Other multer errors (unexpected field, too many files, etc.)
    res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
    return;
  }
  // Not a multer error — pass to the global error handler
  next(err);
}

// POST /api/assignments  — multipart/form-data (file optional, max 25 MB)
router.post("/", upload.single("sourceFile"), multerErrorHandler, asyncHandler(create));

// GET /api/assignments?page=1&pageSize=10
router.get("/", validate(paginationQuerySchema, "query"), asyncHandler(list));

// GET /api/assignments/:id
router.get("/:id", asyncHandler(getById));

// DELETE /api/assignments/:id
router.delete("/:id", asyncHandler(remove));

// POST /api/assignments/:id/generate
router.post("/:id/generate", asyncHandler(generate));

export default router;
