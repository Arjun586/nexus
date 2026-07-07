import express from "express";
import cors from "cors";

import { errorHandler } from "./shared/middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;