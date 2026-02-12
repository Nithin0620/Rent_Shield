import api from "./api";
import { EvidenceGroupedResponse, EvidenceItem } from "../types/evidence";
import { EvidenceType } from "../types/evidenceEnums";

export const uploadEvidence = async (
  payload: { agreementId: string; type: EvidenceType; file: File },
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("agreementId", payload.agreementId);
  formData.append("type", payload.type);
  formData.append("file", payload.file);

  const { data } = await api.post<{ evidence: EvidenceItem }>("/evidence/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress?.(percent);
    }
  });

  return data.evidence;
};

export const verifyEvidence = async (evidenceId: string) => {
  const { data } = await api.get<{ evidenceId: string; integrity: boolean }>(
    `/evidence/${evidenceId}/verify`
  );
  return data;
};

export const getAgreementEvidence = async (agreementId: string) => {
  const { data } = await api.get<EvidenceGroupedResponse>(`/agreements/${agreementId}/evidence`);
  return data;
};
