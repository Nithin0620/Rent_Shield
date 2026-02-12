import { UserRole } from "./auth";

export interface PropertyOwner {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Property {
  _id: string;
  landlordId: PropertyOwner | string;
  title: string;
  address: string;
  rent: number;
  depositAmount: number;
  createdAt: string;
}
