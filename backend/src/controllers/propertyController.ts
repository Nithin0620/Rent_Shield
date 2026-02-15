/// <reference path="../types/express.d.ts" />
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import {
  createProperty as createPropertyService,
  getAllProperties,
  getPropertiesByLandlord,
  getPropertyById,
  updateProperty as updatePropertyService
} from "../services/propertyService";
import { PropertyType, FurnishingType } from "../models/Property";

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  if (!landlordId) {
    throw new AppError("Landlord not authenticated", 401);
  }

  const {
    title,
    address,
    city,
    state,
    pincode,
    propertyType,
    furnishingType,
    monthlyRent,
    securityDeposit,
    maintenanceCharges,
    lockInPeriod,
    noticePeriod,
    petsAllowed,
    smokingAllowed,
    paintingDeductionClause,
    cleaningCharges,
    defaultChecklistItems,
    damageDefinitionNote,
    regionSpecificClause
  } = req.body as {
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
  };

  const property = await createPropertyService({
    landlordId,
    title,
    address,
    city,
    state,
    pincode,
    propertyType,
    furnishingType,
    monthlyRent,
    securityDeposit,
    maintenanceCharges,
    lockInPeriod,
    noticePeriod,
    petsAllowed,
    smokingAllowed,
    paintingDeductionClause,
    cleaningCharges,
    defaultChecklistItems,
    damageDefinitionNote,
    regionSpecificClause
  });

  res.status(201).json({ property });
});

export const listProperties = asyncHandler(async (_req: Request, res: Response) => {
  const properties = await getAllProperties();
  res.status(200).json({ properties });
});

export const listMyProperties = asyncHandler(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  if (!landlordId) {
    throw new AppError("Landlord not authenticated", 401);
  }
  const properties = await getPropertiesByLandlord(landlordId);
  res.status(200).json({ properties });
});

export const getProperty = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId } = req.params as { propertyId: string };
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }
  res.status(200).json({ property });
});

export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId } = req.params as { propertyId: string };
  const landlordId = req.user?.id;

  if (!landlordId) {
    throw new AppError("Landlord not authenticated", 401);
  }

  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.landlordId.toString() !== landlordId) {
    throw new AppError("Not authorized to update this property", 403);
  }

  const updated = await updatePropertyService(propertyId, req.body);
  res.status(200).json({ property: updated });
});
