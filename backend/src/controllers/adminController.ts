import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { adminResolveDispute, runDisputeAiReview } from "../services/disputeService";
import {
  getAllAgreements,
  getAllDisputes,
  getAdminDashboardStats,
  getTopTrustedUsers
} from "../services/adminService";

export const adminDashboardStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getAdminDashboardStats();
  res.status(200).json({ stats });
});

export const adminAllAgreementsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const agreements = await getAllAgreements();
  res.status(200).json({ agreements });
});

export const adminAllDisputesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const disputes = await getAllDisputes();
  res.status(200).json({ disputes });
});

export const adminTriggerAiReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const { disputeId } = req.params;
  if (!disputeId) {
    throw new AppError("Dispute ID required", 400);
  }

  const dispute = await runDisputeAiReview(disputeId);
  res.status(200).json({ dispute });
});

export const adminResolveDisputeHandler = asyncHandler(async (req: Request, res: Response) => {
  const { disputeId } = req.params;
  const { finalDecisionPercentage } = req.body as { finalDecisionPercentage: number };

  if (!disputeId || finalDecisionPercentage === undefined) {
    throw new AppError("Dispute ID and final decision percentage required", 400);
  }

  if (finalDecisionPercentage < 0 || finalDecisionPercentage > 100) {
    throw new AppError("Final decision percentage must be between 0 and 100", 400);
  }

  const dispute = await adminResolveDispute({ disputeId, finalDecisionPercentage });
  res.status(200).json({ dispute });
});

export const adminTopTrustedUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || "10", 10);
  const users = await getTopTrustedUsers(Math.min(limit, 50));
  res.status(200).json({ users });
});
