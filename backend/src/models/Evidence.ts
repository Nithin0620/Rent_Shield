import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum EvidenceType {
  MoveIn = "move_in",
  MoveOut = "move_out",
  DamageProof = "damage_proof"
}

export interface IEvidence extends Document {
  agreementId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  type: EvidenceType;
  fileUrl: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  verified: boolean;
}

const evidenceSchema = new Schema<IEvidence>({
  agreementId: { type: Schema.Types.ObjectId, ref: "RentalAgreement", required: true, index: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: Object.values(EvidenceType), required: true },
  fileUrl: { type: String, required: true },
  fileHash: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now, immutable: true },
  verified: { type: Boolean, default: true }
});

export const Evidence: Model<IEvidence> =
  mongoose.models.Evidence || mongoose.model<IEvidence>("Evidence", evidenceSchema);
