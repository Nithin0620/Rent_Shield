export enum AgreementStatus {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
  Cancelled = "cancelled",
  Disputed = "disputed"
}

export enum EscrowStatus {
  AwaitingPayment = "awaiting-payment",
  Held = "held",
  Released = "released",
  Disputed = "disputed",
  RefundProcessing = "refund-processing"
}

export interface AgreementParty {
  _id: string;
  name: string;
  email: string;
  role: "tenant" | "landlord" | "admin";
  trustScore?: number;
}

export interface AgreementProperty {
  _id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: string;
  furnishingType: string;
  rent?: number;
  monthlyRent?: number;
  securityDeposit?: number;
  maintenanceCharges?: number;
  lockInPeriod: number;
  noticePeriod: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  paintingDeductionClause: boolean;
  cleaningCharges?: number;
  defaultChecklistItems: string[];
  damageDefinitionNote?: string;
  regionSpecificClause?: string;
  isActive: boolean;
}

export interface Escrow {
  depositAmount: number;
  escrowFeePercentage: number;
  escrowFeeAmount: number;
  totalPayableAmount: number;
  status: EscrowStatus;
  paidDate?: string;
  releasedDate?: string;
  releaseMethod?: "lease-end" | "mutual" | "dispute-verdict";
}

export interface Agreement {
  tenantSignature?: string;
  landlordSignature?: string;
  acceptedByTenant: boolean;
  acceptedByLandlord: boolean;
  digitalSignedAt?: string;
}

export interface RentalAgreement {
  _id: string;
  tenantId: AgreementParty;
  landlordId: AgreementParty;
  propertyId: AgreementProperty;
  startDate: string;
  endDate: string;
  months: number;
  depositAmount: number;
  status: AgreementStatus;
  escrow: Escrow;
  agreement: Agreement;
  defaultChecklistItems: string[];
  damageDefinitionNote?: string;
  regionSpecificClause?: string;
  createdAt: string;
  updatedAt: string;
}
