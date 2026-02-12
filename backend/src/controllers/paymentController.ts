import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { createCheckoutSession, handleStripeWebhook } from "../services/paymentService";

export const createOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const { agreementId } = req.body as { agreementId: string };

  const session = await createCheckoutSession({
    agreementId,
    userId,
    ipAddress: req.ip
  });

  res.status(201).json({
    sessionId: session.sessionId,
    url: session.url
  });
});

export const stripeWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  const payload = req.body as Buffer;

  const result = await handleStripeWebhook({
    signature,
    payload,
    ipAddress: req.ip
  });

  res.status(200).json(result);
});
