import { Router } from "express";
import { z } from "zod";
import { getAgreementDetailHandler } from "../controllers/agreementController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validateParams } from "../middleware/validate";

const router = Router();

const agreementParamSchema = z.object({
  agreementId: z.string().min(1, "Agreement id is required")
});

router.get(
  "/:agreementId",
  protect,
  restrictTo("tenant", "landlord", "admin"),
  validateParams(agreementParamSchema),
  getAgreementDetailHandler
);

export default router;
