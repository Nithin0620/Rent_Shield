import { Router } from "express";
import { z } from "zod";
import {
  approveAgreementHandler,
  getChecklistHandler,
  updateChecklistHandler,
  createAgreementHandler,
  myAgreementsHandler,
  getAgreementDetailHandler
} from "../controllers/agreementController";
import { agreementEvidenceHandler } from "../controllers/evidenceController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validateBody, validateParams } from "../middleware/validate";

const router = Router();

const agreementCreateSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  tenantSignature: z.string().min(1, "Digital signature required")
});

const idParamSchema = z.object({
  id: z.string().min(1, "Agreement id is required")
});

const approveSchema = z.object({
  landlordSignature: z.string().min(1, "Digital signature required")
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
  validateBody(approveSchema),
  approveAgreementHandler
);

router.get("/my-agreements", protect, restrictTo("tenant", "landlord"), myAgreementsHandler);

router.get(
  "/:agreementId/detail",
  protect,
  restrictTo("tenant", "landlord", "admin"),
  validateParams(z.object({ agreementId: z.string() })),
  getAgreementDetailHandler
);

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
