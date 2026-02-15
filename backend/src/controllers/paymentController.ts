import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { createCheckoutSession, handlePaymentWebhook } from "../services/paymentService";

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

export const paymentWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as unknown;

  const result = await handlePaymentWebhook({
    payload,
    ipAddress: req.ip
  });

  res.status(200).json(result);
});
