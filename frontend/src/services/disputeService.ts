import api from "./api";
import { Dispute } from "../types/dispute";

export const createDispute = async (agreementId: string, reason: string) => {
  const { data } = await api.post<{ dispute: Dispute }>(`/disputes/${agreementId}/create`, {
    reason
  });
  return data.dispute;
};

export const getDisputeByAgreement = async (agreementId: string) => {
  const { data } = await api.get<{ dispute: Dispute }>(`/disputes/${agreementId}`);
  return data.dispute;
};

export const runAiReview = async (disputeId: string) => {
  const { data } = await api.post<{ dispute: Dispute }>(`/disputes/${disputeId}/ai-review`);
  return data.dispute;
};

export const adminResolveDispute = async (disputeId: string, finalDecisionPercentage: number) => {
  const { data } = await api.post<{ dispute: Dispute }>(`/disputes/${disputeId}/admin-resolve`, {
    finalDecisionPercentage
  });
  return data.dispute;
};
