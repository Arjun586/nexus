import rateLimit, { type Options } from "express-rate-limit";

const createRateLimiter = (options: Partial<Options>) => {
    return rateLimit({
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests, please try again later",
        },
        ...options,
    });
};

export const registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
});

export const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
});

export const refreshLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
});

export const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
