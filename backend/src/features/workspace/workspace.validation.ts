import { z } from "zod";

const workspaceName = z
    .string()
    .trim()
    .min(1)
    .max(100);

export const createWorkspaceSchema = z.object({
    name: workspaceName,
});

export const saveSnapshotSchema = z.object({
    snapshot: z.object({}).passthrough(),
});

export const renameWorkspaceSchema = z.object({
    name: workspaceName,
});
