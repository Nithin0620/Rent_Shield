import { Router } from "express";
import mongoose from "mongoose";
import { redisConnection } from "../config/redis";

const router = Router();

router.get("/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redisState = redisConnection.status === "ready" ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    db: dbState,
    redis: redisState
  });
});

export default router;
