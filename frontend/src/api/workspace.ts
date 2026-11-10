import type {
  GetCollaboratorsResponse,
  InviteCollaboratorInput,
  InviteCollaboratorResponse,
} from "../types/collaborator";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceResponse,
  DeleteWorkspaceResponse,
  GetWorkspaceResponse,
  GetWorkspaceSnapshotResponse,
  GetWorkspacesResponse,
  RenameWorkspaceInput,
  RenameWorkspaceResponse,
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

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<CreateWorkspaceResponse> {
  const { data } = await apiClient.post<CreateWorkspaceResponse>(
    WORKSPACE_ENDPOINTS.workspaces,
    input,
  );

  return data;
}

export async function getWorkspaces(): Promise<GetWorkspacesResponse> {
  const { data } = await apiClient.get<GetWorkspacesResponse>(
    WORKSPACE_ENDPOINTS.workspaces,
  );

  return data;
}

export async function getWorkspace(
  workspaceId: string,
): Promise<GetWorkspaceResponse> {
  const { data } = await apiClient.get<GetWorkspaceResponse>(
    workspaceById(workspaceId),
  );

  return data;
}

export async function getWorkspaceSnapshot(
  workspaceId: string,
): Promise<GetWorkspaceSnapshotResponse> {
  const { data } = await apiClient.get<GetWorkspaceSnapshotResponse>(
    workspaceSnapshotById(workspaceId),
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
  );

  return data;
}

export async function renameWorkspace(
  workspaceId: string,
  input: RenameWorkspaceInput,
): Promise<RenameWorkspaceResponse> {
  const { data } = await apiClient.patch<RenameWorkspaceResponse>(
    workspaceById(workspaceId),
    input,
  );

  return data;
}

export async function deleteWorkspace(
  workspaceId: string,
): Promise<DeleteWorkspaceResponse> {
  const { data } = await apiClient.delete<DeleteWorkspaceResponse>(
    workspaceById(workspaceId),
  );

  return data;
}

export async function getCollaborators(
  workspaceId: string,
): Promise<GetCollaboratorsResponse> {
  const { data } = await apiClient.get<GetCollaboratorsResponse>(
    `${workspaceById(workspaceId)}/members`,
  );

  return data;
}

export async function inviteCollaborator(
  workspaceId: string,
  input: InviteCollaboratorInput,
): Promise<InviteCollaboratorResponse> {
  const { data } = await apiClient.post<InviteCollaboratorResponse>(
    `${workspaceById(workspaceId)}/members`,
    input,
  );

  return data;
}
