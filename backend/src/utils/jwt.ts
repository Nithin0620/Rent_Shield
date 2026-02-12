import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "../models/User";

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
};

export const signAccessToken = (userId: string, role: UserRole): string => {
  const secret: jwt.Secret = getEnv("JWT_ACCESS_SECRET");
  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";
  return jwt.sign({ sub: userId, role }, secret, { expiresIn });
};

export const signRefreshToken = (userId: string, role: UserRole): string => {
  const secret: jwt.Secret = getEnv("JWT_REFRESH_SECRET");
  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";
  return jwt.sign({ sub: userId, role }, secret, { expiresIn });
};

export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  const secret = getEnv("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret) as jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  const secret = getEnv("JWT_REFRESH_SECRET");
  return jwt.verify(token, secret) as jwt.JwtPayload;
};
