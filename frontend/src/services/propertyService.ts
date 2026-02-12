import api from "./api";
import { Property } from "../types/property";

interface PropertyPayload {
  title: string;
  address: string;
  rent: number;
  depositAmount: number;
}

export const getAllProperties = async () => {
  const { data } = await api.get<{ properties: Property[] }>("/properties");
  return data.properties;
};

export const getMyProperties = async () => {
  const { data } = await api.get<{ properties: Property[] }>("/properties/me");
  return data.properties;
};

export const createProperty = async (payload: PropertyPayload) => {
  const { data } = await api.post<{ property: Property }>("/properties", payload);
  return data.property;
};
