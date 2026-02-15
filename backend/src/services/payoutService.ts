import { AppError } from "../utils/AppError";
import { Dispute, DisputeStatus } from "../models/Dispute";
import { RentalAgreement, AgreementStatus, EscrowStatus } from "../models/RentalAgreement";
import { logAudit } from "./auditService";

export const enqueuePayout = async (agreementId: string) => {
  await executePayout(agreementId);
};

export const executePayout = async (agreementId: string) => {
  const agreement = await RentalAgreement.findById(agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const escrow = agreement.escrow;
  if (!escrow) {
    throw new AppError("Escrow not found", 404);
  }

  if (escrow.status === EscrowStatus.Released) {
    return agreement;
  }

  if (!escrow.paidDate) {
    throw new AppError("Payment not verified", 400);
  }

  if (escrow.status !== EscrowStatus.Held && escrow.status !== EscrowStatus.Disputed) {
    throw new AppError("Escrow not ready for payout", 400);
  }

  const dispute = await Dispute.findOne({ agreementId });

  if (escrow.status === EscrowStatus.Disputed && !dispute) {
    throw new AppError("Dispute not found", 404);
  }

  if (dispute && dispute.status !== DisputeStatus.Resolved) {
    throw new AppError("Dispute not yet resolved", 400);
  }

  const landlordPct = dispute?.finalDecisionPercentage ?? 0;
  const tenantPct = 100 - landlordPct;

  // Release escrow
  escrow.status = EscrowStatus.Released;
  escrow.releasedDate = new Date();
  escrow.releaseMethod = dispute ? "dispute-verdict" : "mutual";
  
  agreement.markModified('escrow');
  agreement.status = AgreementStatus.Completed;
  await agreement.save();

  await logAudit({
    action: "escrow_released",
    metadata: { agreementId, landlordPct, tenantPct, releaseMethod: escrow.releaseMethod }
  });

  return agreement;
};
