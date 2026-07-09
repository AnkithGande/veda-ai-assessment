import multer from "multer";
import path from "path";
import { AppError } from "../middleware/errorHandler";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          400,
          `Invalid file type: ${path.extname(file.originalname)}. Only PDF and DOCX are allowed.`
        )
      );
    }
  },
});
