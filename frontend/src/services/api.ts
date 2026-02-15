import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthResponse } from "../types/auth";
import { clearStoredAuth, getStoredTokens, setStoredTokens } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_URL || "https://rent-shield.onrender.com/api";

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

const notifySubscribers = (token: string) => {
  subscribers.forEach((callback) => callback(token));
  subscribers = [];
};

const refreshAccessToken = async (refreshToken: string) => {
  const response = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
    refreshToken
  });
  return response.data;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribers.push((token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshAccessToken(tokens.refreshToken);
        setStoredTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        isRefreshing = false;
        notifySubscribers(data.accessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearStoredAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
