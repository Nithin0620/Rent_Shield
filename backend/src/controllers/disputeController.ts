import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import {
  adminResolveDispute,
  createDispute,
  getDisputeByAgreement,
  runDisputeAiReview
} from "../services/disputeService";
import { RentalAgreement } from "../models/RentalAgreement";

export const createDisputeHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const { reason } = req.body as { reason: string };

  const dispute = await createDispute({
    agreementId: req.params.agreementId,
    raisedBy: userId,
    reason
  });

  res.status(201).json({ dispute });
});

export const getDisputeHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreement = await RentalAgreement.findById(req.params.agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const isParty =
    agreement.tenantId.toString() === userId || agreement.landlordId.toString() === userId;
  const isAdmin = req.user?.role === "admin";

  if (!isParty && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  const dispute = await getDisputeByAgreement(req.params.agreementId);
  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  res.status(200).json({ dispute });
});

export const aiReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await runDisputeAiReview(req.params.id);
  res.status(200).json({ dispute });
});

export const adminResolveHandler = asyncHandler(async (req: Request, res: Response) => {
  const { finalDecisionPercentage } = req.body as { finalDecisionPercentage: number };
  const dispute = await adminResolveDispute({
    disputeId: req.params.id,
    finalDecisionPercentage
  });

  res.status(200).json({ dispute });
});
