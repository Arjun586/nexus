import type { Prisma } from "@prisma/client";
import type { z } from "zod";

import type {
    createWorkspaceSchema,
    renameWorkspaceSchema,
    saveSnapshotSchema,
} from "./workspace.validation.js";

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type SaveSnapshotInput = z.infer<typeof saveSnapshotSchema>;
export type RenameWorkspaceInput = z.infer<typeof renameWorkspaceSchema>;

export type Workspace = {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type WorkspaceSnapshot = {
    snapshot: Prisma.JsonValue | null;
};
