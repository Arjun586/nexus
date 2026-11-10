import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { getValidAccessToken, refreshSession } from "../session/session";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface CollaborationState {
  doc: Y.Doc;
  provider: HocuspocusProvider;
  status: ConnectionStatus;
}

const HOCUSPOCUS_WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:3000";

/**
 * Connects to the Hocuspocus server for a given workspace.
 *
 * Creates a Y.Doc and HocuspocusProvider scoped to `workspaceId`.
 * Cleans up both when the workspace changes or the component unmounts.
 */
export function useCollaboration(
  workspaceId: string | undefined,
): CollaborationState | null {
  const [state, setState] = useState<CollaborationState | null>(null);

  // Track the workspaceId that is currently wired up so we can skip the
  // redundant teardown/setup that React Strict Mode's double-invoke causes.
  const activeIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!workspaceId) {
      activeIdRef.current = undefined;
      queueMicrotask(() => setState(null));
      return;
    }

    // Strict Mode guard: if we already set up for this exact workspaceId, skip.
    if (activeIdRef.current === workspaceId) {
      return;
    }

    activeIdRef.current = workspaceId;

    const doc = new Y.Doc();

    // Hocuspocus calls the token callback on every connect/reconnect, so a
    // reconnect after the access token expires gets refreshed automatically.
    let authFailures = 0;

    const provider = new HocuspocusProvider({
      url: HOCUSPOCUS_WS_URL,
      name: workspaceId,
      document: doc,
      token: async () => (await getValidAccessToken()) ?? "",

      onConnect: () => {
        authFailures = 0;
        setState({ doc, provider, status: "connected" });
      },
      onAuthenticationFailed: () => {
        authFailures += 1;

        // The cached token may have been rejected (e.g. server restarted or
        // membership changed). Refresh it before the next reconnect attempt.
        if (authFailures <= 2) {
          void refreshSession();
        }
      },
      onStatus: ({ status }) => {
        setState((prev) =>
          prev ? { ...prev, status: status as ConnectionStatus } : null,
        );
      },
      onDisconnect: () => {
        setState((prev) =>
          prev ? { ...prev, status: "disconnected" } : null,
        );
      },
    });

    queueMicrotask(() => {
      setState({ doc, provider, status: "connecting" });
    });

    return () => {
      // Only tear down if this cleanup corresponds to the *current* workspace.
      // When React Strict Mode double-invokes, the second effect's cleanup
      // should not destroy the connection that the third invocation created.
      if (activeIdRef.current === workspaceId) {
        activeIdRef.current = undefined;
      }

      provider.destroy();
      doc.destroy();
      queueMicrotask(() => setState(null));
    };
  }, [workspaceId]);

  return state;
}
