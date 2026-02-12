import Stripe from "stripe";
import { AppError } from "../utils/AppError";
import { EscrowStatus, EscrowTransaction } from "../models/EscrowTransaction";
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

  const currency = process.env.STRIPE_CURRENCY || "inr";
  const amount = Math.round(agreement.depositAmount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          product_data: {
            name: `Security Deposit - ${agreementId}`
          },
          unit_amount: amount
        }
      }
    ],
    success_url: getEnv("STRIPE_SUCCESS_URL"),
    cancel_url: getEnv("STRIPE_CANCEL_URL"),
    metadata: {
      agreementId
    }
  });

  escrow.paymentGatewayOrderId = session.id;
  escrow.transactionLogs.push({
    event: "payment_created",
    metadata: { agreementId, amount, currency, sessionId: session.id }
  });
  await escrow.save();

  await logAudit({
    userId,
    action: "payment_created",
    metadata: { agreementId, sessionId: session.id, amount, currency },
    ipAddress
  });

  return { sessionId: session.id, url: session.url };
};

export const handleStripeWebhook = async ({
  signature,
  payload,
  ipAddress
}: {
  signature: string | string[] | undefined;
  payload: Buffer;
  ipAddress?: string;
}) => {
  const secret = getEnv("STRIPE_WEBHOOK_SECRET");
  if (!signature) {
    throw new AppError("Missing signature", 400);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    throw new AppError("Invalid signature", 400);
  }

  if (event.type !== "checkout.session.completed") {
    return { received: true };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const agreementId = session.metadata?.agreementId;
  if (!agreementId) {
    throw new AppError("Agreement metadata missing", 400);
  }

  const escrow = await EscrowTransaction.findOne({ agreementId });
  if (!escrow) {
    throw new AppError("Escrow not found", 404);
  }

  if (escrow.webhookEventIds.includes(event.id)) {
    return { received: true, ignored: true };
  }

  const amountTotal = session.amount_total ?? 0;
  const expected = Math.round(escrow.amount * 100);
  if (amountTotal !== expected) {
    throw new AppError("Payment amount mismatch", 400);
  }

  escrow.paymentGatewayOrderId = session.id;
  escrow.paymentGatewayPaymentId = session.payment_intent?.toString();
  escrow.webhookVerified = true;
  escrow.webhookEventIds.push(event.id);

  if (escrow.escrowStatus === EscrowStatus.Unpaid) {
    escrow.escrowStatus = EscrowStatus.Locked;
    escrow.lockedAt = new Date();
  }

  escrow.transactionLogs.push({
    event: "payment_verified",
    metadata: { eventId: event.id, amount: amountTotal, currency: session.currency }
  });
  await escrow.save();

  await logAudit({
    action: "payment_verified",
    metadata: { agreementId, eventId: event.id },
    ipAddress
  });

  return { received: true };
};

export const stripeClient = stripe;
