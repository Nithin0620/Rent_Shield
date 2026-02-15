import api from "./api";
import { Property } from "../types/property";

export interface PropertyPayload {
  title: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  propertyType?: "flat" | "pg" | "independent-house" | "co-living";
  furnishingType?: "furnished" | "semi-furnished" | "unfurnished";
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  lockInPeriod?: number;
  noticePeriod?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  paintingDeductionClause?: boolean;
  cleaningCharges?: number;
  defaultChecklistItems?: string[];
  damageDefinitionNote?: string;
  regionSpecificClause?: string;
}

export const getAllProperties = async () => {
  const { data } = await api.get<{ properties: Property[] }>("/properties");
  return data.properties;
};

export const getMyProperties = async () => {
  const { data } = await api.get<{ properties: Property[] }>("/properties/me");
  return data.properties;
};

export const getPropertyById = async (propertyId: string) => {
  const { data } = await api.get<{ property: Property }>(`/properties/${propertyId}`);
  return data.property;
};

export const createProperty = async (payload: PropertyPayload) => {
  const { data } = await api.post<{ property: Property }>("/properties", payload);
  return data.property;
};

export const updateProperty = async (propertyId: string, updates: Partial<PropertyPayload>) => {
  const { data } = await api.patch<{ property: Property }>(`/properties/${propertyId}`, updates);
  return data.property;
};
