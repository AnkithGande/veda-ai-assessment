import { Router } from "express";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { upload } from "../../config/multer";
import { paginationQuerySchema } from "./assignments.schema";
import { create, list, getById, remove, generate } from "./assignments.controller";

const router = Router();

// POST /api/assignments
router.post("/", upload.single("sourceFile"), asyncHandler(create));

// GET /api/assignments?page=1&pageSize=10
router.get("/", validate(paginationQuerySchema, "query"), asyncHandler(list));

// GET /api/assignments/:id
router.get("/:id", asyncHandler(getById));

// DELETE /api/assignments/:id
router.delete("/:id", asyncHandler(remove));

// POST /api/assignments/:id/generate
router.post("/:id/generate", asyncHandler(generate));

export default router;
