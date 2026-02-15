import { User } from "../models/User";
import { RentalAgreement, AgreementStatus, EscrowStatus } from "../models/RentalAgreement";
import { Dispute, DisputeStatus } from "../models/Dispute";
import { AppError } from "../utils/AppError";

export const getAllAgreements = async () => {
  return RentalAgreement.find()
    .populate("tenantId", "name email role trustScore")
    .populate("landlordId", "name email role trustScore")
    .populate("propertyId", "title address monthlyRent securityDeposit")
    .sort({ createdAt: -1 });
};

export const getAllDisputes = async () => {
  return Dispute.find()
    .populate({
      path: "agreementId",
      select: "propertyId tenantId landlordId",
      populate: [
        { path: "propertyId", select: "title address" },
        { path: "tenantId", select: "name email" },
        { path: "landlordId", select: "name email" }
      ]
    })
    .populate("raisedBy", "name email role")
    .sort({ createdAt: -1 });
};

export const getAdminDashboardStats = async () => {
  const [totalUsers, totalAgreements, openDisputes] = await Promise.all([
    User.countDocuments(),
    RentalAgreement.countDocuments(),
    Dispute.countDocuments({ status: { $in: [DisputeStatus.Open, DisputeStatus.AiReviewed] } })
  ]);

  const totalAgreementsActive = await RentalAgreement.countDocuments({
    status: AgreementStatus.Active
  });
  const totalAgreementsCompleted = await RentalAgreement.countDocuments({
    status: AgreementStatus.Completed
  });

  const escrowLockedAggr = await RentalAgreement.aggregate([
    { $match: { "escrow.status": EscrowStatus.Held } },
    { $group: { _id: null, total: { $sum: "$escrow.depositAmount" } } }
  ]);

  const escrowLockedCount = await RentalAgreement.countDocuments({
    "escrow.status": EscrowStatus.Held
  });

  return {
    totalUsers,
    totalAgreements,
    totalAgreementsActive,
    totalAgreementsCompleted,
    openDisputes,
    escrowLocked: escrowLockedCount,
    totalEscrowAmount: escrowLockedAggr[0]?.total || 0
  };
};

export const triggerAiReviewOnDispute = async (disputeId: string) => {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  if (dispute.status !== DisputeStatus.Open) {
    throw new AppError("Only open disputes can be reviewed", 400);
  }

  // This would be called with the actual AI service
  // For now, just return the dispute
  return dispute;
};

export const getTopTrustedUsers = async (limit: number = 10) => {
  return User.find()
    .sort({ trustScore: -1 })
    .limit(limit)
    .select("name email role trustScore createdAt");
};
