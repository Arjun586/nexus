import type { Prisma } from "@prisma/client";

import { ApiError } from "../../shared/errors/api-error.js";
import { workspaceRepository } from "./workspace.repository.js";
import type {
    CreateWorkspaceInput,
    RenameWorkspaceInput,
    SaveSnapshotInput,
    Workspace,
    WorkspaceSnapshot,
} from "./workspace.types.js";

const createWorkspace = async (
    ownerId: string,
    input: CreateWorkspaceInput,
): Promise<Workspace> => {
    return workspaceRepository.createWorkspace({
        name: input.name,
        ownerId,
    });
};

const getWorkspaces = async (ownerId: string): Promise<Workspace[]> => {
    return workspaceRepository.findWorkspacesByOwnerId(ownerId);
};

const getWorkspaceById = async (
    ownerId: string,
    workspaceId: string,
): Promise<Workspace> => {
    const workspace = await workspaceRepository.findWorkspaceByIdAndOwnerId(
        workspaceId,
        ownerId,
    );

    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    return workspace;
};

const getSnapshot = async (
    ownerId: string,
    workspaceId: string,
): Promise<WorkspaceSnapshot> => {
    const result = await workspaceRepository.getSnapshot(workspaceId, ownerId);

    if (!result) {
        throw new ApiError(404, "Workspace not found");
    }

    return { snapshot: result.snapshot };
};

const saveSnapshot = async (
    ownerId: string,
    workspaceId: string,
    input: SaveSnapshotInput,
): Promise<WorkspaceSnapshot> => {
    const result = await workspaceRepository.saveSnapshot(
        workspaceId,
        ownerId,
        input.snapshot as Prisma.InputJsonValue,
    );

    if (!result) {
        throw new ApiError(404, "Workspace not found");
    }

    return { snapshot: result.snapshot };
};

const renameWorkspace = async (
    ownerId: string,
    workspaceId: string,
    input: RenameWorkspaceInput,
): Promise<Workspace> => {
    const result = await workspaceRepository.renameWorkspace(
        workspaceId,
        ownerId,
        input.name,
    );

    if (!result) {
        throw new ApiError(404, "Workspace not found");
    }

    return result;
};

const deleteWorkspace = async (
    ownerId: string,
    workspaceId: string,
): Promise<void> => {
    const deleted = await workspaceRepository.deleteWorkspace(
        workspaceId,
        ownerId,
    );

    if (!deleted) {
        throw new ApiError(404, "Workspace not found");
    }
};

export const workspaceService = {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getSnapshot,
    saveSnapshot,
    renameWorkspace,
    deleteWorkspace,
};
