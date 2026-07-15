import { useCallback, useEffect, useRef, useState } from "react";
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


type SaveStatus = "idle" | "saving" | "saved" | "error";


const DEBOUNCE_MS = 2_000;
const MAX_INTERVAL_MS = 30_000;

const Whiteboard = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const colorScheme = useAppColorScheme();

  // Refs — mutated directly to avoid re-renders inside timers/listeners.
  const editorRef = useRef<Editor | null>(null);
  const dirtyRef = useRef(false);
  const isSavingRef = useRef(false);
  const isLoadingSnapshotRef = useRef(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rendered state — only what the UI actually needs.
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the ref in sync with state so timers see the latest value without
  // being added to dependency arrays.
  useEffect(() => {
    isLoadingSnapshotRef.current = isLoadingSnapshot;
  }, [isLoadingSnapshot]);


  const saveIfNeeded = useCallback(async () => {
    const editor = editorRef.current;

    // Guard: skip if any pre-condition is not met.
    if (
      !editor ||
      !workspaceId ||
      isSavingRef.current ||
      !dirtyRef.current
    ) {
      return;
    }

    isSavingRef.current = true;
    dirtyRef.current = false;
    setSaveStatus("saving");

    try {
      const snapshot = JSON.parse(
        JSON.stringify(getSnapshot(editor.store)),
      ) as TLEditorSnapshot;

      await saveWorkspaceSnapshot(
        workspaceId,
        snapshot as unknown as Record<string, unknown>,
      );

      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err) {
      // Re-mark dirty so the next timer tick retries.
      dirtyRef.current = true;
      const { message } = parseApiError(err);
      console.error("[Autosave] Failed:", message);
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [workspaceId]);


  useEffect(() => {
    // 30-second maximum interval: save if dirty regardless of user activity.
    intervalRef.current = setInterval(() => {
      void saveIfNeeded();
    }, MAX_INTERVAL_MS);

    return () => {
      // Clean up interval on unmount.
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Clean up any pending debounce on unmount.
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [saveIfNeeded]);

  const markDirty = useCallback(() => {
    // Ignore store mutations that happen while the initial snapshot is loading.
    if (isLoadingSnapshotRef.current) return;

    dirtyRef.current = true;

    // Reset the debounce window.
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void saveIfNeeded();
    }, DEBOUNCE_MS);
  }, [saveIfNeeded]);



  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      if (!workspaceId) {
        setIsLoadingSnapshot(false);
        setSaveStatus("error");
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
          }
          // Snapshot (or blank board) is now loaded — start tracking changes.
          setSaveStatus("idle");
        } catch (err) {
          if (!cancelled) {
            const { message } = parseApiError(err);
            console.error("[Snapshot load] Failed:", message);
            setSaveStatus("error");
          }
        } finally {
          if (!cancelled) {
            setIsLoadingSnapshot(false);
          }
        }
      };

      void loadSavedSnapshot();

      // Register the store listener. tldraw calls this on every document
      // change (shapes, pages, etc.). We gate on isLoadingSnapshotRef inside
      // markDirty so the initial loadSnapshot() call does not trigger a save.
      const unsubscribe = editor.store.listen(
        () => {
          markDirty();
        },
        // Only listen to document (user-facing) changes, not ephemeral UI state.
        { scope: "document" },
      );

      return () => {
        cancelled = true;
        unsubscribe();
      };
    },
    [workspaceId, markDirty],
  );


  useEffect(() => {
    if (!lastSavedAt) return;

    // Immediately sync so the label is accurate on the render that sets lastSavedAt.
    setNow(new Date());

    tickRef.current = setInterval(() => {
      setNow(new Date());
    }, 1_000);

    return () => {
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [lastSavedAt]);
  const getSaveStatusText = (): string | null => {
    if (saveStatus === "saving") return "Saving…";
    if (saveStatus === "error") return "Save failed";

    if (saveStatus === "saved" && lastSavedAt) {
      const elapsedMs = now.getTime() - lastSavedAt.getTime();
      const elapsedSec = Math.floor(elapsedMs / 1_000);

      if (elapsedSec < 3) return "🟢 All changes saved";

      if (elapsedSec < 60) return `Last saved ${elapsedSec} seconds ago`;

      const elapsedMin = Math.floor(elapsedSec / 60);
      if (elapsedMin < 60) {
        return elapsedMin === 1
          ? "Last saved 1 minute ago"
          : `Last saved ${elapsedMin} minutes ago`;
      }

      const elapsedHr = Math.floor(elapsedMin / 60);
      return elapsedHr === 1
        ? "Last saved 1 hour ago"
        : `Last saved ${elapsedHr} hours ago`;
    }

    // idle + never saved — nothing to show.
    return null;
  };

  const label = getSaveStatusText();


  return (
    <div className="tldraw__editor relative h-full w-full">
      <Tldraw colorScheme={colorScheme} onMount={handleMount} />

      {/* Autosave status indicator — top-right, non-interactive */}
      {isLoadingSnapshot ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[300]">
          <p className="rounded bg-white/90 px-2 py-1 text-right text-xs text-gray-600 shadow-sm">
            Loading…
          </p>
        </div>
      ) : label ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[300]">
          <p className="rounded bg-white/90 px-2 py-1 text-right text-xs text-gray-600 shadow-sm">
            {label}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Whiteboard;
