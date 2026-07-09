import type { Request, Response } from "express";

import { ApiError } from "../../shared/errors/api-error.js";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { workspaceService } from "./workspace.service.js";

const createWorkspace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const workspace = await workspaceService.createWorkspace(req.user.userId, req.body);

    res.status(201).json({
        success: true,
        data: workspace,
    });
});

const getWorkspaces = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const workspaces = await workspaceService.getWorkspaces(req.user.userId);

    res.status(200).json({
        success: true,
        data: workspaces,
    });
});

const getWorkspaceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const workspaceId = req.params.workspaceId;

    if (typeof workspaceId !== "string" || !workspaceId) {
        throw new ApiError(404, "Workspace not found");
    }

    const workspace = await workspaceService.getWorkspaceById(
        req.user.userId,
        workspaceId,
    );

    res.status(200).json({
        success: true,
        data: workspace,
    });
});

export const workspaceController = {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
};
