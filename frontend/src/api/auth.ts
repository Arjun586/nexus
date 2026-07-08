import type {
  LoginInput,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
} from "../types/auth";
import apiClient from "./axios";

const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
} as const;

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    AUTH_ENDPOINTS.register,
    input,
  );
  return data;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    AUTH_ENDPOINTS.login,
    input,
  );
  return data;
}

export async function logout(): Promise<LogoutResponse> {
  const { data } = await apiClient.post<LogoutResponse>(AUTH_ENDPOINTS.logout);
  return data;
}

export async function refresh(): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>(
    AUTH_ENDPOINTS.refresh,
  );
  return data;
}
