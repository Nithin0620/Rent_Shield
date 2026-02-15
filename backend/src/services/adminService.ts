import { User } from "../models/User";
import { RentalAgreement, AgreementStatus } from "../models/RentalAgreement";
import { Dispute, DisputeStatus } from "../models/Dispute";
import { EscrowTransaction, EscrowStatus } from "../models/EscrowTransaction";
import { AppError } from "../utils/AppError";

export const getAllAgreements = async () => {
  return RentalAgreement.find()
    .populate("tenantId", "name email role trustScore")
    .populate("landlordId", "name email role trustScore")
    .populate("propertyId", "title address rent depositAmount")
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
  const [totalUsers, totalAgreements, openDisputes, escrowLocked] = await Promise.all([
    User.countDocuments(),
    RentalAgreement.countDocuments(),
    Dispute.countDocuments({ status: { $in: [DisputeStatus.Open, DisputeStatus.AiReviewed] } }),
    EscrowTransaction.countDocuments({ escrowStatus: EscrowStatus.Locked })
  ]);

  const totalAgreementsActive = await RentalAgreement.countDocuments({
    agreementStatus: AgreementStatus.Active
  });
  const totalAgreementsCompleted = await RentalAgreement.countDocuments({
    agreementStatus: AgreementStatus.Completed
  });

  const totalEscrowLocked = await EscrowTransaction.aggregate([
    { $match: { escrowStatus: EscrowStatus.Locked } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  return {
    totalUsers,
    totalAgreements,
    totalAgreementsActive,
    totalAgreementsCompleted,
    openDisputes,
    escrowLocked,
    totalEscrowAmount: totalEscrowLocked[0]?.total || 0
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
