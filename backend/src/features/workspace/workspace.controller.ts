import type { Request, Response } from "express";

import { ApiError } from "../../shared/errors/api-error.js";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { workspaceService } from "./workspace.service.js";

const requireWorkspaceId = (req: Request): string => {
    const workspaceId = req.params.workspaceId;

    if (typeof workspaceId !== "string" || !workspaceId) {
        throw new ApiError(404, "Workspace not found");
    }

    return workspaceId;
};

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

    const workspace = await workspaceService.getWorkspaceById(
        req.user.userId,
        requireWorkspaceId(req),
    );

    res.status(200).json({
        success: true,
        data: workspace,
    });
});

const getSnapshot = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const snapshot = await workspaceService.getSnapshot(
        req.user.userId,
        requireWorkspaceId(req),
    );

    res.status(200).json({
        success: true,
        data: snapshot,
    });
});

const saveSnapshot = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const snapshot = await workspaceService.saveSnapshot(
        req.user.userId,
        requireWorkspaceId(req),
        req.body,
    );

    res.status(200).json({
        success: true,
        data: snapshot,
    });
});

export const workspaceController = {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getSnapshot,
    saveSnapshot,
};
