import type { Prisma } from "@prisma/client";
import { WorkspaceRole } from "@prisma/client";

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

type AddMemberData = {
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
};

const memberSelect = {
    id: true,
    role: true,
    createdAt: true,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
} satisfies Prisma.MembershipSelect;


type WorkspaceMember = Prisma.MembershipGetPayload<{
    select: typeof memberSelect;
}>;

const createWorkspace = async (
    data: CreateWorkspaceData,
): Promise<WorkspaceMetadata> => {
    return prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
            data,
            select: workspaceMetadataSelect,
        });

        await tx.membership.create({
            data: {
                userId: data.ownerId,
                workspaceId: workspace.id,
                role: WorkspaceRole.OWNER,
            },
        });

        return workspace;
    });
};

const findWorkspacesByOwnerId = async (
    userId: string,
): Promise<WorkspaceMetadata[]> => {
    return prisma.workspace.findMany({
        where: {
            OR: [
                { ownerId: userId },
                { memberships: { some: { userId } } },
            ],
        },
        orderBy: { createdAt: "desc" },
        select: workspaceMetadataSelect,
    });
};

const findWorkspaceByIdAndOwnerId = async (
    id: string,
    userId: string,
): Promise<WorkspaceMetadata | null> => {
    return prisma.workspace.findFirst({
        where: {
            id,
            OR: [
                { ownerId: userId },
                { memberships: { some: { userId } } },
            ],
        },
        select: workspaceMetadataSelect,
    });
};

const getSnapshot = async (
    workspaceId: string,
    userId: string,
): Promise<{ snapshot: Prisma.JsonValue | null } | null> => {
    return prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            OR: [
                { ownerId: userId },
                { memberships: { some: { userId } } },
            ],
        },
        select: { snapshot: true },
    });
};

const saveSnapshot = async (
    workspaceId: string,
    userId: string,
    snapshot: Prisma.InputJsonValue,
): Promise<{ snapshot: Prisma.JsonValue | null } | null> => {
    const accessible = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            OR: [
                { ownerId: userId },
                { memberships: { some: { userId } } },
            ],
        },
        select: { id: true },
    });

    if (!accessible) {
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
    userId: string,
    name: string,
): Promise<WorkspaceMetadata | null> => {
    const accessible = await findWorkspaceByIdAndOwnerId(workspaceId, userId);

    if (!accessible) {
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
    const owned = await prisma.workspace.findFirst({
        where: { id: workspaceId, ownerId },
        select: { id: true },
    });

    if (!owned) {
        return false;
    }

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    return true;
};


const addMember = async (
    data: AddMemberData,
): Promise<WorkspaceMember> => {
    return prisma.membership.create({
        data,
        select: memberSelect,
    });
};


const findMembership = async (
    workspaceId: string,
    userId: string,
): Promise<WorkspaceMember | null> => {
    return prisma.membership.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId,
            },
        },
        select: memberSelect,
    });
};


const listMembers = async (
    workspaceId: string,
): Promise<WorkspaceMember[]> => {
    return prisma.membership.findMany({
        where: {
            workspaceId,
        },
        select: memberSelect,
        orderBy: {
            createdAt: "asc",
        },
    });
};

const findWorkspaceById = async (
    workspaceId: string,
): Promise<WorkspaceMetadata | null> => {
    return prisma.workspace.findUnique({
        where: {
            id: workspaceId,
        },
        select: workspaceMetadataSelect,
    });
};

export const workspaceRepository = {
    createWorkspace,
    findWorkspacesByOwnerId,
    findWorkspaceByIdAndOwnerId,
    getSnapshot,
    saveSnapshot,
    renameWorkspace,
    deleteWorkspace,
    addMember,
    findMembership,
    listMembers,
    findWorkspaceById,
};

export type {
    WorkspaceMetadata,
    WorkspaceMember,
    AddMemberData,
};
