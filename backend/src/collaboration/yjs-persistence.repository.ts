import { prisma } from "../shared/lib/prisma.js";

export const loadYjsState = async ( workspaceId: string, ): Promise<Uint8Array | null> => {
    const workspace = await prisma.workspace.findUnique({
        where: {
                id: workspaceId,
            },
            select: {
                yjsState: true,
            },
    });

    if (!workspace?.yjsState) {
        return null;
    }

    return new Uint8Array(workspace.yjsState);
};

export const saveYjsState = async (workspaceId: string, state: Uint8Array, ): Promise<void> => {
    await prisma.workspace.update({
        where: {
            id: workspaceId,
        },
        data: {
            yjsState: Buffer.from(state),
        },
    });
};