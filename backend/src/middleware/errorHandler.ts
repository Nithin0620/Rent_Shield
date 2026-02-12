import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  const anyErr = err as unknown as {
    name?: string;
    code?: number;
    keyValue?: Record<string, string>;
    message?: string;
  };

  if (anyErr.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    message = err.message || "Validation error";
  }

  if (anyErr.code === 11000) {
    statusCode = 409;
    status = "fail";
    const fields = anyErr.keyValue ? Object.keys(anyErr.keyValue).join(", ") : "field";
    message = `${fields} already exists`;
  }

  if (anyErr.name === "MulterError") {
    statusCode = 400;
    status = "fail";
    message = anyErr.message || "Invalid upload";
  }

  res.status(statusCode).json({
    status,
    message
  });
};
