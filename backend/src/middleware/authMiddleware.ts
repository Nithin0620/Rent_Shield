import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";
import { UserRole } from "../models/User";

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Not authenticated", 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = {
    id: user.id,
    role: user.role
  };

  next();
});

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
};
