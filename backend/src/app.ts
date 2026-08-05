import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./shared/middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""));

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.replace(/\/$/, "");
            if (allowedOrigins.includes(cleanOrigin)) {
                return callback(null, true);
            }
            return callback(null, cleanOrigin);
        },
        credentials: true,
    })
);

app.use(cookieParser());

app.use(express.json({ limit: "5mb" }));

app.use(routes);

app.use(errorHandler);

export default app;