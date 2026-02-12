import { AuthTokens, User } from "../types/auth";

const USER_KEY = "rs_user";
const TOKENS_KEY = "rs_tokens";

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
};

export const setStoredTokens = (tokens: AuthTokens) => {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKENS_KEY);
};
