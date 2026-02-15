import { Router } from "express";
import { z } from "zod";
import {
  approveAgreementHandler,
  rejectAgreementHandler,
  getChecklistHandler,
  updateChecklistHandler,
  confirmReleaseHandler,
  createAgreementHandler,
  myAgreementsHandler,
  payDepositHandler,
  requestReleaseHandler
} from "../controllers/agreementController";
import { agreementEvidenceHandler } from "../controllers/evidenceController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validateBody, validateParams } from "../middleware/validate";

const router = Router();

const agreementCreateSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required")
});

const idParamSchema = z.object({
  id: z.string().min(1, "Agreement id is required")
});

router.post(
  "/create",
  protect,
  restrictTo("tenant"),
  validateBody(agreementCreateSchema),
  createAgreementHandler
);

router.patch(
  "/:id/approve",
  protect,
  restrictTo("landlord"),
  validateParams(idParamSchema),
  approveAgreementHandler
);

router.post(
  "/:id/pay-deposit",
  protect,
  restrictTo("tenant"),
  validateParams(idParamSchema),
  payDepositHandler
);

router.post(
  "/:id/request-release",
  protect,
  restrictTo("tenant", "landlord"),
  validateParams(idParamSchema),
  requestReleaseHandler
);

router.post(
  "/:id/confirm-release",
  protect,
  restrictTo("tenant", "landlord"),
  validateParams(idParamSchema),
  confirmReleaseHandler
);

router.patch(
  "/:id/reject",
  protect,
  restrictTo("landlord"),
  validateParams(idParamSchema),
  validateBody(z.object({ reason: z.string().optional() })),
  rejectAgreementHandler
);

router.get("/my-agreements", protect, restrictTo("tenant", "landlord"), myAgreementsHandler);

router.get(
  "/:id/evidence",
  protect,
  restrictTo("tenant", "landlord"),
  validateParams(idParamSchema),
  agreementEvidenceHandler
);

router.get(
  "/:agreementId/checklist",
  protect,
  restrictTo("tenant", "landlord"),
  validateParams(z.object({ agreementId: z.string() })),
  getChecklistHandler
);

router.patch(
  "/:agreementId/checklist",
  protect,
  restrictTo("tenant", "landlord"),
  validateParams(z.object({ agreementId: z.string() })),
  updateChecklistHandler
);

export default router;
