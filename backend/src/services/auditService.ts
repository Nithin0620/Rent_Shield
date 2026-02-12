import { AuditLog } from "../models/AuditLog";

export const logAudit = async ({
  userId,
  action,
  metadata,
  ipAddress
}: {
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) => {
  await AuditLog.create({
    userId,
    action,
    metadata,
    ipAddress
  });
};
