import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      status: "ok"
    });
  })
);

export default router;
