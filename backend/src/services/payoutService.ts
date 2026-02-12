import Stripe from "stripe";
import { AppError } from "../utils/AppError";
import { EscrowStatus, EscrowTransaction } from "../models/EscrowTransaction";
import { Dispute, DisputeStatus } from "../models/Dispute";
import { RentalAgreement, AgreementStatus } from "../models/RentalAgreement";
import { logAudit } from "./auditService";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
};

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" });

const getDestinations = () => {
  return {
    landlord: getEnv("STRIPE_LANDLORD_DESTINATION"),
    tenant: getEnv("STRIPE_TENANT_DESTINATION")
  };
};

export const enqueuePayout = async (escrowId: string) => {
  const { payoutQueue } = await import("./payoutQueue");
  await payoutQueue.add(
    "execute",
    { escrowId },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );
};

export const executePayout = async (escrowId: string) => {
  const escrow = await EscrowTransaction.findById(escrowId);
  if (!escrow) {
    throw new AppError("Escrow not found", 404);
  }

  if (escrow.escrowStatus === EscrowStatus.Released) {
    return escrow;
  }

  if (!escrow.webhookVerified) {
    throw new AppError("Payment not verified", 400);
  }

  if (escrow.escrowStatus !== EscrowStatus.ReleaseRequested && escrow.escrowStatus !== EscrowStatus.Disputed) {
    throw new AppError("Escrow not ready for payout", 400);
  }

  const agreement = await RentalAgreement.findById(escrow.agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const dispute = await Dispute.findOne({ agreementId: agreement.id, status: DisputeStatus.Resolved });

  if (escrow.escrowStatus === EscrowStatus.ReleaseRequested) {
    if (!escrow.releaseRequestedByTenant || !escrow.releaseRequestedByLandlord) {
      throw new AppError("Release not confirmed by both parties", 400);
    }
  }

  if (escrow.escrowStatus === EscrowStatus.Disputed && !dispute) {
    throw new AppError("Dispute not resolved", 400);
  }

  const landlordPct = dispute?.finalDecisionPercentage ?? 0;
  const tenantPct = 100 - landlordPct;

  const amount = Math.round(escrow.amount * 100);
  const landlordAmount = Math.round((amount * landlordPct) / 100);
  const tenantAmount = amount - landlordAmount;

  const destination = getDestinations();

  if (landlordAmount > 0) {
    await stripe.transfers.create(
      {
        amount: landlordAmount,
        currency: process.env.STRIPE_CURRENCY || "inr",
        destination: destination.landlord
      },
      { idempotencyKey: `escrow-${escrow.id}-landlord` }
    );
  }

  if (tenantAmount > 0) {
    await stripe.transfers.create(
      {
        amount: tenantAmount,
        currency: process.env.STRIPE_CURRENCY || "inr",
        destination: destination.tenant
      },
      { idempotencyKey: `escrow-${escrow.id}-tenant` }
    );
  }

  escrow.escrowStatus = EscrowStatus.Released;
  escrow.releasedAt = new Date();
  escrow.transactionLogs.push({
    event: "escrow_released",
    metadata: { landlordPct, tenantPct }
  });
  await escrow.save();

  agreement.agreementStatus = AgreementStatus.Completed;
  await agreement.save();

  await logAudit({
    action: "escrow_released",
    metadata: { agreementId: agreement.id, landlordPct, tenantPct }
  });

  return escrow;
};
