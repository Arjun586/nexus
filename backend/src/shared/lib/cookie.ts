import type { CookieOptions } from "express";
import ms from "ms";
import type { StringValue } from "ms";

import { env } from "../../config/env.js";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const getBaseRefreshTokenCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        path: "/auth",
    };
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
    return {
        ...getBaseRefreshTokenCookieOptions(),
        maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
    };
};

export const getRefreshTokenClearCookieOptions = (): CookieOptions => {
    return getBaseRefreshTokenCookieOptions();
};
