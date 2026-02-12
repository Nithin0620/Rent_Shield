import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum EscrowStatus {
  Unpaid = "unpaid",
  Locked = "locked",
  ReleaseRequested = "release_requested",
  Released = "released",
  Disputed = "disputed"
}

export interface IEscrowTransaction extends Document {
  agreementId: Types.ObjectId;
  amount: number;
  escrowStatus: EscrowStatus;
  paymentGatewayOrderId?: string;
  paymentGatewayPaymentId?: string;
  webhookVerified: boolean;
  lockedAt?: Date;
  releasedAt?: Date;
  releaseRequestedByTenant: boolean;
  releaseRequestedByLandlord: boolean;
  webhookEventIds: string[];
  transactionLogs: Array<{
    event: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }>;
  createdAt: Date;
}

const escrowTransactionSchema = new Schema<IEscrowTransaction>({
  agreementId: { type: Schema.Types.ObjectId, ref: "RentalAgreement", required: true },
  amount: { type: Number, required: true, min: 0 },
  escrowStatus: {
    type: String,
    enum: Object.values(EscrowStatus),
    default: EscrowStatus.Unpaid
  },
  paymentGatewayOrderId: { type: String },
  paymentGatewayPaymentId: { type: String },
  webhookVerified: { type: Boolean, default: false },
  lockedAt: { type: Date },
  releasedAt: { type: Date },
  releaseRequestedByTenant: { type: Boolean, default: false },
  releaseRequestedByLandlord: { type: Boolean, default: false },
  webhookEventIds: { type: [String], default: [] },
  transactionLogs: {
    type: [
      {
        event: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

export const EscrowTransaction: Model<IEscrowTransaction> =
  mongoose.models.EscrowTransaction ||
  mongoose.model<IEscrowTransaction>("EscrowTransaction", escrowTransactionSchema);
