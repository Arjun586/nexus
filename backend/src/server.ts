import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";
import { hocuspocus } from "./collaboration/hocuspocus.js";
import { env } from "./config/env.js";

const httpServer = createServer(app);

httpServer.listen(env.PORT, () => {
    console.log(`HTTP server running on port ${env.PORT}`);
});

hocuspocus.listen(1234).then(() => {
    console.log("Hocuspocus running on port 1234");
});