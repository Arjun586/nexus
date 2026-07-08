import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./shared/middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());

app.use(cookieParser());

app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;