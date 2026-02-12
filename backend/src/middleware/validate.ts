import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

const formatZodError = (error: ZodError) => {
  return error.errors.map((issue) => issue.message).join(", ");
};

export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(formatZodError(result.error), 400));
    }
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new AppError(formatZodError(result.error), 400));
    }
    req.params = result.data;
    next();
  };
};
