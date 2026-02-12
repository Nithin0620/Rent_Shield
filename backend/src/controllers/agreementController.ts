import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  approveAgreement,
  confirmRelease,
  createAgreement,
  getMyAgreements,
  payDeposit,
  requestRelease
} from "../services/agreementService";
import { AppError } from "../utils/AppError";
import { EscrowTransaction } from "../models/EscrowTransaction";
import { RentalAgreement } from "../models/RentalAgreement";

export const createAgreementHandler = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId, startDate, endDate } = req.body as {
    propertyId: string;
    startDate: string;
    endDate: string;
  };

  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreement = await createAgreement({ tenantId, propertyId, startDate, endDate });
  res.status(201).json({ agreement });
});

export const approveAgreementHandler = asyncHandler(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  if (!landlordId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreement = await approveAgreement(req.params.id, landlordId);
  res.status(200).json({ agreement });
});

export const payDepositHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new AppError("Not authenticated", 401);
  }

  const escrow = await payDeposit(req.params.id, tenantId);
  res.status(200).json({ escrow });
});

export const requestReleaseHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const escrow = await requestRelease(req.params.id, userId);
  res.status(200).json({ escrow });
});

export const confirmReleaseHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const escrow = await confirmRelease(req.params.id, userId);
  res.status(200).json({ escrow });
});

export const myAgreementsHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreements = await getMyAgreements(userId);
  const agreementIds = agreements.map((agreement) => agreement.id);
  const escrows = await EscrowTransaction.find({ agreementId: { $in: agreementIds } });
  const escrowMap = new Map(escrows.map((escrow) => [escrow.agreementId.toString(), escrow]));

  const enriched = agreements.map((agreement) => ({
    agreement,
    escrow: escrowMap.get(agreement.id) || null
  }));

  res.status(200).json({ agreements: enriched });
});

export const getEscrowHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreement = await RentalAgreement.findById(req.params.agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const isParty =
    agreement.tenantId.toString() === userId || agreement.landlordId.toString() === userId;
  const isAdmin = req.user?.role === "admin";
  if (!isParty && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  const escrow = await EscrowTransaction.findOne({ agreementId: req.params.agreementId });
  if (!escrow) {
    throw new AppError("Escrow not found", 404);
  }

  res.status(200).json({ escrow });
});
