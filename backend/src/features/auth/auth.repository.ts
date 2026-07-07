import type { Prisma, User } from "@prisma/client";

import { prisma } from "../../shared/lib/prisma.js";

const findUserByEmail = async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { email },
    });
};

const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
    return prisma.user.create({ data });
};

export const authRepository = {
    findUserByEmail,
    createUser,
};
