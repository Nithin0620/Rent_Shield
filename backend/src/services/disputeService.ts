import mongoose from "mongoose";
import { Dispute, DisputeStatus } from "../models/Dispute";
import { AppError } from "../utils/AppError";
import { RentalAgreement } from "../models/RentalAgreement";
import { EscrowStatus, EscrowTransaction } from "../models/EscrowTransaction";
import { Evidence, EvidenceType } from "../models/Evidence";
import { User } from "../models/User";
import { runAiReview } from "./aiService";
import { enqueuePayout } from "./payoutService";
import { logAudit } from "./auditService";

export const createDispute = async ({ agreementId, raisedBy, reason }: {
  agreementId: string;
  raisedBy: string;
  reason: string;
}) => {
  const session = await mongoose.startSession();
  let dispute;

  await session.withTransaction(async () => {
    const agreement = await RentalAgreement.findById(agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    const isParty =
      agreement.tenantId.toString() === raisedBy || agreement.landlordId.toString() === raisedBy;
    if (!isParty) {
      throw new AppError("Forbidden", 403);
    }

    const escrow = await EscrowTransaction.findOne({ agreementId }).session(session);
    if (!escrow) {
      throw new AppError("Escrow not found", 404);
    }

    if (escrow.escrowStatus !== EscrowStatus.ReleaseRequested) {
      throw new AppError("Dispute can only be raised after release is requested", 400);
    }

    const existing = await Dispute.findOne({
      agreementId,
      status: { $in: [DisputeStatus.Open, DisputeStatus.AiReviewed] }
    }).session(session);

    if (existing) {
      throw new AppError("Active dispute already exists", 409);
    }

    dispute = await Dispute.create(
      [
        {
          agreementId,
          raisedBy,
          reason,
          status: DisputeStatus.Open
        }
      ],
      { session }
    );

    await logAudit({
      userId: raisedBy,
      action: "dispute_created",
      metadata: { agreementId }
    });

    escrow.escrowStatus = EscrowStatus.Disputed;
    escrow.transactionLogs.push({
      event: "dispute_raised",
      metadata: { agreementId },
      createdAt: new Date()
    });
    await escrow.save({ session });
  });

  session.endSession();
  return Array.isArray(dispute) ? dispute[0] : dispute;
};

export const getDisputeByAgreement = async (agreementId: string) => {
  return Dispute.findOne({ agreementId })
    .populate({
      path: "agreementId",
      select: "propertyId agreementStatus tenantId landlordId startDate endDate monthlyRent depositAmount createdAt",
      populate: [
        { path: "propertyId", select: "title address rent depositAmount" },
        { path: "tenantId", select: "name email role" },
        { path: "landlordId", select: "name email role" }
      ]
    })
    .populate("raisedBy", "name email role");
};

export const runDisputeAiReview = async (disputeId: string) => {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  if (dispute.status !== DisputeStatus.Open) {
    throw new AppError("Dispute cannot be AI reviewed", 400);
  }

  const agreementId = dispute.agreementId.toString();
  const moveInEvidence = await Evidence.find({ agreementId, type: EvidenceType.MoveIn }).sort({ uploadedAt: 1 });
  const moveOutEvidence = await Evidence.find({ agreementId, type: EvidenceType.MoveOut }).sort({ uploadedAt: 1 });

  const payload = {
    reason: dispute.reason,
    moveInEvidence: moveInEvidence.map((item) => ({
      fileUrl: item.fileUrl,
      mimeType: item.mimeType,
      uploadedAt: item.uploadedAt.toISOString()
    })),
    moveOutEvidence: moveOutEvidence.map((item) => ({
      fileUrl: item.fileUrl,
      mimeType: item.mimeType,
      uploadedAt: item.uploadedAt.toISOString()
    }))
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { result } = await runAiReview(payload);
      dispute.aiReport = result;
      dispute.recommendedPayoutPercentage = result.recommendedPayoutPercentage;
      dispute.status = DisputeStatus.AiReviewed;
      await dispute.save();
      return dispute;
    } catch (error) {
      lastError = error as Error;
    }
  }

  dispute.aiReport = { error: lastError?.message || "AI review failed" };
  await dispute.save();
  throw lastError || new AppError("AI review failed", 502);
};

export const adminResolveDispute = async ({
  disputeId,
  finalDecisionPercentage
}: {
  disputeId: string;
  finalDecisionPercentage: number;
}) => {
  const session = await mongoose.startSession();
  let dispute;

  await session.withTransaction(async () => {
    dispute = await Dispute.findById(disputeId).session(session);
    if (!dispute) {
      throw new AppError("Dispute not found", 404);
    }

    if (dispute.status !== DisputeStatus.AiReviewed) {
      throw new AppError("Dispute must be AI reviewed first", 400);
    }

    dispute.finalDecisionPercentage = finalDecisionPercentage;
    dispute.adminOverride = true;
    dispute.status = DisputeStatus.Resolved;
    dispute.resolvedAt = new Date();
    await dispute.save({ session });

    // Get agreement and parties
    const agreement = await RentalAgreement.findById(dispute.agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    const tenant = await User.findById(agreement.tenantId).session(session);
    const landlord = await User.findById(agreement.landlordId).session(session);

    // Update trust scores
    if (tenant && landlord) {
      // Tenant lost dispute: -10 trust
      // Landlord won: +5 trust
      if (finalDecisionPercentage > 50) {
        tenant.trustScore = Math.max(0, tenant.trustScore - 10);
        landlord.trustScore = Math.min(100, landlord.trustScore + 5);
      } else {
        // Tenant won: +5 trust
        // Landlord lost: -10 trust
        tenant.trustScore = Math.min(100, tenant.trustScore + 5);
        landlord.trustScore = Math.max(0, landlord.trustScore - 10);
      }

      await tenant.save({ session });
      await landlord.save({ session });
    }

    await logAudit({
      action: "dispute_resolved",
      metadata: {
        disputeId: dispute.id,
        agreementId: dispute.agreementId,
        finalDecisionPercentage,
        tenantScore: tenant?.trustScore,
        landlordScore: landlord?.trustScore
      }
    });

    const escrow = await EscrowTransaction.findOne({ agreementId: dispute.agreementId }).session(session);
    if (escrow) {
      escrow.transactionLogs.push({
        event: "dispute_resolved",
        metadata: { disputeId: dispute.id, finalDecisionPercentage },
        createdAt: new Date()
      });
      await escrow.save({ session });
      await enqueuePayout(escrow.id);
    }
  });

  session.endSession();
  return dispute;
};
