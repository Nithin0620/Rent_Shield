import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProperty extends Document {
  landlordId: Types.ObjectId;
  title: string;
  address: string;
  rent: number;
  depositAmount: number;
  createdAt: Date;
}

const propertySchema = new Schema<IProperty>({
  landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  rent: { type: Number, required: true, min: 0 },
  depositAmount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>("Property", propertySchema);
