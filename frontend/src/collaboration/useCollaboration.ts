import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { getAccessToken } from "../session/access-token";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface CollaborationState {
  doc: Y.Doc;
  provider: HocuspocusProvider;
  status: ConnectionStatus;
}

const HOCUSPOCUS_WS_URL = "ws://localhost:1234";

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

    const accessToken = getAccessToken();

    const provider = new HocuspocusProvider({
      url: HOCUSPOCUS_WS_URL,
      name: workspaceId,
      document: doc,
      token: accessToken || "",

      onConnect: () => {
        setState({ doc, provider, status: "connected" });
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
