import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Tldraw, type Editor, type TLRecord } from "tldraw";
import "tldraw/tldraw.css";
import * as Y from "yjs";

import type { CollaborationState } from "../../collaboration/useCollaboration";
import { useTheme } from "../../utils/theme";

interface WhiteboardProps {
  collabState: CollaborationState | null;
}

const TLDRAW_ORIGIN = Symbol("tldraw");

const Whiteboard = ({ collabState }: WhiteboardProps) => {
  const { isDark } = useTheme();
  const editorRef = useRef<Editor | null>(null);

  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((mountedEditor: Editor) => {
    editorRef.current = mountedEditor;
    setEditor(mountedEditor);

    const dark = document.documentElement.classList.contains("dark");
    try {
      mountedEditor.user.updateUserPreferences({
        colorScheme: dark ? "dark" : "light",
      });
    } catch {
      // Safe fallback
    }

    try {
      const container = mountedEditor.getContainer();
      if (container) {
        container.setAttribute("data-color-mode", dark ? "dark" : "light");
        if (dark) {
          container.classList.remove("tl-theme__light");
          container.classList.add("tl-theme__dark");
        } else {
          container.classList.remove("tl-theme__dark");
          container.classList.add("tl-theme__light");
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Synchronize tldraw dark mode with Nexus application theme
  useEffect(() => {
    if (!editor) return;

    const syncColorMode = () => {
      const currentDark = document.documentElement.classList.contains("dark");
      try {
        editor.user.updateUserPreferences({
          colorScheme: currentDark ? "dark" : "light",
        });
      } catch {
        // Safe fallback
      }

      try {
        const container = editor.getContainer();
        if (container) {
          container.setAttribute("data-color-mode", currentDark ? "dark" : "light");
          if (currentDark) {
            container.classList.remove("tl-theme__light");
            container.classList.add("tl-theme__dark");
          } else {
            container.classList.remove("tl-theme__dark");
            container.classList.add("tl-theme__light");
          }
        }
      } catch {
        // Safe fallback
      }
    };

    syncColorMode();
    window.addEventListener("nexus-theme-change", syncColorMode);
    return () => window.removeEventListener("nexus-theme-change", syncColorMode);
  }, [editor, isDark]);

  useEffect(() => {
    if (!editor || !collabState) {
      return;
    }

    if (collabState.status !== "connected") {
      return;
    }

    const { doc } = collabState;

    const yMap = doc.getMap<TLRecord>("tldraw-records");

    const handleYjsChange = (event: Y.YMapEvent<TLRecord>, transaction: Y.Transaction) => {
      if (transaction.origin === TLDRAW_ORIGIN) {
        return;
      }

      const recordsToPut: TLRecord[] = [];
      const recordIdsToRemove: TLRecord["id"][] = [];

      event.changes.keys.forEach((change, recordId) => {
        if (change.action === "add" || change.action === "update") {
          const record = yMap.get(recordId);

          if (record) {
            recordsToPut.push(record);
          }

          return;
        }

        if (change.action === "delete") {
          recordIdsToRemove.push(recordId as TLRecord["id"]);
        }
      });

      editor.store.mergeRemoteChanges(() => {
        if (recordsToPut.length > 0) {
          editor.store.put(recordsToPut);
        }

        if (recordIdsToRemove.length > 0) {
          editor.store.remove(recordIdsToRemove);
        }
      });
    };

    yMap.observe(handleYjsChange);

    const initialRecords = Array.from(yMap.values());

    if (initialRecords.length > 0) {
      editor.store.mergeRemoteChanges(() => {
        editor.store.put(initialRecords);
      });
    }

    const unsubscribeStore = editor.store.listen(
      (entry) => {
        if (entry.source === "remote") {
          return;
        }

        doc.transact(() => {
          Object.values(entry.changes.added).forEach((record) => {
            yMap.set(record.id, record);
          });

          Object.values(entry.changes.updated).forEach(([, updatedRecord]) => {
            yMap.set(updatedRecord.id, updatedRecord);
          });

          Object.values(entry.changes.removed).forEach((record) => {
            yMap.delete(record.id);
          });
        }, TLDRAW_ORIGIN);
      },
      {
        scope: "document",
      },
    );

    return () => {
      yMap.unobserve(handleYjsChange);
      unsubscribeStore();
    };
  }, [editor, collabState]);

  if (!collabState || collabState.status !== "connected") {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <div className="flex items-center gap-2.5 text-xs text-secondary font-label-md">
          <span className="inline-block animate-spin rounded-full border-2 border-primary border-t-transparent h-4 w-4" />
          <span>Connecting to collaboration server...</span>
        </div>
      </div>
    );
  }

  const licenseKey = import.meta.env.VITE_TLDRAW_LICENSE_KEY;

  return (
    <div
      className={`tldraw__editor relative h-full w-full ${
        isDark ? "tl-theme__dark" : "tl-theme__light"
      }`}
    >
      <Tldraw
        licenseKey={licenseKey}
        onMount={handleMount}
        colorScheme={isDark ? "dark" : "light"}
        className={isDark ? "tl-theme__dark" : "tl-theme__light"}
      />
    </div>
  );
};

export default memo(Whiteboard);