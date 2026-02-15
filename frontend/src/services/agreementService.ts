import api from "./api";
import { RentalAgreement } from "../types/agreement";
import { ExitChecklist } from "../types/checklist";

export interface AgreementPayload {
  propertyId: string;
  startDate: string;
  endDate: string;
  tenantSignature: string;
}

export const createAgreement = async (payload: AgreementPayload) => {
  const { data } = await api.post<{ agreement: RentalAgreement }>("/agreements/create", payload);
  return data.agreement;
};

export const getMyAgreements = async () => {
  const { data } = await api.get<{ agreements: RentalAgreement[] }>("/agreements/my-agreements");
  return data.agreements;
};

export const getAgreementDetail = async (agreementId: string) => {
  const { data } = await api.get<{ agreement: RentalAgreement; checklist: ExitChecklist | null }>(
    `/agreements/${agreementId}/detail`
  );
  return data;
};

export const approveAgreement = async (agreementId: string, landlordSignature: string) => {
  const { data } = await api.patch<{ agreement: RentalAgreement }>(`/agreements/${agreementId}/approve`, {
    landlordSignature
  });
  return data.agreement;
};

export const getChecklist = async (agreementId: string) => {
  const { data } = await api.get<{ checklist: ExitChecklist }>(`/agreements/${agreementId}/checklist`);
  return data.checklist;
};

export const updateChecklist = async (agreementId: string, items: ExitChecklist['items']) => {
  const { data } = await api.patch<{ checklist: ExitChecklist }>(`/agreements/${agreementId}/checklist`, { items });
  return data.checklist;
};
