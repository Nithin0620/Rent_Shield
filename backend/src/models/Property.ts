import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PropertyType = "flat" | "pg" | "independent-house" | "co-living";
export type FurnishingType = "furnished" | "semi-furnished" | "unfurnished";

export interface IProperty extends Document {
  landlordId: Types.ObjectId;
  title: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: PropertyType;
  furnishingType: FurnishingType;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  lockInPeriod: number;
  noticePeriod: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  paintingDeductionClause: boolean;
  cleaningCharges?: number;
  defaultChecklistItems: string[];
  damageDefinitionNote?: string;
  regionSpecificClause?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    propertyType: {
      type: String,
      enum: ["flat", "pg", "independent-house", "co-living"],
      required: true
    },
    furnishingType: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
      required: true
    },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    maintenanceCharges: { type: Number, default: 0, min: 0 },
    lockInPeriod: { type: Number, required: true, min: 0 }, // in months
    noticePeriod: { type: Number, required: true, min: 0 }, // in days
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    paintingDeductionClause: { type: Boolean, default: false },
    cleaningCharges: { type: Number, default: 0, min: 0 },
    defaultChecklistItems: [{ type: String }],
    damageDefinitionNote: { type: String },
    regionSpecificClause: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>("Property", propertySchema);
