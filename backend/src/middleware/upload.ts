import multer from "multer";
import { AppError } from "../utils/AppError";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime"
]);

const maxSizeMb = Number(process.env.EVIDENCE_MAX_SIZE_MB || 20);
const maxSizeBytes = maxSizeMb * 1024 * 1024;

export const uploadEvidence = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new AppError("Invalid file type", 400));
    }
    cb(null, true);
  }
});
