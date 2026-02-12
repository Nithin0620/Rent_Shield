import { Router } from "express";
import { z } from "zod";
import {
  aiReviewHandler,
  adminResolveHandler,
  createDisputeHandler,
  getDisputeHandler
} from "../controllers/disputeController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validateBody, validateParams } from "../middleware/validate";
import { aiReviewRateLimiter, disputeRateLimiter } from "../middleware/rateLimit";

const router = Router();

const agreementParamSchema = z.object({
  agreementId: z.string().min(1, "Agreement id is required")
});

const disputeIdSchema = z.object({
  id: z.string().min(1, "Dispute id is required")
});

const createSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters")
});

const adminResolveSchema = z.object({
  finalDecisionPercentage: z.number().min(0).max(100)
});

router.post(
  "/:agreementId/create",
  protect,
  restrictTo("tenant", "landlord"),
  disputeRateLimiter,
  validateParams(agreementParamSchema),
  validateBody(createSchema),
  createDisputeHandler
);

router.get(
  "/:agreementId",
  protect,
  validateParams(agreementParamSchema),
  getDisputeHandler
);

router.post(
  "/:id/ai-review",
  protect,
  restrictTo("admin"),
  aiReviewRateLimiter,
  validateParams(disputeIdSchema),
  aiReviewHandler
);

router.post(
  "/:id/admin-resolve",
  protect,
  restrictTo("admin"),
  validateParams(disputeIdSchema),
  validateBody(adminResolveSchema),
  adminResolveHandler
);

export default router;
