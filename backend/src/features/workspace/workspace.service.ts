import { Prisma, WorkspaceRole, } from "@prisma/client";

import { ApiError } from "../../shared/errors/api-error.js";
import { workspaceRepository } from "./workspace.repository.js";
import type { WorkspaceMember } from "./workspace.repository.js";
import type {
    CreateWorkspaceInput,
    RenameWorkspaceInput,
    SaveSnapshotInput,
    Workspace,
    WorkspaceSnapshot,
} from "./workspace.types.js";
import { prisma } from "../../shared/lib/prisma.js";

const createWorkspace = async (
    ownerId: string,
    input: CreateWorkspaceInput,
): Promise<Workspace> => {
    return workspaceRepository.createWorkspace({
        name: input.name,
        ownerId,
    });
};

export type InviteMemberInput = {
    email: string;
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


const inviteMember = async (
    ownerId: string,
    workspaceId: string,
    input: InviteMemberInput,
): Promise<WorkspaceMember> => {
    const workspace = await workspaceRepository.findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    if (workspace.ownerId !== ownerId) {
        throw new ApiError(403, "Only the workspace owner can invite members");
    }
    
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });
    

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.id === ownerId) {
        throw new ApiError(400, "Cannot invite yourself");
    }

    const existingMembership = await workspaceRepository.findMembership(
        workspaceId,
        user.id,
    );

    if (existingMembership) {
        throw new ApiError(409, "User is already a member");
    }

    try {
        return await workspaceRepository.addMember({
            workspaceId,
            userId: user.id,
            role: WorkspaceRole.EDITOR,
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new ApiError(409, "User is already a member");
        }

        throw error;
    }
};

const getMembers = async (
    userId: string,
    workspaceId: string,
): Promise<WorkspaceMember[]> => {
    const workspace = await workspaceRepository.findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    const membership = await workspaceRepository.findMembership(workspaceId, userId);

    if (!membership && workspace.ownerId !== userId) {
        throw new ApiError(
            403,
            "Only workspace members can view members",
        );
    }

    return workspaceRepository.listMembers(workspaceId);
};

export const workspaceService = {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getSnapshot,
    saveSnapshot,
    renameWorkspace,
    deleteWorkspace,
    inviteMember,
    getMembers,
};
