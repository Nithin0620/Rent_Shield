import mongoose from "mongoose";
import { Property } from "../models/Property";
import { AgreementStatus, RentalAgreement } from "../models/RentalAgreement";
import { AppError } from "../utils/AppError";
import { EscrowStatus, EscrowTransaction } from "../models/EscrowTransaction";
import { enqueuePayout } from "./payoutService";

interface CreateAgreementInput {
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
}

export const createAgreement = async ({ tenantId, propertyId, startDate, endDate }: CreateAgreementInput) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const agreement = await RentalAgreement.create({
    tenantId,
    landlordId: property.landlordId,
    propertyId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    monthlyRent: property.rent,
    depositAmount: property.depositAmount,
    agreementStatus: AgreementStatus.Pending
  });

  return agreement;
};

export const approveAgreement = async (agreementId: string, landlordId: string) => {
  const session = await mongoose.startSession();

  let updatedAgreement;

  await session.withTransaction(async () => {
    const agreement = await RentalAgreement.findById(agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    if (agreement.landlordId.toString() !== landlordId) {
      throw new AppError("Forbidden", 403);
    }

    if (agreement.agreementStatus !== AgreementStatus.Pending) {
      throw new AppError("Agreement cannot be approved", 400);
    }

    const existingEscrow = await EscrowTransaction.findOne({ agreementId }).session(session);
    if (existingEscrow) {
      throw new AppError("Escrow already exists", 409);
    }

    agreement.agreementStatus = AgreementStatus.Active;
    updatedAgreement = await agreement.save({ session });

    await EscrowTransaction.create(
      [
        {
          agreementId,
          amount: agreement.depositAmount,
          escrowStatus: EscrowStatus.Unpaid
        }
      ],
      { session }
    );
  });

  session.endSession();
  return updatedAgreement;
};

export const payDeposit = async (agreementId: string, tenantId: string) => {
  const session = await mongoose.startSession();

  let escrow;

  await session.withTransaction(async () => {
    const agreement = await RentalAgreement.findById(agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    if (agreement.tenantId.toString() !== tenantId) {
      throw new AppError("Forbidden", 403);
    }

    if (agreement.agreementStatus !== AgreementStatus.Active) {
      throw new AppError("Agreement not active", 400);
    }

    const escrowTransaction = await EscrowTransaction.findOne({ agreementId }).session(session);
    if (!escrowTransaction) {
      throw new AppError("Escrow not found", 404);
    }

    if (escrowTransaction.escrowStatus !== EscrowStatus.Unpaid) {
      throw new AppError("Deposit already paid", 409);
    }

    escrowTransaction.escrowStatus = EscrowStatus.Locked;
    escrowTransaction.lockedAt = new Date();
    escrow = await escrowTransaction.save({ session });
  });

  session.endSession();
  return escrow;
};

export const requestRelease = async (agreementId: string, userId: string) => {
  const session = await mongoose.startSession();
  let escrow;

  await session.withTransaction(async () => {
    const agreement = await RentalAgreement.findById(agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    const isParty =
      agreement.tenantId.toString() === userId || agreement.landlordId.toString() === userId;
    if (!isParty) {
      throw new AppError("Forbidden", 403);
    }

    const escrowTransaction = await EscrowTransaction.findOne({ agreementId }).session(session);
    if (!escrowTransaction) {
      throw new AppError("Escrow not found", 404);
    }

    if (escrowTransaction.escrowStatus !== EscrowStatus.Locked) {
      throw new AppError("Escrow cannot be released", 400);
    }

    if (!escrowTransaction.webhookVerified) {
      throw new AppError("Payment not verified", 400);
    }

    escrowTransaction.escrowStatus = EscrowStatus.ReleaseRequested;
    if (agreement.tenantId.toString() === userId) {
      escrowTransaction.releaseRequestedByTenant = true;
    }
    if (agreement.landlordId.toString() === userId) {
      escrowTransaction.releaseRequestedByLandlord = true;
    }
    escrowTransaction.transactionLogs.push({
      event: "release_requested",
      metadata: { userId }
    });
    escrow = await escrowTransaction.save({ session });
  });

  session.endSession();
  return escrow;
};

export const confirmRelease = async (agreementId: string, userId: string) => {
  const session = await mongoose.startSession();
  let escrow;
  let shouldEnqueue = false;

  await session.withTransaction(async () => {
    const agreement = await RentalAgreement.findById(agreementId).session(session);
    if (!agreement) {
      throw new AppError("Agreement not found", 404);
    }

    const isTenant = agreement.tenantId.toString() === userId;
    const isLandlord = agreement.landlordId.toString() === userId;

    if (!isTenant && !isLandlord) {
      throw new AppError("Forbidden", 403);
    }

    const escrowTransaction = await EscrowTransaction.findOne({ agreementId }).session(session);
    if (!escrowTransaction) {
      throw new AppError("Escrow not found", 404);
    }

    if (escrowTransaction.escrowStatus !== EscrowStatus.ReleaseRequested) {
      throw new AppError("Escrow is not ready for release", 400);
    }

    if (!escrowTransaction.webhookVerified) {
      throw new AppError("Payment not verified", 400);
    }

    if (isTenant) {
      if (escrowTransaction.releaseRequestedByTenant) {
        throw new AppError("Tenant already confirmed", 409);
      }
      escrowTransaction.releaseRequestedByTenant = true;
    }

    if (isLandlord) {
      if (escrowTransaction.releaseRequestedByLandlord) {
        throw new AppError("Landlord already confirmed", 409);
      }
      escrowTransaction.releaseRequestedByLandlord = true;
    }

    if (escrowTransaction.releaseRequestedByTenant && escrowTransaction.releaseRequestedByLandlord) {
      shouldEnqueue = true;
    }

    escrowTransaction.transactionLogs.push({
      event: "release_confirmed",
      metadata: { userId }
    });

    escrow = await escrowTransaction.save({ session });
  });

  session.endSession();
  if (shouldEnqueue && escrow) {
    await enqueuePayout(escrow.id);
  }
  return escrow;
};

export const getMyAgreements = async (userId: string) => {
  return RentalAgreement.find({
    $or: [{ tenantId: userId }, { landlordId: userId }]
  })
    .populate("tenantId", "name email role")
    .populate("landlordId", "name email role")
    .populate("propertyId", "title address rent depositAmount");
};
