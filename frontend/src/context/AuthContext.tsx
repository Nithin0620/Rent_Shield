import React, { createContext, useEffect, useMemo, useState } from "react";
import { AuthTokens, User } from "../types/auth";
import {
  clearStoredAuth,
  getStoredTokens,
  getStoredUser,
  setStoredTokens,
  setStoredUser
} from "../services/tokenStorage";

interface AuthContextValue {
  user: User | null;
  tokens: AuthTokens | null;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseJwt = (token: string): { exp?: number } | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getStoredTokens());

  const login = (nextUser: User, nextTokens: AuthTokens) => {
    setUser(nextUser);
    setTokens(nextTokens);
    setStoredUser(nextUser);
    setStoredTokens(nextTokens);
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    clearStoredAuth();
  };

  useEffect(() => {
    if (!tokens?.accessToken) return;
    const payload = parseJwt(tokens.accessToken);
    if (!payload?.exp) return;

    const expiryMs = payload.exp * 1000;
    if (Date.now() >= expiryMs) {
      logout();
      return;
    }

    const timeout = setTimeout(() => logout(), expiryMs - Date.now());
    return () => clearTimeout(timeout);
  }, [tokens?.accessToken]);

  const value = useMemo(
    () => ({
      user,
      tokens,
      login,
      logout,
      isAuthenticated: Boolean(user && tokens)
    }),
    [user, tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
