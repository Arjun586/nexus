import { getAccessToken } from "../session/access-token";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceResponse,
  GetWorkspacesResponse,
} from "../types/workspace";
import apiClient from "./axios";

const WORKSPACE_ENDPOINTS = {
  workspaces: "/workspaces",
} as const;

const getAuthHeaders = () => {
  const accessToken = getAccessToken();

  return accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : undefined;
};

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<CreateWorkspaceResponse> {
  const { data } = await apiClient.post<CreateWorkspaceResponse>(
    WORKSPACE_ENDPOINTS.workspaces,
    input,
    getAuthHeaders(),
  );

  return data;
}

export async function getWorkspaces(): Promise<GetWorkspacesResponse> {
  const { data } = await apiClient.get<GetWorkspacesResponse>(
    WORKSPACE_ENDPOINTS.workspaces,
    getAuthHeaders(),
  );

  return data;
}
