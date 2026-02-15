import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import agreementRoutes from "./routes/agreementRoutes";
import escrowRoutes from "./routes/escrowRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";
import disputeRoutes from "./routes/disputeRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import adminRoutes from "./routes/adminRoutes";
import healthRoutes from "./routes/healthRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true
  })
);
app.use(requestIdMiddleware);
app.use(requestLogger);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("surever runnning");
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", healthRoutes);

app.all("*", (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
