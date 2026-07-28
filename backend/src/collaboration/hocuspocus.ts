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

    async onLoadDocument({ documentName, document }) {
        const savedState = await loadYjsState(documentName);

        if (!savedState) {
            return document;
        }

        Y.applyUpdate(document, savedState);

        return document;
    },

    async onStoreDocument({ documentName, document }) {
        const state = Y.encodeStateAsUpdate(document);

        await saveYjsState(documentName, state);
    },
});