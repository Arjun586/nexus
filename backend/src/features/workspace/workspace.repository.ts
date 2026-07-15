import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/lib/prisma.js";

type CreateWorkspaceData = {
    name: string;
    ownerId: string;
};

const workspaceMetadataSelect = {
    id: true,
    name: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.WorkspaceSelect;

type WorkspaceMetadata = Prisma.WorkspaceGetPayload<{
    select: typeof workspaceMetadataSelect;
}>;

const createWorkspace = async (
    data: CreateWorkspaceData,
): Promise<WorkspaceMetadata> => {
    return prisma.workspace.create({
        data,
        select: workspaceMetadataSelect,
    });
};

const findWorkspacesByOwnerId = async (
    ownerId: string,
): Promise<WorkspaceMetadata[]> => {
    return prisma.workspace.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        select: workspaceMetadataSelect,
    });
};

const findWorkspaceByIdAndOwnerId = async (
    id: string,
    ownerId: string,
): Promise<WorkspaceMetadata | null> => {
    return prisma.workspace.findFirst({
        where: { id, ownerId },
        select: workspaceMetadataSelect,
    });
};

const getSnapshot = async (
    workspaceId: string,
    ownerId: string,
): Promise<{ snapshot: Prisma.JsonValue | null } | null> => {
    return prisma.workspace.findFirst({
        where: { id: workspaceId, ownerId },
        select: { snapshot: true },
    });
};

const saveSnapshot = async (
    workspaceId: string,
    ownerId: string,
    snapshot: Prisma.InputJsonValue,
): Promise<{ snapshot: Prisma.JsonValue | null } | null> => {
    const owned = await prisma.workspace.findFirst({
        where: { id: workspaceId, ownerId },
        select: { id: true },
    });

    if (!owned) {
        return null;
    }

    return prisma.workspace.update({
        where: { id: workspaceId },
        data: { snapshot },
        select: { snapshot: true },
    });
};

const renameWorkspace = async (
    workspaceId: string,
    ownerId: string,
    name: string,
): Promise<WorkspaceMetadata | null> => {
    const owned = await findWorkspaceByIdAndOwnerId(workspaceId, ownerId);

    if (!owned) {
        return null;
    }

    return prisma.workspace.update({
        where: { id: workspaceId },
        data: { name },
        select: workspaceMetadataSelect,
    });
};

const deleteWorkspace = async (
    workspaceId: string,
    ownerId: string,
): Promise<boolean> => {
    const owned = await findWorkspaceByIdAndOwnerId(workspaceId, ownerId);

    if (!owned) {
        return false;
    }

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    return true;
};

export const workspaceRepository = {
    createWorkspace,
    findWorkspacesByOwnerId,
    findWorkspaceByIdAndOwnerId,
    getSnapshot,
    saveSnapshot,
    renameWorkspace,
    deleteWorkspace,
};

export type { WorkspaceMetadata };
