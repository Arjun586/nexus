import type { Request, Response } from "express";

import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { authService } from "./auth.service.js";

const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});

export const authController = {
    register,
};
