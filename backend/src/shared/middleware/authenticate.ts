import type { RequestHandler } from "express";

import { verifyAccessToken } from "../lib/jwt.js";

const BEARER_PREFIX = "Bearer ";

export const authenticate: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }

    try {
        req.user = verifyAccessToken(token);
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid access token",
        });
    }
};
