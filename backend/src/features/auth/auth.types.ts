import type { z } from "zod";

import type { loginSchema, registerSchema } from "./auth.validation.js";

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type SafeUser = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};

export type LoginResult = {
    user: SafeUser;
    accessToken: string;
    refreshToken: string;
};

export type RefreshResult = {
    accessToken: string;
};
