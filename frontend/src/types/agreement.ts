export enum AgreementStatus {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
  Cancelled = "cancelled"
}

export enum EscrowStatus {
  Unpaid = "unpaid",
  Locked = "locked",
  ReleaseRequested = "release_requested",
  Released = "released",
  Disputed = "disputed"
}

export interface AgreementParty {
  _id: string;
  name: string;
  email: string;
  role: "tenant" | "landlord" | "admin";
}

export interface AgreementProperty {
  _id: string;
  title: string;
  address: string;
  rent: number;
  depositAmount: number;
}

export interface RentalAgreement {
  _id: string;
  tenantId: AgreementParty;
  landlordId: AgreementParty;
  propertyId: AgreementProperty;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  agreementStatus: AgreementStatus;
  agreementPdfUrl?: string;
  createdAt: string;
}

export interface EscrowTransaction {
  _id: string;
  agreementId: string;
  amount: number;
  escrowStatus: EscrowStatus;
  paymentGatewayOrderId?: string;
  paymentGatewayPaymentId?: string;
  webhookVerified: boolean;
  lockedAt?: string;
  releasedAt?: string;
  releaseRequestedByTenant: boolean;
  releaseRequestedByLandlord: boolean;
  transactionLogs: Array<{
    event: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface AgreementWithEscrow {
  agreement: RentalAgreement;
  escrow: EscrowTransaction | null;
}
