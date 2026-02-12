import api from "./api";
import { AuthResponse } from "../types/auth";
import { mockUser } from "./mockData";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "tenant" | "landlord" | "admin";
}

export const login = async (payload: LoginPayload) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  } catch {
    return {
      user: mockUser,
      accessToken: createMockToken(mockUser.role),
      refreshToken: createMockToken(mockUser.role)
    } as AuthResponse;
  }
};

export const register = async (payload: RegisterPayload) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  } catch {
    return {
      user: { ...mockUser, name: payload.name, email: payload.email, role: payload.role },
      accessToken: createMockToken(payload.role),
      refreshToken: createMockToken(payload.role)
    } as AuthResponse;
  }
};

const createMockToken = (role?: string) => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60, role: role || mockUser.role })
  );
  return `${header}.${payload}.mock`;
};
