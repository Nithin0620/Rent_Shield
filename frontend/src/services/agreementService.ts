import api from "./api";
import { AgreementWithEscrow, EscrowTransaction, RentalAgreement } from "../types/agreement";
import { ExitChecklist } from "../types/checklist";

interface AgreementPayload {
  propertyId: string;
  startDate: string;
  endDate: string;
}

export const createAgreement = async (payload: AgreementPayload) => {
  const { data } = await api.post<{ agreement: RentalAgreement }>("/agreements/create", payload);
  return data.agreement;
};

export const getMyAgreements = async () => {
  const { data } = await api.get<{ agreements: AgreementWithEscrow[] }>("/agreements/my-agreements");
  return data.agreements;
};

export const approveAgreement = async (agreementId: string) => {
  const { data } = await api.patch<{ agreement: RentalAgreement }>(`/agreements/${agreementId}/approve`);
  return data.agreement;
};

export const rejectAgreement = async (agreementId: string, reason?: string) => {
  const { data } = await api.patch<{ agreement: RentalAgreement }>(`/agreements/${agreementId}/reject`, { reason });
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

export const payDeposit = async (agreementId: string) => {
  const { data } = await api.post<{ escrow: EscrowTransaction }>(`/agreements/${agreementId}/pay-deposit`);
  return data.escrow;
};

export const requestRelease = async (agreementId: string) => {
  const { data } = await api.post<{ escrow: EscrowTransaction }>(
    `/agreements/${agreementId}/request-release`
  );
  return data.escrow;
};

export const confirmRelease = async (agreementId: string) => {
  const { data } = await api.post<{ escrow: EscrowTransaction }>(
    `/agreements/${agreementId}/confirm-release`
  );
  return data.escrow;
};

export const getEscrowByAgreement = async (agreementId: string) => {
  const { data } = await api.get<{ escrow: EscrowTransaction }>(`/escrow/${agreementId}`);
  return data.escrow;
};
