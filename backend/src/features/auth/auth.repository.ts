import type { Prisma, RefreshToken, User } from "@prisma/client";

import { prisma } from "../../shared/lib/prisma.js";

const findUserByEmail = async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { email },
    });
};

const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
    return prisma.user.create({ data });
};

type CreateRefreshTokenData = {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
};

const createRefreshToken = async (data: CreateRefreshTokenData): Promise<RefreshToken> => {
    return prisma.refreshToken.create({ data });
};

const findRefreshToken = async (tokenHash: string): Promise<RefreshToken | null> => {
    return prisma.refreshToken.findUnique({
        where: { tokenHash },
    });
};

const revokeRefreshToken = async (id: string): Promise<RefreshToken> => {
    return prisma.refreshToken.update({
        where: { id },
        data: { revokedAt: new Date() },
    });
};

export const authRepository = {
    findUserByEmail,
    createUser,
    createRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
};
