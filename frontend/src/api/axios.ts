import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { getAccessToken } from "../session/access-token";
import { refreshSession } from "../session/session";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_ENDPOINTS = [
  "/auth/register",
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
] as const;

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;

  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (
      !config
      || error.response?.status !== 401
      || config._retry
      || isAuthEndpoint(config.url)
    ) {
      return Promise.reject(error);
    }

    // Mark before refreshing so a rejected refresh cannot loop.
    config._retry = true;

    const accessToken = await refreshSession();

    if (!accessToken) {
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${accessToken}`;

    return apiClient(config);
  },
);

export default apiClient;
