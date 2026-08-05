import "dotenv/config";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

import app from "./app.js";
import { hocuspocus } from "./collaboration/hocuspocus.js";
import { env } from "./config/env.js";

const httpServer = createServer(app);

const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        hocuspocus.hocuspocus.handleConnection(ws, request as any);
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`Nexus Backend (HTTP & WebSockets) running on port ${env.PORT}`);
});