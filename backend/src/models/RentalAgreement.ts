import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum AgreementStatus {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
  Cancelled = "cancelled"
}

export interface IRentalAgreement extends Document {
  tenantId: Types.ObjectId;
  landlordId: Types.ObjectId;
  propertyId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  depositAmount: number;
  agreementStatus: AgreementStatus;
  agreementPdfUrl?: string;
  createdAt: Date;
}

const rentalAgreementSchema = new Schema<IRentalAgreement>({
  tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  monthlyRent: { type: Number, required: true, min: 0 },
  depositAmount: { type: Number, required: true, min: 0 },
  agreementStatus: {
    type: String,
    enum: Object.values(AgreementStatus),
    default: AgreementStatus.Pending
  },
  agreementPdfUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const RentalAgreement: Model<IRentalAgreement> =
  mongoose.models.RentalAgreement ||
  mongoose.model<IRentalAgreement>("RentalAgreement", rentalAgreementSchema);
