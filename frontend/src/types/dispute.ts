export enum DisputeStatus {
  Open = "open",
  AiReviewed = "ai_reviewed",
  Resolved = "resolved",
  Rejected = "rejected"
}

export interface DisputeAiReport {
  damageDetected: boolean;
  damageSummary: string;
  severityLevel: "low" | "medium" | "high";
  confidenceScore: number;
  recommendedPayoutPercentage: number;
  error?: string;
}

export interface Dispute {
  _id: string;
  agreementId: string | import("./agreement").RentalAgreement;
  raisedBy: {
    _id: string;
    name: string;
    email: string;
    role: "tenant" | "landlord" | "admin";
  };
  reason: string;
  status: DisputeStatus;
  aiReport?: DisputeAiReport;
  recommendedPayoutPercentage?: number;
  finalDecisionPercentage?: number;
  adminOverride: boolean;
  createdAt: string;
  resolvedAt?: string;
}
