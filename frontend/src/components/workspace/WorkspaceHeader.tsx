import { useEffect, useRef, useState } from "react";

import type { Workspace } from "../../types/workspace";

type WorkspaceHeaderProps = {
  workspace: Workspace;
  onRename: (newName: string) => Promise<boolean>;
};

const formatCreatedAt = (createdAt: string): string => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const WorkspaceHeader = ({ workspace, onRename }: WorkspaceHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditName(workspace.name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isRenaming) return;
    setIsEditing(false);
    setEditName(workspace.name);
  };

  const handleSubmit = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === workspace.name || isRenaming) return;

    setIsRenaming(true);
    try {
      const success = await onRename(trimmed);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const canSave =
    editName.trim().length > 0 &&
    editName.trim() !== workspace.name &&
    !isRenaming;

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSubmit();
              if (e.key === "Escape") handleCancel();
            }}
            disabled={isRenaming}
            maxLength={100}
            className="rounded border border-gray-300 px-2 py-1 text-lg font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSave}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRenaming ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isRenaming}
            className="rounded px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">
            {workspace.name}
          </h1>
          <button
            type="button"
            onClick={startEditing}
            aria-label="Rename workspace"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
        </div>
      )}
      <p className="mt-1 text-sm text-gray-500">
        Created {formatCreatedAt(workspace.createdAt)}
      </p>
    </header>
  );
};

export default WorkspaceHeader;
