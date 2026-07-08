import type { Request, Response } from "express";

import { ApiError } from "../../shared/errors/api-error.js";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions, getRefreshTokenCookieOptions } from "../../shared/lib/cookie.js";
import { authService } from "./auth.service.js";

const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});

const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken, ...data } = await authService.login(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
        success: true,
        message: "Login successful",
        data,
    });
});

const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken || typeof refreshToken !== "string") {
        throw new ApiError(401, "Invalid refresh token");
    }

    const data = await authService.refresh(refreshToken);

    res.status(200).json({
        success: true,
        data,
    });
});

const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken || typeof refreshToken !== "string") {
        throw new ApiError(401, "Invalid refresh token");
    }

    await authService.logout(refreshToken);

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions());

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});

export const authController = {
    register,
    login,
    refresh,
    logout,
};
