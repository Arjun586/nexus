import { useCallback, useEffect, useRef, useState } from "react";
import { Tldraw, type Editor, type TLRecord,} from "tldraw";
import "tldraw/tldraw.css";
import * as Y from "yjs";

import type { CollaborationState } from "../../collaboration/useCollaboration";
import useAppColorScheme from "./use-app-color-scheme";

interface WhiteboardProps {
  collabState: CollaborationState | null;
}

const TLDRAW_ORIGIN = Symbol("tldraw");

const Whiteboard = ({ collabState }: WhiteboardProps) => {
  const colorScheme = useAppColorScheme();

  const editorRef = useRef<Editor | null>(null);

  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((mountedEditor: Editor) => {
    editorRef.current = mountedEditor;
    setEditor(mountedEditor);
  }, []);


  useEffect(() => {
    if (!editor || !collabState) {
      return;
    }

    if (collabState.status !== "connected") {
      return;
    }

    const { doc } = collabState;

    
    const yMap = doc.getMap<TLRecord>("tldraw-records");

    const handleYjsChange = (event: Y.YMapEvent<TLRecord>,transaction: Y.Transaction, ) => {
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