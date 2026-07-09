import { Router } from "express";
import authRoutes from "../features/auth/auth.route.js";
import workspaceRoutes from "../features/workspace/workspace.route.js";

const router = Router();

router.get("/health", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});


router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);

export default router;