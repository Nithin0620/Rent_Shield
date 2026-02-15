import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum AgreementStatus {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
  Cancelled = "cancelled",
  Disputed = "disputed"
}

export enum EscrowStatus {
  AwaitingPayment = "awaiting-payment",
  Held = "held",
  Released = "released",
  Disputed = "disputed",
  RefundProcessing = "refund-processing"
}

export interface IEscrow {
  depositAmount: number;
  escrowFeePercentage: number;
  escrowFeeAmount: number;
  totalPayableAmount: number;
  status: EscrowStatus;
  paidDate?: Date;
  releasedDate?: Date;
  releaseMethod?: "lease-end" | "mutual" | "dispute-verdict";
}

export interface IAgreement {
  tenantSignature?: string;
  landlordSignature?: string;
  acceptedByTenant: boolean;
  acceptedByLandlord: boolean;
  digitalSignedAt?: Date;
}

export interface IRentalAgreement extends Document {
  tenantId: Types.ObjectId;
  landlordId: Types.ObjectId;
  propertyId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  months: number;
  depositAmount: number;
  status: AgreementStatus;
  escrow: IEscrow;
  agreement: IAgreement;
  defaultChecklistItems: string[];
  damageDefinitionNote?: string;
  regionSpecificClause?: string;
  agreementPdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const escrowSchema = new Schema<IEscrow>(
  {
    depositAmount: { type: Number, required: true, min: 0 },
    escrowFeePercentage: { type: Number, default: 1.5, min: 0, max: 100 },
    escrowFeeAmount: { type: Number, required: true, min: 0 },
    totalPayableAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(EscrowStatus),
      default: EscrowStatus.AwaitingPayment
    },
    paidDate: { type: Date },
    releasedDate: { type: Date },
    releaseMethod: {
      type: String,
      enum: ["lease-end", "mutual", "dispute-verdict"]
    }
  },
  { _id: false }
);

const agreementSchema = new Schema<IAgreement>(
  {
    tenantSignature: { type: String },
    landlordSignature: { type: String },
    acceptedByTenant: { type: Boolean, default: false },
    acceptedByLandlord: { type: Boolean, default: false },
    digitalSignedAt: { type: Date }
  },
  { _id: false }
);

const rentalAgreementSchema = new Schema<IRentalAgreement>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    months: { type: Number, required: true, min: 1 },
    depositAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(AgreementStatus),
      default: AgreementStatus.Pending
    },
    escrow: { type: escrowSchema, required: true },
    agreement: { type: agreementSchema, required: true },
    defaultChecklistItems: [{ type: String }],
    damageDefinitionNote: { type: String },
    regionSpecificClause: { type: String },
    agreementPdfUrl: { type: String }
  },
  { timestamps: true }
);

export const RentalAgreement: Model<IRentalAgreement> =
  mongoose.models.RentalAgreement ||
  mongoose.model<IRentalAgreement>("RentalAgreement", rentalAgreementSchema);
