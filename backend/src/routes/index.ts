import { Router } from "express";
import { apiLimiter } from "../shared/middleware/rate-limiter.js";
import authRoutes from "../features/auth/auth.route.js";
import workspaceRoutes from "../features/workspace/workspace.route.js";

const router = Router();

router.use(apiLimiter);

router.get("/health", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});


router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);

export default router;