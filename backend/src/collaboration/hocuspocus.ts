import { Server } from "@hocuspocus/server";

export const hocuspocus = new Server({
    name: "nexus-collaboration",

    async onConnect({ documentName }) {
        console.log(
            `[Hocuspocus] Client connected to document: ${documentName}`,
        );
    },
});