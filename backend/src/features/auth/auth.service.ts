import argon2 from "argon2";

import { ApiError } from "../../shared/errors/api-error.js";
import { env } from "../../config/env.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../shared/lib/jwt.js";
import { hashRefreshToken } from "../../shared/lib/refresh-token.js";
import { authRepository } from "./auth.repository.js";
import type { RegisterInput, LoginInput, LoginResult, RefreshResult, SafeUser } from "./auth.types.js";
import ms from "ms";
import type { StringValue } from "ms";

const toSafeUser = ({
    id,
    name,
    email,
    createdAt,
    updatedAt,
}: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}): SafeUser => ({
    id,
    name,
    email,
    createdAt,
    updatedAt,
});

const register = async (input: RegisterInput): Promise<SafeUser> => {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await authRepository.createUser({
        name: input.name,
        email: input.email,
        passwordHash,
    });

    return toSafeUser(user);
};

const login = async (input: LoginInput): Promise<LoginResult> => {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const safeUser = toSafeUser(user);
    const tokenPayload = {
        userId: safeUser.id,
        email: safeUser.email,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await authRepository.createRefreshToken({
        userId: safeUser.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN as StringValue)),
    });

    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };
};

const refresh = async (refreshToken: string): Promise<RefreshResult> => {
    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new ApiError(401, "Invalid refresh token");
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await authRepository.findRefreshToken(tokenHash);

    if (
        !storedToken
        || storedToken.revokedAt !== null
        || storedToken.expiresAt <= new Date()
        || storedToken.userId !== payload.userId
    ) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = generateAccessToken({
        userId: payload.userId,
        email: payload.email,
    });

    return { accessToken };
};

const logout = async (refreshToken: string): Promise<void> => {
    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new ApiError(401, "Invalid refresh token");
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await authRepository.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.userId !== payload.userId) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (storedToken.revokedAt === null) {
        await authRepository.revokeRefreshToken(storedToken.id);
    }
};

export const authService = {
    register,
    login,
    refresh,
    logout,
};
