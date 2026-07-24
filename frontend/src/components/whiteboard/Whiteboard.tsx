import { useCallback, useEffect, useRef, useState } from "react";
import {
  Tldraw,
  type Editor,
  type TLRecord,
} from "tldraw";
import "tldraw/tldraw.css";
import * as Y from "yjs";

import type { CollaborationState } from "../../collaboration/useCollaboration";
import useAppColorScheme from "./use-app-color-scheme";

interface WhiteboardProps {
  collabState: CollaborationState | null;
}

/**
 * Unique origin used for tldraw -> Yjs transactions.
 *
 * When our Y.Map observer sees a transaction with this origin,
 * it knows that the change came from this same client and should
 * not be applied back into the tldraw store.
 */
const TLDRAW_ORIGIN = Symbol("tldraw");

const Whiteboard = ({ collabState }: WhiteboardProps) => {
  const colorScheme = useAppColorScheme();

  const editorRef = useRef<Editor | null>(null);

  /**
   * We need state as well as a ref here because setting the editor
   * should trigger the synchronization effect below.
   */
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((mountedEditor: Editor) => {
    editorRef.current = mountedEditor;
    setEditor(mountedEditor);
  }, []);

  /**
   * Establish the tldraw <-> Yjs synchronization bridge.
   *
   * React owns this lifecycle so that all observers/listeners are
   * reliably cleaned up when the workspace changes or unmounts.
   */
  useEffect(() => {
    if (!editor || !collabState) {
      return;
    }

    if (collabState.status !== "connected") {
      return;
    }

    const { doc } = collabState;

    /**
     * The Hocuspocus document itself is already scoped by workspaceId,
     * so we only need one stable map name inside that document.
     */
    const yMap = doc.getMap<TLRecord>("tldraw-records");

    console.log("[Whiteboard Sync] Setting up tldraw <-> Yjs bridge");

    /**
     * ---------------------------------------------------------
     * 1. Yjs -> tldraw
     * ---------------------------------------------------------
     *
     * Runs whenever records in the shared Y.Map change.
     */
    const handleYjsChange = (
      event: Y.YMapEvent<TLRecord>,
      transaction: Y.Transaction,
    ) => {
      /**
       * Ignore transactions created by our own tldraw -> Yjs listener.
       *
       * This prevents:
       *
       * tldraw
       *   -> Yjs
       *   -> tldraw
       *   -> Yjs
       *   -> ...
       */
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

      /**
       * Tell tldraw these are remote changes.
       *
       * This is important for correct store semantics and also ensures
       * our local store listener can ignore these changes.
       */
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

    /**
     * ---------------------------------------------------------
     * 2. Initial Yjs -> tldraw hydration
     * ---------------------------------------------------------
     *
     * Copy any records already present in the shared document
     * into this client's tldraw store.
     */
    const initialRecords = Array.from(yMap.values());

    if (initialRecords.length > 0) {
      console.log(
        `[Whiteboard Sync] Loading ${initialRecords.length} existing records`,
      );

      editor.store.mergeRemoteChanges(() => {
        editor.store.put(initialRecords);
      });
    }

    /**
     * ---------------------------------------------------------
     * 3. tldraw -> Yjs
     * ---------------------------------------------------------
     *
     * Listen only to document-level changes.
     *
     * This means shared canvas data such as shapes/pages/bindings,
     * rather than local UI state such as camera or selection.
     */
    const unsubscribeStore = editor.store.listen(
      (entry) => {
        /**
         * Remote Yjs changes were inserted through mergeRemoteChanges().
         *
         * Do not send those changes straight back into Yjs.
         */
        if (entry.source === "remote") {
          return;
        }

        doc.transact(() => {
          /**
           * CREATE
           */
          Object.values(entry.changes.added).forEach((record) => {
            yMap.set(record.id, record);
          });

          /**
           * UPDATE
           */
          Object.values(entry.changes.updated).forEach(([, updatedRecord]) => {
            yMap.set(updatedRecord.id, updatedRecord);
          });

          /**
           * DELETE
           */
          Object.values(entry.changes.removed).forEach((record) => {
            yMap.delete(record.id);
          });
        }, TLDRAW_ORIGIN);
      },
      {
        scope: "document",
      },
    );

    console.log("[Whiteboard Sync] Bridge ready");

    /**
     * React-controlled cleanup.
     */
    return () => {
      console.log("[Whiteboard Sync] Cleaning up bridge");

      yMap.unobserve(handleYjsChange);
      unsubscribeStore();
    };
  }, [editor, collabState]);

  /**
   * Wait until the collaboration connection exists before mounting
   * the whiteboard.
   */
  if (!collabState || collabState.status !== "connected") {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">
          Connecting to collaboration server...
        </p>
      </div>
    );
  }

  return (
    <div className="tldraw__editor relative h-full w-full">
      <Tldraw
        colorScheme={colorScheme}
        onMount={handleMount}
      />
    </div>
  );
};

export default Whiteboard;