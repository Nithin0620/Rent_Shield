import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IChecklistItem {
  _id?: Types.ObjectId;
  label: string;
  agreed: boolean;
  conditionNote?: string;
}

export interface IExitChecklist extends Document {
  agreementId: Types.ObjectId;
  items: IChecklistItem[];
  completedAt?: Date;
  createdAt: Date;
}

const checklistItemSchema = new Schema<IChecklistItem>({
  label: { type: String, required: true },
  agreed: { type: Boolean, default: false },
  conditionNote: { type: String }
});

const exitChecklistSchema = new Schema<IExitChecklist>({
  agreementId: {
    type: Schema.Types.ObjectId,
    ref: "RentalAgreement",
    required: true,
    unique: true,
    index: true
  },
  items: {
    type: [checklistItemSchema],
    default: []
  },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const ExitChecklist: Model<IExitChecklist> =
  mongoose.models.ExitChecklist ||
  mongoose.model<IExitChecklist>("ExitChecklist", exitChecklistSchema);
