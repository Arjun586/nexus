import { Router } from "express";
import authRoutes from "../features/auth/auth.route.js"

const router = Router();

router.get("/health", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});


router.use("/auth", authRoutes);

export default router;