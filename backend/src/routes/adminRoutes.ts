import { Router } from "express";
import { z } from "zod";
import {
  adminDashboardStatsHandler,
  adminAllAgreementsHandler,
  adminAllDisputesHandler,
  adminTriggerAiReviewHandler,
  adminResolveDisputeHandler,
  adminTopTrustedUsersHandler
} from "../controllers/adminController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validateBody, validateParams } from "../middleware/validate";

const router = Router();

// Protect all admin routes
router.use(protect, restrictTo("admin"));

router.get("/stats", adminDashboardStatsHandler);

router.get("/agreements", adminAllAgreementsHandler);

router.get("/disputes", adminAllDisputesHandler);

router.post(
  "/disputes/:disputeId/ai-review",
  validateParams(z.object({ disputeId: z.string() })),
  adminTriggerAiReviewHandler
);

router.patch(
  "/disputes/:disputeId/resolve",
  validateParams(z.object({ disputeId: z.string() })),
  validateBody(z.object({ finalDecisionPercentage: z.number().min(0).max(100) })),
  adminResolveDisputeHandler
);

router.get("/trusted-users", adminTopTrustedUsersHandler);

export default router;
