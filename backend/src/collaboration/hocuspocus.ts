import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

import { loadYjsState, saveYjsState, } from "./yjs-persistence.repository.js";
import { verifyAccessToken } from "../shared/lib/jwt.js";
import { workspaceRepository } from "../features/workspace/workspace.repository.js";

export const hocuspocus = new Server({
    name: "nexus-collaboration",

    async onAuthenticate({ token, documentName }) {
        if (!token) {
            throw new Error("Authentication required");
        }

        let payload;

        try {
            payload = verifyAccessToken(token);
        } catch {
            throw new Error("Invalid access token");
        }

        const membership = await workspaceRepository.findMembership(
            documentName,
            payload.userId,
        );

        if (!membership) {
            throw new Error("Not a member of this workspace");
        }

        return {
            context: {
                userId: payload.userId,
                email: payload.email,
                workspaceId: documentName,
                role: membership.role,
            },
        };
    },

    async onConnect({ documentName }) {
        console.log(
            `[Hocuspocus] Client connected to document: ${documentName}`,
        );
    },


    async onLoadDocument({ documentName, document }) {
        console.log(`[Hocuspocus] Loading document: ${documentName}`,);

        const savedState = await loadYjsState(documentName);

        if (!savedState) {
            console.log(
                `[Hocuspocus] No persisted state for: ${documentName}`,
            );

            return document;
        }

        Y.applyUpdate(document, savedState);

        console.log(
            `[Hocuspocus] Restored document: ${documentName}`,
        );

        return document;
    },

    async onStoreDocument({ documentName, document }) {
        console.log(
            `[Hocuspocus] Storing document: ${documentName}`,
        );

        const state = Y.encodeStateAsUpdate(document);

        await saveYjsState(documentName, state);

        console.log(
            `[Hocuspocus] Stored document: ${documentName}`,
        );
    },
});