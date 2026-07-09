import { ApiError } from "../../shared/errors/api-error.js";
import { workspaceRepository } from "./workspace.repository.js";
import type { CreateWorkspaceInput, Workspace } from "./workspace.types.js";

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

export const workspaceService = {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
};
