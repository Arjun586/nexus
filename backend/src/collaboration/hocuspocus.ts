import { Server } from "@hocuspocus/server";
import * as Y from "yjs";

import { loadYjsState, saveYjsState } from "./yjs-persistence.repository.js";
import { verifyAccessToken } from "../shared/lib/jwt.js";
import { workspaceRepository } from "../features/workspace/workspace.repository.js";

export const hocuspocus = new Server({
    name: "nexus-collaboration",

    // Ensure document is fully saved before being unloaded from memory
    unloadImmediately: false,

    // Debounce saves: persist after 2s of inactivity, but at least every 10s
    debounce: 2000,
    maxDebounce: 10000,

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
        try {
            console.log(`[Hocuspocus] Loading document: ${documentName}`);
            const savedState = await loadYjsState(documentName);

            if (!savedState) {
                console.log(`[Hocuspocus] No saved state for: ${documentName}`);
                return document;
            }

            Y.applyUpdate(document, savedState);
            console.log(`[Hocuspocus] Loaded state for: ${documentName} (${savedState.byteLength} bytes)`);
            return document;
        } catch (error) {
            console.error(`[Hocuspocus] Failed to load document ${documentName}:`, error);
            return document;
        }
    },

    async onStoreDocument({ documentName, document }) {
        try {
            const state = Y.encodeStateAsUpdate(document);
            await saveYjsState(documentName, state);
            console.log(`[Hocuspocus] Saved state for: ${documentName} (${state.byteLength} bytes)`);
        } catch (error) {
            console.error(`[Hocuspocus] Failed to save document ${documentName}:`, error);
        }
    },
});