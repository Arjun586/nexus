import type { Workspace } from "@prisma/client";

import { prisma } from "../../shared/lib/prisma.js";

type CreateWorkspaceData = {
    name: string;
    ownerId: string;
};

const createWorkspace = async (data: CreateWorkspaceData): Promise<Workspace> => {
    return prisma.workspace.create({ data });
};

const findWorkspacesByOwnerId = async (ownerId: string): Promise<Workspace[]> => {
    return prisma.workspace.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
    });
};

const findWorkspaceByIdAndOwnerId = async (
    id: string,
    ownerId: string,
): Promise<Workspace | null> => {
    return prisma.workspace.findFirst({
        where: { id, ownerId },
    });
};

export const workspaceRepository = {
    createWorkspace,
    findWorkspacesByOwnerId,
    findWorkspaceByIdAndOwnerId,
};
