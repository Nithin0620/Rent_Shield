import { AppError } from "../utils/AppError";
import { EscrowStatus, RentalAgreement, AgreementStatus } from "../models/RentalAgreement";
import { logAudit } from "./auditService";

const buildSessionId = () =>
  `sim_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const createCheckoutSession = async ({ agreementId, userId, ipAddress }: {
  agreementId: string;
  userId: string;
  ipAddress?: string;
}) => {
  const agreement = await RentalAgreement.findById(agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  if (agreement.status !== AgreementStatus.Active) {
    throw new AppError("Agreement not active", 400);
  }

  if (agreement.tenantId.toString() !== userId) {
    throw new AppError("Only tenant can pay deposit", 403);
  }

  const escrow = agreement.escrow;
  if (!escrow) {
    throw new AppError("Escrow not found", 404);
  }

  if (escrow.status !== EscrowStatus.AwaitingPayment) {
    throw new AppError("Escrow already funded", 409);
  }

  const sessionId = buildSessionId();

  // Update agreement with payment info
  escrow.paidDate = new Date();
  agreement.markModified('escrow');
  await agreement.save();

  await logAudit({
    userId,
    action: "payment_simulated",
    metadata: { agreementId, sessionId, amount: escrow.depositAmount },
    ipAddress
  });

  return { sessionId, url: `simulated://checkout/${sessionId}` };
};

export const handlePaymentWebhook = async ({
  payload,
  ipAddress
}: {
  payload: unknown;
  ipAddress?: string;
}) => {
  if (payload === undefined) {
    throw new AppError("Invalid webhook payload", 400);
  }

  await logAudit({
    action: "payment_webhook_simulated",
    metadata: { payload: "simulated" },
    ipAddress
  });

  return { received: true, simulated: true };
};
