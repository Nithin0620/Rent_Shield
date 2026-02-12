import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
