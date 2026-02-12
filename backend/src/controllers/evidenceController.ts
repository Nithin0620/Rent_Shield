import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { createEvidence, getAgreementEvidence, verifyEvidenceRecord } from "../services/evidenceService";
import { EvidenceType } from "../models/Evidence";
import { RentalAgreement } from "../models/RentalAgreement";
import { Evidence } from "../models/Evidence";

export const uploadEvidenceHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const { agreementId, type } = req.body as { agreementId: string; type: EvidenceType };

  if (!req.file) {
    throw new AppError("File is required", 400);
  }

  const evidence = await createEvidence({
    agreementId,
    uploadedBy: userId,
    type,
    file: req.file
  });

  res.status(201).json({ evidence });
});

export const verifyEvidenceHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) {
    throw new AppError("Evidence not found", 404);
  }

  const agreement = await RentalAgreement.findById(evidence.agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const isParty =
    agreement.tenantId.toString() === userId || agreement.landlordId.toString() === userId;
  const isAdmin = req.user?.role === "admin";
  if (!isParty && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  const { integrity } = await verifyEvidenceRecord(evidence);

  res.status(200).json({
    evidenceId: evidence.id,
    integrity
  });
});

export const agreementEvidenceHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const agreement = await RentalAgreement.findById(req.params.id);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const isParty =
    agreement.tenantId.toString() === userId || agreement.landlordId.toString() === userId;
  const isAdmin = req.user?.role === "admin";
  if (!isParty && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  const { evidence, grouped } = await getAgreementEvidence(req.params.id);

  res.status(200).json({ evidence, grouped });
});
