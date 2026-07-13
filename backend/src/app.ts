import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./shared/middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(cookieParser());

app.use(express.json({ limit: "5mb" }));

app.use(routes);

app.use(errorHandler);

export default app;