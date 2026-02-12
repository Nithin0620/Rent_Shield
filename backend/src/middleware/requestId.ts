import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"]?.toString() || randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
