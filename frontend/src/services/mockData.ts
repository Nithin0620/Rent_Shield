import { AgreementStatus, AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import { User } from "../types/auth";

export const mockUser: User = {
  id: "u1",
  name: "Aarav Sharma",
  email: "aarav@example.com",
  role: "tenant"
};

export const mockAgreements: AgreementWithEscrow[] = [
  {
    agreement: {
      _id: "a1",
      tenantId: { _id: "t1", name: "Aarav Sharma", email: "aarav@example.com", role: "tenant" },
      landlordId: { _id: "l1", name: "Nisha Patel", email: "nisha@rent.com", role: "landlord" },
      propertyId: {
        _id: "p1",
        title: "Skyline Residency",
        address: "Indiranagar, Bengaluru",
        rent: 28000,
        depositAmount: 84000
      },
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyRent: 28000,
      depositAmount: 84000,
      agreementStatus: AgreementStatus.Active,
      createdAt: new Date().toISOString()
    },
    escrow: {
      _id: "e1",
      agreementId: "a1",
      amount: 84000,
      escrowStatus: EscrowStatus.ReleaseRequested,
      webhookVerified: true,
      releaseRequestedByTenant: false,
      releaseRequestedByLandlord: true,
      transactionLogs: []
    }
  },
  {
    agreement: {
      _id: "a2",
      tenantId: { _id: "t2", name: "Aarav Sharma", email: "aarav@example.com", role: "tenant" },
      landlordId: { _id: "l2", name: "Karan Mehta", email: "karan@rent.com", role: "landlord" },
      propertyId: {
        _id: "p2",
        title: "Mint Heights",
        address: "Gachibowli, Hyderabad",
        rent: 32000,
        depositAmount: 96000
      },
      startDate: "2024-03-01",
      endDate: "2025-02-28",
      monthlyRent: 32000,
      depositAmount: 96000,
      agreementStatus: AgreementStatus.Active,
      createdAt: new Date().toISOString()
    },
    escrow: {
      _id: "e2",
      agreementId: "a2",
      amount: 96000,
      escrowStatus: EscrowStatus.Unpaid,
      webhookVerified: false,
      releaseRequestedByTenant: false,
      releaseRequestedByLandlord: false,
      transactionLogs: []
    }
  }
];

export const mockProperties = [
  {
    id: "p1",
    title: "Skyline Residency",
    address: "Indiranagar, Bengaluru",
    rent: 28000,
    depositAmount: 84000
  },
  {
    id: "p2",
    title: "Mint Heights",
    address: "Gachibowli, Hyderabad",
    rent: 32000,
    depositAmount: 96000
  }
];
