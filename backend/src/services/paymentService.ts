import { AppError } from "../utils/AppError";
import { EscrowStatus, EscrowTransaction } from "../models/EscrowTransaction";
import { RentalAgreement, AgreementStatus } from "../models/RentalAgreement";
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

  if (agreement.agreementStatus !== AgreementStatus.Active) {
    throw new AppError("Agreement not active", 400);
  }

  if (agreement.tenantId.toString() !== userId) {
    throw new AppError("Only tenant can pay deposit", 403);
  }

  const escrow = await EscrowTransaction.findOne({ agreementId });
  if (!escrow) {
    throw new AppError("Escrow not found", 404);
  }

  if (escrow.escrowStatus !== EscrowStatus.Unpaid) {
    throw new AppError("Escrow already funded", 409);
  }

  if (escrow.paymentGatewayOrderId) {
    throw new AppError("Payment order already created", 409);
  }

  const sessionId = buildSessionId();

  escrow.paymentGatewayOrderId = sessionId;
  escrow.transactionLogs.push({
    event: "payment_simulated",
    metadata: { agreementId, amount: escrow.amount },
    createdAt: new Date()
  });
  await escrow.save();

  await logAudit({
    userId,
    action: "payment_simulated",
    metadata: { agreementId, sessionId, amount: escrow.amount },
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
