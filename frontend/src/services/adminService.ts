import api from "./api";

export interface AdminStats {
  totalUsers: number;
  totalAgreements: number;
  totalAgreementsActive: number;
  totalAgreementsCompleted: number;
  openDisputes: number;
  escrowLocked: number;
  totalEscrowAmount: number;
}

export interface AdminAgreement {
  _id: string;
  tenantId: { name: string; email: string; role: string; trustScore: number };
  landlordId: { name: string; email: string; role: string; trustScore: number };
  propertyId: { title: string; address: string };
  status: string;
  createdAt: string;
}

export interface AdminDispute {
  _id: string;
  agreementId: {
    propertyId: { title: string; address: string };
    tenantId: { name: string; email: string };
    landlordId: { name: string; email: string };
  };
  raisedBy: { name: string; email: string; role: string };
  reason: string;
  status: string;
  aiReport?: Record<string, unknown>;
  recommendedPayoutPercentage?: number;
  createdAt: string;
}

export const getAdminStats = async () => {
  const { data } = await api.get<{ stats: AdminStats }>("/admin/stats");
  return data.stats;
};

export const getAdminAgreements = async () => {
  const { data } = await api.get<{ agreements: AdminAgreement[] }>("/admin/agreements");
  return data.agreements;
};

export const getAdminDisputes = async () => {
  const { data } = await api.get<{ disputes: AdminDispute[] }>("/admin/disputes");
  return data.disputes;
};

export const triggerAiReview = async (disputeId: string) => {
  const { data } = await api.post<{ dispute: AdminDispute }>(`/admin/disputes/${disputeId}/ai-review`, {});
  return data.dispute;
};

export const resolveDispute = async (disputeId: string, finalDecisionPercentage: number) => {
  const { data } = await api.patch<{ dispute: AdminDispute }>(`/admin/disputes/${disputeId}/resolve`, {
    finalDecisionPercentage
  });
  return data.dispute;
};

export const getTopTrustedUsers = async (limit: number = 10) => {
  const { data } = await api.get<{ users: Array<{ _id: string; name: string; email: string; role: string; trustScore: number }> }>(`/admin/trusted-users?limit=${limit}`);
  return data.users;
};
