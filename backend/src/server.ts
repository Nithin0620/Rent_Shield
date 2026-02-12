import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { startPayoutWorker } from "./services/payoutQueue";
import { redisConnection } from "./config/redis";
import { logger } from "./utils/logger";
import mongoose from "mongoose";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      logger.info({ port }, "Server running");
    });

    startPayoutWorker();

    const shutdown = async () => {
      logger.info("Shutting down server");
      server.close();
      await redisConnection.quit();
      await mongoose.connection.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
