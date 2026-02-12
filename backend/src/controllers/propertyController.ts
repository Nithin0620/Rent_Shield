import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import {
  createProperty as createPropertyService,
  getAllProperties,
  getPropertiesByLandlord
} from "../services/propertyService";

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const { title, address, rent, depositAmount } = req.body as {
    title: string;
    address: string;
    rent: number;
    depositAmount: number;
  };

  const landlordId = req.user?.id;
  if (!landlordId) {
    throw new AppError("Landlord not authenticated", 401);
  }

  const property = await createPropertyService({
    landlordId,
    title,
    address,
    rent,
    depositAmount
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
