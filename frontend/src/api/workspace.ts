import { getAccessToken } from "../session/access-token";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceResponse,
  GetWorkspaceResponse,
  GetWorkspaceSnapshotResponse,
  GetWorkspacesResponse,
  SaveWorkspaceSnapshotResponse,
  WorkspaceSnapshotPayload,
} from "../types/workspace";
import apiClient from "./axios";

const WORKSPACE_ENDPOINTS = {
  workspaces: "/workspaces",
} as const;

const workspaceById = (workspaceId: string) =>
  `${WORKSPACE_ENDPOINTS.workspaces}/${workspaceId}`;

const workspaceSnapshotById = (workspaceId: string) =>
  `${workspaceById(workspaceId)}/snapshot`;

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

export async function getWorkspace(
  workspaceId: string,
): Promise<GetWorkspaceResponse> {
  const { data } = await apiClient.get<GetWorkspaceResponse>(
    workspaceById(workspaceId),
    getAuthHeaders(),
  );

  return data;
}

export async function getWorkspaceSnapshot(
  workspaceId: string,
): Promise<GetWorkspaceSnapshotResponse> {
  const { data } = await apiClient.get<GetWorkspaceSnapshotResponse>(
    workspaceSnapshotById(workspaceId),
    getAuthHeaders(),
  );

  return data;
}

export async function saveWorkspaceSnapshot(
  workspaceId: string,
  snapshot: WorkspaceSnapshotPayload,
): Promise<SaveWorkspaceSnapshotResponse> {
  const { data } = await apiClient.put<SaveWorkspaceSnapshotResponse>(
    workspaceSnapshotById(workspaceId),
    { snapshot },
    getAuthHeaders(),
  );

  return data;
}
