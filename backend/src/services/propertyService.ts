import { Property, PropertyType, FurnishingType } from "../models/Property";

export interface PropertyInput {
  landlordId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: PropertyType;
  furnishingType: FurnishingType;
  monthlyRent: number;
  securityDeposit: number;
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
}

export const createProperty = async (input: PropertyInput) => {
  return Property.create(input);
};

export const getAllProperties = async () => {
  return Property.find().populate("landlordId", "name email role trustScore");
};

export const getPropertiesByLandlord = async (landlordId: string) => {
  return Property.find({ landlordId }).populate("landlordId", "name email role trustScore");
};

export const getPropertyById = async (propertyId: string) => {
  return Property.findById(propertyId).populate("landlordId", "name email role trustScore");
};

export const updateProperty = async (propertyId: string, updates: Partial<PropertyInput>) => {
  return Property.findByIdAndUpdate(propertyId, updates, { new: true }).populate("landlordId", "name email role trustScore");
};
