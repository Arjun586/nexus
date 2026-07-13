import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1)
        .max(100),
});

export const saveSnapshotSchema = z.object({
    snapshot: z.object({}).passthrough(),
});
