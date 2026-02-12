import { Property } from "../models/Property";

interface PropertyInput {
  landlordId: string;
  title: string;
  address: string;
  rent: number;
  depositAmount: number;
}

export const createProperty = async (input: PropertyInput) => {
  return Property.create(input);
};

export const getAllProperties = async () => {
  return Property.find().populate("landlordId", "name email role");
};

export const getPropertiesByLandlord = async (landlordId: string) => {
  return Property.find({ landlordId }).populate("landlordId", "name email role");
};
