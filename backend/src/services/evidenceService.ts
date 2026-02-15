import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { Evidence, EvidenceType, IEvidence } from "../models/Evidence";
import { RentalAgreement, AgreementStatus } from "../models/RentalAgreement";
import { AppError } from "../utils/AppError";
import { uploadObject, downloadObject } from "./storageService";

const buildKey = (agreementId: string, originalName: string) => {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  return `agreements/${agreementId}/${uuidv4()}.${ext}`;
};

export const createEvidence = async ({
  agreementId,
  uploadedBy,
  type,
  file
}: {
  agreementId: string;
  uploadedBy: string;
  type: EvidenceType;
  file: Express.Multer.File;
}): Promise<IEvidence> => {
  const agreement = await RentalAgreement.findById(agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  const isParty =
    agreement.tenantId.toString() === uploadedBy || agreement.landlordId.toString() === uploadedBy;
  if (!isParty) {
    throw new AppError("Forbidden", 403);
  }

  if (agreement.status !== AgreementStatus.Active) {
    throw new AppError("Agreement not active", 400);
  }

  const fileHash = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const key = buildKey(agreementId, file.originalname);
  const fileUrl = await uploadObject(key, file.buffer, file.mimetype);

  const evidence = await Evidence.create({
    agreementId,
    uploadedBy,
    type,
    fileUrl,
    fileHash,
    fileSize: file.size,
    mimeType: file.mimetype,
    verified: true
  });

  return evidence;
};

export const verifyEvidenceRecord = async (evidence: IEvidence) => {
  const key = new URL(evidence.fileUrl).pathname.replace(/^\//, "");
  const buffer = await downloadObject(key);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const integrity = hash === evidence.fileHash;
  return { evidence, integrity };
};

export const verifyEvidence = async (evidenceId: string) => {
  const evidence = await Evidence.findById(evidenceId);
  if (!evidence) {
    throw new AppError("Evidence not found", 404);
  }
  return verifyEvidenceRecord(evidence);
};

export const getAgreementEvidence = async (agreementId: string) => {
  const evidence = await Evidence.find({ agreementId })
    .sort({ uploadedAt: 1 })
    .populate("uploadedBy", "name email role");

  const grouped = {
    move_in: evidence.filter((item: IEvidence) => item.type === EvidenceType.MoveIn),
    move_out: evidence.filter((item: IEvidence) => item.type === EvidenceType.MoveOut),
    damage_proof: evidence.filter((item: IEvidence) => item.type === EvidenceType.DamageProof)
  };

  return { evidence, grouped };
};
