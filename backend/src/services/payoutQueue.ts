import { Queue, Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { logger } from "../utils/logger";
import { executePayout } from "./payoutService";

export const payoutQueue = new Queue("payouts", {
  connection: redisConnection
});

export const startPayoutWorker = () => {
  const worker = new Worker(
    "payouts",
    async (job) => {
      await executePayout(job.data.escrowId);
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Payout job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Payout job failed");
  });

  return worker;
};
