import type { ErrorRequestHandler } from "express";

import { ApiError } from "../errors/api-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
