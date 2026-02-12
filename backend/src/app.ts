import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import agreementRoutes from "./routes/agreementRoutes";
import escrowRoutes from "./routes/escrowRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";
import disputeRoutes from "./routes/disputeRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/disputes", disputeRoutes);

app.all("*", (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
