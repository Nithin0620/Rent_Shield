import mongoose from "mongoose";
import { Property } from "../models/Property";
import { AgreementStatus, EscrowStatus, RentalAgreement } from "../models/RentalAgreement";
import { AppError } from "../utils/AppError";
import { logAudit } from "./auditService";

interface CreateAgreementInput {
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  tenantSignature: string;
}

export const createAgreement = async ({
  tenantId,
  propertyId,
  startDate,
  endDate,
  tenantSignature
}: CreateAgreementInput) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (!property.isActive) {
    throw new AppError("Property is not active", 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new AppError("End date must be after start date", 400);
  }

  // Calculate escrow fee (1.5% by default)
  const escrowFeePercentage = 1.5;
  const escrowFeeAmount = (property.securityDeposit * escrowFeePercentage) / 100;
  const totalPayableAmount = property.securityDeposit + escrowFeeAmount;

  // Calculate months
  const durationMs = end.getTime() - start.getTime();
  const months = Math.round(durationMs / (1000 * 60 * 60 * 24 * 30.44));

  const agreement = await RentalAgreement.create({
    tenantId,
    landlordId: property.landlordId,
    propertyId,
    startDate: start,
    endDate: end,
    months,
    depositAmount: property.securityDeposit,
    status: AgreementStatus.Pending,
    escrow: {
      depositAmount: property.securityDeposit,
      escrowFeePercentage,
      escrowFeeAmount,
      totalPayableAmount,
      status: EscrowStatus.AwaitingPayment
    },
    agreement: {
      tenantSignature,
      acceptedByTenant: true,
      digitalSignedAt: new Date()
    },
    defaultChecklistItems: property.defaultChecklistItems,
    damageDefinitionNote: property.damageDefinitionNote,
    regionSpecificClause: property.regionSpecificClause
  });

  await logAudit({
    userId: tenantId,
    action: "agreement_created",
    metadata: { agreementId: agreement._id, propertyId }
  });

  return agreement;
};

export const approveAgreement = async (agreementId: string, landlordId: string, signature?: string) => {
  const session = await mongoose.startSession();
  let updatedAgreement;

  await session.withTransaction(async () => {
    const agreement = await RentalAgreement.findById(agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    if (agreement.landlordId.toString() !== landlordId) {
      throw new AppError("Not authorized to approve this agreement", 403);
    }

    if (agreement.status !== AgreementStatus.Pending) {
      throw new AppError("Agreement cannot be approved", 400);
    }

    agreement.status = AgreementStatus.Active;
    if (signature) {
      agreement.agreement.landlordSignature = signature;
    }
    agreement.agreement.acceptedByLandlord = true;
    agreement.agreement.digitalSignedAt = new Date();
    
    // Update escrow status to held when agreement is approved
    if (agreement.escrow) {
      agreement.escrow.status = EscrowStatus.Held;
    }
    
    updatedAgreement = await agreement.save({ session });

    await logAudit({
      userId: landlordId,
      action: "agreement_approved",
      metadata: { agreementId }
    });
  });

  session.endSession();
  return updatedAgreement;
};

export const getAgreementDetail = async (agreementId: string) => {
  return RentalAgreement.findById(agreementId)
    .populate("tenantId", "name email trustScore")
    .populate("landlordId", "name email trustScore")
    .populate("propertyId");
};

export const getMyAgreements = async (userId: string) => {
  return RentalAgreement.find({
    $or: [{ tenantId: userId }, { landlordId: userId }]
  })
    .populate("tenantId", "name email trustScore")
    .populate("landlordId", "name email trustScore")
    .populate("propertyId");
};
