import { Router } from "express";
import { z } from "zod";
import {
  agreementEvidenceHandler,
  uploadEvidenceHandler,
  verifyEvidenceHandler
} from "../controllers/evidenceController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { uploadRateLimiter } from "../middleware/rateLimit";
import { uploadEvidence } from "../middleware/upload";
import { validateBody, validateParams } from "../middleware/validate";

const router = Router();

const uploadSchema = z.object({
  agreementId: z.string().min(1, "Agreement is required"),
  type: z.enum(["move_in", "move_out", "damage_proof"])
});

const idSchema = z.object({
  id: z.string().min(1, "Evidence id is required")
});
const agreementIdSchema = z.object({
  id: z.string().min(1, "Agreement id is required")
});

router.post(
  "/upload",
  protect,
  restrictTo("tenant", "landlord"),
  uploadRateLimiter,
  uploadEvidence.single("file"),
  validateBody(uploadSchema),
  uploadEvidenceHandler
);

router.get(
  "/:id/verify",
  protect,
  restrictTo("tenant", "landlord", "admin"),
  validateParams(idSchema),
  verifyEvidenceHandler
);

router.get(
  "/agreement/:id",
  protect,
  restrictTo("tenant", "landlord", "admin"),
  validateParams(agreementIdSchema),
  agreementEvidenceHandler
);

export default router;
