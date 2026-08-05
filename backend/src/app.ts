import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./shared/middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
    cors({
        origin: frontendUrl.includes(",") ? frontendUrl.split(",").map(url => url.trim()) : frontendUrl,
        credentials: true,
    })
);

app.use(cookieParser());

app.use(express.json({ limit: "5mb" }));

app.use(routes);

app.use(errorHandler);

export default app;