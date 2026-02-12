import { User, UserRole } from "../models/User";
import { AppError } from "../utils/AppError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

const createTokens = (userId: string, role: UserRole) => {
  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId, role);
  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password, role }: RegisterInput) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const user = await User.create({ name, email, password, role });
  const tokens = createTokens(user.id, user.role);

  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokens = createTokens(user.id, user.role);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

export const refreshTokens = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  const payload = verifyRefreshToken(refreshToken);
  const userId = payload.sub as string;

  const user = await User.findOne({ _id: userId, refreshToken });
  if (!user) {
    throw new AppError("Invalid refresh token", 401);
  }

  const tokens = createTokens(user.id, user.role);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};
