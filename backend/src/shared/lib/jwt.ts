import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { env } from "../../config/env.js";

export type AccessTokenPayload = {
    userId: string;
};

const isAccessTokenPayload = (
    payload: jwt.JwtPayload | string,
): payload is jwt.JwtPayload & AccessTokenPayload => {
    return typeof payload === "object" && payload !== null && typeof payload.userId === "string";
};

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
    });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (!isAccessTokenPayload(payload)) {
        throw new Error("Invalid access token payload");
    }

    return { userId: payload.userId };
};
