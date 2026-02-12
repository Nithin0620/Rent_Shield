import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginUser, refreshTokens, registerUser } from "../services/authService";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: "tenant" | "landlord" | "admin";
  };

  const { user, tokens } = await registerUser({ name, email, password, role });

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const { user, tokens } = await loginUser({ email, password });

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const { user, tokens } = await refreshTokens(refreshToken);

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});
