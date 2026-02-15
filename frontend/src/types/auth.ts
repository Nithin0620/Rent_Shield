export type UserRole = "tenant" | "landlord" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  trustScore?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
