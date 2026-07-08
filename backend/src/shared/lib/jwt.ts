import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { env } from "../../config/env.js";

export type TokenPayload = {
    userId: string;
    email: string;
};

export type AccessTokenPayload = TokenPayload;

export type RefreshTokenPayload = TokenPayload;

const isTokenPayload = (
    payload: jwt.JwtPayload | string,
): payload is jwt.JwtPayload & TokenPayload => {
    return (
        typeof payload === "object"
        && payload !== null
        && typeof payload.userId === "string"
        && typeof payload.email === "string"
    );
};

const signToken = (
    payload: TokenPayload,
    secret: string,
    expiresIn: string,
): string => {
    return jwt.sign(payload, secret, {
        expiresIn: expiresIn as StringValue,
    });
};

const verifyToken = (token: string, secret: string): TokenPayload => {
    const payload = jwt.verify(token, secret);

    if (!isTokenPayload(payload)) {
        throw new Error("Invalid token payload");
    }

    return {
        userId: payload.userId,
        email: payload.email,
    };
};

export const generateAccessToken = (payload: TokenPayload): string => {
    return signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return verifyToken(token, env.JWT_ACCESS_SECRET);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return verifyToken(token, env.JWT_REFRESH_SECRET);
};
