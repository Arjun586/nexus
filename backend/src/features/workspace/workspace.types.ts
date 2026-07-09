import type { z } from "zod";

import type { createWorkspaceSchema } from "./workspace.validation.js";

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export type Workspace = {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
};
