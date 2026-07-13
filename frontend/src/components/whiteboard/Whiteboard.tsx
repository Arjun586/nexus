import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getSnapshot,
  loadSnapshot,
  Tldraw,
  type Editor,
  type TLEditorSnapshot,
} from "tldraw";
import "tldraw/tldraw.css";

import {
  getWorkspaceSnapshot,
  saveWorkspaceSnapshot,
} from "../../api/workspace";
import { parseApiError } from "../../utils/parse-api-error";
import useAppColorScheme from "./use-app-color-scheme";

const Whiteboard = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const colorScheme = useAppColorScheme();
  const editorRef = useRef<Editor | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(true);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      if (!workspaceId) {
        setIsLoadingSnapshot(false);
        setStatus("Workspace not found");
        return;
      }

      let cancelled = false;

      const loadSavedSnapshot = async () => {
        setIsLoadingSnapshot(true);

        try {
          const response = await getWorkspaceSnapshot(workspaceId);

          if (cancelled) return;

          const { snapshot } = response.data;

          if (snapshot) {
            loadSnapshot(editor.store, snapshot as unknown as TLEditorSnapshot);
            setStatus("Loaded saved snapshot");
          } else {
            setStatus("Empty whiteboard");
          }
        } catch (err) {
          if (!cancelled) {
            const { message } = parseApiError(err);
            setStatus(message);
          }
        } finally {
          if (!cancelled) {
            setIsLoadingSnapshot(false);
          }
        }
      };

      void loadSavedSnapshot();

      return () => {
        cancelled = true;
      };
    },
    [workspaceId],
  );

  const handleSave = async () => {
    const editor = editorRef.current;

    if (!editor || !workspaceId || isSaving) return;

    setIsSaving(true);

    try {
      const snapshot = JSON.parse(
        JSON.stringify(getSnapshot(editor.store)),
      ) as TLEditorSnapshot;

      await saveWorkspaceSnapshot(
        workspaceId,
        snapshot as unknown as Record<string, unknown>,
      );
      setStatus("Snapshot saved");
    } catch (err) {
      const { message } = parseApiError(err);
      setStatus(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tldraw__editor relative h-full w-full">
      <Tldraw colorScheme={colorScheme} onMount={handleMount} />

      {/* Temporary development controls — top-right to avoid tldraw chrome */}
      <div className="pointer-events-none absolute right-3 top-3 z-[300] flex flex-col items-end gap-2">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={!workspaceId || isSaving || isLoadingSnapshot}
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
        {status ? (
          <p className="pointer-events-none max-w-xs rounded bg-white/90 px-2 py-1 text-right text-xs text-gray-600 shadow-sm">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Whiteboard;
