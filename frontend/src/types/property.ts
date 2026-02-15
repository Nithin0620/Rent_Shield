import { UserRole } from "./auth";

export interface PropertyOwner {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  trustScore?: number;
}

export interface Property {
  _id: string;
  landlordId: PropertyOwner | string;
  title: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: "flat" | "pg" | "independent-house" | "co-living";
  furnishingType: "furnished" | "semi-furnished" | "unfurnished";
  monthlyRent: number;
  rent?: number; // Alias for monthlyRent for backwards compatibility
  securityDeposit: number;
  depositAmount?: number; // Alias for securityDeposit for backwards compatibility
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
  createdAt: string;
  updatedAt: string;
}
