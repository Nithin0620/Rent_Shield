import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum DisputeStatus {
  Open = "open",
  AiReviewed = "ai_reviewed",
  Resolved = "resolved",
  Rejected = "rejected"
}

export interface IDispute extends Document {
  agreementId: Types.ObjectId;
  raisedBy: Types.ObjectId;
  reason: string;
  status: DisputeStatus;
  aiReport?:
    | Record<string, unknown>
    | {
        damageDetected: boolean;
        damageSummary: string;
        severityLevel: "low" | "medium" | "high";
        confidenceScore: number;
        recommendedPayoutPercentage: number;
        error?: string;
      };
  recommendedPayoutPercentage?: number;
  finalDecisionPercentage?: number;
  adminOverride: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

const disputeSchema = new Schema<IDispute>({
  agreementId: { type: Schema.Types.ObjectId, ref: "RentalAgreement", required: true, index: true },
  raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: Object.values(DisputeStatus),
    default: DisputeStatus.Open
  },
  aiReport: { type: Schema.Types.Mixed },
  recommendedPayoutPercentage: { type: Number, min: 0, max: 100 },
  finalDecisionPercentage: { type: Number, min: 0, max: 100 },
  adminOverride: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

export const Dispute: Model<IDispute> =
  mongoose.models.Dispute || mongoose.model<IDispute>("Dispute", disputeSchema);
