import { useCallback, useRef, useState } from "react";
import {
  getSnapshot,
  loadSnapshot,
  Tldraw,
  type Editor,
  type TLEditorSnapshot,
} from "tldraw";
import "tldraw/tldraw.css";

import useAppColorScheme from "./use-app-color-scheme";

const Whiteboard = () => {
  const colorScheme = useAppColorScheme();
  const editorRef = useRef<Editor | null>(null);
  const [exportedSnapshot, setExportedSnapshot] =
    useState<TLEditorSnapshot | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const handleExport = () => {
    const editor = editorRef.current;
    if (!editor) return;

    // JSON round-trip mirrors future persistence and freezes an immutable copy.
    const snapshot = JSON.parse(
      JSON.stringify(getSnapshot(editor.store)),
    ) as TLEditorSnapshot;


    console.log("snapshot", snapshot);

    setExportedSnapshot(snapshot);
    setStatus("Exported current document to memory");
  };

  const handleClear = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const shapeIds = [...editor.getCurrentPageShapeIds()];
    if (shapeIds.length > 0) {
      editor.deleteShapes(shapeIds);
    }

    setStatus("Cleared current page shapes");
  };

  const handleImport = () => {
    const editor = editorRef.current;
    if (!editor || !exportedSnapshot) return;

    loadSnapshot(editor.store, exportedSnapshot);
    setStatus("Imported last exported document");
  };

  return (
    <div className="tldraw__editor relative h-full w-full">
      <Tldraw colorScheme={colorScheme} onMount={handleMount} />

      {/* Temporary development controls — top-right to avoid tldraw chrome */}
      <div className="pointer-events-none absolute right-3 top-3 z-[300] flex flex-col items-end gap-2">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!exportedSnapshot}
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import
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
