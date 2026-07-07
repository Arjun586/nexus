import argon2 from "argon2";

import { ApiError } from "../../shared/errors/api-error.js";
import { authRepository } from "./auth.repository.js";
import type { RegisterInput, SafeUser } from "./auth.types.js";

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

export const authService = {
    register,
};
