import { Router } from "express";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/middleware/validate.js";
import { workspaceController } from "./workspace.controller.js";
import {
    createWorkspaceSchema,
    saveSnapshotSchema,
} from "./workspace.validation.js";

const router = Router();

router.post(
    "/",
    authenticate,
    validate(createWorkspaceSchema),
    workspaceController.createWorkspace,
);

router.get("/", authenticate, workspaceController.getWorkspaces);

router.get(
    "/:workspaceId/snapshot",
    authenticate,
    workspaceController.getSnapshot,
);

router.put(
    "/:workspaceId/snapshot",
    authenticate,
    validate(saveSnapshotSchema),
    workspaceController.saveSnapshot,
);

router.get("/:workspaceId", authenticate, workspaceController.getWorkspaceById);

export default router;
