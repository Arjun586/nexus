import "dotenv/config";
import { createServer } from "node:http";

import app from "./app.js";
import { hocuspocus } from "./collaboration/hocuspocus.js";
import { env } from "./config/env.js";

const httpServer = createServer(app);

// Forward WebSocket upgrade requests to Hocuspocus's own httpServer,
// which has crossws wired up correctly for token extraction and auth.
httpServer.on("upgrade", (request, socket, head) => {
    hocuspocus.httpServer.emit("upgrade", request, socket, head);
});

httpServer.listen(env.PORT, () => {
    console.log(`Nexus Backend (HTTP & WebSockets) running on port ${env.PORT}`);
});