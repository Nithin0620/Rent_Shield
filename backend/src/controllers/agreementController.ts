import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  approveAgreement,
  createAgreement,
  getAgreementDetail,
  getMyAgreements
} from "../services/agreementService";
import { AppError } from "../utils/AppError";
import { RentalAgreement, AgreementStatus } from "../models/RentalAgreement";
import { ExitChecklist } from "../models/ExitChecklist";

export const createAgreementHandler = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId, startDate, endDate, tenantSignature } = req.body as {
    propertyId: string;
    startDate: string;
    endDate: string;
    tenantSignature: string;
  };

  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new AppError("Not authenticated", 401);
  }

  if (!tenantSignature || tenantSignature.trim().length === 0) {
    throw new AppError("Digital signature required", 400);
  }

  const agreement = await createAgreement({ tenantId, propertyId, startDate, endDate, tenantSignature });
  res.status(201).json({ agreement });
});

export const approveAgreementHandler = asyncHandler(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  if (!landlordId) {
    throw new AppError("Not authenticated", 401);
  }

  const { landlordSignature } = req.body as { landlordSignature?: string };

  if (!landlordSignature || landlordSignature.trim().length === 0) {
    throw new AppError("Digital signature required", 400);
  }

  const agreement = await approveAgreement(req.params.id, landlordId, landlordSignature);
  res.status(200).json({ agreement });
});

export const getChecklistHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const checklist = await ExitChecklist.findOne({ agreementId: req.params.agreementId });
  if (!checklist) {
    throw new AppError("Checklist not found", 404);
  }

  res.status(200).json({ checklist });
});

export const updateChecklistHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const { agreementId } = req.params;
  const { items } = req.body as { items: Array<{ _id?: string; label: string; agreed: boolean; conditionNote?: string }> };

  const checklist = await ExitChecklist.findOne({ agreementId });
  if (!checklist) {
    throw new AppError("Checklist not found", 404);
  }

  checklist.items = items.map(({ label, agreed, conditionNote }) => ({
    label,
    agreed,
    conditionNote
  }));
  const updated = await checklist.save();

  res.status(200).json({ checklist: updated });
});

export const myAgreementsHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreements = await RentalAgreement.find({
    $or: [{ tenantId: userId }, { landlordId: userId }]
  })
    .populate("propertyId", "title address city state monthlyRent")
    .populate("tenantId", "name email trustScore")
    .populate("landlordId", "name email trustScore");

  res.status(200).json({ agreements });
});

export const getAgreementDetailHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreement = await RentalAgreement.findById(req.params.agreementId)
    .populate("propertyId", "title address city state monthlyRent")
    .populate("tenantId", "name email trustScore")
    .populate("landlordId", "name email trustScore");

  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const isParty =
    agreement.tenantId.toString() === userId || agreement.landlordId.toString() === userId;
  const isAdmin = req.user?.role === "admin";
  if (!isParty && !isAdmin) {
    throw new AppError("Not authorized to view this agreement", 403);
  }

  // Fetch checklist for this agreement
  const checklist = await ExitChecklist.findOne({ agreementId: req.params.agreementId });

  res.status(200).json({ agreement, checklist });
});
