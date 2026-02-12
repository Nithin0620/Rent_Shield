import { EvidenceType } from "./evidenceEnums";

export interface EvidenceItem {
  _id: string;
  agreementId: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    role: "tenant" | "landlord" | "admin";
  };
  type: EvidenceType;
  fileUrl: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  verified: boolean;
}

export interface EvidenceGroupedResponse {
  evidence: EvidenceItem[];
  grouped: Record<EvidenceType, EvidenceItem[]>;
}
