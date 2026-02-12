import React, { createContext, useMemo, useState } from "react";
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
