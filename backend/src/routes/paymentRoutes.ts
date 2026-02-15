import { Router } from "express";
import { z } from "zod";
import { createOrderHandler, paymentWebhookHandler } from "../controllers/paymentController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { paymentRateLimiter } from "../middleware/rateLimit";

const router = Router();

const createOrderSchema = z.object({
  agreementId: z.string().min(1, "Agreement is required")
});

router.post(
  "/create-order",
  protect,
  restrictTo("tenant"),
  paymentRateLimiter,
  validateBody(createOrderSchema),
  createOrderHandler
);

router.post("/webhook", paymentWebhookHandler);

export default router;
